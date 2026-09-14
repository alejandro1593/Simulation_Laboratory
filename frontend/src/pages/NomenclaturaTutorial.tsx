import { useState } from "react";
import MoleculeSVG from "../components/MoleculeSVG";
import SkeletalFormula from "../components/SkeletalFormula";
import { GRUPOS_FUNCIONALES, PRIORIDADES_GRUPOS, SERIES_HOMOLOGAS, type Ejemplo, type GrupoFuncional } from "../data/organic";

const PREFIJOS = ["", "met", "et", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];

const PASOS = [
  {
    t: "1. Busca la cadena principal",
    d: "Cadena continua de carbonos más larga que incluya el grupo funcional de mayor prioridad.",
  },
  {
    t: "2. Numera",
    d: "Desde el extremo que dé los localizadores (números) más bajos al grupo funcional principal y luego a los sustituyentes.",
  },
  {
    t: "3. Nombra los sustituyentes",
    d: "Cada sustituyente lleva un prefijo (metilo-, cloro-, nitro-…) y su localizador; ordénalos alfabéticamente.",
  },
  {
    t: "4. Aplica el sufijo del grupo principal",
    d: "El grupo de mayor prioridad define el sufijo (–ano, –eno, –ol, –al, –ona, –oico, –amina…); los demás grupos van como prefijos.",
  },
  {
    t: "5. Une todo",
    d: "Prefijos con localizadores (comas separan números; guiones separan números y letras) + raíz + sufijo. Ejemplo real: «3-metilbut-1-eno»",
  },
];

const DETALLES_FALLBACK = [
  "Busca la cadena principal",
  "Numera desde el extremo más cercano al grupo",
  "Aplica el sufijo del grupo principal",
];

