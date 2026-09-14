import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { NAV_GROUPS, NavGroup } from "../data/nav";
import CommandPalette from "./CommandPalette";

function DropdownMenu({ group, align }: { group: NavGroup; align: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const MENU_W = 272;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const recompute = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const left = align === "right"
        ? Math.max(8, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 8))
        : Math.max(8, Math.min(r.left, window.innerWidth - MENU_W - 8));
      setPos({ top: r.bottom + 10, left });
    };
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [open, align]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const left = align === "right"
      ? Math.max(8, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 8))
      : Math.max(8, Math.min(r.left, window.innerWidth - MENU_W - 8));
    setPos({ top: r.bottom + 10, left });
    setOpen(true);
  };

  const active = group.items.find((i) => i.to.split("#")[0] === pathname);
  const triggerLabel = active ? active.label : group.title;
  const triggerIcon = active ? active.icon : "";

  return (
    <div className={`nav-dropdown ${align === "right" ? "align-right" : ""}`} ref={ref}>
      <button
        className={`nav-trigger ${active ? "active" : ""}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {triggerIcon && <span className="nav-trigger-ico">{triggerIcon}</span>}
        <span className="nav-trigger-label">{triggerLabel}</span>
        <span className={`chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && pos && (
        <div className="dropdown-menu" role="menu" style={{ top: pos.top, left: pos.left }}>
          {group.items.map((n) => {
            const isActive = n.to.split("#")[0] === pathname;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                role="menuitem"
                className={({ isActive: ia }) =>
                  `dropdown-item ${isActive || ia ? "active" : ""}`
                }
                onClick={() => setOpen(false)}
              >
                <span className="dropdown-ico">{n.icon}</span>
                <span className="dropdown-txt">
                  <span className="dropdown-label">{n.label}</span>
                  {n.desc && <span className="dropdown-desc">{n.desc}</span>}
                </span>
                {isActive && <span className="dropdown-check">✓</span>}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    localStorage.getItem("mc_theme") === "light" ? "light" : "dark",
  );
  const { hash } = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("mc_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    let raf = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (raf < 12) {
        raf += 1;
        requestAnimationFrame(tryScroll);
      }
    };
    raf += 1;
    tryScroll();
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <header className="topbar">
        <Link to="/" className="brand" aria-label="MolCore Lab">
          <span className="brand-mark">⬢</span> MolCore Lab
        </Link>
        <nav className="nav">
          <button className="nav-trigger search-trigger" onClick={() => setCmdOpen(true)}>
            <span className="nav-trigger-ico">🔎</span>
            <span className="nav-trigger-label muted small">⌘K</span>
          </button>

          <NavLink
            to="/tabla"
            className={({ isActive }) => (isActive ? "nav-trigger active" : "nav-trigger")}
          >
            <span className="nav-trigger-ico">◱</span>
            <span className="nav-trigger-label">Periódica</span>
          </NavLink>

          {NAV_GROUPS.map((g, gi) => (
            <div key={g.title} className="nav-dots">
              <span className="nav-sep">·</span>
              <DropdownMenu group={g} align={gi === NAV_GROUPS.length - 1 ? "right" : "left"} />
            </div>
          ))}
        </nav>
        <div className="account">
          <button
            className="nav-trigger theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            aria-label="Cambiar tema"
          >
            <span className="nav-trigger-ico">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="nav-trigger-label small muted">{theme === "dark" ? "Claro" : "Oscuro"}</span>
          </button>
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