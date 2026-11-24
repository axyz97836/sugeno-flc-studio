import React from 'react';
import { evaluateMF } from '../engine/sugeno';

export default function MembershipChart({
  variable,
  inputValue,
  fuzzified,
  showIndicator = false,
  compact = false,
}) {
  const W = compact ? 440 : 580;
  const H = compact ? 180 : 220;
  const P = { t: 28, r: 24, b: 38, l: 48 };
  const pw = W - P.l - P.r;
  const ph = H - P.t - P.b;
  const [lo, hi] = variable.range;

  const sx = (v) => P.l + ((v - lo) / (hi - lo)) * pw;
  const sy = (v) => P.t + ph - v * ph;

  const curves = variable.membershipFunctions.map((mf, i) => {
    const pts = [];
    for (let n = 0; n <= 100; n++) {
      const xv = lo + (n / 100) * (hi - lo);
      pts.push([sx(xv), sy(evaluateMF(xv, mf))]);
    }
    const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const lx = mf.type === 'triangular' ? mf.params[1] : (mf.params[1] + mf.params[2]) / 2;
    return { mf, d, lx, i };
  });

  const step = (hi - lo) <= 10 ? 2 : (hi - lo) <= 20 ? 5 : 10;
  const gx = [];
  for (let v = lo; v <= hi; v += step) {
    gx.push(v);
  }
  if (gx[gx.length - 1] !== hi) gx.push(hi);

  return (
    <div className="w-full max-w-full min-w-0 flex justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none min-w-0 max-w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', width: '100%', maxWidth: '100%', minWidth: 0 }}
        role="img"
        aria-label={`${variable.name} membership functions chart`}
      >
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line
              x1={P.l}
              y1={sy(v)}
              x2={P.l + pw}
              y2={sy(v)}
              stroke="var(--color-line-subtle)"
              strokeWidth="1"
            />
            <text
              x={P.l - 8}
              y={sy(v) + 4}
              textAnchor="end"
              fill="var(--color-muted)"
              fontSize="12"
              fontFamily="var(--font-mono)"
              className="tabular-nums"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Vertical grid lines & X-axis labels */}
        {gx.map((v) => (
          <g key={v}>
            <line
              x1={sx(v)}
              y1={P.t}
              x2={sx(v)}
              y2={P.t + ph}
              stroke="var(--color-panel-hover)"
              strokeWidth="1"
            />
            <text
              x={sx(v)}
              y={P.t + ph + 20}
              textAnchor="middle"
              fill="var(--color-muted)"
              fontSize="12"
              fontFamily="var(--font-mono)"
              className="tabular-nums"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={P.l}
          y1={P.t + ph}
          x2={P.l + pw}
          y2={P.t + ph}
          stroke="var(--color-line-strong)"
          strokeWidth="1"
        />
        <line
          x1={P.l}
          y1={P.t}
          x2={P.l}
          y2={P.t + ph}
          stroke="var(--color-line-strong)"
          strokeWidth="1"
        />

        {/* Membership Function Curves: flat stroke */}
        {curves.map(({ mf, d, lx, i }) => (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke={mf.color}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <text
              x={sx(lx)}
              y={sy(1) - 10}
              textAnchor="middle"
              fill={mf.color}
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {mf.name}
            </text>
          </g>
        ))}

        {/* Current Crisp Input Indicator */}
        {showIndicator && inputValue != null && (
          <g>
            <line
              x1={sx(inputValue)}
              y1={P.t}
              x2={sx(inputValue)}
              y2={P.t + ph}
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {fuzzified?.map((f, i) => {
              if (f.degree < 0.001) return null;
              const yPos = sy(f.degree);
              const xPos = sx(inputValue);
              return (
                <g key={i}>
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r="4.5"
                    fill="var(--color-ground)"
                    stroke={variable.membershipFunctions[i]?.color || 'var(--color-accent)'}
                    strokeWidth="2"
                  />
                  <rect
                    x={xPos + 8}
                    y={yPos - 11}
                    width="56"
                    height="22"
                    rx="4"
                    fill="var(--color-ground)"
                    stroke="var(--color-line-strong)"
                    strokeWidth="1"
                  />
                  <text
                    x={xPos + 36}
                    y={yPos + 4}
                    textAnchor="middle"
                    fill="var(--color-ink)"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    className="tabular-nums"
                  >
                    {f.degree.toFixed(3)}
                  </text>
                </g>
              );
            })}

            {/* Input value label box on X axis */}
            <rect
              x={sx(inputValue) - 22}
              y={P.t + ph + 6}
              width="44"
              height="20"
              rx="4"
              fill="var(--color-accent)"
            />
            <text
              x={sx(inputValue)}
              y={P.t + ph + 20}
              textAnchor="middle"
              fill="var(--color-ground)"
              fontSize="12"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              className="tabular-nums"
            >
              {inputValue.toFixed(1)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
