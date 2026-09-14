import { useState } from "react";
import { Link } from "react-router-dom";

/* ── Datos curados ───────────────────────────────────────────── */
interface Entry {
  id: string;
  nombre: string;        // nombre común / tradicional
  iupac: string;         // nombre IUPAC / stock
  formula: string;       // fórmula con subíndices unicode
  formulaF: string;      // fórmula sin formato (para comparar)
  aceptados: string[];   // variantes válidas
  uso: string;
}

const DATA: Entry[] = [
  {
    id: "nacl", nombre: "Sal común", iupac: "Cloruro de sodio", formula: "NaCl", formulaF: "NaCl",
    aceptados: ["nacl", "cloruro de sodio", "sal", "sal de mesa", "sal cocinera"],
    uso: "Conservante, condimento, electrólisis industrial",
  },
  {
    id: "h2o", nombre: "Agua", iupac: "Óxido de dihidrógeno", formula: "H₂O", formulaF: "H2O",
    aceptados: ["h2o", "agua", "oxido de hidrogeno", "óxido de hidrógeno", "agua destilada"],
    uso: "Solvente universal, disolvente biológico, refrigerante",
  },
  {
    id: "co2", nombre: "Dióxido de carbono", iupac: "Dióxido de carbono", formula: "CO₂", formulaF: "CO2",
    aceptados: ["co2", "dioxido de carbono", "dióxido de carbono", "anhídrido carbónico", "anhydrido carbonico"],
    uso: "Fotosíntesis, refrescos, extintores, industria alimentaria",
  },
  {
    id: "hcl", nombre: "Ácido clorhídrico", iupac: "Ácido clorhídrico", formula: "HCl", formulaF: "HCl",
    aceptados: ["hcl", "acido clorhidrico", "ácido clorhídrico", "cloruro de hidrógeno"],
    uso: "Síntesis química, limpieza de metales, digestión gástrica",
  },
  {
    id: "naoh", nombre: "Soda cáustica", iupac: "Hidróxido de sodio", formula: "NaOH", formulaF: "NaOH",
    aceptados: ["naoh", "hidroxido de sodio", "hidróxido de sodio", "soda", "soda caustica", "soda cáustica", "lejía de soda"],
    uso: "Jabón, papel, tratamiento de aguas, sosa cáustica",
  },
  {
    id: "h2so4", nombre: "Ácido sulfúrico", iupac: "Ácido sulfúrico", formula: "H₂SO₄", formulaF: "H2SO4",
    aceptados: ["h2so4", "acido sulfurico", "ácido sulfúrico", "aceite de vitriolo", "vitriolo de azufre"],
    uso: "Baterías, fertilizantes, refinería de petróleo",
  },
  {
    id: "caco3", nombre: "Caliza", iupac: "Carbonato de calcio", formula: "CaCO₃", formulaF: "CaCO3",
    aceptados: ["caco3", "carbonato de calcio", "caliza", "cal", "tiza", "mármol"],
    uso: "Construcción, antiácidos, fabricación de cemento",
  },
  {
    id: "fe2o3", nombre: "Óxido férrico", iupac: "Óxido de hierro(III)", formula: "Fe₂O₃", formulaF: "Fe2O3",
    aceptados: ["fe2o3", "oxido de hierro", "óxido de hierro", "oxido ferrico", "óxido férrico", "herrumbre", "herrumbe"],
    uso: "Pigmento rojo (óxido), pinturas anticorrosivas",
  },
  {
    id: "nh3", nombre: "Amoniaco", iupac: "Amoníaco", formula: "NH₃", formulaF: "NH3",
    aceptados: ["nh3", "amoniaco", "amoniaco gas", "amonio hidrógeno"],
    uso: "Fertilizantes, refrigeración, limpieza doméstica",
  },
  {
    id: "cuo", nombre: "Óxido cúprico", iupac: "Óxido de cobre(II)", formula: "CuO", formulaF: "CuO",
    aceptados: ["cuo", "oxido de cobre", "óxido de cobre", "óxido cúprico", "oxido cuprico", "péndulo de los sacerdotes"],
    uso: "Cerámica, pigmento azul, catalizador",
  },
  {
    id: "mgoh2", nombre: "Leche de magnesia", iupac: "Hidróxido de magnesio", formula: "Mg(OH)₂", formulaF: "Mg(OH)2",
    aceptados: ["mg(oh)2", "mgoh2", "hidroxido de magnesio", "hidróxido de magnesio", "leche de magnesia", "hidróxido magnésico"],
    uso: "Antiácido, laxante, tratamiento de aguas",
  },
  {
    id: "na2co3", nombre: "Soda", iupac: "Carbonato de sodio", formula: "Na₂CO₃", formulaF: "Na2CO3",
    aceptados: ["na2co3", "carbonato de sodio", "soda ash", "soda lavavajillas", "soda", "ceniza de soda", "sal de soda"],
    uso: "Vidrio, jabón, tratamiento de aguas",
  },
  {
    id: "ch4", nombre: "Gas natural", iupac: "Metano", formula: "CH₄", formulaF: "CH4",
    aceptados: ["ch4", "metano", "gas natural"],
    uso: "Combustible, calefacción, generación eléctrica",
  },
  {
    id: "cuso4", nombre: "Sulfato de cobre", iupac: "Sulfato de cobre(II)", formula: "CuSO₄", formulaF: "CuSO4",
    aceptados: ["cuso4", "sulfato de cobre", "sulfato cuprico", "azul de vitriolo", "vitriolo azul"],
    uso: "Fungicida agrícola, electrólisis, pigmentos",
  },
  {
    id: "koh", nombre: "Potasa cáustica", iupac: "Hidróxido de potasio", formula: "KOH", formulaF: "KOH",
    aceptados: ["koh", "hidroxido de potasio", "hidróxido de potasio", "potasa", "potasa caustica", "potasa cáustica"],
    uso: "Jabones líquidos, baterías alcalinas, síntesis química",
  },
  {
    id: "mgo", nombre: "Magnesia", iupac: "Óxido de magnesio", formula: "MgO", formulaF: "MgO",
    aceptados: ["mgo", "oxido de magnesio", "óxido de magnesio", "magnesia", "magnesia calcinada", "óxido magnésico"],
    uso: "Refractarios, aislante térmico, antiácido",
  },
];

