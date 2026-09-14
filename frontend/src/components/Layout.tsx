import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  desc?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Laboratorio",
    items: [
      { to: "/simulador", label: "Simulador", icon: "⚛️", desc: "Monta experimentos guiados" },
      { to: "/laboratorio", label: "Laboratorio libre", icon: "🧪", desc: "Reacciones sin guion" },
      { to: "/tutor", label: "Tutor", icon: "🎓", desc: "Ejercicios paso a paso" },
      { to: "/ensayos", label: "Ensayos", icon: "📋", desc: "Prueba tu conocimiento" },
      { to: "/toxicologia", label: "Toxicología", icon: "☠️", desc: "Dosis y DL50" },
    ],
  },
  {
    title: "Catálogos",
    items: [
      { to: "/catalogo/inorganico", label: "Inorgánico", icon: "🧂", desc: "Compuestos y iones" },
      { to: "/catalogo/organico", label: "Orgánico", icon: "🧬", desc: "Moléculas, fórmulas y usos" },
      { to: "/catalogo/organico/aprender", label: "Nomenclatura orgánica", icon: "✏️", desc: "Aprende a nombrar" },
      { to: "/catalogo/organico/nombralo", label: "Nómbralo", icon: "🎯", desc: "Adivina la molécula" },
    ],
  },
  {
    title: "Aprender",
    items: [
      { to: "/aprender", label: "Centro de aprendizaje", icon: "📚", desc: "Todo el temario" },
      { to: "/aprender#fundamentos", label: "Fundamentos", icon: "🔍", desc: "Átomo, enlaces, materia" },
      { to: "/aprender#general", label: "Química general", icon: "⚗️", desc: "Estequiometría, pH, equilibrio" },
      { to: "/aprender#industria", label: "Industria", icon: "🏭", desc: "Procesos y materiales" },
      { to: "/aprender#calculadoras", label: "Calculadoras", icon: "🧮", desc: "Moles↔gramos, diluciones…" },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { to: "/progreso", label: "Mi progreso", icon: "📈", desc: "Estadísticas de aprendizaje" },
      { to: "/calculadora", label: "Calculadora", icon: "🧮", desc: "Kernel de cálculo químico" },
      { to: "/soluciones", label: "Soluciones", icon: "💧", desc: "Preparación y dilución" },
      { to: "/valoracion", label: "Valoración", icon: "⚖️", desc: "Titulación ácido-base" },
      { to: "/termoquimica", label: "Termoquímica", icon: "🔥", desc: "Calores de reacción" },
      { to: "/vsepr", label: "Geometría (VSEPR)", icon: "📐", desc: "Forma de las moléculas" },
      { to: "/isomeria", label: "Isomería", icon: "🔄", desc: "Conexión molecular" },
      { to: "/retos", label: "Retos", icon: "🏆", desc: "Misiones de química" },
      { to: "/constructor", label: "Constructor", icon: "🛠️", desc: "Arma y simula" },
    ],
  },
];

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
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [hash]);

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="MolCore Lab">
          <span className="brand-mark">⬢</span> MolCore Lab
        </Link>
        <nav className="nav">
          <NavLink
            to="/tabla"
            className={({ isActive }) => (isActive ? "nav-trigger active" : "nav-trigger")}
          >
            <span className="nav-trigger-ico">◱</span>
            <span className="nav-trigger-label">Periódica</span>
          </NavLink>

          {groups.map((g, gi) => {
            const last = gi === groups.length - 1;
            return (
              <div key={g.title} className="nav-dots">
                {gi > 0 && <span className="nav-sep">·</span>}
                <DropdownMenu group={g} align={last ? "right" : "left"} />
              </div>
            );
          })}
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