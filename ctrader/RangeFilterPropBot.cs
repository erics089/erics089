// =====================================================================
// RangeFilterPropBot — cTrader cBot (C#, cTrader Algo / Desktop 5.x)
// Port der Range-Filter-Strategie (DonovanWall / guikroth) mit
// Prop-Risk-Overlay fuer Leverage "Turbo Trade":
//   - Daily-Loss-Killswitch (Default 2,5 % = Puffer unter der 3 %-Grenze)
//   - Trailing-Drawdown-Killswitch (Default 5 % = Puffer unter 6 %)
//   - Fixer SL/TP in % + risikobasierte Positionsgroesse
// Referenz (Pine-Original): strategies/range-filter-5min-prop.pine
// Empfohlen: Forex-Majors, M5-Bars, Backtest mit Tick-Daten.
// =====================================================================
using System;
using cAlgo.API;

namespace cAlgo.Robots
{
    [Robot(AccessRights = AccessRights.None)]
    public class RangeFilterPropBot : Robot
    {
        // --- Strategie-Parameter (identisch zum Pine-Skript) ---
        [Parameter("Sampling Period", DefaultValue = 100, MinValue = 2)]
        public int SamplingPeriod { get; set; }

        [Parameter("Range Multiplier", DefaultValue = 3.0, MinValue = 0.1)]
        public double RangeMultiplier { get; set; }

        // --- Prop-Risk-Overlay ---
        [Parameter("Risiko pro Trade (%)", DefaultValue = 0.5, MinValue = 0.05)]
        public double RiskPercent { get; set; }

        [Parameter("Stop-Loss (%)", DefaultValue = 0.5, MinValue = 0.05)]
        public double SlPercent { get; set; }

        [Parameter("Take-Profit (%)", DefaultValue = 1.0, MinValue = 0.05)]
        public double TpPercent { get; set; }

        [Parameter("Daily Loss Killswitch (%)", DefaultValue = 2.5, MinValue = 0.1)]
        public double DailyKillPercent { get; set; }

        [Parameter("Trailing DD Killswitch (%)", DefaultValue = 5.0, MinValue = 0.5)]
        public double TrailingKillPercent { get; set; }

        [Parameter("Shorts erlauben", DefaultValue = true)]
        public bool AllowShorts { get; set; }

        private const string Label = "RangeFilterProp";

        // Range-Filter-Zustand
        private double _emaAbsDiff;   // EMA(|close-close[1]|, per)
        private double _smoothRange;  // EMA(davon, per*2-1) * mult
        private double _filt;
        private int _upward, _downward, _condIni;
        private long _warmupBars;
        private bool _initialized;

        // Risk-Zustand
        private DateTime _currentDay;
        private double _dayStartEquity;
        private double _equityPeak;
        private bool _killedToday;
        private bool _killedTrailing;

        protected override void OnStart()
        {
            _currentDay = Server.Time.Date;
            _dayStartEquity = Account.Equity;
            _equityPeak = Account.Equity;
        }

        protected override void OnTick()
        {
            // Killswitches laufen tick-genau, nicht nur auf Bar-Schluss
            RollDailyWindow();
            _equityPeak = Math.Max(_equityPeak, Account.Equity);

            if (!_killedTrailing && Account.Equity <= _equityPeak * (1 - TrailingKillPercent / 100.0))
            {
                _killedTrailing = true;
                CloseAll("Trailing-DD Killswitch");
                Print("TRAILING-DD KILLSWITCH: Bot gestoppt. Equity {0:F2}, Peak {1:F2}", Account.Equity, _equityPeak);
                Stop();
                return;
            }

            if (!_killedToday && Account.Equity <= _dayStartEquity * (1 - DailyKillPercent / 100.0))
            {
                _killedToday = true;
                CloseAll("Daily Killswitch");
                Print("DAILY KILLSWITCH: keine neuen Trades bis Tageswechsel.");
            }
        }

