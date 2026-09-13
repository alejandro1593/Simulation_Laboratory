import { useState } from "react";
import { VSEPR, type VseprMol } from "../data/herramientas";

function VsepSvg({ m, size = 170 }: { m: VseprMol; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const rB = size * 0.34;
  const disp: [number, string][] = Object.entries(m.hijos).map(([k, a]) => [a, k]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Geometría ${m.forma}`}>
      <circle cx={cx} cy={cy} r={rB * 2.1} fill="rgba(92,232,192,0.05)" stroke="rgba(92,232,192,0.2)" strokeDasharray="3 4" />
      {disp.map(([ang, k]) => {
        const rad = (ang * Math.PI) / 180;
        const x = cx + rB * Math.sin(rad);
        const y = cy - rB * Math.cos(rad);
        return (
          <g key={k}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#7d8aa0" strokeWidth={2} strokeLinecap="round" />
            <circle cx={x} cy={y} r={10} fill="rgba(122,162,255,0.16)" stroke="#7aa2ff" strokeWidth={1.6} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#cfe0ff" fontFamily="var(--mono)">X</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={15} fill="rgba(92,232,192,0.15)" stroke="#5ce8c0" strokeWidth={2} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={14} fontWeight={700} fill="#d9fff2" fontFamily="var(--mono)">{m.central}</text>
      {Array.from({ length: m.paresLibres }).map((_, i) => {
        const ang = 90 + i * 120;
        const rad = (ang * Math.PI) / 180;
        const x = cx + rB * 0.85 * Math.sin(rad);
        const y = cy - rB * 0.85 * Math.cos(rad);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={7} fill="none" stroke="rgba(242,178,99,0.7)" strokeWidth={1.4} strokeDasharray="2 2" />
            <text x={x} y={y + 3} textAnchor="middle" fontSize={9} fill="#f2b263" fontStyle="italic">ep</text>
          </g>
        );
      })}
    </svg>
  );
}

function doms(m: VseprMol): number {
  return m.atomos + m.paresLibres;
}

export default function GeometriaVSEPR() {
  const [sel, setSel] = useState<VseprMol | null>(null);

  return (
    <section className="page">
      <h1>Geometría molecular (VSEPR)</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        La notación <b>AXE</b> describe la forma molecular: A = átomo central, X = ligandos, E = pares de electrones libres.
      </p>

      <div className="grid-3">
        {VSEPR.map((m) => (
          <button key={m.id} className="card" onClick={() => setSel(m)} style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", cursor: "pointer", border: "1px solid var(--hair)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <h2 style={{ marginBottom: 0, fontSize: 17 }}>{m.formula}</h2>
              <span className="tag blue">{m.axe}</span>
            </div>
            <VsepSvg m={m} />
            <div className="muted small" style={{ minHeight: 28 }}>{m.nombre}</div>
            <div className="small"><b>{m.forma}</b> · ángulo {m.angulo}</div>
          </button>
        ))}
      </div>

      {sel && (
        <div className="modal-back" onClick={() => setSel(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2 style={{ marginBottom: 4 }}>{sel.formula} · {sel.nombre}</h2>
            <div className="muted" style={{ fontFamily: "var(--mono)", marginBottom: 8 }}>{sel.axe} — {sel.forma}</div>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <VsepSvg m={sel} size={170} />
              <div style={{ display: "grid", gap: 8, flex: 1 }}>
                <div className="stat"><span>Dominios electrónicos</span><b>{doms(sel)}</b></div>
                <div className="stat"><span>Ligandos</span><b>{sel.atomos}</b></div>
                <div className="stat"><span>Pares libres</span><b>{sel.paresLibres}</b></div>
                <div className="stat"><span>Ángulo</span><b>{sel.angulo}</b></div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--hair)", margin: "14px 0 10px" }} />
            <div className="muted small">
              Teoría VSEPR: los <b>pares de valencia</b> (enlazantes y libres) se repelen y se orientan para distanciarse al máximo: {doms(sel)} dominios → {doms(sel) === 2 ? "lineal (180°)" : doms(sel) === 3 ? "triángulo (120°)" : doms(sel) === 4 ? "tetraedro (109,5°)" : doms(sel) === 5 ? "bipirámide trigonal" : "octaedro"}. Los pares libres (ep) ocupan más espacio que los enlaces, por lo que comprimen el ángulo.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <button className="primary" onClick={() => setSel(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}