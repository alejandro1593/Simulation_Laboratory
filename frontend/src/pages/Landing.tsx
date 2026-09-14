import { Link } from "react-router-dom";

const zones = [
  { title: "Laboratorio", ico: "⚗️", fn: "Simulador + tutor de balanceo", to: "/simulador", tone: "rgba(92,232,192,0.12)" },
  { title: "Ensayos de laboratorio", ico: "🦺", fn: "Instrumental real y pictogramas GHS", to: "/ensayos", tone: "rgba(122,162,255,0.12)" },
  { title: "Toxicología", ico: "☣️", fn: "LD50, pictogramas GHS y peligros por reactivos y elementos", to: "/toxicologia", tone: "rgba(240,100,100,0.12)" },
  { title: "Tabla periódica", ico: "🧪", fn: "118 elementos con modelo de capas", to: "/tabla", tone: "rgba(122,162,255,0.12)" },
  { title: "Catálogo inorgánico", ico: "🧫", fn: "Compuestos con 3 nomenclaturas", to: "/catalogo/inorganico", tone: "rgba(242,178,99,0.12)" },
  { title: "Catálogo orgánico", ico: "🧬", fn: "Grupos funcionales y compuestos de interés", to: "/catalogo/organico", tone: "rgba(176,140,232,0.12)" },
  { title: "Constructor", ico: "🪄", fn: "Arma moléculas y valídalas", to: "/constructor", tone: "rgba(124,224,138,0.12)" },
  { title: "Calculadora", ico: "⚖️", fn: "Masa, soluciones, oxidación y gases", to: "/calculadora", tone: "rgba(88,214,200,0.12)" },
];

export default function Landing() {
  return (
    <section className="page">
      <div className="hero">
        <div>
          <h1>
            Experimenta <em>química real.</em>
          </h1>
          <p>
            Un laboratorio virtual determinista: cada reacción se balancea en el backend con un kernel
            de fracciones exactas y el cliente nunca inventa una fórmula. Datos curados, nomenclaturas
            reales y componentes interactivos.
          </p>
          <div className="hero-cta">
            <Link className="primary" to="/register">
              Crear una cuenta
            </Link>
            <Link className="ghost" to="/tabla">
              Explorar la tabla periódica
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="zone-tag" style={{ alignSelf: "flex-start" }}>sistema · molcore</div>
          <p className="equation" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            {`2 H₂(g) + O₂(g) → 2 H₂O(g)`}
            <span className="ok">   ✓ balanceada</span>
          </p>
          <p className="small muted" style={{ marginBottom: 0 }}>
            Hidrógeno y oxígeno escalados por el kernel: conserva masa, átomos y carga
            con aritmética exacta sobre fracciones.
          </p>
        </div>
      </div>

      <h2>Zona académica</h2>
      <div className="zone-cards">
        {zones.map((z) => (
          <Link key={z.title} className="zone-link" to={z.to}>
            <span className="z-ico" style={{ background: z.tone, border: "1px solid var(--hair)" }}>
              {z.ico}
            </span>
            <span className="z-fn">{z.title}</span>
            <span className="z-d">{z.fn}</span>
          </Link>
        ))}
      </div>

      <hr className="hair-sep" />
      <h2>Principios</h2>
      <div className="grid-3">
        <div className="card">
          <h3>Kernel determinista</h3>
          <p className="small muted" style={{ margin: "6px 0 0" }}>
            El balanceo resuelve con fracciones exactas; el cliente solo reproduce el resultado.
            Sin cálculos flotantes ni fórmulas inventadas.
          </p>
        </div>
        <div className="card">
          <h3>Datos curados</h3>
          <p className="small muted" style={{ margin: "6px 0 0" }}>
            Elementos, compuestos, estados de oxidación y nomenclaturas reales (IUPAC, Stock,
            tradicional). La tabla completa con los 118 elementos confirmados.
          </p>
        </div>
        <div className="card">
          <h3>Zonas selladas</h3>
          <p className="small muted" style={{ margin: "6px 0 0" }}>
            Lobby, Académica e Investigación con accesos separados. La investigadora se mantiene
            sellada hasta nueva fase.
          </p>
        </div>
      </div>
    </section>
  );
}