        protected override void OnBar()
        {
            RollDailyWindow();

            int i = Bars.Count - 2; // letzte GESCHLOSSENE Bar
            if (i < 1)
                return;

            double src = Bars.ClosePrices[i];
            double prevSrc = Bars.ClosePrices[i - 1];

            // --- Smooth Range: EMA(|diff|, per) -> EMA(., per*2-1) * mult ---
            double diff = Math.Abs(src - prevSrc);
            double a1 = 2.0 / (SamplingPeriod + 1);
            double a2 = 2.0 / (SamplingPeriod * 2 - 1 + 1);

            if (!_initialized)
            {
                _emaAbsDiff = diff;
                _smoothRange = diff * RangeMultiplier;
                _filt = src;
                _initialized = true;
                return;
            }

            _emaAbsDiff = a1 * diff + (1 - a1) * _emaAbsDiff;
            double emaEma = a2 * _emaAbsDiff + (1 - a2) * (_smoothRange / Math.Max(RangeMultiplier, 1e-10));
            _smoothRange = emaEma * RangeMultiplier;

            // --- Range Filter Rekursion (identisch zum Pine-Original) ---
            double prevFilt = _filt;
            if (src > prevFilt)
                _filt = (src - _smoothRange < prevFilt) ? prevFilt : src - _smoothRange;
            else
                _filt = (src + _smoothRange > prevFilt) ? prevFilt : src + _smoothRange;

            _upward = _filt > prevFilt ? _upward + 1 : (_filt < prevFilt ? 0 : _upward);
            _downward = _filt < prevFilt ? _downward + 1 : (_filt > prevFilt ? 0 : _downward);

            bool longCond = src > _filt && _upward > 0;
            bool shortCond = src < _filt && _downward > 0;

            int prevCondIni = _condIni;
            _condIni = longCond ? 1 : (shortCond ? -1 : _condIni);

            bool longSignal = longCond && prevCondIni == -1;
            bool shortSignal = shortCond && prevCondIni == 1;

            // Warmup: erst handeln, wenn die EMAs eingeschwungen sind
            _warmupBars++;
            if (_warmupBars < SamplingPeriod * 3)
                return;

            if (_killedToday || _killedTrailing)
                return;

            if (longSignal)
            {
                CloseAll("Signalwechsel Long");
                Enter(TradeType.Buy);
            }
            else if (shortSignal && AllowShorts)
            {
                CloseAll("Signalwechsel Short");
                Enter(TradeType.Sell);
            }
        }

        private void Enter(TradeType direction)
        {
            double price = direction == TradeType.Buy ? Symbol.Ask : Symbol.Bid;
            double slPips = price * (SlPercent / 100.0) / Symbol.PipSize;
            double tpPips = price * (TpPercent / 100.0) / Symbol.PipSize;

            // Positionsgroesse: fixes Risiko in % der Equity gegen die SL-Distanz
            double riskAmount = Account.Equity * (RiskPercent / 100.0);
            double volumeUnits = riskAmount / (slPips * Symbol.PipValue);
            double volume = Symbol.NormalizeVolumeInUnits(volumeUnits, RoundingMode.Down);

            if (volume < Symbol.VolumeInUnitsMin)
            {
                Print("Volumen {0} unter Minimum {1} — Trade uebersprungen.", volume, Symbol.VolumeInUnitsMin);
                return;
            }

            var result = ExecuteMarketOrder(direction, SymbolName, volume, Label, slPips, tpPips);
            if (!result.IsSuccessful)
                Print("Order fehlgeschlagen: {0}", result.Error);
        }

        private void CloseAll(string reason)
        {
            foreach (var position in Positions.FindAll(Label, SymbolName))
            {
                Print("Schliesse Position #{0} ({1})", position.Id, reason);
                ClosePosition(position);
            }
        }

        private void RollDailyWindow()
        {
            if (Server.Time.Date != _currentDay)
            {
                _currentDay = Server.Time.Date;
                _dayStartEquity = Account.Equity;
                _killedToday = false;
            }
        }
    }
}
