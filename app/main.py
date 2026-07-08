"""FastAPI-App: REST-API + Auslieferung des Dashboards.

Start:  uvicorn app.main:app --reload   (oder ./run.sh)
"""
import csv
import io
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import db, leadgen, scripts

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(title="imondu Sales-Dashboard", version="1.0")


@app.on_event("startup")
def _startup():
    db.init_db()


# ---------------------------------------------------------------------------
# Pydantic-Modelle
# ---------------------------------------------------------------------------
class WorkflowRequest(BaseModel):
    source: str = "auto"          # 'auto' | 'osm'
    count: int = 10
    region: str | None = None
    query: str | None = None
    city: str | None = None
    categories: list[str] | None = None
    segments: list[str] | None = None


class LeadUpdate(BaseModel):
    company_name: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    street: str | None = None
    postal_code: str | None = None
    city: str | None = None
    region: str | None = None
    segment: str | None = None
    lead_type: str | None = None
    consent: int | None = None
    status: str | None = None
    disposition: str | None = None
    owner: str | None = None
    next_followup_at: float | None = None


class CallLog(BaseModel):
    outcome: str | None = None
    notes: str | None = None
    next_action: str | None = None
    status: str | None = None
    disposition: str | None = None
    followup_at: float | None = None


class ScriptRequest(BaseModel):
    prefer: str = "auto"          # 'auto' | 'template' | 'ki'


class SettingsUpdate(BaseModel):
    anthropic_api_key: str | None = None
    script_model: str | None = None
    sales_rep_name: str | None = None
    sales_company: str | None = None
    script_tone: str | None = None
    default_region: str | None = None
    b2c_requires_consent: str | None = None


class NewLead(BaseModel):
    lead_type: str = "b2b"
    company_name: str | None = None
    contact_name: str | None = None
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    city: str | None = None
    segment: str | None = None
    consent: int = 0


# ---------------------------------------------------------------------------
# Meta / Stats
# ---------------------------------------------------------------------------
@app.get("/api/meta")
def meta():
    s = db.get_settings()
    return {
        "statuses": db.STATUSES,
        "segments": list(leadgen.SEGMENTS.keys()),
        "stats": db.stats(),
        "has_api_key": bool((s.get("anthropic_api_key") or "").strip()),
        "settings": {k: v for k, v in s.items() if k != "anthropic_api_key"},
    }


@app.get("/api/stats")
def get_stats():
    return db.stats()


# ---------------------------------------------------------------------------
# Leads
# ---------------------------------------------------------------------------
@app.get("/api/leads")
def get_leads(status: str = None, search: str = None, lead_type: str = None,
              due: bool = False, sort: str = "score"):
    return db.list_leads(status=status, search=search, lead_type=lead_type,
                         due=due, sort=sort)


@app.get("/api/leads/{lead_id}")
def get_lead(lead_id: int):
    lead = db.get_lead(lead_id)
    if not lead:
        raise HTTPException(404, "Lead nicht gefunden")
    return lead


@app.post("/api/leads")
def create_lead(payload: NewLead):
    raw = payload.model_dump()
    lead = leadgen.enrich_lead(raw)
    new_id = db.create_lead(lead)
    if not new_id:
        raise HTTPException(409, "Lead existiert bereits (Duplikat)")
    return db.get_lead(new_id)


@app.patch("/api/leads/{lead_id}")
def patch_lead(lead_id: int, payload: LeadUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    lead = db.update_lead(lead_id, updates)
    if not lead:
        raise HTTPException(404, "Lead nicht gefunden")
    return lead


@app.delete("/api/leads/{lead_id}")
def remove_lead(lead_id: int):
    db.delete_lead(lead_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Call logs / Wiedervorlage
# ---------------------------------------------------------------------------
@app.post("/api/leads/{lead_id}/calls")
def log_call(lead_id: int, payload: CallLog):
    if not db.get_lead(lead_id):
        raise HTTPException(404, "Lead nicht gefunden")
    return db.add_call_log(lead_id, payload.model_dump())


# ---------------------------------------------------------------------------
# Script-Generierung
# ---------------------------------------------------------------------------
@app.post("/api/leads/{lead_id}/script")
def make_script(lead_id: int, payload: ScriptRequest):
    lead = db.get_lead(lead_id)
    if not lead:
        raise HTTPException(404, "Lead nicht gefunden")
    result = scripts.generate_script(lead, prefer=payload.prefer)
    db.update_lead(lead_id, {"script": result["script"]})
    return result


# ---------------------------------------------------------------------------
# Workflows (Lead-Generierung / Scraping)
# ---------------------------------------------------------------------------
@app.post("/api/workflows/run")
def run_workflow(req: WorkflowRequest):
    params = req.model_dump()
    source = params.pop("source", "auto")
    result = leadgen.run_workflow(source, params)
    return result


@app.get("/api/jobs")
def get_jobs():
    return db.list_jobs()


# ---------------------------------------------------------------------------
# CSV-Import / Export
# ---------------------------------------------------------------------------
@app.post("/api/import/csv")
async def import_csv(file: UploadFile = File(...)):
    content = (await file.read()).decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(content))
    raw_leads = []
    for row in reader:
        row = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}
        raw_leads.append({
            "lead_type": row.get("lead_type") or ("b2c" if row.get("privat") else "b2b"),
            "company_name": row.get("company_name") or row.get("firma") or row.get("company"),
            "contact_name": row.get("contact_name") or row.get("name") or row.get("ansprechpartner"),
            "phone": row.get("phone") or row.get("telefon") or row.get("tel"),
            "email": row.get("email") or row.get("e-mail") or row.get("mail"),
            "website": row.get("website") or row.get("web"),
            "street": row.get("street") or row.get("straße") or row.get("strasse"),
            "postal_code": row.get("postal_code") or row.get("plz"),
            "city": row.get("city") or row.get("stadt") or row.get("ort"),
            "segment": row.get("segment") or row.get("branche"),
            "consent": 1 if (row.get("consent") or row.get("einwilligung") or "").lower()
                       in ("1", "ja", "true", "yes") else 0,
        })
    result = leadgen.insert_leads(raw_leads, source="csv-import")
    return result


@app.get("/api/export/csv")
def export_csv():
    leads = db.list_leads(limit=100000)
    buf = io.StringIO()
    cols = ["id", "lead_type", "company_name", "contact_name", "phone", "email",
            "website", "city", "segment", "score", "status", "disposition", "source"]
    writer = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
    writer.writeheader()
    for l in leads:
        writer.writerow(l)
    from fastapi.responses import Response
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=imondu_leads.csv"},
    )


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
@app.get("/api/settings")
def get_settings():
    s = db.get_settings()
    key = (s.get("anthropic_api_key") or "").strip()
    s["anthropic_api_key"] = ("••••••" + key[-4:]) if key else ""
    s["_has_api_key"] = bool(key)
    return s


@app.patch("/api/settings")
def patch_settings(payload: SettingsUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    # Maskierten Key nicht überschreiben
    if updates.get("anthropic_api_key", "").startswith("••••"):
        updates.pop("anthropic_api_key", None)
    db.update_settings(updates)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Static / Frontend
# ---------------------------------------------------------------------------
@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/", StaticFiles(directory=STATIC_DIR), name="static")
