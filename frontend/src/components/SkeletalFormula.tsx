import { useState } from "react";
import type { Mol } from "../data/organic";

interface Props {
  mol: Mol;
  width?: number;
  height?: number;
  interactive?: boolean;
  onAtom?: (idx: number | null) => void;
  onBond?: (idx: number | null) => void;
}

// Fórmula esqueletal: los carbonos son vértices implícitos (sin etiqueta ni H),
// los heteroátomos se etiquetan en color y el grupo funcional se resalta en verde menta.
// Render alto contraste para que enlaces y grupos se aprecien con nitidez.
// Con `interactive` cada átomo y enlace responde al cursor (tooltip + realce).

const SYM_COLOR: Record<string, string> = {
  O: "#ff7b7b",
  N: "#7aa2ff",
  S: "#f2b263",
  Cl: "#7ce08a",
  Br: "#c77cf0",
  F: "#58d6c8",
  I: "#b06ce8",
  H: "#e5ecf8",
};

const SYM_NAME: Record<string, string> = {
  C: "Carbono",
  O: "Oxígeno",
  N: "Nitrógeno",
  S: "Azufre",
  Cl: "Cloro",
  Br: "Bromo",
  F: "Flúor",
  I: "Yodo",
  H: "Hidrógeno",
};

const BOND = "#dfe7f4";
const ACCENT = "#5ce8c0";

const isCarbon = (a: { s?: string; txt?: string }): boolean => {
  if (a.s === "C") return true;
  if (a.s) return false;
  const t = a.txt;
  if (t === undefined) return true;
  if (t.startsWith("CH")) return true;
  if (t === "C") return true;
  return false;
};

