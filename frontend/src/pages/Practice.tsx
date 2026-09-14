import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

/* ------------------------------------------------------------------ */
/*  PRNG determinista                                                  */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rnd: () => number, min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

/* Sustancias con masa molar de referencia (valores IUPAC/CRC, curados) */
const SUBS = [
  { nombre: "cloruro de sodio (NaCl)", formula: "NaCl", masa: 58.44 },
  { nombre: "agua (H₂O)", formula: "H₂O", masa: 18.02 },
  { nombre: "hidróxido de sodio (NaOH)", formula: "NaOH", masa: 40.00 },
  { nombre: "ácido clorhídrico (HCl)", formula: "HCl", masa: 36.46 },
  { nombre: "ácido sulfúrico (H₂SO₄)", formula: "H₂SO₄", masa: 98.08 },
  { nombre: "carbonato de calcio (CaCO₃)", formula: "CaCO₃", masa: 100.09 },
  { nombre: "glucosa (C₆H₁₂O₆)", formula: "C₆H₁₂O₆", masa: 180.16 },
  { nombre: "etanol (C₂H₆O)", formula: "C₂H₅OH", masa: 46.07 },
  { nombre: "amoniaco (NH₃)", formula: "NH₃", masa: 17.03 },
  { nombre: "ácido acético (CH₃COOH)", formula: "CH₃COOH", masa: 60.05 },
];

/* ------------------------------------------------------------------ */
/*  Generadores de problemas                                           */
/* ------------------------------------------------------------------ */
type ProblemType = "moles" | "molaridad" | "dilucion" | "gas" | "ph";

interface ProbField {
  key: string;
  label: string;
  unit: string;
}

interface Problem {
  id: number;
  type: ProblemType;
  tipo: string;
  statement: string;
  explain: string;
  fields: ProbField[];
  answers: number[];
  steps: string[];
}

const R = 0.082057;

