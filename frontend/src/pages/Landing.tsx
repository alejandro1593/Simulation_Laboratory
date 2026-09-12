import { Link } from "react-router-dom";

const features = [
  {
    title: "Simulador determinista",
    body: "La reacción se balancea en el backend con un kernel de fracciones exactas. El navegador solo reproduce la escena: nada se inventa en el cliente.",
  },
  {
    title: "Tabla periódica de 118 elementos",
    body: "Datos curados del catálogo: masas, electronegatividades, familias y vecinos para estudiar tendencias.",
  },
  {
    title: "Constructor de moléculas",
    body: "Escenarios didácticos con reglas de valencia y cálculo de masa molar a pie de ratón.",
  },
  {
    title: "Tutor paso a paso",
    body: "Balanceo estequiométrico con sugerencias por elemento y verificación de tus soluciones.",
  },
];

const zones = [
  { name: "Lobby", color: "#6a9955", ok: true },
  { name: "Académica", color: "#4f9bd8", ok: true },
  { name: "Investigación", color: "#e06c75", ok: false },
];

export default function Landing() {
  return (
    <section className="landing">
      <div className="hero">
        <h1>Experimenta química real.</h1>
        <p className="lead">
          Un laboratorio virtual compartimentado, como una instalación clasificada: cada zona tiene su propio
          acceso y nunca se inventa una reacción.
        </p>
        <div className="zones">
          {zones.map((z) => (
            <span key={z.name} className="zone-chip">
              <span className="dot" style={{ backgroundColor: z.color, opacity: z.ok ? 1 : 0.4 }} />
              {z.name} {z.ok ? "· abierta" : "· sellada"}
            </span>
          ))}
        </div>
        <div className="hero-actions">
          <Link className="primary" to="/register">
            Crear una cuenta
          </Link>
          <Link className="ghost" to="/tabla">
            Ver la tabla periódica
          </Link>
        </div>
      </div>
      <div className="grid">
        {features.map((f) => (
          <article key={f.title} className="card">
            <h2>{f.title}</h2>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}