export default function SkeletalFormula({ mol, width = 340, height = 180, interactive = false, onAtom, onBond }: Props) {
  if (!mol.atoms.length) return <div className="muted" />;

  const [hovA, setHovA] = useState<number | null>(null);
  const [hovB, setHovB] = useState<number | null>(null);

  const setA = (idx: number | null) => { setHovA(idx); if (onAtom) onAtom(idx); };
  const setB = (idx: number | null) => { setHovB(idx); if (onBond) onBond(idx); };

  const xs = mol.atoms.map((a) => a.x);
  const ys = mol.atoms.map((a) => a.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const pad = 1.0;
  const scale = Math.min(width / (spanX + pad * 2), height / (spanY + pad * 2));
  const offX = (width - spanX * scale) / 2 - minX * scale;
  const offY = (height - spanY * scale) / 2 - minY * scale;
  const px = (x: number) => x * scale + offX;
  const py = (y: number) => y * scale + offY;

  const bonds = mol.bonds.map((b, i) => {
    const ba = mol.atoms.findIndex((at) => at.id === b.a);
    const bb = mol.atoms.findIndex((at) => at.id === b.b);
    if (ba < 0 || bb < 0) return null;
    const A = mol.atoms[ba];
    const B = mol.atoms[bb];
    const ax = px(A.x);
    const ay = py(A.y);
    const bx = px(B.x);
    const by = py(B.y);
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.max(Math.hypot(dx, dy), 1e-6);
    const nx = -dy / len;
    const ny = dx / len;
    const hi = (mol.hiB ?? []).map((x) => Number(x)).includes(i);
    return { ax, ay, bx, by, nx, ny, len, o: b.o ?? 1, hi };
  }).filter((b): b is NonNullable<typeof b> => b !== null);

  const hiA = new Set(mol.hiA ?? []);

  const bondTitle = (o: number) => (o === 2 ? "Enlace doble" : o === 3 ? "Enlace triple" : "Enlace simple");

  const bondLines: React.ReactNode[] = [];
  bonds.forEach((b, i) => {
    const hov = hovB === i && interactive;
    const base = b.hi || hov ? ACCENT : BOND;
    const w = b.hi || hov ? 3.6 : 2.8;
    const glow = (x1: number, y1: number, x2: number, y2: number) =>
      b.hi || hov ? (
        <line key={`g${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ACCENT} strokeOpacity={0.35} strokeWidth={w * 2.1} strokeLinecap="round" />
      ) : null;
    const hit = interactive ? (
      <line
        key={`hit${i}`}
        x1={b.ax} y1={b.ay} x2={b.bx} y2={b.by}
        stroke="transparent" strokeWidth={14}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setB(i)}
        onMouseLeave={() => setB(null)}
      >
        {interactive && <title>{bondTitle(b.o)}</title>}
      </line>
    ) : null;
    if (b.o === 1) {
      bondLines.push(glow(b.ax, b.ay, b.bx, b.by));
      bondLines.push(<line key={i} x1={b.ax} y1={b.ay} x2={b.bx} y2={b.by} stroke={base} strokeWidth={w} strokeLinecap="round" />);
    } else if (b.o === 2) {
      const s = Math.min(4.6, b.len / 6);
      const mult = (m: number) => [
        b.ax + b.nx * s * m,
        b.ay + b.ny * s * m,
        b.bx + b.nx * s * m,
        b.by + b.ny * s * m,
      ] as const;
      const [a1, a2, b1, b2] = mult(1);
      const [c1, c2, d1, d2] = mult(-1);
      bondLines.push(glow(b.ax, b.ay, b.bx, b.by));
      bondLines.push(<line key={`${i}a`} x1={a1} y1={a2} x2={b1} y2={b2} stroke={base} strokeWidth={w} strokeLinecap="round" />);
      bondLines.push(<line key={`${i}b`} x1={c1} y1={c2} x2={d1} y2={d2} stroke={base} strokeWidth={w} strokeLinecap="round" />);
    } else {
      const s = Math.min(4, b.len / 7);
      const mult = (m: number) => [
        b.ax + b.nx * s * m,
        b.ay + b.ny * s * m,
        b.bx + b.nx * s * m,
        b.by + b.ny * s * m,
      ] as const;
      const [a1, a2, b1, b2] = mult(1);
      const [c1, c2, d1, d2] = mult(-1);
      bondLines.push(glow(b.ax, b.ay, b.bx, b.by));
      bondLines.push(<line key={`${i}a`} x1={a1} y1={a2} x2={b1} y2={b2} stroke={base} strokeWidth={w} strokeLinecap="round" />);
      bondLines.push(<line key={`${i}b`} x1={b.ax} y1={b.ay} x2={b.bx} y2={b.by} stroke={base} strokeWidth={w} strokeLinecap="round" />);
      bondLines.push(<line key={`${i}c`} x1={c1} y1={c2} x2={d1} y2={d2} stroke={base} strokeWidth={w} strokeLinecap="round" />);
    }
    bondLines.push(hit);
  });

  const atomNodes = mol.atoms.map((at, idx) => {
    const cx = px(at.x);
    const cy = py(at.y);
    const hi = hiA.has(at.id);
    const hov = hovA === idx && interactive;
    if (isCarbon(at)) {
      const r = Math.min(Math.max(scale * 0.16, 2), 4.2);
      return (
        <g key={at.id} style={interactive ? { cursor: "pointer" } : undefined}>
          {hi && <circle cx={cx} cy={cy} r={r * 2.4} fill={ACCENT} opacity={0.32} />}
          {(hov || hi) && <circle cx={cx} cy={cy} r={r * 2} fill="none" stroke={ACCENT} strokeWidth={1.8} />}
          <circle cx={cx} cy={cy} r={r} fill={hi || hov ? ACCENT : "#eef3fa"} />
          {interactive && (
            <circle
              cx={cx} cy={cy} r={r * 3.2} fill="transparent"
              onMouseEnter={() => setA(idx)}
              onMouseLeave={() => setA(null)}
            >
              <title>Carbono</title>
            </circle>
          )}
        </g>
      );
    }
    const sym = at.s || at.txt || "?";
    const color = hi || hov ? ACCENT : SYM_COLOR[sym] ?? "#cfd8ea";
    const fs = Math.min(Math.max(scale * 0.5, 12), 34);
    return (
      <g key={at.id} style={interactive ? { cursor: "pointer" } : undefined}>
        {hi && !hov && (
          <circle cx={cx} cy={cy} r={fs * 0.78} fill={ACCENT} opacity={0.18}>
            <title>Grupo funcional</title>
          </circle>
        )}
        {hov && <circle cx={cx} cy={cy} r={fs * 0.85} fill="none" stroke={ACCENT} strokeWidth={1.8} opacity={0.9} />}
        <text
          x={cx}
          y={cy + fs * 0.08}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily='"Segoe UI", system-ui, sans-serif'
          fontWeight={700}
          fontSize={hov ? fs + 2 : fs}
          fill={color}
          stroke="rgba(8, 14, 24, 0.9)"
          strokeWidth={fs * 0.34}
          paintOrder="stroke"
          strokeLinejoin="round"
          onMouseEnter={() => setA(idx)}
          onMouseLeave={() => setA(null)}
        >
          {sym}
          {interactive && <title>{SYM_NAME[sym] ?? sym}</title>}
        </text>
      </g>
    );
  });

  const aromatic =
    mol.atoms.length === 6 &&
    mol.bonds.length === 6 &&
    mol.atoms.every(isCarbon) &&
    mol.bonds.filter((b) => b.o === 2).length === 3;

  const ring = (() => {
    if (!aromatic || !bonds.length) return null;
    const cx = mol.atoms.reduce((s, a) => s + px(a.x), 0) / mol.atoms.length;
    const cy = mol.atoms.reduce((s, a) => s + py(a.y), 0) / mol.atoms.length;
    const r = bonds.reduce((s, b) => s + b.len, 0) / bonds.length * 0.55;
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={ACCENT} strokeWidth={2.4} opacity={0.85} />;
  })();

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Estructura esqueletal"
      onMouseLeave={() => { setA(null); setB(null); }}
    >
      <g>{ring}</g>
      <g>{bondLines}</g>
      <g>{atomNodes}</g>
    </svg>
  );
}