function generate(seed: number, id: number): Problem {
  const rnd = mulberry32((seed * 0x9E3779B9) ^ (id * 1000003));
  const types: ProblemType[] = ["moles", "molaridad", "dilucion", "gas", "ph"];
  const type = types[randInt(rnd, 0, types.length - 1)];
  const sub = SUBS[randInt(rnd, 0, SUBS.length - 1)];

  if (type === "moles") {
    const dir = randInt(rnd, 0, 1);
    if (dir === 0) {
      const n = randInt(rnd, 1, 12) / 2;
      const m = n * sub.masa;
      return {
        id, type, tipo: "Moles → Gramos",
        statement: `¿Cuántos gramos pesan ${fmtNice(n)} mol de ${sub.nombre}?`,
        explain: "m = n × M",
        fields: [{ key: "v", label: "Masa", unit: "g" }],
        answers: [m],
        steps: [
          `Masa molar de ${sub.formula}: M = ${sub.masa} g/mol`,
          `m = n × M = ${fmtNice(n)} × ${sub.masa}`,
          `m = ${fmt(m)} g`,
        ],
      };
    }
    const m = randInt(rnd, 1, 8) * sub.masa;
    const n = m / sub.masa;
    return {
      id, type, tipo: "Gramos → Moles",
      statement: `¿Cuántos moles hay en ${fmt(m)} g de ${sub.nombre}?`,
      explain: "n = m / M",
      fields: [{ key: "v", label: "Cantidad", unit: "mol" }],
      answers: [n],
      steps: [
        `Masa molar de ${sub.formula}: M = ${sub.masa} g/mol`,
        `n = m / M = ${fmt(m)} / ${sub.masa}`,
        `n = ${fmt(n)} mol`,
      ],
    };
  }

  if (type === "molaridad") {
    const mode = randInt(rnd, 0, 2);
    if (mode === 0) {
      const n = randInt(rnd, 2, 20) / 10;
      const v = randInt(rnd, 1, 25) * 100;
      const C = n / (v / 1000);
      return {
        id, type, tipo: "Molaridad (C = n/V)",
        statement: `Se disuelven ${fmtNice(n)} mol de soluto en ${v} mL de disolución. ¿Cuál es la molaridad?`,
        explain: "C = n / V(L)",
        fields: [{ key: "v", label: "Concentración", unit: "mol/L" }],
        answers: [C],
        steps: [`V = ${v} mL = ${v / 1000} L`, `C = ${fmtNice(n)} / ${v / 1000}`, `C = ${fmt(C)} mol/L`],
      };
    }
    if (mode === 1) {
      const m = randInt(rnd, 2, 20) * (sub.masa / 10);
      const v = randInt(rnd, 1, 10) * 100;
      const moles = m / sub.masa;
      const C = moles / (v / 1000);
      return {
        id, type, tipo: "Molaridad desde masa",
        statement: `Se disuelven ${fmt(m)} g de ${sub.nombre} en ${v} mL de agua. ¿Cuál es la molaridad?`,
        explain: "n = m/M; C = n/V",
        fields: [{ key: "v", label: "Concentración", unit: "mol/L" }],
        answers: [C],
        steps: [
          `n = ${fmt(m)} / ${sub.masa} = ${fmt(moles)} mol`,
          `V = ${v} mL = ${v / 1000} L`,
          `C = ${fmt(moles)} / ${v / 1000} = ${fmt(C)} mol/L`,
        ],
      };
    }
    const C = randInt(rnd, 5, 40) / 100;
    const v = randInt(rnd, 1, 9) * 100;
    const n = C * (v / 1000);
    const m = n * sub.masa;
    return {
      id, type, tipo: "Preparar una concentración",
      statement: `Quieres preparar ${v} mL de ${fmtNice(C)} mol/L de ${sub.nombre}. ¿Qué masa de soluto necesitas?`,
      explain: "n = C·V; m = n·M",
      fields: [{ key: "v", label: "Masa", unit: "g" }],
      answers: [m],
      steps: [
        `n = C × V = ${fmtNice(C)} × ${v / 1000} = ${fmt(n)} mol`,
        `m = n × M = ${fmt(n)} × ${sub.masa}`,
        `m = ${fmt(m)} g`,
      ],
    };
  }

  if (type === "dilucion") {
    const c1 = randInt(rnd, 5, 30) / 10;
    const v1 = randInt(rnd, 50, 400);
    const factor = randInt(rnd, 5, 30) / 10;
    const c2 = c1 / factor;
    const v2 = c1 * v1 / c2;
    return {
      id, type, tipo: "Dilución (C₁V₁ = C₂V₂)",
      statement: `Se diluyen ${v1} mL de disolución ${fmtNice(c1)} mol/L hasta que la concentración baja a ${fmtNice(c2)} mol/L. ¿Cuál es el volumen final?`,
      explain: "C₁V₁ = C₂V₂ → V₂ = C₁V₁/C₂",
      fields: [{ key: "v", label: "Volumen final", unit: "mL" }],
      answers: [v2],
      steps: [
        `V₂ = C₁V₁ / C₂ = ${fmtNice(c1)} × ${v1} / ${fmtNice(c2)}`,
        `V₂ = ${fmt(v2)} mL`,
      ],
    };
  }

  if (type === "gas") {
    const n = randInt(rnd, 1, 10) / 10;
    const T = randInt(rnd, 20, 80);
    const P = randInt(rnd, 2, 12) / 10;
    const V = (n * R * (T + 273.15)) / P;
    return {
      id, type, tipo: "Gas ideal (PV = nRT)",
      statement: `Un gas con n = ${fmtNice(n)} mol ocupa la presión de ${fmtNice(P)} atm a ${T} °C. ¿Qué volumen ocupa? (R = 0.082 atm·L/(mol·K))`,
      explain: "PV = nRT → V = nRT/P",
      fields: [{ key: "v", label: "Volumen", unit: "L" }],
      answers: [V],
      steps: [
        `T = ${T} + 273.15 = ${T + 273.15} K`,
        `V = ${fmtNice(n)} × 0.082 × ${T + 273.15} / ${fmtNice(P)}`,
        `V = ${fmt(V)} L`,
      ],
    };
  }

  const which = randInt(rnd, 0, 1);
  if (which === 0) {
    const C = randInt(rnd, 1, 10) / 10_000;
    const ph = -Math.log10(C);
    return {
      id, type, tipo: "pH de ácido fuerte",
      statement: `Una disolución de ácido fuerte tiene [H⁺] = ${C.toExponential()} mol/L. ¿Cuál es su pH? (log₁₀ 0.001 = −3)`,
      explain: "pH = −log₁₀[H⁺]",
      fields: [{ key: "v", label: "pH", unit: "" }],
      answers: [ph],
      steps: [`pH = −log₁₀(${C.toExponential()})`, `pH = ${fmt(ph, 3)}`],
    };
  }
  const C = Math.pow(10, -randInt(rnd, 3, 12) / 2);
  const ph = -Math.log10(C);
  const poh = 14 - ph;
  return {
    id, type, tipo: "pH → pOH",
    statement: `Una disolución tiene pH = ${fmt(ph, 3)}. ¿Cuál es su pOH? (a 25 °C, pH + pOH = 14)`,
    explain: "pOH = 14 − pH",
    fields: [{ key: "v", label: "pOH", unit: "" }],
    answers: [poh],
    steps: [`pOH = 14 − ${fmt(ph, 3)}`, `pOH = ${fmt(poh, 3)}`],
  };
}

function fmt(n: number, d = 4): string {
  if (!Number.isFinite(n)) return "—";
  return Number(n.toPrecision(d)).toString();
}
function fmtNice(n: number): string {
  return Number(n.toPrecision(6)).toString();
}

const TIPO_LABEL: Record<ProblemType, string> = {
  moles: "⚖️ Estequiometría",
  molaridad: "🧪 Soluciones",
  dilucion: "💧 Dilución",
  gas: "🎈 Gases",
  ph: "📊 Ácidos y pH",
};

const TYPE_COLOR: Record<ProblemType, string> = {
  moles: "#5ce8c0",
  molaridad: "#5cb8ff",
  dilucion: "#8ea2ff",
  gas: "#f59e42",
  ph: "#c89bff",
};

