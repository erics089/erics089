"""SQLite-Datenbank für das imondu Sales-Dashboard.

Bewusst ohne ORM gehalten (nur stdlib sqlite3), damit die App mit minimalen
Abhängigkeiten läuft und leicht nachvollziehbar bleibt.
"""
import json
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "imondu.db"


def _dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


@contextmanager
def get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = _dict_factory
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL,
    -- Stammdaten
    lead_type TEXT NOT NULL DEFAULT 'b2b',      -- 'b2b' | 'b2c'
    company_name TEXT,                          -- Firma / Objektbezeichnung
    contact_name TEXT,                          -- Ansprechpartner / Name
    phone TEXT,
    email TEXT,
    website TEXT,
    -- Adresse
    street TEXT,
    postal_code TEXT,
    city TEXT,
    region TEXT,
    -- Klassifizierung / Enrichment
    segment TEXT,                               -- z.B. Bautraeger, Architekt, Hausverwaltung
    source TEXT,                                -- woher der Lead stammt
    enrichment TEXT,                            -- JSON: strukturierte Zusatzinfos
    fit_reasons TEXT,                           -- JSON-Liste: warum passt der Lead zu imondu
    score INTEGER DEFAULT 0,                    -- 0-100 Lead-Score
    consent INTEGER DEFAULT 0,                  -- 1 = Einwilligung zur Kontaktaufnahme vorhanden
    -- Sales / Pipeline
    status TEXT NOT NULL DEFAULT 'neu',         -- siehe STATUSES
    disposition TEXT,                           -- letztes Anruf-Ergebnis
    next_followup_at REAL,                      -- Wiedervorlage-Zeitpunkt
    last_contacted_at REAL,
    owner TEXT,                                 -- Sales-Executive
    script TEXT,                                -- zuletzt generiertes Script
    dedupe_key TEXT UNIQUE                      -- verhindert Duplikate beim Import
);

CREATE TABLE IF NOT EXISTS call_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    created_at REAL NOT NULL,
    outcome TEXT,                               -- Ergebnis (erreicht, Mailbox, Interesse, ...)
    notes TEXT,
    next_action TEXT,
    followup_at REAL
);

CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at REAL NOT NULL,
    finished_at REAL,
    source TEXT,
    status TEXT,                                -- laufend | fertig | fehler
    params TEXT,                                -- JSON
    result TEXT                                 -- JSON: {found, imported, skipped, log[]}
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_followup ON leads(next_followup_at);
"""

# Pipeline-Status – die Reihenfolge spiegelt den Sales-Funnel wider.
STATUSES = [
    "neu",              # frisch generiert, noch nicht bearbeitet
    "kontaktiert",      # angerufen, kein Abschluss
    "wiedervorlage",    # Rückruf/Follow-up terminiert
    "interessiert",     # qualifiziert, warmes Interesse
    "termin",           # Termin/Demo vereinbart
    "gewonnen",         # Abschluss
    "verloren",         # kein Interesse
    "nicht_anrufen",    # Do-Not-Call (Widerspruch / fehlende Einwilligung)
]

DEFAULT_SETTINGS = {
    "anthropic_api_key": "",
    "script_model": "claude-opus-4-8",
    "sales_rep_name": "",
    "sales_company": "imondu",
    "script_tone": "empathisch, vertrauenswürdig, nicht drängend",
    "b2c_requires_consent": "1",
    "default_region": "München",
}


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)
        for k, v in DEFAULT_SETTINGS.items():
            conn.execute(
                "INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)", (k, v)
            )


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
def get_settings() -> dict:
    with get_conn() as conn:
        rows = conn.execute("SELECT key, value FROM settings").fetchall()
    data = {r["key"]: r["value"] for r in rows}
    for k, v in DEFAULT_SETTINGS.items():
        data.setdefault(k, v)
    return data


def update_settings(updates: dict):
    with get_conn() as conn:
        for k, v in updates.items():
            conn.execute(
                "INSERT INTO settings(key, value) VALUES (?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                (k, str(v)),
            )


# ---------------------------------------------------------------------------
# Leads
# ---------------------------------------------------------------------------
_JSON_FIELDS = ("enrichment", "fit_reasons")


def _serialize(lead: dict) -> dict:
    out = dict(lead)
    for f in _JSON_FIELDS:
        if f in out and not isinstance(out[f], str):
            out[f] = json.dumps(out[f], ensure_ascii=False)
    return out


def _deserialize(row: dict) -> dict:
    if row is None:
        return None
    out = dict(row)
    for f in _JSON_FIELDS:
        if out.get(f):
            try:
                out[f] = json.loads(out[f])
            except (json.JSONDecodeError, TypeError):
                out[f] = [] if f == "fit_reasons" else {}
        else:
            out[f] = [] if f == "fit_reasons" else {}
    return out


def create_lead(lead: dict) -> int | None:
    """Legt einen Lead an. Gibt die ID zurück oder None bei Duplikat."""
    now = time.time()
    lead = _serialize(lead)
    lead.setdefault("created_at", now)
    lead["updated_at"] = now
    cols = [
        "created_at", "updated_at", "lead_type", "company_name", "contact_name",
        "phone", "email", "website", "street", "postal_code", "city", "region",
        "segment", "source", "enrichment", "fit_reasons", "score", "consent",
        "status", "disposition", "next_followup_at", "last_contacted_at",
        "owner", "script", "dedupe_key",
    ]
    values = [lead.get(c) for c in cols]
    placeholders = ", ".join("?" for _ in cols)
    with get_conn() as conn:
        try:
            cur = conn.execute(
                f"INSERT INTO leads ({', '.join(cols)}) VALUES ({placeholders})",
                values,
            )
            return cur.lastrowid
        except sqlite3.IntegrityError:
            return None  # Duplikat (dedupe_key)


def list_leads(status=None, search=None, lead_type=None, due=False,
               sort="score", limit=500) -> list:
    q = "SELECT * FROM leads WHERE 1=1"
    params = []
    if status and status != "alle":
        q += " AND status = ?"
        params.append(status)
    if lead_type and lead_type != "alle":
        q += " AND lead_type = ?"
        params.append(lead_type)
    if search:
        q += (" AND (company_name LIKE ? OR contact_name LIKE ? OR city LIKE ? "
              "OR segment LIKE ? OR phone LIKE ?)")
        like = f"%{search}%"
        params += [like, like, like, like, like]
    if due:
        q += " AND next_followup_at IS NOT NULL AND next_followup_at <= ?"
        params.append(time.time())
    sort_map = {
        "score": "score DESC, created_at DESC",
        "neu": "created_at DESC",
        "followup": "next_followup_at ASC",
        "name": "company_name ASC",
    }
    q += " ORDER BY " + sort_map.get(sort, sort_map["score"])
    q += " LIMIT ?"
    params.append(limit)
    with get_conn() as conn:
        rows = conn.execute(q, params).fetchall()
    return [_deserialize(r) for r in rows]


def get_lead(lead_id: int) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        logs = conn.execute(
            "SELECT * FROM call_logs WHERE lead_id = ? ORDER BY created_at DESC",
            (lead_id,),
        ).fetchall()
    lead = _deserialize(row)
    if lead is not None:
        lead["call_logs"] = logs
    return lead


def update_lead(lead_id: int, updates: dict) -> dict | None:
    if not updates:
        return get_lead(lead_id)
    updates = _serialize(updates)
    updates["updated_at"] = time.time()
    allowed = {
        "lead_type", "company_name", "contact_name", "phone", "email", "website",
        "street", "postal_code", "city", "region", "segment", "source",
        "enrichment", "fit_reasons", "score", "consent", "status", "disposition",
        "next_followup_at", "last_contacted_at", "owner", "script", "updated_at",
    }
    fields = {k: v for k, v in updates.items() if k in allowed}
    sets = ", ".join(f"{k} = ?" for k in fields)
    with get_conn() as conn:
        conn.execute(
            f"UPDATE leads SET {sets} WHERE id = ?",
            list(fields.values()) + [lead_id],
        )
    return get_lead(lead_id)


def delete_lead(lead_id: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))


# ---------------------------------------------------------------------------
# Call logs
# ---------------------------------------------------------------------------
def add_call_log(lead_id: int, log: dict) -> dict:
    now = time.time()
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO call_logs (lead_id, created_at, outcome, notes, "
            "next_action, followup_at) VALUES (?, ?, ?, ?, ?, ?)",
            (lead_id, now, log.get("outcome"), log.get("notes"),
             log.get("next_action"), log.get("followup_at")),
        )
        # Lead-Status / Zeitstempel mitziehen
        lead_updates = {"last_contacted_at": now}
        if log.get("status"):
            lead_updates["status"] = log["status"]
        if log.get("disposition"):
            lead_updates["disposition"] = log["disposition"]
        if log.get("followup_at"):
            lead_updates["next_followup_at"] = log["followup_at"]
            lead_updates.setdefault("status", "wiedervorlage")
        sets = ", ".join(f"{k} = ?" for k in lead_updates)
        conn.execute(
            f"UPDATE leads SET {sets}, updated_at = ? WHERE id = ?",
            list(lead_updates.values()) + [now, lead_id],
        )
    return get_lead(lead_id)


# ---------------------------------------------------------------------------
# Jobs (Scraping-/Leadgen-Läufe)
# ---------------------------------------------------------------------------
def create_job(source: str, params: dict) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO jobs (created_at, source, status, params) VALUES (?, ?, ?, ?)",
            (time.time(), source, "laufend", json.dumps(params, ensure_ascii=False)),
        )
        return cur.lastrowid


def finish_job(job_id: int, status: str, result: dict):
    with get_conn() as conn:
        conn.execute(
            "UPDATE jobs SET status = ?, finished_at = ?, result = ? WHERE id = ?",
            (status, time.time(), json.dumps(result, ensure_ascii=False), job_id),
        )


def list_jobs(limit=20) -> list:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    for r in rows:
        for f in ("params", "result"):
            if r.get(f):
                try:
                    r[f] = json.loads(r[f])
                except (json.JSONDecodeError, TypeError):
                    pass
    return rows


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------
def stats() -> dict:
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) c FROM leads").fetchone()["c"]
        by_status = conn.execute(
            "SELECT status, COUNT(*) c FROM leads GROUP BY status"
        ).fetchall()
        due = conn.execute(
            "SELECT COUNT(*) c FROM leads WHERE next_followup_at IS NOT NULL "
            "AND next_followup_at <= ?", (time.time(),)
        ).fetchone()["c"]
    return {
        "total": total,
        "by_status": {r["status"]: r["c"] for r in by_status},
        "due_followups": due,
    }
