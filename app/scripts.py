"""Script-Generator für individuelle, empathische Kaltakquise-Gespräche.

Zwei Wege:
  1. Template-Engine (immer verfügbar, ohne API-Key): baut ein personalisiertes
     Script aus den Lead-Daten nach bewährter, nicht-drängender Struktur.
  2. Claude API (optional): wenn ein Anthropic-Key hinterlegt ist, wird das
     Script von Claude formuliert – natürlicher, stärker auf den Lead zugeschnitten.

Verkaufsphilosophie (bewusst so gebaut):
  - Permission-based Opener (fragt nach kurzer Erlaubnis statt zu überrumpeln)
  - Relevanz zuerst (konkreter Aufhänger aus den Lead-Infos)
  - Nutzen statt Druck (imondu = Wertsteigerung, digitales Matching)
  - Soft-Close auf einen kleinen nächsten Schritt (Info schicken / kurzer Termin)
  - Ehrlicher Umgang mit Einwänden, echtes Ausstiegsangebot ("kein Interesse -> ok")
"""
from . import db

VALUE_POINTS = [
    "imondu ist die digitale Plattform für Immobilienentwicklung – wir bringen "
    "Eigentümer und geprüfte Entwicklungspartner zusammen.",
    "Der Fokus liegt auf Wertsteigerung der Immobilie, nicht auf schnellem Verkauf.",
    "Statt kalter Klinkenputzerei entstehen über intelligentes Matching passende, "
    "geprüfte Verbindungen – transparent und mit klaren Preisstrukturen.",
]


def _first_name(contact_name: str) -> str:
    if not contact_name:
        return ""
    return contact_name.strip().split(" ")[0]


def _greeting_name(lead: dict) -> str:
    name = lead.get("contact_name") or ""
    if name:
        return f"Herr/Frau {name.split(' ')[-1]}"
    return "Ihr Team"


def build_template_script(lead: dict, settings: dict) -> str:
    rep = settings.get("sales_rep_name") or "[Ihr Name]"
    company = settings.get("sales_company", "imondu")
    enrichment = lead.get("enrichment") or {}
    fit_reasons = lead.get("fit_reasons") or []
    seg = lead.get("segment") or "Ihr Unternehmen"
    city = lead.get("city") or "Ihrer Region"
    prop = enrichment.get("property_type")
    potential = enrichment.get("potential")
    role = enrichment.get("role")
    greeting = _greeting_name(lead)
    is_b2c = lead.get("lead_type") == "b2c"
    consent = int(lead.get("consent", 0))

    # Konkreter, personalisierter Aufhänger
    if prop and potential:
        hook = (f"Wir sehen bei Objekten wie {prop.lower()}n im Raum {city} "
                f"häufig ungenutztes Potenzial – Stichwort {potential.lower()}.")
    elif seg:
        hook = (f"Wir arbeiten gerade verstärkt mit {seg}n im Raum {city} zusammen.")
    else:
        hook = f"Wir sind aktuell verstärkt im Raum {city} aktiv."

    role_line = f" – speziell mit Blick auf Ihre Rolle als {role}" if role else ""

    warning = ""
    if is_b2c and not consent:
        warning = (
            "\n⚠️  RECHTLICHER HINWEIS: Dies ist ein Privatkontakt (B2C) OHNE "
            "dokumentierte Einwilligung. Eine telefonische Kaltakquise ist in "
            "Deutschland unzulässig (§7 UWG). Bitte NICHT anrufen – nutze dieses "
            "Script erst, wenn ein Opt-in vorliegt (z.B. nach Web-Anfrage des Kunden).\n"
        )

    fit_block = ""
    if fit_reasons:
        fit_block = "\n".join(f"   • {r}" for r in fit_reasons[:4])

    script = f"""{warning}══════════════════════════════════════════════════════════
 GESPRÄCHSLEITFADEN · {lead.get('company_name') or lead.get('contact_name') or 'Lead'}
 Segment: {seg} · Ort: {city} · Score: {lead.get('score', 0)}/100
══════════════════════════════════════════════════════════

WARUM DIESER LEAD PASST
{fit_block or '   • (keine Zusatzinfos vorhanden)'}

──────────────────────────────────────────────
1) ERÖFFNUNG  (Erlaubnis einholen – nicht überrumpeln)
──────────────────────────────────────────────
„Guten Tag {greeting}, mein Name ist {rep} von {company}.
 Ich weiß, ich rufe unangekündigt an – haben Sie 30 Sekunden,
 dann sage ich Ihnen kurz, worum es geht, und Sie entscheiden,
 ob es für Sie interessant ist?“

 → Wenn NEIN: „Kein Problem, wann passt es besser – oder soll ich
   Ihnen kurz eine Info per Mail schicken?“ (Respekt zeigt Vertrauen.)

──────────────────────────────────────────────
2) RELEVANTER AUFHÄNGER  (auf den Lead gemünzt)
──────────────────────────────────────────────
„{hook}“{role_line}.

──────────────────────────────────────────────
3) NUTZEN  (Wertsteigerung, kein Druck)
──────────────────────────────────────────────
„{VALUE_POINTS[0]}
 {VALUE_POINTS[1]}“

──────────────────────────────────────────────
4) EINE OFFENE FRAGE  (zuhören, nicht pitchen)
──────────────────────────────────────────────
„Wie gehen Sie aktuell vor, wenn Sie für ein Objekt den passenden
 Entwicklungspartner suchen – eher über Ihr Netzwerk, oder wäre ein
 geprüftes digitales Matching für Sie eine Erleichterung?“

 → Aktiv zuhören. Notieren. Nicht unterbrechen.

──────────────────────────────────────────────
5) EINWÄNDE  (ehrlich, ohne Rechtfertigungsdruck)
──────────────────────────────────────────────
 • „Keine Zeit.“      → „Verstehe. Ich schicke Ihnen zwei Sätze per Mail,
                         und Sie schauen, wann es Ihnen passt. Okay?“
 • „Haben wir schon.“ → „Super, dann kennen Sie das Thema. Was funktioniert
                         bei Ihrer aktuellen Lösung gut – wo hakt es manchmal?“
 • „Kein Interesse.“  → „Alles gut, danke für die Offenheit. Darf ich Ihnen
                         einmalig eine Info schicken – falls es später relevant wird?“

──────────────────────────────────────────────
6) SANFTER ABSCHLUSS  (kleiner nächster Schritt)
──────────────────────────────────────────────
„Ich schlage vor: Ich schicke Ihnen eine kurze Übersicht per Mail,
 und wir telefonieren nächste Woche 10 Minuten, wenn Sie mögen.
 Passt Ihnen {'Dienstag oder Donnerstag' } besser?“

 → Zwei einfache Optionen statt Ja/Nein. Kein Drängen.
   Kein Termin? „Kein Problem – ich melde mich in ein paar Wochen wieder.“

──────────────────────────────────────────────
 KONTAKT
──────────────────────────────────────────────
 Ansprechpartner : {lead.get('contact_name') or '—'}
 Telefon         : {lead.get('phone') or '—'}
 E-Mail          : {lead.get('email') or '—'}
 Website         : {lead.get('website') or '—'}
"""
    return script


