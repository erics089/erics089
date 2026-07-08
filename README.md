# imondu · Sales-Dashboard

Ein schlankes Sales-Cockpit für Sales Executives der Plattform **imondu**
(digitale Plattform für Immobilienentwicklung – verbindet Eigentümer mit
geprüften Entwicklungspartnern, Fokus auf Wertsteigerung).

Es hilft dir, **passende Kandidaten automatisiert zu finden**, sie
**anzureichern**, pro Lead ein **individuelles, empathisches Anruf-Script** zu
erzeugen und deine **Kaltakquise sauber zu verwalten** (Wer wurde angerufen? Wer
geht auf Wiedervorlage?).

---

## Schnellstart

```bash
./run.sh
```

Dann im Browser öffnen: **http://localhost:8000**

Das Skript legt eine virtuelle Umgebung an, installiert die Abhängigkeiten,
befüllt die Datenbank beim ersten Start mit realistischen Demo-Leads und startet
den Server. (Manuell: `pip install -r requirements.txt && python seed.py &&
uvicorn app.main:app`.)

---

## Was kann das Dashboard?

### ⚡ Leads automatisiert finden (der Kern)
Auf Knopfdruck laufen **Workflows**, die neue Kandidaten beschaffen:

- **Auto-Generator** – erzeugt sofort passende B2B-Leads (Bauträger,
  Projektentwickler, Architekten, Hausverwaltungen, Investoren …) inklusive
  angereicherter Infos: Ansprechpartner, Objektart, Entwicklungs­potenzial,
  Firmengröße. Funktioniert immer, unabhängig von der Netzwerkfreigabe.
- **Web-Scraper** – Konnektor, der eine öffentliche Quelle durchsucht. Ist kein
  Outbound-Netz verfügbar (z. B. in isolierten Umgebungen), fällt er sauber auf
  den Generator zurück, damit die Pipeline nie leer bleibt. Eigene Zielquellen
  lassen sich in `app/leadgen.py → scrape_public_source()` eintragen.
- **CSV-Import** – eigene Listen hochladen (flexible Spaltennamen).

Jeder Lead bekommt automatisch einen **Score (0–100)** und eine Begründung,
**warum er zu imondu passt**.

### 📇 Individuelle Anruf-Scripts
Pro Lead wird ein **maßgeschneidertes Script** erzeugt, das alle ausgelesenen
Infos nutzt (Segment, Objekt, Potenzial, Ort, Rolle). Die Struktur folgt
bewährten, **empathischen** Kaltakquise-Prinzipien: Erlaubnis-Opener, relevanter
Aufhänger, Nutzen statt Druck, offene Frage, faire Einwandbehandlung, sanfter
Abschluss auf einen kleinen nächsten Schritt.

- **Ohne API-Key**: hochwertige Template-Engine (kostenlos, sofort).
- **Mit Anthropic API-Key** (in Einstellungen hinterlegen): Claude formuliert
  das Script noch natürlicher und stärker auf den Lead zugeschnitten.

### 📋 Lead- & Pipeline-Verwaltung
- Statusspalten: neu → kontaktiert → wiedervorlage → interessiert → termin →
  gewonnen / verloren / nicht anrufen.
- **Anrufe protokollieren**, Ergebnis + Notiz festhalten.
- **Wiedervorlagen**: Rückruf-Termin setzen; fällige Leads erscheinen im
  Reiter **🔔 Wiedervorlagen**.
- Suche, Filter (Status / B2B-B2C), Sortierung, KPI-Leiste, CSV-Export.

### ⚙️ Einstellungen
Name (fürs Script), Firma, Standard-Region, Script-Ton, Anthropic-Key & Modell.

---

## ⚖️ Rechtlicher Hinweis (wichtig)

Telefonische **Kaltakquise bei Privatpersonen (B2C)** ist in Deutschland ohne
vorherige **ausdrückliche Einwilligung unzulässig** (§ 7 UWG) und bußgeldbewehrt;
das Scrapen personenbezogener Daten Privater ist DSGVO-kritisch. **B2B-Akquise**
(Firmen/Gewerbe) ist unter Bedingungen zulässig.

Das Dashboard setzt das technisch um: B2C-Leads **ohne** dokumentierte
Einwilligung werden automatisch auf Status **„nicht anrufen"** gesetzt, im
Script mit einer Warnung versehen und im Score gedeckelt. Lege B2C-Kontakte erst
nach einem echten **Opt-in** (z. B. eigene Landingpage-Anfrage) auf
kontaktierbar. Der Fokus des Tools liegt bewusst auf **B2B**.

---

## Technik

- **Backend:** FastAPI + SQLite (stdlib `sqlite3`, kein ORM). REST-API unter `/api/*`.
- **Frontend:** Vanilla HTML/CSS/JS (kein Build-Schritt), Single-Page.
- **Optional:** `anthropic` SDK für KI-Scripts.
- **Daten:** lokale Datei `data/imondu.db` (per `.gitignore` ausgenommen).

### Projektstruktur
```
app/
  main.py       FastAPI-Routen + statische Auslieferung
  db.py         SQLite-Schema & Zugriff
  leadgen.py    Lead-Workflows: Generator, Scraper, Enrichment, Scoring
  scripts.py    Script-Generator (Template + Claude)
  static/       index.html · styles.css · app.js  (das Dashboard)
seed.py         Demo-Daten
run.sh          Setup + Start
```

### Eigene Scraping-Quelle anbinden
In `app/leadgen.py` die Funktion `scrape_public_source()` anpassen: Ziel-URL,
Parameter und CSS-Selektoren eintragen. `run_workflow("scrape", …)` ruft sie auf.
Bitte robots.txt und Nutzungsbedingungen der Zielseite beachten.
