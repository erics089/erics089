# cTrader-Implementierung — Range Filter Prop Bot

Stand der Recherche: Juli 2026

## 1. Aktuelle cTrader-Versionen

| App | Aktuelle Version | Relevanz für uns |
|---|---|---|
| **cTrader Desktop** (Windows/Mac) | 5.0.x (Release Notes bis 5.0.44) | ✅ Die einzige Umgebung mit vollem Algo-Stack: cBots entwickeln, **backtesten, optimieren**, live laufen lassen |
| **cTrader Web** | fortlaufend | cBots können laufen, aber kein volles Entwickeln/Backtesten |
| **cTrader Mobile** | 5.6 (Equity-Charts, Candle-Countdown) | Nur Monitoring, kein Algo |
| **cTrader Algo / Cloud** | Teil von cTrader 5.0 | Kostenloses **Cloud-Hosting für cBots** — Bot läuft 24/5 ohne eigenen VPS |

Quellen: https://community.ctrader.com/forum/announcements/ ·
https://www.spotware.com/news/ctrader-5-0/ · https://help.ctrader.com/ctrader-algo/

## 2. Welche Erweiterungsform ist die richtige?

cTrader Algo kennt drei Typen:

1. **cBot** ✅ **← unsere Wahl.** Automatisierter Trading-Roboter (C# oder Python).
   Kann Orders ausführen, wird im integrierten **Backtester mit echten Tick-Daten**
   getestet und optimiert, und kann kostenlos in der **cTrader Cloud** gehostet werden.
2. **Custom Indicator** — nur Anzeige, keine Orders. Für uns höchstens als
   visuelle Ergänzung.
3. **Plugin** — UI-Erweiterung (C#/Python oder Web-App via Plugin-SDK).
   **Kann NICHT backgetestet, nicht optimiert und nicht in der Cloud betrieben
   werden.** Trades brauchen bei Algo-API-Plugins eine Nutzerbestätigung.
   → Für eine Handelsstrategie ungeeignet.

**Wichtigste Erkenntnis:** cTrader hat einen eigenen, tick-genauen Backtester.
**TradingView wird nicht gebraucht** — Strategie direkt in cTrader testen und nutzen.

## 3. Der Entwurf: `RangeFilterPropBot.cs`

1:1-Port der Top-Empfehlung (Range Filter M5) aus `REPORT.md` mit Prop-Overlay:

- **Signal-Kern:** identische Mathematik wie das Pine-Skript (geglättete Range
  über Doppel-EMA, Filter-Rekursion, Upward/Downward-Zähler, Signal bei Flip).
- **Daily-Loss-Killswitch (2,5 %):** tick-genau; schließt alle Positionen und
  blockt neue Trades bis zum Tageswechsel. Puffer unter der 3 %-Regel.
- **Trailing-DD-Killswitch (5 %):** überwacht den Equity-Peak; bei Verletzung
  wird alles geschlossen und der Bot **gestoppt**. Puffer unter der 6 %-Regel.
- **Positionsgröße:** fixes Risiko (Default 0,5 % der Equity) gegen die
  SL-Distanz gerechnet — nicht "100 % Equity" wie im Pine-Prototyp. Das ist der
  entscheidende Unterschied, der den Trailing-DD real kontrolliert.
- **SL/TP:** 0,5 % / 1,0 % (1:2), als Pips an die Order gehängt — Server-seitig,
  greift also auch bei Verbindungsabbruch.

## 4. Deine Schritte (Anleitung)

### Schritt 1 — cTrader Desktop installieren (~10 Min.)
1. cTrader Desktop von deinem Broker oder von ctrader.com laden (Windows/Mac).
2. Mit deinem Demo-Konto (oder Leverage-Zugangsdaten, sobald vorhanden) einloggen.
3. Links im Menü auf den Tab **"Algo"** wechseln.

### Schritt 2 — cBot anlegen (~5 Min.)
1. Algo-Tab → Bereich **cBots** → **"+ New"** → Name `RangeFilterPropBot` → Sprache **C#**.
2. Den kompletten Inhalt von `ctrader/RangeFilterPropBot.cs` in den Editor
   kopieren (alles ersetzen).
3. **Build** klicken (Zahnrad/Hammer-Symbol). Erwartung: "Build succeeded".
   Falls Fehler kommen: Fehlermeldung kopieren und mir geben — ich fixe sie.

### Schritt 3 — Backtest direkt in cTrader (~15 Min.)
1. Im cBot rechts **"+"** → Instanz auf **EURUSD, m5** anlegen.
2. Reiter **"Backtest"**: Zeitraum 1–2 Jahre, Daten-Modus
   **"Tick data (accurate)"**, Startkapital = geplante Kontogröße,
   Kommission/Spread des Brokers eintragen.
3. Start. Danach dieselben 4 Kennzahlen prüfen wie im REPORT beschrieben:
   Max-DD < 4 %, kein Tag < −2,5 %, kein Tag > 20 % des Gesamtprofits,
   genug Handelstage pro Woche.
4. Optional Reiter **"Optimisation"**: Sampling Period (50–200) und
   Range Multiplier (2–4) optimieren lassen — danach zwingend auf einem
   NICHT optimierten Zeitraum gegentesten (Out-of-Sample).

### Schritt 4 — Demo-Forward-Test (2–4 Wochen)
1. Instanz auf dem Demo-Konto starten (Play-Button).
2. Optional: über **cTrader Cloud** hosten (kostenlos ab cTrader 5.0), dann
   läuft der Bot ohne deinen PC.

### Schritt 5 — Leverage Turbo Trade
1. Simulation-Phase mit identischen Parametern starten.
2. Vorher mit mir die Positionsgröße final rechnen: `RiskPercent` so wählen,
   dass auch eine realistische Verluststrecke (z. B. 6–8 Verluste in Folge)
   die 6 %-Trailing-Grenze nicht reißt. Faustformel: bei 0,5 % Risiko/Trade
   und Killswitch 2,5 %/Tag sind max. 5 volle Verlusttrades pro Tag möglich.

## 5. Was ich von dir brauche

| # | Info | Wofür |
|---|---|---|
| 1 | Build-Ergebnis aus Schritt 2 (OK oder Fehlermeldung) | ggf. Code-Fix |
| 2 | Backtest-Kennzahlen (Netto-Profit, Max-DD, Winrate, Trades) | Parameter-Tuning |
| 3 | Broker/Feed, den Leverage für Turbo Trade nutzt | Spread/Kommission korrekt einstellen |
| 4 | Geplante Kontogröße | exakte Risiko-Kalibrierung auf die 6 %-Grenze |

## 6. Quellen

- https://help.ctrader.com/ctrader-algo/ — offizielle Algo-Doku (C#/Python)
- https://help.ctrader.com/ctrader-algo/how-tos/cbots/create-a-cbot-in-5-mins/
- https://help.ctrader.com/ctrader-algo/documentation/plugins/ — Plugin-Grenzen
- https://help.ctrader.com/ctrader-algo/documentation/cloud-features/ — Cloud-Hosting
- https://www.spotware.com/news/ctrader-5-0/ — cTrader 5.0 (kostenloses Algo-Hosting)
- https://community.ctrader.com/forum/announcements/ — Release Notes (Desktop 5.0.44)
- https://www.financemagnates.com/forex/ctrader-mobile-56-updates-tools-for-retail-traders-as-market-set-to-hit-133b-by-this-decade/ — Mobile 5.6
