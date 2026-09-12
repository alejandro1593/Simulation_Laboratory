import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import SimBench, { SceneEvent } from "../components/SimBench";

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

  useEffect(() => {
    api<{ substances: Substance[]; experiments: Experiment[] }>("/academic/simulator/catalog")
      .then((d) => {
        setSubstances(Object.fromEntries(d.substances.map((s) => [s.key, s])));
        setExperiments(d.experiments);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar el catálogo."));
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
          <ul className="exp-list">
            {experiments.map((e, i) => (
              <li key={e.id}>
                <button className={i === selected ? "exp-item active" : "exp-item"} onClick={() => pickExp(i)}>
                  <strong>{e.titleEs}</strong>
                  <span className="muted">
                    {e.topic} · {e.equation_display}
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
            <ul>
              {Object.entries(result.stoichiometry.products_mol).map(([f, m]) => (
                <li key={f}>
                  {f}: {m} mol
                </li>
              ))}
            </ul>
          </div>
          <SimBench scene={result.scene} key={result.id} />
          <div className="span-2">
            <h3>Explicación</h3>
            <p>{result.explanation}</p>
            <h3>Seguridad (simulada)</h3>
            <p className="muted">{result.safety}</p>
          </div>
        </div>
      )}
    </section>
  );
}