import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

interface TopicProgress {
  topic: string;
  attempts: number;
  correct: number;
  mastery: number;
}

interface DayActivity {
  day: string;
  attempts: number;
  correct: number;
}

interface ProgressSummary {
  topics: TopicProgress[];
  totals: { attempts: number; correct: number; accuracy: number };
  streak: number;
  last_7_days: DayActivity[];
}

const TOPIC_LABEL: Record<string, string> = {
  balanceo: "Balanceo",
  esteq: "Estequiometría",
  nomen: "Nomenclatura",
  aprender: "Centro de aprendizaje",
  practica: "Práctica de problemas",
  tabla: "Quiz de la tabla periódica",
};

function masteryTone(m: number): string {
  if (m >= 80) return "var(--ok)";
  if (m >= 50) return "var(--warn)";
  return "var(--danger)";
}

export default function MiProgreso() {
  const [data, setData] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api<ProgressSummary>("/academic/progress", { authed: true })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "No se pudo cargar el progreso."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <div className="error" style={{ padding: 20 }}>{error}</div>;
  if (!data) return <p className="muted">Cargando progreso…</p>;

  const maxDaily = Math.max(1, ...data.last_7_days.map((d) => d.attempts));

  return (
    <section className="page">
      <h1>Mi progreso</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Precisión por tema a partir de los retos autocorregibles. Cada comprobación suma un intento; cada acierto suma a la racha.
      </p>

      <div className="grid-3" style={{ margin: "14px 0" }}>
        <div className="stat">
          <span>Racha</span>
          <b>{data.streak} {data.streak === 1 ? "día" : "días"} 🔥</b>
        </div>
        <div className="stat">
          <span>Intentos</span>
          <b>{data.totals.attempts}</b>
        </div>
        <div className="stat">
          <span>Precisión global</span>
          <b>{data.totals.accuracy}%</b>
        </div>
      </div>

      {data.totals.attempts === 0 ? (
        <div className="card">
          <p className="lead" style={{ margin: 0 }}>
            Aún no has registrado intentos.
          </p>
          <p className="muted small">
            Resuelve retos de <Link to="/retos">balanceo, estequiometría o nomenclatura</Link> y tu
            dominio por tema empezará a aparecer aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginTop: 4 }}>
            <h2>Dominio por tema</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
              {data.topics.map((t) => (
                <div key={t.topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span>{TOPIC_LABEL[t.topic] ?? t.topic}</span>
                    <span className="muted small">{t.correct}/{t.attempts} · {t.mastery}%</span>
                  </div>
                  <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${t.mastery}%`, borderRadius: 6, background: masteryTone(t.mastery), transition: "width .4s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 14 }}>
            <h2>Actividad · últimos 7 días</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 16, height: 130 }}>
              {data.last_7_days.map((d) => {
                const h = Math.round((d.attempts / maxDaily) * 100);
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                    <span className="muted small" style={{ fontSize: 11 }}>
                      {d.attempts > 0 ? `${d.correct}/${d.attempts}` : "—"}
                    </span>
                    <div
                      style={{ width: "100%", maxWidth: 36, height: `${Math.max(h, 4)}%`, borderRadius: "4px 4px 0 0", background: d.attempts > 0 ? "var(--accent)" : "rgba(255,255,255,0.07)" }}
                      title={`${d.day}: ${d.attempts} intentos`}
                    />
                    <span className="muted small" style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                      {new Date(d.day + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}