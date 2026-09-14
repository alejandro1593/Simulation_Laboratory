import { useEffect, useState } from "react";

const STOPS = [
  { p: 0, c: "#e0342c" },
  { p: 2, c: "#e05a32" },
  { p: 4, c: "#ef9b3c" },
  { p: 6, c: "#e8d94c" },
  { p: 7.2, c: "#7fc855" },
  { p: 9, c: "#46b39a" },
  { p: 11, c: "#2f8ac9" },
  { p: 13, c: "#7a58c9" },
  { p: 14, c: "#6d46d0" },
];

function clasificar(ph: number): { label: string; tone: string } {
  if (ph < 3) return { label: "Muy ácido", tone: "#ff7a6b" };
  if (ph < 6) return { label: "Ácido", tone: "#ffb26b" };
  if (ph < 7) return { label: "Ligeramente ácido", tone: "#f0dc6b" };
  if (ph < 7.01) return { label: "Neutro", tone: "#9ce07a" };
  if (ph < 8) return { label: "Ligeramente alcalino", tone: "#8ad9a4" };
  if (ph < 11) return { label: "Alcalino", tone: "#6fc3d9" };
  return { label: "Muy alcalino", tone: "#9b8ae8" };
}

const W = 300;
const H = 92;
const BAR_X = 28;
const BAR_W = W - 70;
const BAR_H = 22;
const BAR_Y = 46;

function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function PHmetro({ ph }: { ph: number }) {
  const [anim, setAnim] = useState(0);
  const shown = 7 + (ph - 7) * ease(anim);
  const cls = clasificar(shown);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DUR = 1500;
    const tick = (now: number) => {
      setAnim(Math.min(1, (now - start) / DUR));
      if (now - start < DUR) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ph]);

  const needleX = BAR_X + (Math.max(0, Math.min(14, shown)) / 14) * BAR_W;

  return (
    <div className="panel phimetro" aria-label="pH metro animado">
      <h3 style={{ marginTop: 0 }}>pH-metro (simulado)</h3>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} aria-hidden="true">
        <defs>
          <linearGradient id="ph-grad" x1="0" y1="0" x2="1" y2="0">
            {STOPS.map((s) => (
              <stop key={s.p} offset={`${(s.p / 14) * 100}%`} stopColor={s.c} />
            ))}
          </linearGradient>
        </defs>
        <text x={4} y={BAR_Y + BAR_H / 2 + 3} fill="#9fb0bf" fontSize="10" textAnchor="end" className="mono">
          0
        </text>
        <text x={BAR_X + BAR_W} y={BAR_Y + BAR_H / 2 + 3} fill="#9fb0bf" fontSize="10" textAnchor="start" className="mono" style={{ paddingLeft: 4 }}>
          14
        </text>
        <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} rx={6} fill="url(#ph-grad)" />
        <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} rx={6} fill="none" stroke="#3a444e" />
        {[0, 7, 14].map((p) => {
          const px = BAR_X + (p / 14) * BAR_W;
          return <line key={p} x1={px} y1={BAR_Y - 3} x2={px} y2={BAR_Y + BAR_H + 3} stroke="#ffffff" strokeOpacity={0.75} />;
        })}
        <text x={BAR_X + (7 / 14) * BAR_W} y={BAR_Y + BAR_H + 14} fill="#9fb0bf" fontSize="9" textAnchor="middle">
          7
        </text>
        <g>
          <line x1={needleX} y1={BAR_Y - 10} x2={needleX} y2={BAR_Y + BAR_H + 6} stroke="#f4f7fa" strokeWidth={2} />
          <polygon points={`${needleX},${BAR_Y - 14} ${needleX - 5},${BAR_Y - 24} ${needleX + 5},${BAR_Y - 24}`} fill="#f4f7fa" />
        </g>
        <text x={W / 2} y={16} fill="#eaf0f6" fontSize="22" fontWeight="700" textAnchor="middle" className="mono ph-num">
          {shown.toFixed(2)}
        </text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 2 }}>
        <span style={{ color: cls.tone, fontWeight: 600, fontSize: 13 }}>{cls.label}</span>
        <span className="muted small">{ph < 7 ? "ácida" : ph > 7 ? "alcalina" : "neutra"}</span>
      </div>
      <p className="captions" style={{ marginTop: 4, marginBottom: 0 }}>
        Indicación didáctica: el kernel solo estima pH para ácidos y bases fuertes.
      </p>
    </div>
  );
}