def _claude_prompt(lead: dict, settings: dict) -> str:
    enrichment = lead.get("enrichment") or {}
    fit = "; ".join(lead.get("fit_reasons") or [])
    tone = settings.get("script_tone", "empathisch, vertrauenswürdig, nicht drängend")
    rep = settings.get("sales_rep_name") or "[Ihr Name]"
    return f"""Du bist ein Top-Sales-Coach für empathische, seriöse B2B-Kaltakquise \
in Deutschland. Erstelle einen individuellen Telefon-Gesprächsleitfaden für einen \
Sales Executive der Plattform imondu.

Über imondu: digitale Plattform für Immobilienentwicklung; verbindet \
Immobilieneigentümer mit geprüften Entwicklungspartnern; Fokus auf Wertsteigerung \
statt Verkauf; geprüfte Profile, transparente Preise, digitales Matching.

Ton: {tone}. Niemals aufdringlich. Permission-based Opener. Nutzen vor Druck. \
Immer ehrlicher Ausstieg möglich. Auf Deutsch, per Sie.

Sales-Rep-Name: {rep}

Lead-Daten:
- Firma: {lead.get('company_name')}
- Ansprechpartner: {lead.get('contact_name')} ({enrichment.get('role', 'Rolle unbekannt')})
- Segment: {lead.get('segment')}
- Ort: {lead.get('city')}
- Objekt/Potenzial: {enrichment.get('property_type', '—')} / {enrichment.get('potential', '—')}
- Warum passend: {fit or '—'}

Struktur: (1) Erlaubnis-Opener, (2) personalisierter Aufhänger aus den Lead-Daten, \
(3) Nutzen/Wertsteigerung, (4) eine offene Frage, (5) 3 Einwandbehandlungen, \
(6) sanfter Abschluss auf einen kleinen nächsten Schritt. Kurz, sprechbar, mit \
wörtlichen Formulierungen in Anführungszeichen. Kein Fließtext-Vorwort."""


def generate_with_claude(lead: dict, settings: dict) -> str | None:
    api_key = (settings.get("anthropic_api_key") or "").strip()
    if not api_key:
        return None
    try:
        import anthropic
    except ImportError:
        return None
    try:
        client = anthropic.Anthropic(api_key=api_key)
        model = settings.get("script_model") or "claude-opus-4-8"
        msg = client.messages.create(
            model=model,
            max_tokens=1600,
            messages=[{"role": "user", "content": _claude_prompt(lead, settings)}],
        )
        parts = [b.text for b in msg.content if getattr(b, "type", "") == "text"]
        text = "\n".join(parts).strip()
        if not text:
            return None
        header = (f"══ KI-GENERIERT (Claude) · Score {lead.get('score', 0)}/100 ══\n"
                  f"Lead: {lead.get('company_name') or lead.get('contact_name')}\n\n")
        # B2C-Warnung ggf. voranstellen
        if lead.get("lead_type") == "b2c" and not int(lead.get("consent", 0)):
            header = ("⚠️ B2C ohne Einwilligung – Telefon-Kaltakquise unzulässig "
                      "(§7 UWG). Erst nach Opt-in nutzen.\n\n") + header
        return header + text
    except Exception as e:  # noqa: BLE001
        return f"[KI-Generierung fehlgeschlagen: {type(e).__name__}: {e} — "
        # (Fallback erfolgt im Aufrufer)


def generate_script(lead: dict, prefer="auto") -> dict:
    """Erzeugt ein Script. prefer: 'auto' | 'template' | 'ki'.
    Gibt {script, engine} zurück.
    """
    settings = db.get_settings()
    engine = "template"
    script = None

    if prefer in ("auto", "ki"):
        ki = generate_with_claude(lead, settings)
        if ki and not ki.startswith("[KI-Generierung fehlgeschlagen"):
            return {"script": ki, "engine": "claude"}
        if prefer == "ki":
            # explizit KI gewünscht, aber nicht verfügbar -> Hinweis + Template
            note = ("[Hinweis: KI nicht verfügbar (kein/ungültiger API-Key). "
                    "Template genutzt.]\n\n")
            return {"script": note + build_template_script(lead, settings),
                    "engine": "template-fallback"}

    script = build_template_script(lead, settings)
    return {"script": script, "engine": engine}
