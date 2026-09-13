interface Props {
  shells: number[];
  size?: number;
  accent?: string;
}

/**
 * Diagrama de Bohr: capas de electrones dibujadas como anillos.
 * recibe población de capas, p.ej. [2, 8, 1] para el sodio.
 */
export default function ShellDiagram({ shells, size = 190, accent = "#5ce8c0" }: Props) {
  const total = shells.reduce((a, b) => a + b, 0);
  const nuc = Math.min(6 + total * 0.45, 22);
  const ringGap = (size / 2 - nuc - 12) / Math.max(shells.length, 1);
  const electronDot = Math.max(2.6, nuc * 0.16);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Diagrama de Bohr con ${total} electrones`}>
      <circle cx={cx} cy={cy} r={nuc} fill={accent} opacity={0.9} />
      <circle cx={cx} cy={cy} r={nuc + 2.5} fill="none" stroke={accent} strokeOpacity={0.35} strokeWidth={1.5} />
      {shells.map((n, i) => {
        const ring = nuc + 12 + ringGap * i + 4 * i;
        const dots: React.ReactNode[] = [];
        for (let k = 0; k < n; k++) {
          const ang = (k / n) * Math.PI * 2;
          dots.push(
            <circle
              key={k}
              cx={cx + ring * Math.cos(ang)}
              cy={cy + ring * Math.sin(ang)}
              r={electronDot}
              fill={accent}
              opacity={0.92}
            />,
          );
        }
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={ring} fill="none" stroke={accent} strokeOpacity={0.18} strokeWidth={1.2} />
            {dots}
          </g>
        );
      })}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily='"JetBrains Mono", monospace'
        fontSize={nuc * 0.42}
        fontWeight={700}
        fill="#06261e"
      >
        {total}
      </text>
    </svg>
  );
}

/**
 * Convierte una configuración electrónica ("1s² 2s² 2p⁶ 3s¹") en la
 * población de cada capa: p.ej. K → [2, 8, 8, 1].
 */
export function poblacionDesdeConfig(cfg: string): number[] {
  const out: number[] = [];
  cfg.match(/(\d)[spdf]\s*(?:²|³|⁴|⁵|⁶|⁷|⁸|⁹|¹⁰|[0-9])/g)?.forEach((tok) => {
    const m = tok.match(/^(\d)/);
    if (!m) return;
    const n = Number(m[1]);
    const sup = tok.slice(2);
    const supMap: Record<string, number> = { "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9, "¹⁰": 10 };
    const count = supMap[sup[0]] ?? Number(sup) ?? 1;
    out[n - 1] = (out[n - 1] ?? 0) + (Number.isFinite(count) ? count : 1);
  });
  if (!out.length) return [];
  return out.map((v) => v ?? 0);
}