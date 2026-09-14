import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

interface NavItem {
  to: string;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Laboratorio",
    items: [
      { to: "/simulador", label: "Simulador" },
      { to: "/laboratorio", label: "Laboratorio libre" },
      { to: "/tutor", label: "Tutor" },
      { to: "/ensayos", label: "Ensayos" },
      { to: "/toxicologia", label: "Toxicología" },
    ],
  },
  {
    title: "Tabla",
    items: [{ to: "/tabla", label: "Periódica" }],
  },
  {
    title: "Catálogos",
    items: [
      { to: "/catalogo/inorganico", label: "Inorgánico" },
      { to: "/catalogo/organico", label: "Orgánico" },
      { to: "/catalogo/organico/aprender", label: "Orgánico · Nomenclatura" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { to: "/progreso", label: "Progreso" },
      { to: "/soluciones", label: "Soluciones" },
      { to: "/valoracion", label: "Valoración" },
      { to: "/termoquimica", label: "Termoquímica" },
      { to: "/vsepr", label: "Geometría (VSEPR)" },
      { to: "/isomeria", label: "Isomería" },
      { to: "/retos", label: "Retos" },
      { to: "/constructor", label: "Constructor" },
      { to: "/calculadora", label: "Calculadora" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="MolCore Lab">
          <span className="brand-mark">⬢</span> MolCore Lab
        </Link>
        <nav className="nav">
          {groups.map((g, gi) => (
            <div key={g.title} className="nav-group" style={{ display: "flex", gap: "3px", alignItems: "center" }}>
              {gi > 0 && (
                <span style={{ color: "var(--faint)", margin: "0 6px", fontSize: 13 }}>·</span>
              )}
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10.5,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "var(--faint)",
                  marginRight: 5,
                  whiteSpace: "nowrap",
                }}
              >
                {g.title}
              </span>
              {g.items.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span className="zone-tag">{user.zone}</span>
              <span className="muted small">{user.username}</span>
              <button className="tiny" onClick={logout} title="Cerrar sesión">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link className="ghost" to="/login">
                Entrar
              </Link>
              <Link className="primary" to="/register">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer muted">
        MolCore Lab · Química resuelta con determinismo: kernel de balanceo, datos curados y verificación por API.
      </footer>
    </div>
  );
}