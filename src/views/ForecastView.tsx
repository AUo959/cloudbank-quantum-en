import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Send,
  Loader2,
} from 'lucide-react';
import { EXAMPLE_FORECAST } from '@/lib/constellation';
import { cn } from '@/lib/utils';
import type { ForecastInput, ForecastResult } from '@/lib/types';

const REGIONS = [
  'Indo-Pacific',
  'Middle East',
  'Europe',
  'Africa',
  'Latin America',
  'Arctic',
];

export function ForecastView() {
  const [form, setForm] = useState<ForecastInput>({
    scenario: '',
    region: 'Indo-Pacific',
    timeframeMonths: 12,
    confidenceThreshold: 0.6,
    includeCascades: true,
  });
  const [result, setResult] = useState<ForecastResult | null>(EXAMPLE_FORECAST);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scenario.trim()) return;
    setIsSubmitting(true);
    setResult(null);
    // Simulate forecast generation
    setTimeout(() => {
      setResult({
        ...EXAMPLE_FORECAST,
        scenario: form.scenario,
        region: form.region,
        timeframe: `${Math.round(form.timeframeMonths * 0.5)}-${form.timeframeMonths} months`,
        confidence: form.confidenceThreshold + Math.random() * (1 - form.confidenceThreshold) * 0.5,
        timestamp: new Date(),
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp size={12} className="text-status-error" />;
    if (trend === 'down') return <TrendingDown size={12} className="text-status-warning" />;
    return <Minus size={12} className="text-space-text-muted" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-space-border shrink-0">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-gold" />
          <h1 className="text-sm font-semibold text-space-text">QSFE Forecast Engine</h1>
          <span className="text-[10px] font-mono text-space-text-muted px-2 py-0.5 rounded-full bg-space-surface-2 border border-space-border">
            QUANTUM SCENARIO · READY
          </span>
        </div>
      </div>

      {/* Content - Two Column */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left - Form */}
        <div className="w-[380px] shrink-0 border-r border-space-border overflow-y-auto overscroll-contain p-5">
          <h2 className="text-xs font-semibold text-space-text-secondary uppercase tracking-wider mb-4">
            Scenario Parameters
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Scenario */}
            <div>
              <label className="block text-[11px] font-medium text-space-text-secondary mb-1.5">
                Scenario Description
              </label>
              <textarea
                value={form.scenario}
                onChange={(e) => setForm({ ...form, scenario: e.target.value })}
                data-testid="forecast-scenario"
                rows={4}
                placeholder="Describe the geopolitical scenario to analyze..."
                className="w-full resize-none bg-space-bg border border-space-border rounded-lg px-3 py-2.5 text-[13px] text-space-text placeholder:text-space-text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-[11px] font-medium text-space-text-secondary mb-1.5">
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                data-testid="forecast-region"
                className="w-full bg-space-bg border border-space-border rounded-lg px-3 py-2.5 text-[13px] text-space-text focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-colors appearance-none cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-[11px] font-medium text-space-text-secondary mb-1.5">
                Timeframe: <span className="text-teal font-mono">{form.timeframeMonths} months</span>
              </label>
              <input
                type="range"
                min={1}
                max={120}
                value={form.timeframeMonths}
                onChange={(e) => setForm({ ...form, timeframeMonths: parseInt(e.target.value) })}
                data-testid="forecast-timeframe"
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-[9px] font-mono text-space-text-muted mt-1">
                <span>1mo</span>
                <span>120mo</span>
              </div>
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-[11px] font-medium text-space-text-secondary mb-1.5">
                Confidence Threshold: <span className="text-teal font-mono">{form.confidenceThreshold.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.confidenceThreshold * 100}
                onChange={(e) =>
                  setForm({ ...form, confidenceThreshold: parseInt(e.target.value) / 100 })
                }
                data-testid="forecast-confidence"
                className="w-full accent-teal"
              />
              <div className="flex justify-between text-[9px] font-mono text-space-text-muted mt-1">
                <span>0.00</span>
                <span>1.00</span>
              </div>
            </div>

            {/* Include Cascades */}
            <div className="flex items-center justify-between py-2">
              <label className="text-[11px] font-medium text-space-text-secondary">
                Include Cascade Analysis
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, includeCascades: !form.includeCascades })}
                data-testid="forecast-cascades"
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  form.includeCascades ? 'bg-teal' : 'bg-space-border'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform',
                    form.includeCascades ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !form.scenario.trim()}
              data-testid="forecast-submit"
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-all',
                form.scenario.trim() && !isSubmitting
                  ? 'bg-teal text-space-bg hover:bg-teal-bright'
                  : 'bg-space-surface-2 text-space-text-muted cursor-not-allowed border border-space-border'
              )}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {isSubmitting ? 'Processing Scenario...' : 'Submit Forecast'}
            </button>
          </form>
        </div>

        {/* Right - Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          <AnimatePresence mode="wait">
            {isSubmitting && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4"
              >
                <Loader2 size={32} className="text-teal animate-spin" />
                <p className="text-[13px] text-space-text-secondary">
                  QSFE engine processing scenario parameters...
                </p>
              </motion.div>
            )}

            {!isSubmitting && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Scenario Header */}
                <div className="bg-space-surface border border-space-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gold uppercase tracking-wider">
                      Forecast Result
                    </span>
                    <span className="text-[10px] font-mono text-space-text-muted">
                      {result.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-space-text leading-relaxed mb-3">
                    {result.scenario}
                  </p>
                  <div className="flex gap-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-plasma/10 text-plasma-bright border border-plasma/15">
                      {result.region}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/15">
                      {result.timeframe}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/15">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Primary Outcome */}
                <div className="bg-space-surface border border-space-border rounded-xl p-4">
                  <h3 className="text-[11px] font-semibold text-space-text-secondary uppercase tracking-wider mb-2">
                    Primary Outcome Assessment
                  </h3>
                  <p className="text-[13px] text-space-text leading-relaxed">
                    {result.primaryOutcome}
                  </p>
                </div>

                {/* Key Indicators */}
                <div>
                  <h3 className="text-[11px] font-semibold text-space-text-secondary uppercase tracking-wider mb-2">
                    Key Indicators
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {result.keyIndicators.map((ind) => (
                      <div
                        key={ind.label}
                        className="bg-space-surface border border-space-border rounded-lg p-3"
                      >
                        <span className="text-[10px] text-space-text-muted block mb-1">
                          {ind.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold font-mono tabular-nums text-space-text">
                            {ind.value}
                          </span>
                          <TrendIcon trend={ind.trend} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cascade Effects */}
                {form.includeCascades && (
                  <div className="bg-space-surface border border-space-border rounded-xl p-4">
                    <h3 className="text-[11px] font-semibold text-space-text-secondary uppercase tracking-wider mb-3">
                      Cascade Effects
                    </h3>
                    <div className="space-y-2.5">
                      {result.cascadeEffects.map((effect, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-[10px] font-mono text-teal shrink-0 mt-0.5">
                            C{i + 1}
                          </span>
                          <p className="text-[12px] text-space-text-secondary leading-relaxed">
                            {effect}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                <div className="bg-space-surface border border-space-border rounded-xl p-4">
                  <h3 className="text-[11px] font-semibold text-space-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle size={13} className="text-status-warning" />
                    Risk Factors
                  </h3>
                  <div className="space-y-2">
                    {result.riskFactors.map((risk, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-[10px] font-mono text-status-warning shrink-0 mt-0.5">
                          R{i + 1}
                        </span>
                        <p className="text-[12px] text-space-text-secondary leading-relaxed">
                          {risk}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {!isSubmitting && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-3 text-center"
              >
                <BarChart3 size={40} className="text-space-text-muted" />
                <p className="text-[13px] text-space-text-secondary">
                  Configure scenario parameters and submit to generate a forecast.
                </p>
                <p className="text-[11px] text-space-text-muted">
                  The QSFE engine analyzes geopolitical scenarios with cascade modeling.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
