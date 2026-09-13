import { useState } from "react";
import { api } from "../api/client";

interface MM {
  formula: string;
  molar_mass_g_mol: number;
  composition: Record<string, number>;
  charge: number;
}

interface SP {
  formula: string;
  molarity: number;
  volume_ml: number;
  moles: number;
  molar_mass_g_mol: number;
  mass_to_weigh_g: number;
}

interface DIL {
  c1: number;
  v1_ml: number;
  c2: number;
  v2_ml: number;
  water_to_add_ml: number;
}

interface OX {
  formula: string;
  charge: number;
  states: Record<string, number | null>;
  total: number;
  balanced: boolean;
  notes: string[];
}

function useCalc<T>() {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (path: string, body: unknown) => {
    setBusy(true);
    setErr(null);
    setData(null);
    try {
      setData(await api<T>(path, { method: "POST", body }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return { data, err, busy, run, setData };
}

const R_IDEAL = 0.082057366; // L·atm·K⁻¹·mol⁻¹

const CONV_CATS: { key: string; name: string; units: { k: string; f: number }[] }[] = [
  {
    key: "masa",
    name: "Masa",
    units: [
      { k: "kg", f: 1000 },
      { k: "g", f: 1 },
      { k: "mg", f: 0.001 },
      { k: "lb", f: 453.59237 },
      { k: "oz", f: 28.349523 },
    ],
  },
  {
    key: "volumen",
    name: "Volumen",
    units: [
      { k: "m³", f: 1000 },
      { k: "L", f: 1 },
      { k: "mL", f: 0.001 },
      { k: "gal (US)", f: 3.785411784 },
    ],
  },
  {
    key: "presion",
    name: "Presión",
    units: [
      { k: "atm", f: 101325 },
      { k: "Pa", f: 1 },
      { k: "kPa", f: 1000 },
      { k: "bar", f: 100000 },
      { k: "mmHg (torr)", f: 133.322368 },
      { k: "psi", f: 6894.757 },
    ],
  },
  {
    key: "longitud",
    name: "Longitud",
    units: [
      { k: "km", f: 1000 },
      { k: "m", f: 1 },
      { k: "cm", f: 0.01 },
      { k: "mm", f: 0.001 },
      { k: "ft", f: 0.3048 },
      { k: "in", f: 0.0254 },
    ],
  },
];

const fmt = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toLocaleString("es", { minimumFractionDigits: 0, maximumFractionDigits: d }) : "—";

export default function Calculations() {
  const mm = useCalc<MM>();
  const sp = useCalc<SP>();
  const dil = useCalc<DIL>();
  const ox = useCalc<OX>();

  const [mmF, setMmF] = useState("H2SO4");
  const [spF, setSpF] = useState("NaOH");
  const [spM, setSpM] = useState("1.0");
  const [spV, setSpV] = useState("500");
  const [c1, setC1] = useState("2.0");
  const [v1, setV1] = useState("100");
  const [c2, setC2] = useState("0.5");
  const [oxF, setOxF] = useState("KMnO4");

  const [convCat, setConvCat] = useState(CONV_CATS[1]);
  const [convFrom, setConvFrom] = useState(CONV_CATS[1].units[1]);
  const [convTo, setConvTo] = useState(CONV_CATS[1].units[0]);
  const [convVal, setConvVal] = useState("1");
  const conv = parseFloat(convVal);
  const convResult =
    Number.isFinite(conv) && convFrom.f > 0 && convTo.f > 0
      ? (conv * convFrom.f) / convTo.f
      : null;

  const [gUnk, setGUnk] = useState<"P" | "V" | "n" | "T">("V");
  const [gP, setGP] = useState("1");
  const [gV, setGV] = useState("22.4");
  const [gn, setGn] = useState("1");
  const [gT, setGT] = useState("273.15");
  const gPv = parseFloat(gP);
  const gVv = parseFloat(gV);
  const gnv = parseFloat(gn);
  const gTv = parseFloat(gT);
  const gasError =
    !Number.isFinite(gPv) || !Number.isFinite(gVv) || !Number.isFinite(gnv) || !Number.isFinite(gTv)
      ? "Rellena los tres valores numéricos."
      : gUnk !== "T" && gTv <= 0
      ? "Temperatura debe ser > 0 K (el cero absoluto no se divide)."
      : null;
  const gasResult =
    gasError === null && gPv >= 0 && gVv >= 0 && gnv >= 0
      ? gUnk === "P"
        ? { v: (gnv * R_IDEAL * gTv) / gVv, u: "atm" }
        : gUnk === "V"
        ? { v: (gnv * R_IDEAL * gTv) / gPv, u: "L" }
        : gUnk === "n"
        ? { v: (gPv * gVv) / (R_IDEAL * gTv), u: "mol" }
        : { v: (gPv * gVv) / (gnv * R_IDEAL), u: "K" }
      : null;

  return (
    <div className="page">
      <h1>Calculadora de laboratorio</h1>
      <p className="lead">
        Herramientas de concentración y estequiometría resueltas con datos reales (masas atómicas
        del catálogo de elementos) por el kernel del backend. El cálculo de estados de oxidación
        aplica reglas deterministas: primero fija F/grupos 1-2/H/Zn/Al, luego despeja el elemento
        restante por carga total.
      </p>

      <div className="grid-2">
        <div className="card">
          <h2>Masa molar</h2>
          <p className="small muted">Composición a partir de la fórmula. Acepta paréntesis y cargas: <code>Fe2(SO4)3</code>, <code>NH4(1+)</code>.</p>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              mm.run("/academic/calculators/molar-mass", { formula: mmF });
            }}
          >
            <input value={mmF} onChange={(e) => setMmF(e.target.value)} placeholder="Fórmula" />
            <button className="primary" type="submit" disabled={busy(mm)}>{busy(mm) ? "…" : "Calcular"}</button>
          </form>
          {mm.data && (
            <>
              <p className="equation" style={{ marginTop: 12 }}>
                M({mm.data.formula}) ={" "}
                <b style={{ color: "var(--accent)" }}>{fmt(mm.data.molar_mass_g_mol, 3)} g/mol</b>{" "}
                {mm.data.charge !== 0 && <span className="muted">· carga {mm.data.charge > 0 ? "+" : ""}{mm.data.charge}</span>}
              </p>
              <table className="table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Elemento</th>
                    <th>Átomos</th>
                    <th>Aporte</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(mm.data.composition).map(([el, n]) => (
                    <tr key={el}>
                      <td className="mono">{el}</td>
                      <td className="mono">{n}</td>
                      <td className="mono muted">
                        {n} × A({el})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {mm.err && <p className="error" style={{ marginTop: 10 }}>{mm.err}</p>}
        </div>

        <div className="card">
          <h2>Preparar disolución</h2>
          <p className="small muted">Gramos de soluto sólido para un volumen y molaridad dados, desde la masa molar de la fórmula.</p>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              sp.run("/academic/calculators/solution-prep", {
                formula: spF,
                molarity: parseFloat(spM),
                volume_ml: parseFloat(spV),
              });
            }}
          >
            <input value={spF} onChange={(e) => setSpF(e.target.value)} placeholder="Soluto (fórmula)" />
            <div className="row">
              <input value={spM} onChange={(e) => setSpM(e.target.value)} placeholder="Molaridad (mol/L)" style={{ flex: 1 }} />
              <input value={spV} onChange={(e) => setSpV(e.target.value)} placeholder="Volumen (mL)" style={{ flex: 1 }} />
            </div>
            <button className="primary" type="submit" disabled={busy(sp)}>{busy(sp) ? "…" : "Calcular"}</button>
          </form>
          {sp.data && (
            <ul className="recipe" style={{ marginTop: 12 }}>
              <li>
                <span>Masa molar</span>
                <span className="mono">{fmt(sp.data.molar_mass_g_mol)} g/mol</span>
              </li>
              <li>
                <span>Moles a preparar</span>
                <span className="mono">{fmt(sp.data.moles, 6)} mol</span>
              </li>
              <li>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Pesar</span>
                <span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {fmt(sp.data.mass_to_weigh_g)} g de {sp.data.formula}
                </span>
              </li>
              <li>
                <span>Aforar a</span>
                <span className="mono">{fmt(sp.data.volume_ml, 0)} mL</span>
              </li>
            </ul>
          )}
          {sp.err && <p className="error" style={{ marginTop: 10 }}>{sp.err}</p>}
        </div>

        <div className="card">
          <h2>Dilución (C₁·V₁ = C₂·V₂)</h2>
          <p className="small muted">Cuánta agua añadir a una alícuota para alcanzar la concentración objetivo.</p>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              dil.run("/academic/calculators/dilution", {
                c1: parseFloat(c1),
                v1_ml: parseFloat(v1),
                c2: parseFloat(c2),
              });
            }}
          >
            <div className="row">
              <input value={c1} onChange={(e) => setC1(e.target.value)} placeholder="C₁ (mol/L)" style={{ flex: 1 }} />
              <input value={v1} onChange={(e) => setV1(e.target.value)} placeholder="V₁ (mL)" style={{ flex: 1 }} />
              <input value={c2} onChange={(e) => setC2(e.target.value)} placeholder="C₂ (mol/L)" style={{ flex: 1 }} />
            </div>
            <button className="primary" type="submit" disabled={busy(dil)}>{busy(dil) ? "…" : "Calcular"}</button>
          </form>
          {dil.data && (
            <ul className="recipe" style={{ marginTop: 12 }}>
              <li>
                <span>Volumen final (V₂)</span>
                <span className="mono">{fmt(dil.data.v2_ml)} mL</span>
              </li>
              <li>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Añadir agua</span>
                <span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {fmt(dil.data.water_to_add_ml)} mL
                </span>
              </li>
            </ul>
          )}
          {dil.err && <p className="error" style={{ marginTop: 10 }}>{dil.err}</p>}
        </div>

        <div className="card">
          <h2>Estados de oxidación</h2>
          <p className="small muted">
            Asigna el número de oxidación de cada elemento con reglas de electronegatividad.
            Incluye peróxidos (H₂O₂) e hidruros metálicos (NaH).
          </p>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              ox.run("/academic/calculators/oxidation-states", { formula: oxF });
            }}
          >
            <input value={oxF} onChange={(e) => setOxF(e.target.value)} placeholder="Fórmula" />
            <button className="primary" type="submit" disabled={busy(ox)}>{busy(ox) ? "…" : "Calcular"}</button>
          </form>
          {ox.data && (
            <div style={{ marginTop: 12 }}>
              <div className="ox-tags">
                {Object.entries(ox.data.states).map(([el, st]) => (
                  <span key={el} className="ox-tag" style={st == null ? { opacity: 0.5 } : {}}>
                    {el} {st == null ? "?" : st > 0 ? `+${st}` : st}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12.5, marginTop: 8 }}>
                <span title="Suma de estados × átomos = carga" style={{ whiteSpace: "nowrap" }}>
                  Σ = {ox.data.total > 0 ? "+" : ""}{ox.data.total} · carga {ox.data.charge}
                </span>{" "}
                {ox.data.balanced ? (
                  <b className="ok">✓ equilibrado</b>
                ) : (
                  <span className="error" style={{ padding: "2px 8px" }}>no cuadra</span>
                )}
              </p>
              {ox.data.notes.map((n) => (
                <p className="notice" key={n} style={{ margin: "6px 0" }}>{n}</p>
              ))}
            </div>
          )}
          {ox.err && <p className="error" style={{ marginTop: 10 }}>{ox.err}</p>}
        </div>

        <div className="card">
          <h2>Conversor de unidades</h2>
          <p className="small muted">
            Factores de conversión reales (el mmHg = torr; la lb y la oz en masa, el gal US). Se calcula al instante.
          </p>
          <div className="row">
            <select
              value={convCat.key}
              onChange={(e) => {
                const c = CONV_CATS.find((x) => x.key === e.target.value) ?? CONV_CATS[0];
                setConvCat(c);
                setConvFrom(c.units[1]);
                setConvTo(c.units[0]);
              }}
            >
              {CONV_CATS.map((c) => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="inline-form" style={{ marginTop: 8 }}>
            <input type="number" value={convVal} onChange={(e) => setConvVal(e.target.value)} step="any" />
            <select value={convFrom.k} onChange={(e) => setConvFrom(convCat.units.find((u) => u.k === e.target.value) ?? convFrom)}>
              {convCat.units.map((u) => (
                <option key={u.k} value={u.k}>{u.k}</option>
              ))}
            </select>
            <span className="muted">→</span>
            <select value={convTo.k} onChange={(e) => setConvTo(convCat.units.find((u) => u.k === e.target.value) ?? convTo)}>
              {convCat.units.map((u) => (
                <option key={u.k} value={u.k}>{u.k}</option>
              ))}
            </select>
          </div>
          {convResult !== null && (
            <p className="equation" style={{ marginTop: 12 }}>
              {fmt(conv, 6)} {convFrom.k} = <b style={{ color: "var(--accent)" }}>{fmt(convResult, 6)}</b> {convTo.k}
            </p>
          )}
          <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
            Temperatura: 0 °C = 273.15 K = 32 °F (pregunta al tutor si necesitas esa conversión).
          </p>
        </div>

        <div className="card">
          <h2>Gas ideal: PV = nRT</h2>
          <p className="small muted">
            R = {R_IDEAL} L·atm·K⁻¹·mol⁻¹. Elige la incógnita y completa los otros tres datos. La temperatura se
            introduce en <b>kelvin</b>.
          </p>
          <div className="row">
            <select
              value={gUnk}
              onChange={(e) => setGUnk(e.target.value as "P" | "V" | "n" | "T")}
              style={{ flex: 1 }}
            >
              <option value="P">Calcular P</option>
              <option value="V">Calcular V</option>
              <option value="n">Calcular n</option>
              <option value="T">Calcular T</option>
            </select>
          </div>
          <form
            className="form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="row">
              <input
                type="number"
                value={gP}
                onChange={(e) => setGP(e.target.value)}
                placeholder="P (atm)"
                disabled={gUnk === "P"}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                value={gV}
                onChange={(e) => setGV(e.target.value)}
                placeholder="V (L)"
                disabled={gUnk === "V"}
                style={{ flex: 1 }}
              />
            </div>
            <div className="row">
              <input
                type="number"
                value={gn}
                onChange={(e) => setGn(e.target.value)}
                placeholder="n (mol)"
                disabled={gUnk === "n"}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                value={gT}
                onChange={(e) => setGT(e.target.value)}
                placeholder="T (K)"
                disabled={gUnk === "T"}
                style={{ flex: 1 }}
              />
            </div>
          </form>
          {gasError && <p className="error" style={{ marginTop: 10 }}>{gasError}</p>}
          {gasResult && (
            <p className="equation" style={{ marginTop: 12 }}>
              {gUnk} = <b style={{ color: "var(--accent)" }}>{fmt(gasResult.v, 4)} {gasResult.u}</b>
              {gUnk === "T" && <span className="muted"> ≈ {fmt(gasResult.v - 273.15, 2)} °C</span>}
            </p>
          )}
          <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
            Modelo ideal: gases sin interacciones. Da buenas aproximaciones a presiones bajas y
            temperaturas alejadas de la licuefacción.
          </p>
        </div>
      </div>
    </div>
  );
}

function busy(c: { busy: boolean }) {
  return c.busy;
}