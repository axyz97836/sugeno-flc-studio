import React from 'react';
import { motion } from 'framer-motion';

export default function DefuzzView({ preset, pipeline, currentStep }) {
  const active = pipeline.result.details.filter((d) => d.firingStrength > 0);
  const { result } = pipeline;

  if (currentStep === 3) {
    if (active.length === 0) {
      return (
        <div className="p-6 rounded-[8px] bg-panel border border-line text-center text-xs text-muted">
          No fuzzy rules fired with non-zero firing strength for the current inputs.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {active.map((d, i) => (
          <motion.div
            key={d.ruleIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className="rounded-[8px] p-4 bg-panel border border-line space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] bg-accent-subtle border border-accent-line text-accent">
                Rule {d.ruleIndex + 1}
              </span>
              <span className="text-xs font-mono text-muted truncate max-w-[60%]">
                {d.antecedents.join(' ∧ ')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted">
                <span>Firing Weight (wᵢ)</span>
                <span className="font-mono tabular-nums font-bold text-ink">
                  {d.firingStrength.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Rule Output (zᵢ)</span>
                <span className="font-mono tabular-nums font-bold text-ink">
                  {d.ruleOutput} {preset.output.unit}
                </span>
              </div>
              <div className="h-px bg-line" />
              <div className="flex justify-between items-center font-bold text-accent">
                <span>Weighted Output (wᵢ × zᵢ)</span>
                <span className="font-mono tabular-nums">
                  {d.contribution.toFixed(4)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (currentStep === 4) {
    const maxContrib = active.length > 0 ? Math.max(...active.map((r) => r.contribution)) : 0;

    return (
      <div className="space-y-5">
        {/* Formula breakdown */}
        <div className="text-center py-4 rounded-[8px] bg-panel border border-line space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted">
            Sugeno Weighted Average Equation
          </div>
          <div className="font-mono text-base font-bold text-ink">
            z* = Σ(wᵢ × zᵢ) / Σ(wᵢ)
          </div>
        </div>

        {/* Numerator */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted">
            Numerator: Σ(wᵢ × zᵢ)
          </div>
          <div className="p-3.5 rounded-[8px] bg-panel border border-line font-mono tabular-nums text-xs leading-relaxed text-ink">
            {active.length === 0 ? (
              <span>0.0000</span>
            ) : (
              <>
                {active.map((d, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-line-strong"> + </span>}
                    <span>({d.firingStrength.toFixed(3)} × {d.ruleOutput})</span>
                  </span>
                ))}
                <span className="text-line-strong"> = </span>
                <span className="font-bold text-accent">{result.numerator.toFixed(4)}</span>
              </>
            )}
          </div>
        </div>

        {/* Denominator */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted">
            Denominator: Σ(wᵢ)
          </div>
          <div className="p-3.5 rounded-[8px] bg-panel border border-line font-mono tabular-nums text-xs leading-relaxed text-ink">
            {active.length === 0 ? (
              <span>0.0000</span>
            ) : (
              <>
                {active.map((d, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-line-strong"> + </span>}
                    <span>{d.firingStrength.toFixed(3)}</span>
                  </span>
                ))}
                <span className="text-line-strong"> = </span>
                <span className="font-bold text-accent">{result.denominator.toFixed(4)}</span>
              </>
            )}
          </div>
        </div>

        {/* Final output card: flat fill, solid contrast */}
        <div className="text-center py-6 px-4 rounded-[8px] bg-accent-subtle border border-accent-line space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted">
            Crisp Defuzzified Output
          </div>
          <div className="font-mono tabular-nums text-xs text-muted">
            {result.numerator.toFixed(4)} / {result.denominator.toFixed(4)}
          </div>
          <div className="pt-2 flex items-baseline justify-center gap-1.5">
            <span className="text-xl sm:text-[28px] font-bold font-mono tabular-nums text-accent">
              {result.output.toFixed(2)}
            </span>
            <span className="text-base text-ink">{preset.output.unit}</span>
          </div>
          <div className="text-xs text-muted">{preset.output.name}</div>
        </div>

        {/* Contribution breakdown bars: flat solid fill */}
        {active.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-muted">
              Rule Contributions to Final Output
            </div>
            <div className="space-y-2">
              {active.map((d) => {
                const pct = maxContrib > 0 ? (d.contribution / maxContrib) * 100 : 0;
                return (
                  <div key={d.ruleIndex} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-14 text-muted">Rule {d.ruleIndex + 1}</span>
                    <div className="flex-1 h-5 rounded-[4px] bg-panel border border-line overflow-hidden">
                      <div
                        className="h-full bg-accent px-2 flex items-center justify-end text-[12px] font-bold text-ground tabular-nums"
                        style={{ width: `${Math.max(pct, 14)}%` }}
                      >
                        {d.contribution.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
