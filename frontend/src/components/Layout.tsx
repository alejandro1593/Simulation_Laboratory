import { Link, NavLink, useNavigate } from "react-router-dom";
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
    title: "Catálogos",
    items: [
      { to: "/catalogo/inorganico", label: "Inorgánico" },
      { to: "/catalogo/organico", label: "Orgánico" },
      { to: "/catalogo/organico/aprender", label: "Nomenclatura orgánica" },
      { to: "/catalogo/organico/nombralo", label: "Nómbralo" },
    ],
  },
  {
    title: "Aprender",
    items: [
      { to: "/aprender", label: "Centro de aprendizaje" },
      { to: "/aprender#fundamentos", label: "Fundamentos" },
      { to: "/aprender#general", label: "Química general" },
      { to: "/aprender#industria", label: "Industria" },
      { to: "/aprender#calculadoras", label: "Calculadoras" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { to: "/progreso", label: "Mi progreso" },
      { to: "/calculadora", label: "Calculadora" },
      { to: "/soluciones", label: "Soluciones" },
      { to: "/valoracion", label: "Valoración" },
      { to: "/termoquimica", label: "Termoquímica" },
      { to: "/vsepr", label: "Geometría (VSEPR)" },
      { to: "/isomeria", label: "Isomería" },
      { to: "/retos", label: "Retos" },
      { to: "/constructor", label: "Constructor" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="MolCore Lab">
          <span className="brand-mark">⬢</span> MolCore Lab
        </Link>
        <nav className="nav">
          <NavLink
            to="/tabla"
            className={({ isActive }) => (isActive ? "nav-pill active" : "nav-pill")}
          >
            Periódica
          </NavLink>

          {groups.map((g, gi) => (
            <div key={g.title} className="nav-group">
              {gi > 0 && <span className="nav-sep">·</span>}
              <select
                className="nav-select"
                value=""
                onChange={(e) => {
                  if (e.target.value) navigate(e.target.value);
                  e.target.value = "";
                }}
                aria-label={g.title}
              >
                <option value="" disabled>{g.title}</option>
                {g.items.map((n) => (
                  <option key={n.to} value={n.to}>{n.label}</option>
                ))}
              </select>
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