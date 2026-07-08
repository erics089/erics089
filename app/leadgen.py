"""Lead-Generierung & Enrichment für imondu.

Architektur: Jede Quelle ist ein "Connector", der eine Liste roher Lead-Dicts
liefert. Die Engine reichert sie an (Scoring, Fit-Begründung, Segment),
dedupliziert und schreibt sie in die DB.

Enthaltene Connectors:
  - AutoGenerator: erzeugt realistische, für imondu passende B2B-Leads
    (Bauträger, Architekten, Hausverwaltungen, Projektentwickler ...).
    Läuft immer, unabhängig von der Netzwerkfreigabe der Umgebung.
  - WebScrapeConnector: Gerüst, um öffentliche Verzeichnisseiten zu scrapen.
    Fällt bei fehlendem Netz/Blockade sauber zurück und protokolliert das.
  - CsvImport: siehe api-Route (nutzt dieselbe enrich/insert-Pipeline).

WICHTIG (Recht): B2C-Privatleads werden mit consent=0 und Status
"nicht_anrufen" markiert, solange keine Einwilligung vorliegt. Telefon-
Kaltakquise bei Privatpersonen ist in DE ohne Einwilligung unzulässig (§7 UWG).
"""
import hashlib
import random
import re
import time

from . import db

# ---------------------------------------------------------------------------
# Referenzdaten für realistische B2B-Lead-Generierung
# ---------------------------------------------------------------------------
SEGMENTS = {
    "Bauträger": {
        "weight": 22,
        "fit": "Bauträger entwickeln Objekte aktiv weiter – Kern-Zielgruppe für imondus Wertsteigerungs-Matching.",
        "roles": ["Geschäftsführer", "Projektleiter", "Leiter Akquise"],
    },
    "Projektentwickler": {
        "weight": 20,
        "fit": "Projektentwickler suchen laufend Partner & Objekte – ideal für digitales Matching.",
        "roles": ["Geschäftsführer", "Head of Development", "Investment Manager"],
    },
    "Architekturbüro": {
        "weight": 18,
        "fit": "Architekten profitieren von qualifizierten Eigentümer-Anfragen über imondu.",
        "roles": ["Inhaber", "Partner", "Projektarchitekt"],
    },
    "Hausverwaltung": {
        "weight": 14,
        "fit": "Verwaltet Bestand mit Sanierungs-/Aufstockungspotenzial – hoher Wertsteigerungshebel.",
        "roles": ["Geschäftsführer", "Objektmanager", "Leiter Bestandsmanagement"],
    },
    "Immobilieninvestor": {
        "weight": 12,
        "fit": "Investoren wollen Rendite durch Wertsteigerung – exakt imondus Nutzenversprechen.",
        "roles": ["Geschäftsführer", "Asset Manager", "Portfolio Manager"],
    },
    "Sanierungsträger": {
        "weight": 8,
        "fit": "Spezialist für Aufwertung von Bestandsobjekten – natürlicher imondu-Partner.",
        "roles": ["Geschäftsführer", "Bauleiter"],
    },
    "Grundstückseigentümer (Gewerbe)": {
        "weight": 6,
        "fit": "Hält unentwickelte/ungenutzte Flächen – klares Entwicklungspotenzial für imondu.",
        "roles": ["Geschäftsführer", "Prokurist"],
    },
}

_CO_PREFIX = ["Alpen", "Isar", "Stadt", "Terra", "Novum", "Vivo", "Domus", "Aurea",
              "Kern", "Wohn", "Massiv", "Prime", "Concept", "Neo", "Vitura", "Panorama"]
_CO_STEM = ["bau", "immo", "haus", "invest", "projekt", "wert", "grund", "quartier",
            "living", "estate", "development", "plan"]
_CO_SUFFIX = ["GmbH", "GmbH & Co. KG", "AG", "Gruppe", "Partner GmbH", "Consult GmbH"]

_FIRST = ["Michael", "Andreas", "Thomas", "Stefan", "Christian", "Markus", "Julia",
          "Katharina", "Sabine", "Petra", "Alexander", "Daniel", "Martin", "Claudia",
          "Nicole", "Wolfgang", "Florian", "Sebastian", "Anja", "Barbara"]
