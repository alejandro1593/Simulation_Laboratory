import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIAS, ELEMENTS } from "../data/elements";
import type { Categoría, ElementRow } from "../data/elements";
import { api } from "../api/client";

/* PRNG determinista (mulberry32): el mismo juego se puede reproducir. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Modo = "encontrar" | "propiedades";

interface Estado {
  fase: "config" | "jugando" | "fin";
  modo: Modo;
  ronda: number;
  totalRondas: number;
  aciertos: number;
  racha: number;
  mejorRacha: number;
  prompt: { tipo: string; texto: string; target: ElementRow } | null;
  opciones: ElementRow[] | null;
  resultado: "ok" | "fail" | null;
  seed: number;
}

const GRID = ELEMENTS.filter((e) => e.g !== null);

function hacePrompt(modo: Modo, rnd: () => number, ronda: number): NonNullable<Estado["prompt"]> {
  if (modo === "encontrar") {
    const target = GRID[Math.floor(rnd() * GRID.length)];
    const tipos = [
      () => ({ tipo: "nombre", texto: `Nombre: ${target.nE}` }),
      () => ({ tipo: "símbolo", texto: `Símbolo: ${target.s}` }),
      () => ({ tipo: "número atómico", texto: `Z = ${target.z}` }),
      () => ({ tipo: "masa molar", texto: `Masa ≈ ${target.m.toFixed(1)} g/mol` }),
    ];
    const t = tipos[Math.floor(rnd() * tipos.length)]();
    return { tipo: t.tipo, texto: t.texto, target };
  }
  // propiedades: mezcla de preguntas de opción múltiple sobre grupo/categoría/estado/bloque
  const target = ELEMENTS[Math.floor(rnd() * ELEMENTS.length)];
  const pool = [
    { tipo: "grupo", texto: `¿En qué grupo (columna) está ${target.nE} (${target.s})?` },
    { tipo: "categoría", texto: `¿Qué categoría es ${target.nE} (${target.s})?` },
    { tipo: "estado", texto: `¿En qué estado está ${target.nE} a 25 °C?` },
    { tipo: "símbolo", texto: `¿Cuál es el número atómico de ${target.nE}?` },
  ];
  // ronda 1-2 fáciles (categoría/estado), después variado
  const idx = ronda % 2 === 0 ? 1 : (rnd() * pool.length) | 0;
  const p = pool[idx % pool.length];
  return { tipo: p.tipo, texto: p.texto, target };
}

function opcionesPara(prompt: Estado["prompt"], modo: Modo, rnd: () => number): ElementRow[] | null {
  if (modo === "encontrar") return null;
  if (!prompt) return null;
  const t = prompt.target;
  const pool = ELEMENTS.filter((e) => e.z !== t.z);
  const distractores: ElementRow[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (distractores.length < 3 * 4 && guard < 500) {
    guard += 1;
    const cand = pool[Math.floor(rnd() * pool.length)];
    const key = prompt.tipo === "grupo"
      ? String(cand.g)
      : prompt.tipo === "categoría"
        ? cand.cat
        : prompt.tipo === "estado"
          ? cand.st
          : String(cand.z);
    if (seen.has(key) || key === String(t.z)) {
      if (distractores.length >= 3) break;
      continue;
    }
    if (distractores.length >= 3) break;
    seen.add(key);
    distractores.push(cand);
  }
  return shuffle([t, ...distractores], rnd);
}

function formatOpt(e: ElementRow, tipo: string): string {
  if (tipo === "grupo") return `Grupo ${e.g}`;
  if (tipo === "categoría") return CATEGORIAS[e.cat as Categoría];
  if (tipo === "estado") return e.st === "G" ? "Gas" : e.st === "L" ? "Líquido" : "Sólido";
  return String(e.z);
}

const initialState = (modo: Modo): Estado => ({
  fase: "config",
  modo,
  ronda: 0,
  totalRondas: modo === "encontrar" ? 12 : 10,
  aciertos: 0,
  racha: 0,
  mejorRacha: 0,
  prompt: null,
  opciones: null,
  resultado: null,
  seed: 0,
});

export default function PeriodicQuiz() {
  const [estado, setEstado] = useState<Estado>(initialState("encontrar"));
  const [nuevo] = useState(0);

  const rnd = useMemo(() => mulberry32(estado.seed || Date.now()), [estado.seed, nuevo]);

  const empezar = (modo: Modo) => {
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    const st = { ...initialState(modo), seed, fase: "jugando" as const, ronda: 1 };
    const prompt = hacePrompt(modo, rnd, 1);
    st.prompt = prompt;
    st.opciones = opcionesPara(prompt, modo, rnd);
    setEstado(st);
  };

  const responder = (el: ElementRow | null) => {
    if (estado.fase !== "jugando" || estado.resultado !== null) return;
    const ok = estado.modo === "encontrar"
      ? el?.z === estado.prompt?.target.z
      : el?.z === estado.prompt?.target.z;
    const racha = ok ? estado.racha + 1 : 0;
    setEstado((prev) => {
      const next: Estado = {
        ...prev,
        resultado: ok ? "ok" : "fail",
        racha,
        aciertos: prev.aciertos + (ok ? 1 : 0),
        mejorRacha: Math.max(prev.mejorRacha, racha),
      };
      return next;
    });
    // registrar progreso (best-effort, silencioso)
    if (ok) {
      api("/academic/progress", {
        method: "POST",
        authed: true,
        body: { topic: "tabla", activity_type: "quiz", score: 1, detail: `ronda-${estado.modo}` },
      }).catch(() => {});
    }
    setTimeout(() => {
      setEstado((prev) => {
        if (prev.ronda >= prev.totalRondas) return { ...prev, fase: "fin", resultado: null };
        const ronda = prev.ronda + 1;
        const prompt = hacePrompt(prev.modo, rnd, ronda);
        return {
          ...prev,
          ronda,
          resultado: null,
          prompt,
          opciones: opcionesPara(prompt, prev.modo, rnd),
        };
      });
    }, 850);
  };

  const pct = estado.totalRondas > 0 ? Math.round((estado.aciertos / estado.totalRondas) * 100) : 0;

  return (
    <section className="page">
      <h1>Tabla periódica · Quiz</h1>
      <p className="lead">
        Juego interactivo sobre los 118 elementos. Dos modalidades: <b>encuentra el elemento</b> sobre la tabla,
        y <b>adivina la propiedad</b> de opción múltiple. Datos curados, rondas deterministas.
      </p>

      {estado.fase === "config" && (
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="card">
            <h3 style={{ margin: "0 0 6px" }}>🔍 Encuéntralo en la tabla</h3>
            <p className="small muted" style={{ margin: "0 0 12px" }}>
              12 rondas. Te damos el nombre, el símbolo, el número atómico o la masa; tú pinchas la casilla correcta.
            </p>
            <button className="primary" onClick={() => empezar("encontrar")}>Jugar · encontrar</button>
          </div>
          <div className="card">
            <h3 style={{ margin: "0 0 6px" }}>⚡ Adivina la propiedad</h3>
            <p className="small muted" style={{ margin: "0 0 12px" }}>
              10 rondas de opción múltiple: grupo, categoría, estado a 25 °C y número atómico.
            </p>
            <button className="ghost" onClick={() => empezar("propiedades")}>Jugar · propiedades</button>
          </div>
        </div>
      )}

      {estado.fase === "jugando" && estado.prompt && (
        <div className="qcard" style={{ marginTop: 16 }}>
          <div className="qstats">
            <span className="chip">Ronda {estado.ronda} / {estado.totalRondas}</span>
            <span className="chip okchip">✅ {estado.aciertos}</span>
            <span className="chip badchip">❌ {estado.ronda - 1 - estado.aciertos}</span>
            <span className="chip racha">🔥 Racha: {estado.racha}</span>
            <span className="skip" />
            <Link className="tiny" to="/tabla">Ir a la tabla</Link>
          </div>
          <div className="qbar">
            <div className="qbar-fill" style={{ width: `${(estado.ronda / estado.totalRondas) * 100}%` }} />
          </div>
          <div style={{ padding: 14 }}>
            <span className="muted small" style={{ display: "block", marginBottom: 4 }}>{estado.prompt.tipo}</span>
            <p className="equation" style={{ margin: 0, fontSize: 20 }}>{estado.prompt.texto}</p>
          </div>

          {estado.modo === "encontrar" ? (
            <div className="periodic-quiz" style={{ overflowX: "auto", padding: "6px 12px 12px" }}>
              <div className="periodic pz">
                {GRID.map((e) => {
                  const hit = estado.prompt?.target.z === e.z;
                  return (
                    <button
                      key={e.z}
                      disabled={estado.resultado !== null}
                      onClick={() => responder(e)}
                      title={`${e.nE} (${e.s}) · Z ${e.z}`}
                      className={
                        `pz-cell c-${e.cat} ${estado.resultado !== null ? (hit ? "pz-hit" : "pz-dim") : ""}`
                      }
                      style={{
                        gridColumn: (e.g ?? 1) + 1,
                        gridRow: e.p + 1,
                      }}
                    >
                      <b>{e.s}</b>
                    </button>
                  );
                })}
              </div>
              {estado.resultado !== null && (
                <div className={estado.resultado === "ok" ? "ok-chip" : "bad-chip"} style={{ display: "inline-block", marginTop: 8 }}>
                  {estado.resultado === "ok" ? `✅ Correcto: ${estado.prompt.target.nE} (${estado.prompt.target.s})` : `Era ${estado.prompt.target.nE} (${estado.prompt.target.s})`}
                </div>
              )}
              <p className="faint small" style={{ marginTop: 6 }}>Lantánidos y actínidos no aparecen en esta cuadrícula; el resto están en su posición real.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8, padding: "4px 14px 14px", gridTemplateColumns: "1fr 1fr" }}>
              {estado.opciones?.map((e) => (
                <button
                  key={e.z}
                  className={estado.resultado === null ? "ghost" : (e.z === estado.prompt?.target.z ? "primary" : "ghost")}
                  disabled={estado.resultado !== null}
                  onClick={() => responder(e)}
                  style={{ textAlign: "left" }}
                >
                  {formatOpt(e, estado.prompt?.tipo ?? "grupo")}
                </button>
              ))}
              {estado.resultado !== null && (
                <span className={estado.resultado === "ok" ? "ok-chip" : "bad-chip"} style={{ marginTop: 4 }}>
                  {estado.resultado === "ok" ? "✅ ¡Correcto!" : `❌ Era ${estado.prompt.target.nE} (${estado.prompt.target.s})`}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {estado.fase === "fin" && (
        <div className="card" style={{ marginTop: 16, maxWidth: 480 }}>
          <h3 style={{ margin: "0 0 6px" }}>
            {pct >= 80 ? "🏆 ¡Dominas la tabla!" : pct >= 50 ? "👍 Buen trabajo" : "📚 Vuelve al temario y reintenta"}
          </h3>
          <p className="lead" style={{ margin: 0 }}>{estado.aciertos} de {estado.totalRondas} · {pct}%</p>
          <p className="small muted">Mejor racha: {estado.mejorRacha}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="primary" onClick={() => empezar(estado.modo)}>Reintentar</button>
            <Link className="ghost" to="/aprender">Centro de aprendizaje</Link>
          </div>
        </div>
      )}
    </section>
  );
}