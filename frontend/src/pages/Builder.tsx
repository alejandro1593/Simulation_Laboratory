import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

interface Atom {
  id: string;
  symbol: string;
  x: number;
  y: number;
  charge?: number;
}

interface Bond {
  a: string;
  b: string;
  order: number;
}

interface Preset {
  name: string;
  atoms: Atom[];
  bonds: Bond[];
  notes: string;
}

const RADIUS: Record<string, number> = { H: 9, C: 13, N: 12, O: 12 };
const COLORS: Record<string, string> = {
  H: "#ececec",
  C: "#5b8cc4",
  N: "#5e9cd1",
  O: "#e05a5a",
};

function coords(preset: Preset) {
  const xs = preset.atoms.map((a) => a.x);
  const ys = preset.atoms.map((a) => a.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return { cx, cy };
}

function Molecule({ preset }: { preset: Preset }) {
  const { cx, cy } = coords(preset);
  const byId = Object.fromEntries(preset.atoms.map((a) => [a.id, a]));
  return (
    <svg viewBox="-60 -60 120 120" width="220" height="220" role="img" aria-label={preset.name}>
      {preset.bonds.map((b, i) => {
        const a1 = byId[b.a];
        const a2 = byId[b.b];
        const x1 = (a1.x - cx) * 40;
        const y1 = (a1.y - cy) * 40;
        const x2 = (a2.x - cx) * 40;
        const y2 = (a2.y - cy) * 40;
        if (b.order === 2) {
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#444" strokeWidth={4} />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#444" strokeWidth={1} strokeDasharray="3 4" />
            </g>
          );
        }
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#444" strokeWidth={4} />;
      })}
      {preset.atoms.map((a) => {
        const r = RADIUS[a.symbol] ?? 10;
        return (
          <g key={a.id} transform={`translate(${(a.x - cx) * 40}, ${(a.y - cy) * 40})`}>
            <circle r={r} fill={COLORS[a.symbol] ?? "#9aa"} stroke="#222" strokeWidth={1.5} />
            <text y={r + 11} textAnchor="middle" fontSize={11} fill="#ddd">
              {a.symbol}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Builder() {
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [formula, setFormula] = useState("H2SO4");
  const [mm, setMm] = useState<{ molar_mass_g_mol: number; composition: Record<string, number> } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Record<string, Preset>>("/academic/builder/presets")
      .then(setPresets)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudieron cargar los presets."));
  }, []);

  async function calcMass() {
    setError("");
    try {
      const r = await api<{ molar_mass_g_mol: number; composition: Record<string, number> }>(
        "/academic/calculators/molar-mass",
        { method: "POST", body: { formula }, authed: true },
      );
      setMm(r);
    } catch (e) {
      setMm(null);
      setError(e instanceof ApiError ? e.message : "No se pudo calcular la masa molar.");
    }
  }

  return (
    <section className="page">
      <h1>Constructor de moléculas</h1>
      <p className="lead">
        Escenarios didácticos ya validados por las reglas de valencia. Úsalos para repasar geometría, enlaces y
        masa molar de compuestos reales.
      </p>
      {error && <p className="error">{error}</p>}
      <div className="mol-gallery">
        {Object.entries(presets).map(([name, preset]) => (
          <div className="card" key={name}>
            <h3>{name.replace(/_/g, " ")}</h3>
            <Molecule preset={preset} />
            <p className="muted small">{preset.notes}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>Calculadora de masa molar</h2>
        <div className="inline-form">
          <input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="Ej: Ca(OH)2" />
          <button className="primary" onClick={calcMass}>
            Calcular
          </button>
        </div>
        {mm && (
          <p>
            <strong>{formula}</strong> = {mm.molar_mass_g_mol} g/mol ·{" "}
            {Object.entries(mm.composition)
              .map(([el, n]) => `${el}${n}`)
              .join(" + ")}
          </p>
        )}
      </div>
    </section>
  );
}