const parseNum = (s: string) => {
  const clean = s.replace(/,/g, ".").replace(/\s+/g, "");
  const v = parseFloat(clean);
  return Number.isFinite(v) ? v : null;
};

const approx = (a: number, b: number) => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (a === 0) return Math.abs(b) < 1e-6;
  return Math.abs(a - b) <= Math.abs(a) * 0.01 + 0.01;
};

/* ------------------------------------------------------------------ */
/*  Página                                                             */
/* ------------------------------------------------------------------ */
export default function Practice() {
  const sessionSeed = useRef(Math.floor(Math.random() * 1e9));
  const [prob, setProb] = useState<Problem>(() => generate(sessionSeed.current, Math.floor(Math.random() * 1000)));
  const [vals, setVals] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "ok" | "bad">("idle");
  const [showSol, setShowSol] = useState(false);
  const [score, setScore] = useState({ ok: 0, bad: 0, racha: 0, best: 0, total: 0 });

  const next = () => {
    setProb((p) => generate(sessionSeed.current, p.id + 1));
    setVals({});
    setState("idle");
    setShowSol(false);
  };

  const check = () => {
    const answers = prob.fields.map((f) => parseNum(vals[f.key] ?? ""));
    const allOk = answers.every((a, i) => a !== null && approx(a, prob.answers[i]));
    setState(allOk ? "ok" : "bad");
    const racha = allOk ? score.racha + 1 : 0;
    setScore((s) => ({ ...s, racha, best: Math.max(s.best, racha), ok: s.ok + (allOk ? 1 : 0), bad: s.bad + (allOk ? 0 : 1), total: s.total + 1 }));
    api("/academic/progress", {
      method: "POST",
      authed: true,
      body: { topic: "practica", activity_type: "problema", score: allOk ? 1 : 0, detail: prob.type },
    }).catch(() => {});
  };

  const canCheck = prob.fields.every((f) => (vals[f.key] ?? "").trim() !== "");

  const nivel = useMemo(() => {
    const acc = score.total ? Math.round((score.ok * 100) / score.total) : 0;
    return acc >= 80 ? "var(--ok)" : acc >= 50 ? "var(--warn)" : "var(--danger)";
  }, [score]);

  return (
    <section className="page" style={{ maxWidth: 720 }}>
      <h1>Práctica de problemas</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Problemas generados con solución paso a paso. Los valores se regeneran al avanzar; el enunciado nunca cambia a mitad de intento.
        <Link to="/aprender" className="link" style={{ marginLeft: 8 }}>↪ Repasa la teoría</Link>
      </p>

      <div className="grid-4" style={{ margin: "14px 0" }}>
        <div className="stat"><span>Acertados</span><b className="ok-chip">{score.ok}</b></div>
        <div className="stat"><span>Fallos</span><b className="bad-chip">{score.bad}</b></div>
        <div className="stat"><span>Racha</span><b>{score.racha} {score.racha === 1 ? "🔥" : score.racha > 1 ? "🔥" : ""}</b></div>
        <div className="stat"><span>Precisión</span><b style={{ color: nivel }}>{score.total ? Math.round((score.ok * 100) / score.total) : 0}%</b></div>
      </div>

      <div className="card">
        <div className="filters" style={{ gap: 8 }}>
          <span className="chip" style={{ borderColor: TYPE_COLOR[prob.type], color: TYPE_COLOR[prob.type] }}>{TIPO_LABEL[prob.type]}</span>
          <span className="chip" style={{ borderColor: "transparent", cursor: "default" }}>{prob.tipo}</span>
        </div>
        <p className="lead" style={{ margin: "14px 0" }}>{prob.statement}</p>

        <div className="calc-row" style={{ marginBottom: 12 }}>
          {prob.fields.map((f) => (
            <label key={f.key}>
              {f.label} {f.unit ? `(${f.unit})` : ""}
              <input
                type="number"
                step="any"
                value={vals[f.key] ?? ""}
                onChange={(e) => { setVals((v) => ({ ...v, [f.key]: e.target.value })); setState("idle"); }}
                placeholder="Escribe el resultado"
                aria-label={f.label}
              />
            </label>
          ))}
        </div>

        <div className="qform" style={{ flexWrap: "wrap", gap: 8 }}>
          <button className="primary" onClick={check} disabled={!canCheck || state === "ok"}>Comprobar</button>
          {!showSol && state === "bad" && <button className="ghost" onClick={() => setShowSol(true)}>Ver solución</button>}
          <button className="tiny" onClick={next}>Próximo problema →</button>
        </div>

        {showSol && (
          <div className="qres bad" style={{ marginTop: 14 }}>
            <b>La solución esperada era:</b>
            <ol className="qdet" style={{ marginTop: 8 }}>
              {prob.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        )}

        {state === "ok" && (
          <div className="qres ok" style={{ marginTop: 14 }}>
            <b>¡Correcto! 🎉</b> {prob.explain}
          </div>
        )}
        {state === "bad" && !showSol && (
          <div className="qres bad" style={{ marginTop: 14 }}>
            <b>No coincide.</b> Revisa unidades y de nuevo; usa «Ver solución» si lo necesitas.
          </div>
        )}
      </div>
    </section>
  );
}