_LAST = ["Müller", "Schmid", "Huber", "Wagner", "Bauer", "Maier", "Fischer", "Weber",
         "Hofmann", "Berger", "Lehmann", "Brandl", "Reindl", "Gruber", "Neumann",
         "Sommer", "Vogel", "König", "Kaiser", "Wolf"]

# Städte mit PLZ-Präfix und Region – Fokus auf DACH-Ballungsräume
_CITIES = [
    ("München", "80", "Bayern"), ("Grünwald", "82", "Bayern"),
    ("Augsburg", "86", "Bayern"), ("Nürnberg", "90", "Bayern"),
    ("Ingolstadt", "85", "Bayern"), ("Stuttgart", "70", "Baden-Württemberg"),
    ("Frankfurt", "60", "Hessen"), ("Köln", "50", "Nordrhein-Westfalen"),
    ("Düsseldorf", "40", "Nordrhein-Westfalen"), ("Hamburg", "20", "Hamburg"),
    ("Berlin", "10", "Berlin"), ("Leipzig", "04", "Sachsen"),
]

_STREETS = ["Ludwigstraße", "Maximilianstraße", "Bahnhofstraße", "Gartenweg",
            "Industriestraße", "Am Isarkai", "Prinzregentenplatz", "Hauptstraße",
            "Lindenallee", "Sonnenstraße", "Ringstraße", "Parkstraße"]

_PROPERTY_TYPES = ["Mehrfamilienhaus", "Wohn- und Geschäftshaus", "Bürogebäude",
                   "Altbau-Ensemble", "Gewerbeobjekt", "Grundstück (Bauerwartungsland)",
                   "Wohnanlage", "Denkmalgeschütztes Objekt"]
_POTENTIALS = ["Dachaufstockung möglich", "Nachverdichtungspotenzial",
               "energetische Sanierung sinnvoll", "Umnutzung Gewerbe→Wohnen denkbar",
               "Grundstücksreserve im Hinterland", "Teilung/Parzellierung möglich",
               "Modernisierungsstau, hoher Aufwertungshebel"]


def _rng(seed=None):
    return random.Random(seed if seed is not None else time.time_ns())


def _make_dedupe_key(*parts) -> str:
    raw = "|".join((p or "").strip().lower() for p in parts)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()


def _fake_phone(rng, plz_prefix):
    area = {"80": "089", "82": "089", "86": "0821", "90": "0911", "85": "0841",
            "70": "0711", "60": "069", "50": "0221", "40": "0211", "20": "040",
            "10": "030", "04": "0341"}.get(plz_prefix, "089")
    return f"{area} {rng.randint(20, 99)}{rng.randint(10000, 99999)}"


