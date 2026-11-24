import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './icons';

export default function ExplanationPanel({ stepInfo, currentStep, handCalc, preset, pipeline }) {
  const [showCalc, setShowCalc] = useState(false);
  const info = stepInfo[currentStep];

  return (
    <div className="flex flex-col h-full bg-ground">
      {/* Header */}
      <header className="p-4 border-b border-line">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted">
          Explanation & Ledger
        </h2>
      </header>

      {/* Main explanation body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted mb-1">
                Step {currentStep + 1} of {stepInfo.length}
              </div>
              <h3 className="text-base font-bold text-ink">{info.title}</h3>
            </div>

            <p className="text-xs leading-relaxed text-ink">
              {info.description}
            </p>

            {info.formula && (
              <div className="p-3 rounded-[6px] bg-panel border border-line space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted">
                  Governing Equation
                </div>
                <div className="text-xs font-mono text-accent leading-relaxed">
                  {info.formula}
                </div>
              </div>
            )}

            {info.highlight && (
              <div className="p-3 rounded-[6px] bg-accent-subtle border border-accent-line space-y-1">
                <div className="text-xs uppercase tracking-wider font-semibold text-accent">
                  Controller Behavior
                </div>
                <p className="text-xs leading-relaxed text-ink">
                  {info.highlight}
                </p>
              </div>
            )}

            {/* Final output summary when on Step 4 */}
            {currentStep >= 4 && pipeline && (
              <div className="p-4 rounded-[6px] bg-panel border border-line space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted">
                  Controller Output
                </div>
                <div className="flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-xl font-bold text-accent">
                    {pipeline.result.output.toFixed(2)}
                  </span>
                  <span className="text-xs text-ink">{preset.output.unit}</span>
                </div>
                <div className="text-xs text-muted">{preset.output.name}</div>
              </div>
            )}

            {/* Active rules list on Steps 2-4 */}
            {currentStep >= 2 && pipeline && (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider font-semibold text-muted">
                  Active Rules Firing
                </div>
                <div className="space-y-1.5">
                  {pipeline.evaluatedRules
                    .map((r, i) => ({ ...r, originalIndex: i }))
                    .filter((r) => r.firingStrength > 0)
                    .map((r) => (
                      <div
                        key={r.originalIndex}
                        className="flex items-center justify-between text-xs p-2 rounded-[6px] bg-panel border border-line"
                      >
                        <span className="font-mono text-ink">
                          Rule {r.originalIndex + 1}
                        </span>
                        <span className="font-mono tabular-nums text-accent">
                          w = {r.firingStrength.toFixed(3)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hand calculation verification accordion */}
      <footer className="border-t border-line">
        <button
          onClick={() => setShowCalc(!showCalc)}
          aria-expanded={showCalc}
          className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-ink hover:bg-panel-hover transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span>Hand Calculation Ledger</span>
          <Icon
            name={showCalc ? 'chevronUp' : 'chevronDown'}
            className="w-4 h-4 text-muted"
          />
        </button>

        <AnimatePresence>
          {showCalc && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 max-h-64 overflow-y-auto border-t border-line bg-panel space-y-1">
                {handCalc.map((line, idx) => (
                  <LedgerLine key={idx} line={line} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
}

function LedgerLine({ line }) {
  if (line.type === 'divider') {
    return <div className="my-2 h-px bg-line" />;
  }

  if (line.type === 'header') {
    return (
      <div className="text-xs font-bold text-ink mb-1">
        {line.text}
      </div>
    );
  }

  if (line.type === 'subheader') {
    return (
      <div className="text-xs font-semibold text-accent uppercase tracking-wider mt-2 mb-1">
        {line.text}
      </div>
    );
  }

  if (line.type === 'label') {
    return (
      <div className="text-xs font-medium text-ink">
        {line.text}
      </div>
    );
  }

  if (line.type === 'formula') {
    return (
      <div className="text-xs font-mono text-accent py-0.5">
        {line.text}
      </div>
    );
  }

  if (line.type === 'result') {
    return (
      <div className="text-xs font-mono tabular-nums font-bold text-accent pt-1">
        {line.text}
      </div>
    );
  }

  return (
    <div
      className={`text-xs font-mono tabular-nums leading-relaxed ${
        line.highlight ? 'text-accent' : 'text-muted'
      }`}
    >
      {line.text}
    </div>
  );
}
