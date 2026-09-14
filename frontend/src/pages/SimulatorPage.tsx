import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import SimBench, { SceneEvent } from "../components/SimBench";
import CurvaAvance, { EvolutionData } from "../components/CurvaAvance";
import PHmetro from "../components/pHimetro";

interface Substance {
  key: string;
  nameEs: string;
  formula: string;
  state: string;
  molar_mass: number;
  concentrations?: number[];
  color?: string;
}

interface Experiment {
  id: string;
  titleEs: string;
  level: string | string[];
  topic: string;
  reactants: string[];
  equation_display: string;
}

interface SimulationResult {
  id: string;
  title: string;
  equation_balanced: string;
  verified: { conserves_mass: boolean; residual_atoms: Record<string, number>; charge: number };
  stoichiometry: {
    limiting_reagent: string;
    extent_mol: number;
    reactants_mol: Record<string, number>;
    products_mol: Record<string, number>;
  };
  gas_volume_l: number | null;
  temperature_delta_c: number | null;
  ph_estimate: number | null;
  scene: SceneEvent[];
  explanation: string;
  safety: string;
  snapshot: string;
  evolution?: EvolutionData | null;
}

interface AddItem {
  substance: string;
  unit: "mL" | "g" | "mol";
  value: number;
}

export default function SimulatorPage() {
  const [substances, setSubstances] = useState<Record<string, Substance>>({});
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selected, setSelected] = useState(0);
  const [adds, setAdds] = useState<AddItem[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [customSub, setCustomSub] = useState("");
  const [unit, setUnit] = useState<AddItem["unit"]>("mL");
  const [value, setValue] = useState("30");
  const [prodIdx, setProdIdx] = useState(0);
  const [historial, setHistorial] = useState<{ id: string; title: string; equation: string; at: string }[]>([]);
  const [showHist, setShowHist] = useState(false);

  useEffect(() => {
    api<{ substances: Substance[]; experiments: Experiment[] }>("/academic/simulator/catalog")
      .then((d) => {
        setSubstances(Object.fromEntries(d.substances.map((s) => [s.key, s])));
        setExperiments(d.experiments);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar el catálogo."));
    try {
      const saved = localStorage.getItem("mc_historial");
      if (saved) setHistorial(JSON.parse(saved));
    } catch {
      /* sin historial */
    }
  }, []);

  const defaultAdds = useCallback(
    (exp: Experiment): AddItem[] =>
      exp.reactants.map((k) => {
        const s = substances[k];
        return s.state === "S" ? { substance: k, unit: "g", value: 1 } : { substance: k, unit: "mL", value: 30 };
      }),
    [substances],
  );

  function pickExp(i: number) {
    setSelected(i);
    setAdds(defaultAdds(experiments[i]));
  }

  async function run() {
    if (!adds.length) {
      setError("Añade al menos una sustancia.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await api<SimulationResult>("/academic/simulator/run", {
        method: "POST",
        body: { additions: adds, equipment: "default" },
        authed: true,
      });
      setResult(res);
      setProdIdx(0);
      try {
        const entry = { id: res.id, title: res.title, equation: res.equation_balanced, at: new Date().toISOString() };
        const next = [entry, ...historial.filter((h) => h.id !== res.id)].slice(0, 40);
        setHistorial(next);
        localStorage.setItem("mc_historial", JSON.stringify(next));
      } catch {
        /* almacenamiento no disponible */
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "El simulador no pudo ejecutar la receta.");
    } finally {
      setBusy(false);
    }
  }

  function addCustom() {
    if (!customSub || !value || Number(value) <= 0) return;
    setAdds((prev) => [...prev, { substance: customSub, unit, value: Number(value) }]);
  }

  function descargarReporte() {
    if (!result) return;
    const r = result;
    const prod = Object.entries(r.stoichiometry.products_mol)
      .map(([f, m]) => `  - ${f}: ${m.toFixed(4)} mol`)
      .join("\n");
    const txt = [
      "==============================================",
      "  REPORTE DE PRÁCTICA · MOLCORE LAB",
      "==============================================",
      `Fecha: ${new Date().toLocaleString()}`,
      `Experimento: ${r.title}`,
      "",
      `Ecuación balanceada: ${r.equation_balanced}`,
      `Verificación: masa y carga conservadas = ${r.verified.conserves_mass ? "SÍ" : "NO"}`,
      "",
      "Estequiometría:",
      `  Reactivo limitante: ${r.stoichiometry.limiting_reagent}`,
      `  Grado de avance: ${r.stoichiometry.extent_mol} mol`,
      "  Productos:",
      prod,
      "",
      r.gas_volume_l != null ? `Volumen de gas (25 °C): ${r.gas_volume_l} L` : "Gas: no aplica",
      r.temperature_delta_c != null ? `Cambio de temperatura: ${r.temperature_delta_c} °C` : "ΔT: no aplica",
      r.ph_estimate != null ? `pH estimado: ${r.ph_estimate}` : "pH: no aplica",
      "",
      "Explicación:",
      `  ${r.explanation}`,
      "",
      "Seguridad (simulada):",
      `  ${r.safety}`,
      "==============================================",
    ].join("\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${r.id || "practica"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="page">
      <h1>Simulador de experimentos</h1>
      <p className="lead">
        Elige un experimento del catálogo curado o monta tu propia receta. Cada ejecución se balancea y se
        verifica en el backend antes de renderizar la animación.
      </p>

      <div className="grid-2">
        <div className="card">
          <h2>Catálogo</h2>
          <select value={selected} onChange={(e) => pickExp(Number(e.target.value))} aria-label="Experimento del catálogo" style={{ width: "100%", padding: "8px 10px" }}>
            {experiments.map((e, i) => (
              <option key={e.id} value={i}>
                {e.titleEs} · {e.topic} · {e.equation_display}
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h2>Receta</h2>
          {adds.length === 0 ? (
            <p className="muted">Elige un experimento o añade sustancias manualmente.</p>
          ) : (
            <ul className="recipe">
              {adds.map((a, i) => (
                <li key={`${a.substance}-${i}`}>
                  {substances[a.substance]?.nameEs} · {a.value} {a.unit}
                  <button className="tiny" onClick={() => setAdds(adds.filter((_, j) => j !== i))}>
                    quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="inline-form">
            <select value={customSub} onChange={(e) => setCustomSub(e.target.value)}>
              <option value="">— sustancia —</option>
              {Object.values(substances).map((s) => (
                <option key={s.key} value={s.key}>
                  {s.nameEs}
                </option>
              ))}
            </select>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} min={1} />
            <select value={unit} onChange={(e) => setUnit(e.target.value as AddItem["unit"])}>
              <option value="mL">mL</option>
              <option value="g">g</option>
              <option value="mol">mol</option>
            </select>
            <button type="button" onClick={addCustom}>
              Añadir
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primary" onClick={run} disabled={busy || !adds.length}>
            {busy ? "Resolviendo en el kernel…" : "Ejecutar reacción"}
          </button>
        </div>
      </div>

      {result && (
        <div className="card result-grid">
          <div>
            <h2>{result.title}</h2>
            <p className="equation">
              <code>{result.equation_balanced}</code>
            </p>
            <p className={result.verified.conserves_mass ? "ok" : "error"}>
              Masa y carga conservadas: {result.verified.conserves_mass ? "sí" : "no"}
            </p>
            <table className="table">
              <tbody>
                <tr>
                  <td>Reactivo limitante</td>
                  <td>{result.stoichiometry.limiting_reagent}</td>
                </tr>
                <tr>
                  <td>Grado de avance</td>
                  <td>{result.stoichiometry.extent_mol} mol</td>
                </tr>
                {result.gas_volume_l != null && (
                  <tr>
                    <td>Volumen de gas (25 °C)</td>
                    <td>{result.gas_volume_l} L</td>
                  </tr>
                )}
                {result.temperature_delta_c != null && (
                  <tr>
                    <td>Cambio de temperatura</td>
                    <td>{result.temperature_delta_c} °C</td>
                  </tr>
                )}
                {result.ph_estimate != null && (
                  <tr>
                    <td>pH estimado</td>
                    <td>{result.ph_estimate}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <h3>Productos</h3>
            {(() => {
              const entries = Object.entries(result.stoichiometry.products_mol);
              const total = entries.reduce((s, [, m]) => s + m, 0);
              const safe = Math.min(Math.max(prodIdx, 0), entries.length - 1);
              const [formula, moles] = entries[safe] ?? ["—", 0];
              const pct = total > 0 ? (moles / total) * 100 : 0;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <select value={safe} onChange={(e) => setProdIdx(Number(e.target.value))} aria-label="Producto formado">
                    {entries.map(([f, m], i) => (
                      <option key={f} value={i}>
                        {f} · {m} mol
                      </option>
                    ))}
                  </select>
                  {entries.length > 0 && (
                    <div className="panel" style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span className="muted small">Producto</span>
                        <span className="mono small">{formula}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span className="muted small">Cantidad</span>
                        <span className="mono small">{moles.toFixed(4)} mol</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <span className="muted small">Fracción molar</span>
                        <span className="mono small">{pct.toFixed(1)} %</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <SimBench scene={result.scene} key={result.id} />
          <div className="span-2 grid-2" style={{ alignItems: "stretch" }}>
            {result.ph_estimate != null && <PHmetro ph={result.ph_estimate} />}
            {result.evolution && <CurvaAvance data={result.evolution} />}
          </div>
          <div className="span-2">
            <h3>Explicación</h3>
            <p>{result.explanation}</p>
            <h3>Seguridad (simulada)</h3>
            <p className="muted">{result.safety}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button className="primary" onClick={descargarReporte} aria-label="Descargar reporte">
                ⬇ Descargar reporte (.txt)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>Historial de prácticas</span>
          <button className="ghost tiny" onClick={() => setShowHist((v) => !v)}>
            {showHist ? "Ocultar" : `Mostrar (${historial.length})`}
          </button>
        </h2>
        {showHist && (
          <>
            {historial.length === 0 ? (
              <p className="muted">Todavía no has ejecutado ninguna práctica en este navegador.</p>
            ) : (
              <table className="table">
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id}>
                      <td>{h.title}</td>
                      <td className="mono small">{h.equation}</td>
                      <td className="muted small" style={{ whiteSpace: "nowrap" }}>
                        {new Date(h.at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {historial.length > 0 && (
              <button
                className="ghost"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setHistorial([]);
                  localStorage.removeItem("mc_historial");
                }}
              >
                Borrar historial
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}