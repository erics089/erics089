# TradingView-Strategie-Recherche — Leverage "Turbo Trade" (Prop-Trading)

Recherche-Datum: 2026-07-07
Ziel: Existierende, im TradingView Strategy Tester backtestbare Strategie finden, die die
Turbo-Trade-Regeln erfüllt (Daily Loss < 3 %, Trailing DD < 6 %, Consistency ≤ 20 %,
1:30 Leverage, Trades ≥ 1–10 min Haltedauer, cTrader-/Copy-Trading-tauglich).

---

## Ehrliche Vorab-Einordnung

Die Kombination **+10 %/Monat** + **max. 6 % Trailing-DD** + **≤ 3 % Daily-DD** +
**Consistency ≤ 20 %** bei **1:30** ist die härteste denkbare Regel-Kombination.
Der bindende Engpass ist fast nie die Rendite, sondern der **6 % Trailing-Drawdown**
zusammen mit der **Consistency-Regel**:

- **Trendfolge** (SuperTrend, Lorentzian, UT Bot pur) erzeugt Rendite über wenige große
  Gewinntage → reißt die Consistency-Regel, Roh-DD meist > 6 %. Braucht harten Risk-Overlay.
- **Frequente Mean-Reversion / Range-Filter** auf M1–M15 passt strukturell besser zu
  Consistency + Frequenz + Haltedauer, leidet aber unter Spread/Slippage.
- Marketing-Zahlen wie „40 % Return / 3,49 % DD" (Atlantium etc.) stammen von
  **Closed-Source-Skripten** — mit hoher Wahrscheinlichkeit curve-fitted und
  out-of-sample nicht reproduzierbar. Unten explizit als unverifizierbar markiert.

**Fazit:** Keine öffentlich verfügbare Strategie erfüllt „out of the box" alle Kriterien
nachweisbar. Realistischer Weg: robuste, offene Basis-Strategie + **Prop-Risk-Overlay**
(Daily-Loss-Killswitch, fixer SL/TP, Consistency-Sizing) — genau das liefern die
Skripte in `strategies/`.

---

## Ranking der Kandidaten (beste Passung zuerst)

### 1. Range Filter + ATR Strategy (Low Drawdown) — TOLLBOOTH
- Link: https://www.tradingview.com/script/LhFKyg82-Range-Filter-ATR-Strategy-Low-Drawdown/
- Kernidee: Range-Filter (DEMA-basiert) filtert Rauschen; ATR-basiertes Position-Sizing
  + Trailing-Stop, Default 1 % Risiko/Trade. Explizit auf niedrigen DD ausgelegt.
- Ein/Aus: Long bei Dreh über Range-Filter + Aufwärts-Count; Exit über ATR-Trailing /
  Gegensignal.
- Instrument/TF: Forex-Majors, Gold, Indizes; M5–M15.
- Winrate: herstellerseitig ~50–60 % (nicht unabhängig verifiziert).
- DD: als „Low Drawdown" beworben; selbst zu verifizieren.
- Frequenz: mittel-hoch, mehrere Trades/Tag auf M5.
- Passung: ★★★★☆ — bestes strukturelles Match (Sizing + TF + Haltedauer).