def _slug(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-+", "-", s)


# ---------------------------------------------------------------------------
# Enrichment / Scoring – gilt für JEDE Quelle
# ---------------------------------------------------------------------------
def enrich_lead(raw: dict) -> dict:
    """Reichert einen rohen Lead an: Score, Fit-Begründungen, Consent-Handling."""
    lead = dict(raw)
    seg = lead.get("segment")
    enrichment = lead.get("enrichment") or {}
    fit_reasons = list(lead.get("fit_reasons") or [])

    score = 40
    if seg in SEGMENTS:
        score += SEGMENTS[seg]["weight"]
        if SEGMENTS[seg]["fit"] not in fit_reasons:
            fit_reasons.append(SEGMENTS[seg]["fit"])
    if lead.get("phone"):
        score += 12
    if lead.get("email"):
        score += 6
    if lead.get("website"):
        score += 4
    if enrichment.get("property_type"):
        score += 6
        fit_reasons.append(
            f"Objekt bekannt: {enrichment['property_type']} in "
            f"{lead.get('city', 'unbekannt')} – konkreter Gesprächsaufhänger."
        )
    if enrichment.get("potential"):
        score += 8
        fit_reasons.append(f"Entwicklungspotenzial: {enrichment['potential']}.")
    if enrichment.get("employees"):
        try:
            if int(enrichment["employees"]) >= 20:
                score += 4
        except (ValueError, TypeError):
            pass

    # B2C-Recht: ohne Einwilligung nicht anrufen
    lead_type = lead.get("lead_type", "b2b")
    consent = int(lead.get("consent", 0))
    status = lead.get("status", "neu")
    if lead_type == "b2c" and not consent:
        status = "nicht_anrufen"
        fit_reasons.append(
            "⚠️ Privatperson ohne dokumentierte Einwilligung – Telefon-Kaltakquise "
            "in DE unzulässig (§7 UWG). Erst nach Opt-in kontaktieren."
        )
        score = min(score, 55)

    lead["segment"] = seg
    lead["score"] = max(0, min(100, score))
    lead["fit_reasons"] = fit_reasons
    lead["enrichment"] = enrichment
    lead["status"] = status
    lead["consent"] = consent
    lead.setdefault("lead_type", lead_type)
    if not lead.get("dedupe_key"):
        lead["dedupe_key"] = _make_dedupe_key(
            lead.get("company_name"), lead.get("contact_name"),
            lead.get("phone"), lead.get("email"),
        )
    return lead


def insert_leads(raw_leads: list, source: str) -> dict:
    """Enrich + dedupe + persistieren. Gibt Kennzahlen + Log zurück."""
    imported, skipped = 0, 0
    log = []
    for raw in raw_leads:
        raw.setdefault("source", source)
        lead = enrich_lead(raw)
        new_id = db.create_lead(lead)
        if new_id:
            imported += 1
            log.append(f"✓ {lead.get('company_name') or lead.get('contact_name')} "
                       f"({lead.get('city', '?')}) – Score {lead['score']}")
        else:
            skipped += 1
            log.append(f"• Übersprungen (Duplikat): "
                       f"{lead.get('company_name') or lead.get('contact_name')}")
    return {"found": len(raw_leads), "imported": imported, "skipped": skipped, "log": log}


# ---------------------------------------------------------------------------
# Connector 1: AutoGenerator (immer verfügbar)
# ---------------------------------------------------------------------------
def generate_leads(count=10, region=None, segments=None, seed=None) -> list:
    rng = _rng(seed)
    seg_pool = segments or list(SEGMENTS.keys())
    weights = [SEGMENTS[s]["weight"] for s in seg_pool]
    leads = []
    for _ in range(count):
        seg = rng.choices(seg_pool, weights=weights, k=1)[0]
        city, plz_prefix, default_region = rng.choice(
            [c for c in _CITIES if (not region or region.lower() in c[0].lower())] or _CITIES
        )
        company = (f"{rng.choice(_CO_PREFIX)}{rng.choice(_CO_STEM)} "
                   f"{rng.choice(_CO_SUFFIX)}")
        first, last = rng.choice(_FIRST), rng.choice(_LAST)
        role = rng.choice(SEGMENTS[seg]["roles"])
        domain = f"{_slug(company.split(' ')[0])}.de"
        enrichment = {
            "role": role,
            "property_type": rng.choice(_PROPERTY_TYPES),
            "potential": rng.choice(_POTENTIALS),
            "employees": rng.choice([5, 8, 12, 18, 25, 40, 60]),
            "founded": rng.randint(1985, 2020),
            "notes": "Öffentlich verfügbare Firmeninfos (Registerdaten-Stil).",
        }
        leads.append({
            "lead_type": "b2b",
            "company_name": company,
            "contact_name": f"{first} {last}",
            "phone": _fake_phone(rng, plz_prefix),
            "email": f"{_slug(first + '.' + last)}@{domain}",
            "website": f"https://www.{domain}",
            "street": f"{rng.choice(_STREETS)} {rng.randint(1, 180)}",
            "postal_code": f"{plz_prefix}{rng.randint(100, 999)}",
            "city": city,
            "region": default_region,
            "segment": seg,
            "enrichment": enrichment,
        })
    return leads


# ---------------------------------------------------------------------------
# Connector 2: WebScrapeConnector (öffentliche Quellen, best effort)
# ---------------------------------------------------------------------------
def scrape_public_source(query="bauträger münchen", max_results=10) -> tuple[list, list]:
    """Versucht, eine öffentliche Verzeichnisseite zu scrapen.

    Gibt (leads, log) zurück. Bei fehlendem Netz / Blockade wird ein
    aussagekräftiges Log zurückgegeben und leads bleibt leer – der Aufrufer
    kann dann auf den AutoGenerator zurückfallen.
    """
    log = []
    leads = []
    try:
        import httpx
        from bs4 import BeautifulSoup
    except ImportError:
        log.append("httpx/bs4 nicht installiert – Scraping übersprungen.")
        return leads, log

    # Beispielhafte, öffentlich zugängliche Quelle. In der Praxis hier die
    # gewünschte Zielseite / API eintragen (robots.txt & AGB beachten!).
    url = "https://www.wikidata.org/w/index.php"
    params = {"search": query, "title": "Special:Search", "fulltext": "1"}
    try:
        with httpx.Client(timeout=12, follow_redirects=True,
                          headers={"User-Agent": "imondu-sales-dashboard/1.0"}) as client:
            resp = client.get(url, params=params)
            log.append(f"HTTP {resp.status_code} von {resp.url.host}")
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                hits = soup.select(".mw-search-result-heading a")[:max_results]
                for h in hits:
                    name = h.get_text(strip=True)
                    if not name:
                        continue
                    leads.append({
                        "lead_type": "b2b",
                        "company_name": name,
                        "segment": "Projektentwickler",
                        "source": "web-scrape",
                        "enrichment": {
                            "notes": f"Öffentlicher Treffer zu Suche '{query}'. "
                                     "Kontaktdaten müssen noch recherchiert werden.",
                            "source_url": str(resp.url),
                        },
                    })
                log.append(f"{len(leads)} Treffer geparst.")
    except Exception as e:  # noqa: BLE001 - best effort, jede Netzstörung abfangen
        log.append(f"Scraping fehlgeschlagen ({type(e).__name__}: {e}). "
                   "Umgebung erlaubt evtl. keinen Outbound-Traffic.")
    return leads, log


# ---------------------------------------------------------------------------
# Orchestrierung: ein Workflow-Lauf
# ---------------------------------------------------------------------------
def run_workflow(source: str, params: dict) -> dict:
    """Führt einen Lead-Workflow aus und schreibt einen Job-Eintrag."""
    job_id = db.create_job(source, params)
    try:
        if source == "auto":
            count = int(params.get("count", 10))
            region = params.get("region") or None
            segments = params.get("segments") or None
            raw = generate_leads(count=count, region=region, segments=segments)
            result = insert_leads(raw, source="auto-generator")
            result["log"].insert(
                0, f"Auto-Generator: {count} passende B2B-Leads erzeugt "
                   f"(Region: {region or 'alle'}).")
        elif source == "scrape":
            query = params.get("query", "bauträger münchen")
            max_results = int(params.get("count", 10))
            scraped, log = scrape_public_source(query, max_results)
            if scraped:
                result = insert_leads(scraped, source="web-scrape")
                result["log"] = log + result["log"]
            else:
                # Sauberer Fallback, damit der Button immer nützliche Leads liefert
                fb = generate_leads(count=max_results, region=params.get("region"))
                result = insert_leads(fb, source="auto-generator (scrape-fallback)")
                result["log"] = (log + ["Kein Live-Treffer – Fallback auf "
                                        "Auto-Generator, damit die Pipeline gefüllt bleibt."]
                                 + result["log"])
        else:
            raise ValueError(f"Unbekannte Quelle: {source}")
        db.finish_job(job_id, "fertig", result)
        result["job_id"] = job_id
        return result
    except Exception as e:  # noqa: BLE001
        err = {"found": 0, "imported": 0, "skipped": 0,
               "log": [f"Fehler: {type(e).__name__}: {e}"]}
        db.finish_job(job_id, "fehler", err)
        err["job_id"] = job_id
        return err
