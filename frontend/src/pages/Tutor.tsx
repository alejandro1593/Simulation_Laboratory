import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

interface Problem {
  id: string;
  input: string;
  topic: string;
  difficulty: number;
}

interface Steps {
  element: string;
  reactants_total: number;
  products_total: number;
  initial_balanced: boolean;
  tip: string;
}

interface Balanced {
  balanced: string;
  verified: { conserves_mass: boolean; charge: number };
  steps: Steps[];
}

interface Check {
  correct: boolean;
  reference?: string;
  proposed?: string;
  detail?: string;
  verified?: { conserves_mass: boolean } | null;
}

export default function Tutor() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solution, setSolution] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [manual, setManual] = useState("");
  const [balanced, setBalanced] = useState<Balanced | null>(null);
  const [error, setError] = useState("");

  const next = useCallback(async (topic?: string, difficulty?: number) => {
    setError("");
    setCheck(null);
    setSolution("");
    try {
      const p = await api<Problem>(
        `/academic/tutor/problem${new URLSearchParams({
          ...(topic ? { topic } : {}),
          ...(difficulty ? { difficulty: String(difficulty) } : {}),
        })}`,
        { authed: true },
      );
      setProblem(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo generar el ejercicio.");
    }
  }, []);

  useEffect(() => {
    next();
  }, [next]);

  async function submitCheck(e: FormEvent) {
    e.preventDefault();
    if (!problem) return;
    setError("");
    try {
      const r = await api<Check>("/academic/tutor/check", {
        method: "POST",
        body: { exercise: problem.input, solution },
        authed: true,
      });
      setCheck(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo verificar.");
    }
  }

  async function submitBalance(e: FormEvent) {
    e.preventDefault();
    if (!manual.trim()) return;
    setError("");
    try {
      const r = await api<Balanced>("/academic/tutor/balance", {
        method: "POST",
        body: { equation: manual },
        authed: true,
      });
      setBalanced(r);
    } catch (err) {
      setBalanced(null);
      setError(err instanceof ApiError ? err.message : "Ecuación no válida.");
    }
  }

  return (
    <section className="page">
      <h1>Tutor de balanceo</h1>
      {error && <p className="error">{error}</p>}

      {problem && (
        <div className="card">
          <h2>
            Ejercicio {problem.id} · {problem.topic} · dificultad {problem.difficulty}
          </h2>
          <p className="equation">
            <code>{problem.input}</code>
          </p>
          <form onSubmit={submitCheck} className="form">
            <label>
              Tu solución
              <input value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Ej: 2 H2 + O2 -> 2 H2O" />
            </label>
            <div className="row">
              <button className="primary" type="submit">
                Comprobar
              </button>
              <button type="button" className="ghost" onClick={() => next()}>
                Otro ejercicio
              </button>
            </div>
          </form>
          {check && (
            <p className={check.correct ? "ok" : "error"}>
              {check.correct ? "¡Correcto! Conserva masa y carga." : `Aún no: ${check.detail}`}
              {check.reference && !check.correct && (
                <>
                  {" "}
                  Referencia: <code>{check.reference}</code>
                </>
              )}
            </p>
          )}
        </div>
      )}

      <div className="card">
        <h2>Balanceo guiado</h2>
        <p className="muted small">Escribe cualquier ecuación para verificar y obtener consejos por elemento.</p>
        <form onSubmit={submitBalance} className="inline-form">
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="C3H8 + O2 -> CO2 + H2O" />
          <button className="primary" type="submit">
            Balancear
          </button>
        </form>
        {balanced && (
          <>
            <p className="equation">
              <code>{balanced.balanced}</code>
            </p>
            <p className={balanced.verified.conserves_mass ? "ok" : "error"}>
              Conserva masa {balanced.verified.conserves_mass ? "y carga" : ""} ✓
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Elemento</th>
                  <th>Reactivos</th>
                  <th>Productos</th>
                  <th>Sugerencia</th>
                </tr>
              </thead>
              <tbody>
                {balanced.steps.map((s) => (
                  <tr key={s.element}>
                    <td>{s.element}</td>
                    <td>{s.reactants_total}</td>
                    <td>{s.products_total}</td>
                    <td className="muted small">{s.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}