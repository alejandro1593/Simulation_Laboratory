import { useState } from "react";

type Modo = "molaridad" | "dilucion" | "porcentaje";

function f(n: number, d = 4): string {
  return Number.isFinite(n) ? n.toFixed(d) : "—";
}

export default function Soluciones() {
  const [modo, setModo] = useState<Modo>("molaridad");

  const [m, setM] = useState("12");
  const [mm, setMm] = useState("40");
  const [v, setV] = useState("500");

  const [c1, setC1] = useState("1.0");
  const [v1, setV1] = useState("25");
  const [v2, setV2] = useState("250");

  const [rho, setRho] = useState("1.19");
  const [pct, setPct] = useState("37"); // % m/m ácido clorhídrico comercial
  const [mmP, setMmP] = useState("36.46");

  const mG = parseFloat(m) || 0;
  const mmV = parseFloat(mm) || 0;
  const vL = (parseFloat(v) || 0) / 1000;
  const M = vL > 0 && mmV > 0 ? mG / (mmV * vL) : NaN;
  const mPasos = M > 0 ? `${f(mG, 2)} g / (${f(mmV, 2)} g/mol × ${f(vL, 3)} L)` : null;

  const c1v = parseFloat(c1) || 0;
  const v1v = parseFloat(v1) || 0;
  const v2v = parseFloat(v2) || 0;
  const c2 = v2v > 0 ? (c1v * v1v) / v2v : NaN;

  const rhoV = parseFloat(rho) || 0;
  const pctV = parseFloat(pct) || 0;
  const mmPv = parseFloat(mmP) || 0;
  const mpv = (rhoV > 0 && mmPv > 0 ? ((1000 * rhoV * pctV) / 100) / mmPv : NaN);

  return (
    <section className="page">
      <h1>Soluciones</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Cálculo de concentraciones y diluciones con desarrollo paso a paso.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
        {(["molaridad", "dilucion", "porcentaje"] as Modo[]).map((m2) => (
          <button key={m2} className={modo === m2 ? "primary" : "ghost"} onClick={() => setModo(m2)}>
            {m2 === "molaridad" ? "Molaridad" : m2 === "dilucion" ? "Dilución" : "Desde porcentaje"}
          </button>
        ))}
      </div>

      {modo === "molaridad" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2>Preparar una disolución</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label className="field">
              Masa de soluto (g) <input value={m} onChange={(e) => setM(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              Masa molar (g/mol) <input value={mm} onChange={(e) => setMm(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              Volumen final (mL) <input value={v} onChange={(e) => setV(e.target.value)} inputMode="decimal" />
            </label>
          </div>
          {mPasos && (
            <div className="result-box" aria-label="Resultado molaridad">
              <div className="result-main">M = {f(M)} mol/L</div>
              <div className="muted small">M = {mPasos} = {f(mG / (mmV * vL), 6)} mol/L</div>
            </div>
          )}
        </div>
      )}

      {modo === "dilucion" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2>Dilución: C₁·V₁ = C₂·V₂</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label className="field">
              C₁ (mol/L) <input value={c1} onChange={(e) => setC1(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              V₁ (mL) <input value={v1} onChange={(e) => setV1(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              V₂ final (mL) <input value={v2} onChange={(e) => setV2(e.target.value)} inputMode="decimal" />
            </label>
          </div>
          <div className="result-box" aria-label="Resultado dilucion">
            <div className="result-main">C₂ = {f(c2)} mol/L</div>
            <div className="muted small">C₂ = {f(c1v, 2)} × {f(v1v, 2)} / {f(v2v, 2)} = {f((c1v * v1v) / v2v, 6)} mol/L</div>
          </div>
        </div>
      )}

      {modo === "porcentaje" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2>De % m/m a molaridad</h2>
          <p className="muted small">
            M = (1000 × ρ × %m/m) / (100 × Mm) — típico para ácidos y soluciones comerciales (ej. HCl 37 %, ρ=1,19 g/mL).
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label className="field">
              Densidad ρ (g/mL) <input value={rho} onChange={(e) => setRho(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              Pureza (% m/m) <input value={pct} onChange={(e) => setPct(e.target.value)} inputMode="decimal" />
            </label>
            <label className="field">
              Masa molar (g/mol) <input value={mmP} onChange={(e) => setMmP(e.target.value)} inputMode="decimal" />
            </label>
          </div>
          <div className="result-box" aria-label="Resultado porcentaje">
            <div className="result-main">M = {f(mpv)} mol/L</div>
            <div className="muted small">M = (1000 × {f(rhoV, 2)} × {f(pctV, 2)}) / (100 × {f(mmPv, 2)}) = {f(mpv, 6)} mol/L</div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Relaciones rápidas</h2>
        <div className="grid-2">
          <div>
            Molaridad: <b>M = m / (Mm · V[L])</b>
            <div className="muted small">Número de moles de soluto por litro de disolución.</div>
          </div>
          <div>
            Dilución: <b>C₁·V₁ = C₂·V₂</b>
            <div className="muted small">Diluir no cambia los moles de soluto.</div>
          </div>
          <div>
            % m/m = (m soluto / m disolución) × 100
            <div className="muted small">% m/v = (m soluto g / V mL) × 100; ppm = mg de soluto por L.</div>
          </div>
          <div>
            <b>M = (10 · ρ · %m/m) / Mm</b>
            <div className="muted small">Conversión desde pureza comercial (ρ en g/mL).</div>
          </div>
        </div>
      </div>
    </section>
  );
}