/* ── Normalización ────────────────────────────────────────────── */
const norm = (s: string) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[·\-–—]/g, " ")
    .replace(/[\s,._'']+/g, "")
    .replace(/₂/g, "2").replace(/₃/g, "3").replace(/₄/g, "4").replace(/₅/g, "5")
    .replace(/₁/g, "1").replace(/₆/g, "6").replace(/₇/g, "7").replace(/₈/g, "8")
    .replace(/\(oh\)2/g, "(oh)2")
    .trim();

const match = (input: string, entry: Entry) => {
  const v = norm(input);
  if (v === norm(entry.formulaF)) return true;
  if (v === norm(entry.nombre)) return true;
  return entry.aceptados.some((a) => norm(a) === v);
};

/* ── Componente ───────────────────────────────────────────────── */
export default function NombraloInorg() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"name2formula" | "formula2name">("name2formula");
  const [tmp, setTmp] = useState("");
  const [status, setStatus] = useState<"guess" | "solved">("guess");
  const [win, setWin] = useState(false);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState({ ok: 0, no: 0, racha: 0, mejor: 0 });

  const entry = DATA[idx];

  const enviar = () => {
    if (!tmp.trim() || status === "solved") return;
    if (match(tmp, entry)) {
      setStatus("solved"); setWin(true);
      setScore((s) => ({ ...s, ok: s.ok + 1, racha: s.racha + 1, mejor: Math.max(s.mejor, s.racha + 1) }));
    } else {
      setHint(true);
      setScore((s) => ({ ...s, no: s.no + 1, racha: 0 }));
    }
  };

  const verResp = () => { setStatus("solved"); setWin(false); setScore((s) => ({ ...s, no: s.no + 1, racha: 0 })); };
  const reset = () => { setStatus("guess"); setWin(false); setTmp(""); setHint(false); };
  const next = () => { setIdx((idx + 1) % DATA.length); reset(); };
  const reiniciar = () => { setIdx(0); reset(); setScore({ ok: 0, no: 0, racha: 0, mejor: 0 }); };

  const prompt = mode === "name2formula"
    ? { show: entry.nombre, ask: "Escribe la fórmula química", placeholder: "Ej. H2O, NaCl, H2SO4…", sub: entry.formula }
    : { show: entry.formula, ask: "Escribe el nombre del compuesto", placeholder: "Ej. cloruro de sodio, ácido sulfúrico…", sub: entry.nombre };

  return (
    <section className="page" style={{ maxWidth: 640 }}>
      <div className="filters" style={{ marginBottom: 6 }}>
        <Link className="chip" to="/catalogo/inorganico" style={{ textDecoration: "none" }}>🧂 Catálogo inorgánico</Link>
      </div>

      <h1>Nómbralo: compuestos inorgánicos</h1>
      <p className="lead">
        {mode === "name2formula"
          ? "Dado el nombre del compuesto, escribe su fórmula química. Acepta notación normal (H2O) o unicode (H₂O)."
          : "Dada la fórmula química, escribe su nombre (común, tradicional o IUPAC)."
        } Compuestos reales y estables, nada inventado.
      </p>

      <div className="filters" style={{ margin: "10px 0 0", gap: 8 }}>
        <button className={`chip ${mode === "name2formula" ? "on" : ""}`} onClick={() => { setMode("name2formula"); reset(); }}>
          Nombre → Fórmula
        </button>
        <button className={`chip ${mode === "formula2name" ? "on" : ""}`} onClick={() => { setMode("formula2name"); reset(); }}>
          Fórmula → Nombre
        </button>
        <span className="chip" style={{ borderColor: "transparent", cursor: "default" }}>{idx + 1} / {DATA.length}</span>
      </div>

      <div className="qcard" style={{ marginTop: 12 }}>
        <div className="qstats">
          <span className="chip okchip">✅ {score.ok}</span>
          <span className="chip badchip">❌ {score.no}</span>
          <span className="chip racha">🔥 {score.racha} · mejor {score.mejor}</span>
          <button className="tiny" onClick={reiniciar}>Reiniciar</button>
        </div>

        <div style={{ margin: "16px 0 8px", textAlign: "center" }}>
          <span className="faint small">{prompt.ask}</span>
          <div className="mono" style={{ fontSize: 26, marginTop: 6, color: "var(--accent)", letterSpacing: 1 }}>
            {mode === "formula2name" ? prompt.show : prompt.show}
          </div>
          {mode === "name2formula" && (
            <span className="faint small" style={{ marginTop: 4, display: "block" }}>
              Nombre IUPAC: <b>{entry.iupac}</b>
            </span>
          )}
        </div>

        {status === "guess" ? (
          <div className="qform" style={{ justifyContent: "center" }}>
            <input
              className="search"
              style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
              placeholder={prompt.placeholder}
              value={tmp}
              onChange={(e) => { setTmp(e.target.value); setHint(false); }}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              aria-label="Tu respuesta"
            />
            <button className="primary" onClick={enviar} disabled={!tmp.trim()}>Comprobar</button>
            {hint && <button className="ghost" onClick={verResp}>Ver respuesta</button>}
          </div>
        ) : (
          <div className={win ? "qres ok" : "qres bad"} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <b>{win ? "¡Correcto! 🎉" : "La respuesta era:"}</b>
              <span className="mono">{entry.nombre}</span>
              <span className="faint small">· {entry.formula}</span>
            </div>
            <div className="fact" style={{ marginTop: 10 }}>
              <div><span className="hint-col">Nombre IUPAC</span><span className="small">{entry.iupac}</span></div>
              <div><span className="hint-col">Fórmula</span><span className="mono small">{entry.formula}</span></div>
              <div><span className="hint-col">Uso / aplicaciones</span><span className="small">{entry.uso}</span></div>
            </div>
            <button className="primary" style={{ marginTop: 14 }} onClick={next}>Siguiente →</button>
          </div>
        )}

        {status === "guess" && hint && (
          <div className="qres bad" style={{ marginTop: 10, textAlign: "center" }}>
            <span className="faint small">Pista: tiene {entry.formula.length} caracteres. La fórmula contiene {
              [...new Set(entry.formulaF.replace(/[()]/g, "").split(""))].join(", ")
            }.</span>
          </div>
        )}
      </div>
    </section>
  );
}