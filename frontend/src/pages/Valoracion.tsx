import { useMemo, useState } from "react";
import { ACIDOS, BASES, INDICADORES, indicatorColor, type Acido, type Base } from "../data/herramientas";

function clamp(n: number): number {
  return Math.max(0, Math.min(14, n));
}

function pHat(Vb: number, acid: Acido, base: Base, Ca: number, Va: number, Cb: number): number | null {
  const Vt = Va + Vb; // mL
  if (Vt <= 0 || Vb <= 0) return null;
  const lt = Vt / 1000;
  const nH0 = Ca * Va * 0.001 * acid.protones; // mol H+ iniciales
  const nB = Cb * Vb * 0.001; // mol de base añadida

  if (acid.fuerte && base.fuerte) {
    // ácido fuerte + base fuerte: neutralización total
    const extra = Math.max(nH0 - nB, 0);
    if (extra > 0) return -Math.log10(extra / lt);
    const exb = Math.max(nB - nH0, 0);
    if (exb > 0) return 14 + Math.log10(exb / lt);
    return 7;
  }

  if (acid.fuerte && !base.fuerte) {
    // ácido fuerte + base débil (NH3): NH4+
    if (nB < nH0) return -Math.log10((nH0 - nB) / lt);
    if (Math.abs(nB - nH0) < 1e-12) {
      const cN = nH0 / lt;
      const Ka = 1e-14 / (base.kb ?? 1.8e-5);
      return -Math.log10(Math.min(Math.sqrt(Ka * cN), Math.max(cN, 1e-9)));
    }
    // exceso de NH3: tampón NH4+/NH3
    const nNH4 = nH0;
    const nNH3 = nB - nH0;
    const pKb = -Math.log10(base.kb ?? 1.8e-5);
    const pOH = pKb + Math.log10(nNH4 / Math.max(nNH3, 1e-12));
    return 14 - pOH;
  }

  if (!acid.fuerte && base.fuerte) {
    // ácido débil (CH3COOH) + base fuerte
    const nA = Ca * Va * 0.001;
    const Ka = acid.ka ?? 1.8e-5;
    if (nB < nA) {
      // tampón acetato/ácido
      const pKa = -Math.log10(Ka);
      return pKa + Math.log10(nB / Math.max(nA - nB, 1e-12));
    }
    if (Math.abs(nB - nA) < 1e-12) {
      const c = nA / lt;
      const Kb = 1e-14 / Ka;
      return 14 + Math.log10(Math.sqrt(Kb * c));
    }
    const exb = nB - nA;
    return 14 + Math.log10(exb / lt);
  }

  return null; // ácido débil + base débil: fuera de alcance
}

