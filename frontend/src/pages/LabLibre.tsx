import { useEffect, useState } from "react";
import { api } from "../api/client";
import { SUBSTANCIAS, COMPAT, type Substancia, type CompatRule } from "../data/herramientas";
import SimBench, { SceneEvent } from "../components/SimBench";

interface Catalog {
  substances: { key: string; nameEs: string; formula: string; state: string; molar_mass: number }[];
  experiments: { id: string; titleEs: string; reactants: string[] }[];
}

interface SimOut {
  id: string;
  title: string;
  equation_balanced: string;
  scene: SceneEvent[];
  explanation: string;
  safety: string;
  gas_volume_l: number | null;
  temperature_delta_c: number | null;
  ph_estimate: number | null;
  snapshot: string;
}

function findRule(a: string, b: string): CompatRule | undefined {
  return COMPAT.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
}

export default function LabLibre() {
  const [catOk, setCatOk] = useState(false);

  const [aKey, setAKey] = useState("naoh");
  const [bKey, setBKey] = useState("cuso4");
  const [amtA, setAmtA] = useState("20");
  const [amtB, setAmtB] = useState("20");
  const [unitA, setUnitA] = useState<"mL" | "g">("mL");
  const [unitB, setUnitB] = useState<"mL" | "g">("mL");

  const [rule, setRule] = useState<CompatRule | null>(null);
  const [sinReaccion, setSinReaccion] = useState(false);
  const [res, setRes] = useState<SimOut | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Catalog>("/academic/simulator/catalog")
      .then(() => setCatOk(true))
      .catch(() => { setCatOk(false); });
  }, []);

  const sA: Substancia | undefined = SUBSTANCIAS.find((s) => s.key === aKey);
  const sB: Substancia | undefined = SUBSTANCIAS.find((s) => s.key === bKey);

  async function mezclar() {
    const r = findRule(aKey, bKey);
    setRule(r ?? null);
    setSinReaccion(false);
    setRes(null);
    setError("");
    if (!r || r.tipo === "peligro" || r.tipo === "inert") {
      if (r) setError(`${r.titulo}: ${r.detalle}`);
      else setError("No se prevé una reacción balanceada conocida para esta mezcla (inert simulada).");
      if (!r) setSinReaccion(true);
      return;
    }
    setBusy(true);
    try {
      const out = await api<SimOut>("/academic/simulator/run", {
        method: "POST",
        body: {
          additions: [
            { substance: aKey, unit: unitA, value: Number(amtA) || 1 },
            { substance: bKey, unit: unitB, value: Number(amtB) || 1 },
          ],
          equipment: "default",
        },
        authed: true,
      });
      setRes(out);
    } catch (e) {
      setSinReaccion(true);
      setError(`Simulación estándar no disponible para este par (${r.titulo}: ${r.detalle}).`);
    } finally {
      setBusy(false);
    }
  }

  function onSelectA(k: string) {
    setAKey(k);
    const s = SUBSTANCIAS.find((x) => x.key === k);
    setUnitA(s?.state === "S" ? "g" : "mL");
  }
  function onSelectB(k: string) {
    setBKey(k);
    const s = SUBSTANCIAS.find((x) => x.key === k);
    setUnitB(s?.state === "S" ? "g" : "mL");
  }

  return (
    <section className="page">
      <h1>Laboratorio libre</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Combina dos sustancias y observa qué ocurre. Las reglas de compatibilidad están curadas; los pares peligrosos muestran advertencia sin permitir su ejecución.
      </p>

      <div className="card" style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <h2>Mezclar dos sustancias</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label className="field">
            Sustancia A
            <select value={aKey} onChange={(e) => onSelectA(e.target.value)} aria-label="Sustancia A">
              {SUBSTANCIAS.map((s) => <option key={s.key} value={s.key}>{s.nameEs}</option>)}
            </select>
          </label>
          <label className="field">
            Cantidad A
            <div style={{ display: "flex", gap: 6 }}>
              <input value={amtA} onChange={(e) => setAmtA(e.target.value)} inputMode="decimal" style={{ width: 70 }} />
              <select value={unitA} onChange={(e) => setUnitA(e.target.value as "mL" | "g")} aria-label="Unidad A">
                <option value="mL">mL</option><option value="g">g</option>
              </select>
            </div>
          </label>
          <label className="field">
            Sustancia B
            <select value={bKey} onChange={(e) => onSelectB(e.target.value)} aria-label="Sustancia B">
              {SUBSTANCIAS.map((s) => <option key={s.key} value={s.key}>{s.nameEs}</option>)}
            </select>
          </label>
          <label className="field">
            Cantidad B
            <div style={{ display: "flex", gap: 6 }}>
              <input value={amtB} onChange={(e) => setAmtB(e.target.value)} inputMode="decimal" style={{ width: 70 }} />
              <select value={unitB} onChange={(e) => setUnitB(e.target.value as "mL" | "g")} aria-label="Unidad B">
                <option value="mL">mL</option><option value="g">g</option>
              </select>
            </div>
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {sA && sB && (
            <div className="stat" style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <span>{sA.formula}</span>
              <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 999, background: sA.color, border: "1px solid rgba(255,255,255,0.25)" }} />
              <span className="muted">+</span>
              <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 999, background: sB.color, border: "1px solid rgba(255,255,255,0.25)" }} />
              <span>{sB.formula}</span>
            </div>
          )}
          <button className="primary" onClick={mezclar} disabled={busy || !sA || !sB}>
            {busy ? "Mezclando…" : "Mezclar"}
          </button>
        </div>
        {!catOk && <div className="notice">Catálogo del backend no disponible: se usan datos locales curados. Solo se describirá el fenómeno (sin animación).</div>}
      </div>

      {rule && (rule.tipo === "peligro" || rule.tipo === "inert") && (
        <div className={rule.tipo === "peligro" ? "error" : "result-box"} aria-label="Advertencia de compatibilidad">
          <h3 style={{ margin: "0 0 4px" }}>{rule.titulo}</h3>
          <p style={{ margin: 0 }}>{rule.detalle}</p>
        </div>
      )}

      {res && (
        <div className="card result-grid" style={{ marginTop: 14 }}>
          <div>
            <h2>{res.title}</h2>
            <p className="equation"><code>{res.equation_balanced}</code></p>
            <table className="table">
              <tbody>
                {res.temperature_delta_c != null && <tr><td>Cambio de temperatura</td><td>{res.temperature_delta_c} °C</td></tr>}
                {res.gas_volume_l != null && <tr><td>Volumen de gas (25 °C)</td><td>{res.gas_volume_l} L</td></tr>}
                {res.ph_estimate != null && <tr><td>pH estimado</td><td>{res.ph_estimate}</td></tr>}
              </tbody>
            </table>
            <h3>Explicación</h3>
            <p>{res.explanation}</p>
            <h3>Seguridad (simulada)</h3>
            <p className="muted">{res.safety}</p>
          </div>
          <SimBench scene={res.scene} key={res.id} />
        </div>
      )}

      {sinReaccion && (
        <div className="card" style={{ marginTop: 14 }} aria-label="Mezcla simple">
          <h2 style={{ marginBottom: 4 }}>{rule?.titulo ?? "Mezcla sin reacción conocida"}</h2>
          <p className="muted" style={{ marginTop: 0 }}>{error}</p>
          <p className="small">
            En un laboratorio didáctico, mezclar sustancias sin reacción conocida (p. ej. sales solubles con agua) solo diluye o satura la disolución.
          </p>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Normas generales</h2>
        <ul className="list">
          <li>Nunca mezclar <b>ácido concentrado con agua</b>: añadir el ácido sobre el agua en frío, nunca al revés.</li>
          <li><b>HNO3 y H2O2 concentrados</b> son oxidantes: evitar contacto con combustible (alcoholes, orgánicos).</li>
          <li>El <b>H2SO4</b> concentrado deshidrata con fuerza: no mojar con etanol sin control de temperatura.</li>
          <li>Los <b>metales con ácidos</b> liberan H2 inflamable: no acercar llamas.</li>
          <li>Los <b>carbonatos/bicarbonatos con ácidos</b> liberan CO2: uso en vitrina o con poca cantidad.</li>
        </ul>
      </div>
    </section>
  );
}