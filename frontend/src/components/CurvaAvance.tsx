export interface EvolutionSpecies {
  formula: string;
  role: "reactivo" | "producto";
  coeff: number;
  initial_mol: number;
}

export interface EvolutionPoint {
  xi: number;
  moles: Record<string, number>;
  gas_volume_l?: number;
  dT_c?: number;
}

export interface EvolutionData {
  x_label: string;
  extent_mol: number;
  species: EvolutionSpecies[];
  points: EvolutionPoint[];
}

const W = 520;
const H = 280;
const L = 46;
const R = 14;
const T = 16;
const B = 30;

const ROL_COLORS: Record<string, string[]> = {
  reactivo: ["#6ee7c3", "#7aa2ff", "#f2a35c", "#e05c8a"],
  producto: ["#f2c14e", "#5c9df2", "#c76ee7", "#57d98c"],
};

function fmt(v: number): string {
  if (v === 0) return "0";
  if (v >= 0.01) return v.toFixed(3);
  return v.toExponential(1);
}

export default function CurvaAvance({ data }: { data: EvolutionData }) {
  const { points, species, extent_mol } = data;
  const n = points.length - 1;

  const yMax = Math.max(
    1e-9,
    ...species.map((s) => (s.role === "reactivo" ? s.initial_mol : s.coeff * extent_mol)),
  );

  const x = (i: number) => L + (i / n) * (W - L - R);
  const y = (v: number) => T + (1 - v / yMax) * (H - T - B);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * yMax);
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * extent_mol);

  const series = species.map((s, idx) => {
    const palette = ROL_COLORS[s.role] ?? ROL_COLORS.producto;
    const color = palette[idx % palette.length];
    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.moles[s.formula] ?? 0).toFixed(1)}`)
      .join(" ");
    return { ...s, color, path };
  });

  const hasGas = points.some((p) => p.gas_volume_l != null);
  const hasDeltaT = points.some((p) => p.dT_c != null);
  const gasFinal = points[n].gas_volume_l;
  const dTFinal = points[n].dT_c;

  return (
    <div className="panel curve-avance" aria-label="Curva de avance de la reacción">
      <h3 style={{ marginTop: 0 }}>Evolución vs grado de avance (ξ)</h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", background: "transparent" }} role="img" aria-label="Curva de moles según el avance de reacción">
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="#3a444e" />
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#3a444e" />
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={L - 4} y1={y(t)} x2={W - R} y2={y(t)} stroke="#2a323b" strokeDasharray="2 4" />
            <text x={L - 7} y={y(t) + 3} fill="#9fb0bf" fontSize="10" textAnchor="end" className="mono">
              {fmt(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <g key={`x${i}`}>
            <text x={x(i * (n / 4))} y={H - B + 14} fill="#9fb0bf" fontSize="10" textAnchor="middle" className="mono">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={L + (W - L - R) / 2} y={H - 2} fill="#9fb0bf" fontSize="10" textAnchor="middle">
          {data.x_label}
        </text>
        <text x={10} y={T + 8} fill="#9fb0bf" fontSize="10" textAnchor="start" transform={`rotate(-90 18 ${(T + H - B) / 2})`}>
          moles
        </text>
        {series.map((s) => (
          <g key={s.formula}>
            <path d={s.path} fill="none" stroke={s.color} strokeWidth={2.2} strokeDasharray={s.role === "producto" ? "6 3" : undefined} />
            <circle cx={x(n)} cy={y(points[n].moles[s.formula] ?? 0)} r={3} fill={s.color} />
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {series.map((s) => (
          <span key={s.formula} className="chip" style={{ fontSize: 11 }}>
            <i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, marginRight: 5, background: s.color, verticalAlign: -1 }} />
            {s.formula} · {s.role} · ν={s.coeff}
          </span>
        ))}
      </div>
      {(hasGas || hasDeltaT) && (
        <p className="captions" style={{ marginTop: 6, marginBottom: 0 }}>
          {hasGas && <>Gas desprendido (25 °C): <b>{gasFinal?.toFixed(3)} L</b> · n = V / 24,465 L·mol⁻¹.</>}{" "}
          {hasDeltaT && <>ΔT estimada (proporcional a ξ): <b>{dTFinal && dTFinal > 0 ? "+" : ""}{dTFinal?.toFixed(2)} °C</b>.</>}
        </p>
      )}
    </div>
  );
}