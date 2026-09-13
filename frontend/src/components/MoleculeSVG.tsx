import type { Mol } from "../data/organic";

interface Props {
  mol: Mol;
  width?: number;
  height?: number;
}

const SYM_COLORS: Record<string, string> = {
  C: "#cfd6e4",
  H: "#e7ecf5",
  O: "#ff7b7b",
  N: "#7aa2ff",
  S: "#f2b263",
  Cl: "#7ce08a",
  Br: "#c77cf0",
  F: "#58d6c8",
  I: "#b06ce8",
};

/** Centro el dibujo y lo escalo para que quepa en width×height. */
export default function MoleculeSVG({ mol, width = 260, height = 130 }: Props) {
  if (!mol.atoms.length) return <div className="muted" />;
  const xs = mol.atoms.map((a) => a.x);
  const ys = mol.atoms.map((a) => a.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const pad = 0.9;
  const scale = Math.min(width / (spanX + pad * 2), height / (spanY + pad * 2));
  const offX = (width - spanX * scale) / 2 - minX * scale;
  const offY = (height - spanY * scale) / 2 - minY * scale;
  const px = (x: number) => x * scale + offX;
  const py = (y: number) => y * scale + offY;

  const bonds: { a: number; b: number; o: 1 | 2 | 3 }[] = mol.bonds.map((b) => {
    const ba = mol.atoms.findIndex((at) => at.id === b.a);
    const bb = mol.atoms.findIndex((at) => at.id === b.b);
    return { a: ba, b: bb, o: b.o ?? 1 };
  });
  const hiA = new Set(mol.hiA ?? []);
  const hiB = new Set((mol.hiB ?? []).map((x) => Number(x)));

  const bondLines: React.ReactNode[] = [];
  bonds.forEach((b, i) => {
    const A = mol.atoms[b.a];
    const B = mol.atoms[b.b];
    const ax = px(A.x);
    const ay = py(A.y);
    const bx = px(B.x);
    const by = py(B.y);
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.max(Math.hypot(dx, dy), 1e-6);
    const nx = -dy / len;
    const ny = dx / len;
    const hi = hiB.has(i);
    const stroke = hi ? "#5ce8c0" : "#7d8aa0";
    const width = hi ? 2.4 : 1.7;
    if (b.o === 1) {
      bondLines.push(<line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={width} strokeLinecap="round" />);
    } else if (b.o === 2) {
      const s = Math.min(4, len / 6);
      bondLines.push(
        <line key={`${i}a`} x1={ax + nx * s} y1={ay + ny * s} x2={bx + nx * s} y2={by + ny * s} stroke={stroke} strokeWidth={width} strokeLinecap="round" />,
        <line key={`${i}b`} x1={ax - nx * s} y1={ay - ny * s} x2={bx - nx * s} y2={by - ny * s} stroke={stroke} strokeWidth={width} strokeLinecap="round" />,
      );
    } else {
      const s = Math.min(3.4, len / 7);
      bondLines.push(
        <line key={`${i}a`} x1={ax + nx * s} y1={ay + ny * s} x2={bx + nx * s} y2={by + ny * s} stroke={stroke} strokeWidth={width} strokeLinecap="round" />,
        <line key={`${i}b`} x1={ax} y1={ay} x2={bx} y2={by} stroke={stroke} strokeWidth={width} strokeLinecap="round" />,
        <line key={`${i}c`} x1={ax - nx * s} y1={ay - ny * s} x2={bx - nx * s} y2={by - ny * s} stroke={stroke} strokeWidth={width} strokeLinecap="round" />,
      );
    }
  });

  const r = Math.max(Math.min(scale * 0.42, 15), 6);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      <g>{bondLines}</g>
      {mol.atoms.map((at) => {
        const cx = px(at.x);
        const cy = py(at.y);
        if (at.txt) {
          const fill = hiA.has(at.id) ? "#5ce8c0" : "#c9d4e6";
          return (
            <text
              key={at.id}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"JetBrains Mono", monospace'
              fontSize={r * 0.85}
              fontWeight={600}
              fill={fill}
            >
              {at.txt}
            </text>
          );
        }
        const color = hiA.has(at.id) ? "#5ce8c0" : SYM_COLORS[at.s ?? ""] ?? "#cfd6e4";
        return (
          <g key={at.id}>
            <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.14} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.6} />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"JetBrains Mono", monospace'
              fontSize={r}
              fontWeight={700}
              fill={color}
            >
              {at.s}
            </text>
          </g>
        );
      })}
    </svg>
  );
}