### 2. Range Filter Buy & Sell 5min (guikroth-Version) — PHVNTOM_TRADER
- Link: https://www.tradingview.com/script/J8GzFGfD-Range-Filter-Buy-and-Sell-5min-guikroth-version/
- Kernidee: Klassischer DonovanWall-Range-Filter, für M5-Forex getunt; Open Source.
- Ein/Aus: Long bei Bruch über Filter mit Aufwärts-Momentum; Wechsel bei Gegensignal.
- Instrument/TF: Forex-Majors M5 (auch M15).
- Winrate: ~50–55 % (variiert stark). DD roh oft > 6 % → Risk-Overlay nötig.
- Frequenz: hoch (gut für „Min. Profitable Days").
- Passung: ★★★★☆ — Haltedauer 1–10 min ideal, cTrader-tauglich.
- Code: `strategies/range-filter-5min-prop.pine`

### 3. UT Bot Alerts (Strategy) — QuantNomad / Yo_adriiiiaan (Original-Idee HPotter)
- Link: https://www.tradingview.com/script/n8ss8BID-UT-Bot-Alerts/
- Kernidee: ATR-Trailing-Stop + EMA-Filter. Open Source, no-repaint.
- Ein/Aus: Buy wenn Preis > ATR-Trailing-Stop und EMA kreuzt darüber; Sell spiegelbildlich.
- Instrument/TF: universal; berichtet ~60 % (EUR/USD H4), ~66 % Krypto (nicht unabhängig).
- Frequenz: mittel (mehr auf kleineren TF).
- Passung: ★★★★☆ — sauberer, verifizierbarer Code; braucht SL/TP-Overlay.
- Code: `strategies/ut-bot-prop.pine`

### 4. WaveTrend Oscillator — LazyBear
- Link: https://www.tradingview.com/script/2KE8wTuF-Indicator-WaveTrend-Oscillator-WT/
- Mean-Reversion-Oszillator, Open Source. ~55–65 % Winrate in Range-Phasen, schlecht in
  starken Trends. Frequente kleine Gewinne → gutes Consistency-Profil.
- Passung: ★★★☆☆

### 5. SuperTrend Strategy (Standard)
- Link: https://www.tradingview.com/scripts/supertrend/
- ATR-Bänder um hl2; Profit-Faktor ~2,1 (Forex, herstellerseitig). Reißt die
  Consistency-Regel häufig; DD oft > 6 %. Als Confluence-Filter wertvoller als standalone.
- Passung: ★★★☆☆

### 6. Machine Learning: Lorentzian Classification — jdehorty
- Link: https://www.tradingview.com/script/WhBzgfDu-Machine-Learning-Lorentzian-Classification/
- kNN mit Lorentz-Distanz über Feature-Space (RSI/WT/CCI/ADX). Open Source,
  „Most Valuable Script 2023", > 14 000 Boosts, Top-50 global.
- Ist ein Indikator, kein Strategy-Objekt → Strategy-Port in
  `strategies/lorentzian-knn-prop.pine`. TradeSearcher listet ~96 Backtests;
  Performance stark asset-/TF-abhängig. Consistency & DD kritisch (swing-lastig).
- Passung: ★★★☆☆ — hohes Edge-Potenzial, aber Aufwand + Overfitting-Gefahr.

### 7. Nadaraya-Watson Envelope (Mean Reversion) — LuxAlgo
- Link: https://www.tradingview.com/script/Iko0E2kL-Nadaraya-Watson-Envelope-LUX/
- Kernel-Regression-Bänder; Fade an Extrembändern. ⚠️ Standard-Version repaint —
  nur Non-Repaint-Variante verwertbar.
- Passung: ★★★☆☆

### 8. Lone Wolf MITS v1.1.3 — lonewolftradinggroup
- Link: https://www.tradingview.com/script/adDD6JqU-Lone-Wolf-Trading-Group-MITS-v1-1-3/
- 9-Confluence-Scoring, DD als Primär-Constraint. ⚠️ Futures + invite-only →
  Leverage-/Instrument-Mismatch.
- Passung: ★★☆☆☆

### 9. Atlantium Gold Ultra — Charlycalvoes
- Link: https://www.tradingview.com/script/Bjez8v7B/
- Behauptet ~40 % Return / 3,49 % DD auf Gold. ⚠️ Closed Source, nicht verifizierbar,
  hält über Nacht/Wochenende (Gap-Risiko fürs Daily-Limit).
- Passung: ★★☆☆☆

### 10. Eclipse Ceres Strategy — EclipseCharts
- Link: https://www.tradingview.com/script/WvlRaQzu-Eclipse-Ceres-Strategy/
- Low-Frequency, High-Quality-Setups. ⚠️ Niedrige Frequenz gefährdet
  „Min. 3 Profitable Days"; Closed Source.
- Passung: ★★☆☆☆

### 11. Trading On The Go (TOTG)
- ATR-Stops 1–2 %/Trade. ⚠️ Closed/Marketing, nicht verifizierbar.
- Passung: ★★☆☆☆

### 12. CJ Futures Low-Drawdown Backtest — euealbule30
- Link: https://www.tradingview.com/script/OQYG2KC5-CJ-Futures-Low-Drawdown-Backtest/
- ⚠️ Futures → Leverage-Mismatch.
- Passung: ★★☆☆☆

### 13. trustdan/trend-following-backtesting-strategies (GitHub)
- Link: https://github.com/trustdan/trend-following-backtesting-strategies
- 210+ Strategie/Instrument-Kombis systematisch getestet; beste Einzelwerte 3,96 % Max-DD
  (CAT), 72 % Winrate (UNH). ⚠️ US-Aktien/ETFs auf Daily-TF — Ideenfundus, nicht direkt
  Prop-tauglich.
- Passung: ★★☆☆☆

---

## 🎯 Top-Empfehlung

**Range Filter (Konzept #1/TOLLBOOTH), umgesetzt über die offene
Range-Filter-5min-Strategy (#2) mit Prop-Overlay** → `strategies/range-filter-5min-prop.pine`

Begründung:
1. **Haltedauer & Ausführung:** M5-Signale ⇒ ~1–10+ min Trades, sauber über
   cTrader/Copy-Trading replizierbar, nicht latenzkritisch.
2. **Frequenz:** Mehrere Trades/Tag ⇒ „3 × ≥ 0,5 %-Tage" realistisch erfüllbar.
3. **Consistency ≤ 20 %:** Viele gleichartige kleine Gewinne statt weniger Home-Runs.
4. **DD-Kontrolle:** Enger fixer SL (0,5 %) + Daily-Loss-Killswitch bei 2,5 %
   (Puffer unter 3 %); 6 %-Trailing-DD zusätzlich über Positionsgröße steuern.
5. **Verifizierbarkeit:** Vollständig Open Source — im Gegensatz zu den
   Closed-Source-Marketing-Skripten.

**Realistische Erwartung:** +10 %/Monat ist nicht garantiert. Im Strategy Tester über
mehrere Jahre, mehrere Forex-Paare, mit realem Spread/Kommission (im Code enthalten)
prüfen. Sampling-Period/Multiplier + SL/TP pro Instrument optimieren und
out-of-sample validieren; ggf. auf 1–2 unkorrelierte Paare verteilen.

**Fallback-Reihenfolge:** #2 (Range Filter) → #3 (UT Bot) → #1 (TOLLBOOTH-Original) →
#4 (WaveTrend) → #6 (Lorentzian-Port).

---

## Quellen

- https://lunefi.com/blog/best-tradingview-indicators-2026-backtested-win-rates
- https://www.thinkmarkets.com/en/trading-academy/trading-view/best-community-tradingview-strategies-to-trade-in-2026/
- https://www.tradingview.com/script/LhFKyg82-Range-Filter-ATR-Strategy-Low-Drawdown/
- https://www.tradingview.com/script/J8GzFGfD-Range-Filter-Buy-and-Sell-5min-guikroth-version/
- https://www.tradingview.com/script/lut7sBgG-Range-Filter-DW/
- https://www.tradingview.com/script/n8ss8BID-UT-Bot-Alerts/
- https://www.tradingview.com/script/WhBzgfDu-Machine-Learning-Lorentzian-Classification/
- https://tradesearcher.ai/strategies/2019-lorentzian-classification-strategy
- https://www.tradingview.com/script/Bjez8v7B/
- https://www.tradingview.com/script/adDD6JqU-Lone-Wolf-Trading-Group-MITS-v1-1-3/
- https://www.tradingview.com/script/WvlRaQzu-Eclipse-Ceres-Strategy/
- https://www.tradingview.com/script/OQYG2KC5-CJ-Futures-Low-Drawdown-Backtest/
- https://github.com/trustdan/trend-following-backtesting-strategies
- https://propfirmpinescripts.com/
- https://the5ers.com/prop-firm-drawdown-rules-explained-daily-max-and-trailing-limits-in-2026/
