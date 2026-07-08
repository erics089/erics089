"""Befüllt die Datenbank mit realistischen Demo-Leads, damit das Dashboard
sofort einsatzbereit ist. Idempotent (Duplikate werden übersprungen).

Aufruf:  python seed.py
"""
from app import db, leadgen


def main():
    db.init_db()
    before = db.stats()["total"]

    # Bunte Mischung passender B2B-Leads über mehrere Regionen
    raw = []
    raw += leadgen.generate_leads(count=14, seed=42)
    raw += leadgen.generate_leads(count=6, region="München", seed=7)

    # Ein paar Leads mit Sales-Historie / Wiedervorlage, damit Pipeline & KPIs leben
    import time
    now = time.time()
    result = leadgen.insert_leads(raw, source="demo-seed")

    # Ein B2C-Beispiel MIT Einwilligung (zulässig) ...
    leadgen.insert_leads([{
        "lead_type": "b2c", "consent": 1,
        "contact_name": "Familie Sonnleitner", "phone": "089 44112233",
        "email": "sonnleitner@example.de", "city": "München", "segment": "Grundstückseigentümer (Gewerbe)",
        "enrichment": {"property_type": "Einfamilienhaus mit großem Grundstück",
                       "potential": "Nachverdichtung / Teilung möglich",
                       "notes": "Hat über Landingpage Kontakt angefragt (Opt-in)."},
    }], source="landingpage-optin")

    # ... und ein B2C-Beispiel OHNE Einwilligung (wird als 'nicht_anrufen' geführt)
    leadgen.insert_leads([{
        "lead_type": "b2c", "consent": 0,
        "contact_name": "Herr Bergmaier", "phone": "089 55667788", "city": "Grünwald",
        "segment": "Grundstückseigentümer (Gewerbe)",
        "enrichment": {"property_type": "Villa", "potential": "Aufstockung denkbar"},
    }], source="scrape-privat")

    # Etwas Pipeline-Bewegung simulieren
    leads = db.list_leads(status="neu", limit=6)
    if leads:
        db.add_call_log(leads[0]["id"], {
            "outcome": "Erreicht – Interesse", "status": "interessiert",
            "notes": "Will Unterlagen per Mail. Rückruf nächste Woche."})
        db.add_call_log(leads[1]["id"], {
            "outcome": "Mailbox / nicht erreicht", "status": "wiedervorlage",
            "notes": "Auf Mailbox gesprochen.", "followup_at": now + 2 * 86400})
        db.add_call_log(leads[2]["id"], {
            "outcome": "Rückruf gewünscht", "status": "wiedervorlage",
            "notes": "Kein Zeit, morgen nochmal.", "followup_at": now - 3600})  # fällig

    after = db.stats()["total"]
    print(f"Seed fertig. Leads: {before} -> {after} (neu: {after - before})")
    print("Starte das Dashboard mit:  ./run.sh   (oder uvicorn app.main:app)")


if __name__ == "__main__":
    main()
