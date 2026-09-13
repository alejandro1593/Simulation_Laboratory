import { useMemo, useState } from "react";
import { RETOS_BALANCEO, RETOS_ESTEQ, RETOS_NOMEN } from "../data/herramientas";

type Modo = "balanceo" | "esteq" | "nomen";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Retos() {
  const [modo, setModo] = useState<Modo>("balanceo");
  const [bIdx, setBIdx] = useState(0);
  const [coefs, setCoefs] = useState<string[]>([]);
  const [bRes, setBRes] = useState<null | boolean>(null);

  const [eIdx, setEIdx] = useState(0);
  const [eVal, setEVal] = useState("");
  const [eRes, setERes] = useState<null | "ok" | "mal">(null);

  const [nIdx, setNIdx] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [nRes, setNRes] = useState<null | "ok" | "mal">(null);

  const [score, setScore] = useState({ b: [0, 0], e: [0, 0], n: [0, 0] });

  const b = RETOS_BALANCEO[bIdx % RETOS_BALANCEO.length];
  const e = RETOS_ESTEQ[eIdx % RETOS_ESTEQ.length];
  const n = RETOS_NOMEN[nIdx % RETOS_NOMEN.length];
  const opts = useMemo(() => shuffle(RETOS_NOMEN[nIdx % RETOS_NOMEN.length].opts), [nIdx]);

  function startB(bi: number) {
    setBIdx(bi);
    setCoefs(() => Array.from({ length: RETOS_BALANCEO[bi % RETOS_BALANCEO.length].coefs.length }, () => ""));
    setBRes(null);
  }

  function checkB() {
    const vals = coefs.map((c) => parseInt(c, 10));
    const ok = vals.length === b.coefs.length && vals.every((c, i) => c === b.coefs[i]);
    setBRes(ok);
    setScore((s) => ({ ...s, b: [s.b[0], s.b[1] + 1] }));
    if (ok) setScore((s) => ({ ...s, b: [s.b[0] + 1, s.b[1]] }));
  }

  const ansE = ((e.datoGramos / e.M[0]) * (e.rel[1] / e.rel[0])) * e.M[1];

  function checkE() {
    const v = parseFloat(eVal);
    const rel = Math.abs(v - ansE) / ansE;
    const ok = Number.isFinite(v) && rel <= 0.03;
    setERes(ok ? "ok" : "mal");
    setScore((s) => ({ ...s, e: [s.e[0] + (ok ? 1 : 0), s.e[1] + 1] }));
  }

  function checkN(c: string) {
    setChoice(c);
    const ok = c === n.a;
    setNRes(ok ? "ok" : "mal");
    setScore((s) => ({ ...s, n: [s.n[0] + (ok ? 1 : 0), s.n[1] + 1] }));
  }

  function nextN() {
    setNIdx((x) => x + 1);
    setChoice(null);
    setNRes(null);
  }

  return (
    <section className="page">
      <h1>Retos autocorregibles</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Practica balanceo, estequiometría y nomenclatura. Se evalúa al instante y lleva tu marcador de la sesión.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
        {([["balanceo", "Balanceo"], ["esteq", "Estequiometría"], ["nomen", "Nomenclatura"]] as [Modo, string][]).map(([k, lbl]) => (
          <button key={k} className={modo === k ? "primary" : "ghost"} onClick={() => setModo(k)}>{lbl}</button>
        ))}
      </div>

      {modo === "balanceo" && (
        <div className="card" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ marginBottom: 0 }}>Balancea la ecuación</h2>
            <span className="tag amber">Aciertos {score.b[0]}/{score.b[1]}</span>
          </div>
          <div className="muted" style={{ fontFamily: "var(--mono)", margin: "10px 0", fontSize: 16 }}>{b.eq}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0" }}>
            {b.partes.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  value={coefs[i] ?? ""}
                  onChange={(ev) => {
                    const nx = [...coefs];
                    nx[i] = ev.target.value.replace(/\D/g, "");
                    setCoefs(nx);
                    setBRes(null);
                  }}
                  placeholder={String(i + 1)}
                  inputMode="numeric"
                  aria-label={`Coeficiente ${p}`}
                  style={{ width: 56, textAlign: "center" }}
                />
                <span style={{ fontFamily: "var(--mono)" }}>{p}</span>
                {i < b.partes.length - 1 && <span className="muted">+</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="primary" onClick={checkB} disabled={coefs.some((c) => !c)}>Comprobar</button>
            <button className="ghost" onClick={() => startB((bIdx + 1) % RETOS_BALANCEO.length)}>Nuevo reto</button>
          </div>
          {bRes === true && <div className="ok" style={{ marginTop: 10 }}>Ecuación balanceada correctamente.</div>}
          {bRes === false && <div className="error" style={{ marginTop: 10 }}>No es correcto: verifica que haya el mismo número de cada elemento a ambos lados y usa coeficientes enteros mínimos.</div>}
        </div>
      )}

      {modo === "esteq" && (
        <div className="card" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ marginBottom: 0 }}>Calcula cuánto producto se obtiene</h2>
            <span className="tag amber">Aciertos {score.e[0]}/{score.e[1]}</span>
          </div>
          <div className="muted" style={{ margin: "10px 0" }}>{e.q}</div>
          <div className="muted" style={{ fontFamily: "var(--mono)", fontSize: 15, marginBottom: 10 }}>{e.ecuacion}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <label className="field">
              Respuesta (gramos)
              <input value={eVal} onChange={(ev) => { setEVal(ev.target.value); setERes(null); }} inputMode="decimal" placeholder="Ej: 0.20" />
            </label>
            <button className="primary" onClick={checkE} disabled={!eVal}>Comprobar</button>
            <button className="ghost" onClick={() => { setEIdx((x) => x + 1); setEVal(""); setERes(null); }}>Nuevo reto</button>
          </div>
          {eRes === "ok" && <div className="ok" style={{ marginTop: 10 }}>¡Correcto! m(producto) = {ansE.toFixed(e.fmt)} g.</div>}
          {eRes === "mal" && (
            <div className="error" style={{ marginTop: 10 }}>
              No coincide. Pista: moles reactivo = {e.datoGramos} g / {e.M[0]} g/mol = {(e.datoGramos / e.M[0]).toFixed(4)} mol; por estequiometría {e.rel[1]}/{e.rel[0]} → {(((e.datoGramos / e.M[0]) * e.rel[1]) / e.rel[0]).toFixed(4)} mol de producto × {e.M[1]} g/mol = {ansE.toFixed(e.fmt)} g.
            </div>
          )}
        </div>
      )}

      {modo === "nomen" && (
        <div className="card" style={{ marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ marginBottom: 0 }}>Nombra el compuesto</h2>
            <span className="tag amber">Aciertos {score.n[0]}/{score.n[1]}</span>
          </div>
          <div className="muted" style={{ margin: "10px 0" }}>¿Cuál es el nombre correcto de…</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 18, color: "var(--accent)", marginBottom: 14 }}>{n.q}</div>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            {opts.map((o) => {
              const isChoice = choice === o;
              return (
                <button
                  key={o}
                  className={isChoice ? (choice === n.a ? "primary" : "ghost") : "ghost"}
                  onClick={() => checkN(o)}
                  disabled={choice !== null}
                  style={{ textAlign: "left", justifyContent: "flex-start" }}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {(choice !== null || nRes) && (
            <div style={{ marginTop: 12 }}>
              {nRes === "ok" && <div className="ok">¡Correcto! {n.q} = {n.a}.</div>}
              {nRes === "mal" && <div className="error">Incorrecto. La respuesta era: {n.a}.</div>}
              <button className="primary" style={{ marginTop: 10 }} onClick={nextN}>Siguiente</button>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="ghost" onClick={() => setScore({ b: [0, 0], e: [0, 0], n: [0, 0] })}>Reiniciar marcador</button>
          </div>
        </div>
      )}
    </section>
  );
}