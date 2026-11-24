import React from 'react';
import { Icon } from './icons';

export default function InputPanel({ preset, inputs, onInputChange, presets, onPresetChange }) {
  return (
    <div className="flex flex-col h-full bg-ground">
      {/* Preset selection */}
      <section className="p-4 border-b border-line">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted mb-3">
          Problem Preset
        </h2>
        <div className="space-y-1.5" role="radiogroup" aria-label="Problem Presets">
          {presets.map((p) => {
            const isSelected = preset.id === p.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => onPresetChange(p)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-[6px] text-left transition-colors flex items-center gap-3 border ${
                  isSelected
                    ? 'bg-accent-subtle border-accent-line text-accent'
                    : 'bg-transparent border-transparent text-ink hover:bg-panel-hover'
                }`}
              >
                <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <Icon
                    name={p.iconKey}
                    className="w-4 h-4"
                    stroke={isSelected ? 'var(--color-accent)' : 'currentColor'}
                  />
                </span>
                <span className="text-xs font-semibold">{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Crisp input sliders */}
      <section className="flex-1 overflow-y-auto p-4 border-b border-line">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted mb-4">
          Crisp Input Values
        </h2>
        <div className="space-y-6">
          {preset.inputs.map((inp, idx) => (
            <div key={inp.name} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label htmlFor={`input-${idx}`} className="text-xs font-medium text-ink">
                  {inp.name}
                </label>
                <div className="text-xs font-mono tabular-nums">
                  <span className="font-bold text-accent">{inputs[idx].toFixed(1)}</span>
                  <span className="text-muted ml-1">{inp.unit}</span>
                </div>
              </div>

              <div className="min-h-[44px] flex items-center">
                <input
                  id={`input-${idx}`}
                  type="range"
                  min={inp.range[0]}
                  max={inp.range[1]}
                  step={0.1}
                  value={inputs[idx]}
                  onChange={(e) => onInputChange(idx, parseFloat(e.target.value))}
                  className="w-full"
                  aria-label={`${inp.name} crisp input slider`}
                />
              </div>

              {/* Membership evaluation badges */}
              <div className="grid grid-cols-3 gap-1.5">
                {inp.membershipFunctions.map((mf, mi) => {
                  const degree = evaluateDegree(inputs[idx], mf);
                  const isActive = degree > 0;
                  return (
                    <div
                      key={mi}
                      className={`p-2 rounded-[6px] text-center border transition-colors ${
                        isActive
                          ? 'bg-panel-hover border-line-strong'
                          : 'bg-panel border-line-subtle'
                      }`}
                    >
                      <div
                        className={`text-xs font-medium truncate ${
                          isActive ? 'text-accent' : 'text-muted'
                        }`}
                      >
                        {mf.name}
                      </div>
                      <div
                        className={`text-xs font-mono tabular-nums font-bold mt-0.5 ${
                          isActive ? 'text-ink' : 'text-line-strong'
                        }`}
                      >
                        {degree.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preset description and plain spec line (no stat tiles) */}
      <footer className="p-4 bg-panel space-y-3">
        <p className="text-xs leading-relaxed text-muted">
          {preset.description}
        </p>
        <div className="pt-2 border-t border-line-subtle text-xs font-mono text-muted leading-relaxed">
          Specification: {preset.inputs.length} inputs · {preset.rules.length} rules · {preset.output.name} range [{preset.output.range[0]}, {preset.output.range[1]}]{preset.output.unit}
        </div>
      </footer>
    </div>
  );
}

function evaluateDegree(x, mf) {
  if (mf.type === 'triangular') {
    const [a, b, c] = mf.params;
    if (x <= a || x >= c) return 0;
    return x <= b ? (x - a) / (b - a) : (c - x) / (c - b);
  }
  if (mf.type === 'trapezoidal') {
    const [a, b, c, d] = mf.params;
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    return x < b ? (x - a) / (b - a) : (d - x) / (d - c);
  }
  return 0;
}