export default function Valoracion() {
  const [acidKey, setAcidKey] = useState("hcl");
  const [baseKey, setBaseKey] = useState("naoh");
  const [indKey, setIndKey] = useState("fenol");
  const [Ca, setCa] = useState("0.1");
  const [Va, setVa] = useState("20");
  const [Cb, setCb] = useState("0.1");
  const [VbSel, setVbSel] = useState(0);

  const acid = ACIDOS.find((a) => a.key === acidKey)!;
  const base = BASES.find((b) => b.key === baseKey)!;
  const indicator = INDICADORES.find((i) => i.key === indKey) ?? INDICADORES[0];
  const CaV = parseFloat(Ca) || 0;
  const VaV = parseFloat(Va) || 0;
  const CbV = parseFloat(Cb) || 0;

  const valores = useMemo(() => {
    const Ve = (CaV * VaV * acid.protones) / CbV;
    const pHi = acid.fuerte ? -Math.log10(Math.max(CaV, 1e-9)) : pHat(0.01, acid, base, CaV, VaV, CbV);
    const pHf = pHat(Ve, acid, base, CaV, VaV, CbV);
    const Vmax = Math.max(Ve * 2.2, 5);
    const N = 100;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const vb = (i / N) * Vmax;
      const pH = pHat(vb, acid, base, CaV, VaV, CbV);
      if (pH !== null) pts.push({ x: vb, y: clamp(pH) });
    }
    return { Ve, pHi, pHf, Vmax, pts, valid: Ve > 0 && Number.isFinite(Ve) };
  }, [acid, base, CaV, VaV, CbV]);

  const W = 620;
  const H = 300;
  const padL = 46;
  const padB = 34;
  const xOf = (v: number) => padL + ((v - 0) / (valores.Vmax || 1)) * (W - padL - 8);
  const yOf = (ph: number) => 10 + (1 - ph / 14) * (H - padB - 10);
  const ptsStr = valores.pts.map((p) => `${xOf(p.x)},${yOf(p.y)}`).join(" ");
  const eqX = xOf(valores.Ve);

  const pHSel = pHat(VbSel, acid, base, CaV, VaV, CbV);

  return (
    <section className="page">
      <h1>Valoración ácido-base</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Curva de pH por Volumen de valorante; se calcula el punto de equivalencia paso a paso.
      </p>

      <div className="card" style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <h2>Parámetros</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label className="field">
            Ácido (en el matraz)
            <select value={acidKey} onChange={(e) => setAcidKey(e.target.value)} aria-label="Ácido">
              {ACIDOS.map((a) => <option key={a.key} value={a.key}>{a.nombre}</option>)}
            </select>
          </label>
          <label className="field">
            Base valorante
            <select value={baseKey} onChange={(e) => setBaseKey(e.target.value)} aria-label="Base">
              {BASES.map((b) => <option key={b.key} value={b.key}>{b.nombre}</option>)}
            </select>
          </label>
          <label className="field">
            Indicador
            <select value={indKey} onChange={(e) => setIndKey(e.target.value)} aria-label="Indicador">
              {INDICADORES.map((i) => <option key={i.key} value={i.key}>{i.nombre} (pH {i.pHi}–{i.pHf})</option>)}
            </select>
          </label>
          <label className="field">
            C ácido (M) <input value={Ca} onChange={(e) => setCa(e.target.value)} inputMode="decimal" />
          </label>
          <label className="field">
            V ácido (mL) <input value={Va} onChange={(e) => setVa(e.target.value)} inputMode="decimal" />
          </label>
          <label className="field">
            C base (M) <input value={Cb} onChange={(e) => setCb(e.target.value)} inputMode="decimal" />
          </label>
        </div>

        {valores.valid ? (
          <div className="grid-3">
            <div className="stat"><span>Vol. equivalencia</span><b>{valores.Ve.toFixed(2)} mL</b></div>
            <div className="stat"><span>pH inicial</span><b>{(valores.pHi ?? 0).toFixed(2)}</b></div>
            <div className="stat"><span>pH en equilibrio</span><b>{(valores.pHf ?? 0).toFixed(2)}</b></div>
          </div>
        ) : (
          <div className="error">Revise los parámetros: la estequiometría no es válida (C mayor que 0, V mayor que 0).</div>
        )}

        <div className="notice" style={{ marginTop: 4 }}>
          Cálculo con el modelo ideal (actividades = concentraciones). Para H2SO4 se considera la disociación completa del primer protón; en el punto de equivalencia de ácidos o bases débiles se resuelve la hidrólisis del conjugado.
        </div>
      </div>

      <div className="card">
        <h2>Curva de pH</h2>
        {valores.valid ? (
          <>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de valoración" style={{ maxWidth: W }}>
              {/* Indicator transition band */}
              <rect x={padL} y={yOf(indicator.pHf)} width={W - padL - 8} height={yOf(indicator.pHi) - yOf(indicator.pHf)} fill={indicator.colorMid ?? indicator.colorBase} opacity={0.13} rx={3} />
              <text x={W - 6} y={yOf(indicator.pHf) + 4} fill={indicator.colorBase} fontSize="9" textAnchor="end" opacity={0.6}>{indicator.pHf}</text>
              <text x={W - 6} y={yOf(indicator.pHi) - 3} fill={indicator.colorBase} fontSize="9" textAnchor="end" opacity={0.6}>{indicator.pHi}</text>
              {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((ph) => (
                <line key={ph} x1={padL} y1={yOf(ph)} x2={W - 8} y2={yOf(ph)} stroke={ph === 7 ? "rgba(122,162,255,0.35)" : "rgba(255,255,255,0.07)"} strokeDasharray={ph === 7 ? "" : "3 5"} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => {
                const v = Math.round(((valores.Vmax / 6) * i) * 10) / 10;
                return (
                  <g key={i}>
                    <line x1={xOf(v)} y1={10} x2={xOf(v)} y2={H - padB} stroke="rgba(255,255,255,0.07)" />
                    <text x={xOf(v)} y={H - 16} fill="#8b93b5" fontSize="10" textAnchor="middle">{v}</text>
                  </g>
                );
              })}
              <text x={padL} y={H - 16} fill="#8b93b5" fontSize="10">V base (mL)</text>
              {valores.Ve > 0 && (
                <line x1={eqX} y1={10} x2={eqX} y2={H - padB} stroke="#7aa2ff" strokeDasharray="4 3" />
              )}
              <polyline points={ptsStr} fill="none" stroke="#5ce8c0" strokeWidth={2.4} strokeLinejoin="round" />
              {(valores.pHf ?? 0) > 0 && <circle cx={eqX} cy={yOf(valores.pHf!)} r={5} fill="#f2b263" />}
              <text x={2} y={yOf(14) + 4} fill="#ff9aa0" fontSize="10">14</text>
              <text x={2} y={yOf(0) + 4} fill="#ff9aa0" fontSize="10">0</text>
              {valores.Ve > 0 && (
                <text x={Math.min(eqX, W - 70)} y={20} fill="#7aa2ff" fontSize="11" fontFamily="var(--mono)">
                  Eq {valores.Ve.toFixed(1)} mL · pH {(valores.pHf ?? 0).toFixed(1)}
                </text>
              )}
            </svg>
            <label className="field" style={{ marginTop: 8 }}>
              Explorar pH a V = <b style={{ display: "inline", color: "var(--accent)" }}>{VbSel.toFixed(1)}</b> mL de base
              <input type="range" min={0} max={Math.round(valores.Vmax * 10) / 10} step={0.1} value={Math.min(VbSel, valores.Vmax)} onChange={(e) => setVbSel(parseFloat(e.target.value))} />
            </label>
            <div className="result-box" aria-label="pH seleccionado">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, border: "2px solid rgba(255,255,255,0.15)", background: pHSel !== null ? indicatorColor(indicator, clamp(pHSel)) : "transparent", flexShrink: 0, transition: "background 0.25s" }} />
                <div>
                  <div className="result-main">pH = {pHSel === null ? "—" : clamp(pHSel).toFixed(2)}</div>
                  <div className="muted small">
                    {pHSel === null ? "Añada base para iniciar la valoración." : pHSel > 11 ? "Exceso de base (zona básica)." : pHSel < 3 ? "Exceso de ácido (zona ácida)." : Math.abs(pHSel - 7) < 0.05 ? "Punto de equivalencia (sal neutra o hidrólisis)." : "Zona de transición o tampón."}
                  </div>
                </div>
              </div>
              {pHSel !== null && (
                <div className="muted small" style={{ marginTop: 8 }}>
                  <b>{indicator.nombre}</b>: {clamp(pHSel) < indicator.pHi ? "Color de forma ácida" : clamp(pHSel) > indicator.pHf ? "Color de forma básica" : `En zona de viraje (pH ${indicator.pHi}–${indicator.pHf})`}.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="muted">Ajuste los parámetros para dibujar la curva.</div>
        )}
      </div>
    </section>
  );
}