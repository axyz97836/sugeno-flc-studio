import React from 'react';

export default function RuleMatrix({ preset, evaluatedRules, currentStep }) {
  const m1 = preset.inputs[0].membershipFunctions;
  const m2 = preset.inputs[1].membershipFunctions;
  const showFiring = currentStep >= 2;
  const getRule = (i, j) => evaluatedRules[i * m2.length + j];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="font-semibold text-ink">{preset.inputs[0].name}</span>
        <span>×</span>
        <span className="font-semibold text-ink">{preset.inputs[1].name}</span>
        <span>→</span>
        <span className="font-semibold text-accent">{preset.output.name} Consequent</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full border-separate border-spacing-2 min-w-[340px]">
          <thead>
            <tr>
              <th className="p-2 text-xs font-semibold text-muted text-left">
                {preset.inputs[0].short} \ {preset.inputs[1].short}
              </th>
              {m2.map((m, j) => (
                <th
                  key={j}
                  className="p-2 text-xs font-semibold text-center text-muted"
                >
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m1.map((mf1, i) => (
              <tr key={i}>
                <td
                  className="p-2 text-xs font-semibold text-right whitespace-nowrap text-muted"
                >
                  {mf1.name}
                </td>
                {m2.map((_, j) => {
                  const r = getRule(i, j);
                  const strength = showFiring ? r.firingStrength : 0;
                  const isActive = showFiring && strength > 0;

                  return (
                    <td key={j} className="p-0">
                      <div
                        className={`p-3 rounded-[6px] text-center border transition-colors ${
                          isActive
                            ? 'bg-accent-subtle border-accent-line'
                            : 'bg-panel border-line'
                        }`}
                      >
                        <div
                          className={`text-sm font-bold font-mono tabular-nums ${
                            isActive ? 'text-accent' : 'text-ink'
                          }`}
                        >
                          {r.consequent}
                          <span className="text-xs font-normal text-muted ml-0.5">
                            {preset.output.unit}
                          </span>
                        </div>

                        {showFiring && (
                          <div
                            className={`text-xs font-mono tabular-nums mt-1 ${
                              isActive ? 'text-ink' : 'text-line-strong'
                            }`}
                          >
                            w = {strength.toFixed(3)}
                          </div>
                        )}

                        <div className="text-xs uppercase tracking-wider text-muted mt-0.5">
                          {r.label}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