type PoolItem = { gr: GrupoFuncional; e: Ejemplo };
const GF_POOL: PoolItem[] = GRUPOS_FUNCIONALES.flatMap((gr) => gr.ejemplos.map((e) => ({ gr, e })));

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[·\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function NomenclaturaTutorial() {
  const [sel, setSel] = useState(GRUPOS_FUNCIONALES[0].id);
  const [ex, setEx] = useState(0);
  const [skel, setSkel] = useState(true);
  const g = GRUPOS_FUNCIONALES.find((x) => x.id === sel) ?? GRUPOS_FUNCIONALES[0];
  const e = g.ejemplos[ex] ?? g.ejemplos[0];
  const detalles = e.detalles ?? DETALLES_FALLBACK;

  const [pool] = useState<PoolItem[]>(() => shuffle(GF_POOL));
  const [qqi, setQqi] = useState(0);
  const [tmp, setTmp] = useState("");
  const [status, setStatus] = useState<"type" | "solved">("type");
  const [win, setWin] = useState(false);
  const [err, setErr] = useState(false);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState({ aciertos: 0, fallos: 0, racha: 0, mejor: 0 });

  const q = pool[Math.min(qqi, pool.length - 1)];
  const quedan = pool.length - qqi;
  const fin = status === "solved" && quedan <= 1;

  const enviar = () => {
    const v = norm(tmp);
    if (!v || status === "solved") return;
    const hit = v === norm(q.e.iupac) || v === norm(q.e.nombre);
    if (hit) {
      setStatus("solved");
      setWin(true);
      setScore((s) => ({ ...s, aciertos: s.aciertos + 1, racha: s.racha + 1, mejor: Math.max(s.mejor, s.racha + 1) }));
    } else {
      setErr(true);
      setScore((s) => ({ ...s, racha: 0 }));
      setHint(true);
    }
  };

  const verRespuesta = () => {
    if (status === "solved") return;
    setStatus("solved");
    setWin(false);
    setScore((s) => ({ ...s, fallos: s.fallos + 1, racha: 0 }));
  };

  const siguiente = () => {
    setQqi(qqi + 1);
    setTmp("");
    setStatus("type");
    setWin(false);
    setErr(false);
    setHint(false);
  };

  const reiniciar = () => {
    setQqi(0);
    setTmp("");
    setStatus("type");
    setWin(false);
    setErr(false);
    setHint(false);
    setScore({ aciertos: 0, fallos: 0, racha: 0, mejor: 0 });
  };

  return (
    <div className="page">
      <h1>¿Cómo nombrar un compuesto orgánico?</h1>
      <p className="lead">
        La nomenclatura IUPAC convierte la estructura de una molécula en un nombre único:
        raíces para la cadena, localizadores para las posiciones y sufijos/prefijos para los
        grupos funcionales. Aquí lo desmontamos paso a paso con ejemplos interactivos.
      </p>

      <hr className="hair-sep" />
      <h2>El método en 5 pasos</h2>
      <div className="grid-3">
        {PASOS.map((p) => (
          <div className="card" key={p.t}>
            <h3 style={{ fontSize: 13 }}>{p.t}</h3>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{p.d}</p>
          </div>
        ))}
      </div>

      <hr className="hair-sep" />
      <h2>Prefijos según el número de carbonos</h2>
      <p className="lead" style={{ marginBottom: 14 }}>
        La raíz del nombre indica cuántos carbonos tiene la cadena principal (met- = 1, et- = 2,
        prop- = 3, but- = 4…).
      </p>
      <div className="cat-table-wrap" style={{ maxWidth: 820 }}>
        <table className="table">
          <thead>
            <tr>
              <th>#C</th>
              <th>Prefijo</th>
              <th>Serie (nombre)</th>
              <th>Fórmula</th>
              <th>Encontramos (uso)</th>
            </tr>
          </thead>
          <tbody>
            {SERIES_HOMOLOGAS[0].filas.map((f) => (
              <tr key={f[0] as number}>
                <td className="mono">{f[0]}</td>
                <td className="mono">{PREFIJOS[f[0] as number]}</td>
                <td>{f[1]}</td>
                <td className="mono">{f[2]}</td>
                <td className="small muted">{f[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="hair-sep" />
      <h2>Prioridad de los grupos funcionales</h2>
      <p className="lead" style={{ marginBottom: 14 }}>
        Cuando hay varias funciones en la molécula, este orden decide cuál manda en el nombre.
      </p>
      <div className="notice" style={{ marginBottom: 14 }}>
        El grupo de mayor prioridad manda en el sufijo: los demás grupos se nombran como prefijos.
      </div>
      <div className="cat-table-wrap" style={{ maxWidth: 560 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Prioridad</th>
              <th>Grupo</th>
            </tr>
          </thead>
          <tbody>
            {PRIORIDADES_GRUPOS.map((p) => {
              const [n, ...rest] = p.split(". ");
              return (
                <tr key={p}>
                  <td className="mono" style={{ fontSize: 13 }}>{n}</td>
                  <td>{rest.join(". ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <hr className="hair-sep" />
      <h2>Sufijos y prefijos de cada grupo</h2>
      <p className="lead" style={{ marginBottom: 14 }}>
        Cada grupo funcional aporta un sufijo (si es el grupo principal) y un prefijo (si va como
        sustituyente).
      </p>
      <div className="cat-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Grupo funcional</th>
              <th>Fórmula general</th>
              <th>Grupo</th>
              <th>Sufijo</th>
              <th>Prefijo</th>
            </tr>
          </thead>
          <tbody>
            {GRUPOS_FUNCIONALES.map((gr) => (
              <tr key={gr.id}>
                <td>{gr.nombre}</td>
                <td className="mono">{gr.formula}</td>
                <td className="small muted">{gr.grupo}</td>
                <td className="mono small">{gr.sufijo}</td>
                <td className="mono small">{gr.prefijo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="hair-sep" />
      <h2>Paso a paso con ejemplos</h2>
      <p className="lead" style={{ marginBottom: 14 }}>
        Elige un grupo funcional y sigue la construcción real del nombre de cada ejemplo.
        Alterna entre la fórmula esqueletal (nítida y sin H sobre C) y la vista con átomos explícitos.
      </p>

      <div className="filters">
        <select value={sel} onChange={(ev) => { setSel(ev.target.value); setEx(0); }}>
          {GRUPOS_FUNCIONALES.map((gr) => (
            <option key={gr.id} value={gr.id}>{gr.nombre}</option>
          ))}
        </select>
      </div>

      <h3 style={{ marginBottom: 6 }}>
        {g.nombre} <span className="gf-tag">{g.formula}</span>
      </h3>
      <p className="notice" style={{ marginBottom: 12 }}>{g.reglas}</p>

      {g.ejemplos.length > 1 && (
        <div className="filters" style={{ marginTop: 0 }}>
          {g.ejemplos.map((ej, i) => (
            <button
              key={ej.nombre}
              className={i === ex ? "chip on" : "chip"}
              onClick={() => setEx(i)}
              style={{ cursor: "pointer" }}
            >
              {ej.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ margin: 0 }}>{e.nombre}</h3>
          <div className="filters" style={{ margin: 0 }}>
            <button
              className={skel ? "chip on" : "chip"}
              onClick={() => setSkel(true)}
              style={{ cursor: "pointer" }}
            >
              ⚛️ Fórmula esqueletal
            </button>
            <button
              className={!skel ? "chip on" : "chip"}
              onClick={() => setSkel(false)}
              style={{ cursor: "pointer" }}
            >
              🧪 Con átomos
            </button>
          </div>
        </div>
        <p className="equation">{e.iupac}</p>
        <p className="muted" style={{ margin: "8px 0 0" }}>Común: {e.comun}</p>
        <div className="molbox molbox--big" style={{ margin: "14px 0 10px" }}>
          {skel ? (
            <SkeletalFormula mol={e.mol} width={400} height={210} />
          ) : (
            <MoleculeSVG mol={e.mol} width={400} height={210} />
          )}
        </div>
        <p className="captions" style={{ margin: 0 }}>
          En esqueletal, cada vértice y extremo de línea es un carbono (sus hidrógenos se omiten) y el
          grupo funcional se resalta en <b>verde menta</b>.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <span className="chip">Sufijo: {g.sufijo}</span>
          <span className="chip">Prefijo: {g.prefijo}</span>
        </div>

        <h3 style={{ marginTop: 18, marginBottom: 8 }}>Cómo se construye este nombre</h3>
        <ol
          style={{
            margin: "0 0 0 18px",
            padding: "12px 16px 12px 34px",
            border: "1px solid var(--hair-soft)",
            borderRadius: 10,
            display: "grid",
            gap: 8,
          }}
        >
          {detalles.map((d, i) => (
            <li key={i} className="small">{d}</li>
          ))}
        </ol>
      </div>

      <hr className="hair-sep" />
      <h2>🧠 Ponte a prueba: nombra el compuesto</h2>
      <p className="lead" style={{ marginBottom: 12 }}>
        Mira la fórmula esqueletal, escribe el nombre IUPAC del compuesto y compruébalo.
        Hay {pool.length} moléculas distintas entre todos los grupos funcionales. El grupo funcional
        se resalta en verde menta. No se descuentan intentos: solo cuenta si revelas la respuesta.
      </p>

      <div className="qcard">
        <div className="qstats">
          <span className="chip">Pregunta {qqi + 1} / {pool.length}</span>
          <span className="chip okchip">✅ {score.aciertos}</span>
          <span className="chip badchip">❌ {score.fallos}</span>
          <span className="chip racha">🔥 Racha: {score.racha} · mejor {score.mejor}</span>
          {score.aciertos + score.fallos > 0 && (
            <span className="chip">
              Acierto: {Math.round((score.aciertos / (score.aciertos + score.fallos)) * 100)}%
            </span>
          )}
          <span className="skip" />
          <button className="tiny" onClick={reiniciar}>Reiniciar</button>
        </div>

        <div className="qbar">
          <div
            className="qbar-fill"
            style={{ width: `${(((qqi + (status === "solved" ? 1 : 0)) / pool.length) * 100).toFixed(1)}%` }}
          />
        </div>

        <div className="molbox molbox--big" style={{ margin: "14px 0 8px" }}>
          <SkeletalFormula mol={q.e.mol} width={430} height={215} />
        </div>
        <p className="captions" style={{ margin: 0, textAlign: "center" }}>
          {hint ? (
            <>
              Familia: <b>{q.gr.nombre}</b> · sufijo <b>{q.gr.sufijo}</b> · prefijo <b>{q.gr.prefijo}</b>
            </>
          ) : (
            <>¿Cuál es el nombre IUPAC de esta molécula?</>
          )}
        </p>

        {status === "type" ? (
          <div className="qform">
            <input
              className="search"
              style={{ flex: 1, minWidth: 220 }}
              placeholder="Escribe el nombre IUPAC…"
              value={tmp}
              onChange={(ev) => { setTmp(ev.target.value); setErr(false); }}
              onKeyDown={(ev) => ev.key === "Enter" && enviar()}
              aria-label="Nombre IUPAC del compuesto"
            />
            <button className="primary" onClick={enviar} disabled={!tmp.trim()}>Comprobar</button>
            {!hint && (
              <button className="ghost" onClick={() => setHint(true)}>💡 Pista</button>
            )}
            {err && (
              <button className="ghost" onClick={verRespuesta}>Ver respuesta</button>
            )}
          </div>
        ) : (
          <div className={win ? "qres ok" : "qres bad"}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <b>{win ? "¡Correcto! 🎉" : "La respuesta era:"}</b>
              <span className="mono">{q.e.iupac}</span>
              <span className="faint small">· común: {q.e.comun}</span>
            </div>
            <ol className="qdet" style={{ margin: "10px 0 0 18px", padding: 0 }}>
              {(q.e.detalles ?? DETALLES_FALLBACK).map((d, i) => (
                <li key={i} className="small">{d}</li>
              ))}
            </ol>
            <div style={{ marginTop: 12 }}>
              {fin ? (
                <button className="primary" onClick={reiniciar}>🔁 Volver a empezar</button>
              ) : (
                <button className="primary" onClick={siguiente}>Siguiente →</button>
              )}
            </div>
          </div>
        )}
      </div>

      <hr className="hair-sep" />
      <h2>Familias homólogas</h2>
      <p className="lead" style={{ marginBottom: 16 }}>
        Series que comparten grupo funcional y fórmula general: solo cambia la longitud de la
        cadena en unidades de –CH₂–.
      </p>
      <div className="grid-3">
        {SERIES_HOMOLOGAS.map((ser) => (
          <div className="card" key={ser.nombre}>
            <h3 className="mono" style={{ fontSize: 13 }}>{ser.nombre}</h3>
            <div className="cat-table-wrap" style={{ marginTop: 8 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fórmula</th>
                    <th>Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {ser.filas.map((f) => (
                    <tr key={f[0] as number}>
                      <td>{f[1]}</td>
                      <td className="mono">{f[2]}</td>
                      <td className="small muted">{f[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <p className="captions" style={{ marginTop: 22 }}>
        Tablas de referencia: la prioridad de grupos funcionales se usa también para nombrar
        compuestos con varias funciones.
      </p>
    </div>
  );
}