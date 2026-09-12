import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const nav = [
  { to: "/simulador", label: "Simulador" },
  { to: "/tabla", label: "Tabla periódica" },
  { to: "/constructor", label: "Constructor" },
  { to: "/tutor", label: "Tutor de balanceo" },
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
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span className="muted">
                {user.username} · zona {user.zone}
              </span>
              <button
                className="ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
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
        MolCore Lab · MVP Fase 1 · La química se resuelve en el backend con un kernel determinista y datos curados.
      </footer>
    </div>
  );
}