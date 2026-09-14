import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_GROUPS } from "../data/nav";
import { ELEMENTS } from "../data/elements";
import { COMPUESTOS_INTERES } from "../data/organic";
import { CATALOGO_INORGANICO } from "../data/inorganic";
import { TOPIC_INDEX, CALCULATOR_INDEX } from "../pages/Aprender";

interface IndexEntry {
  id: string;
  route: string;
  icon: string;
  label: string;
  sub?: string;
  cat: string;
}

function buildIndex(): IndexEntry[] {
  const idx: IndexEntry[] = [];
  for (const g of NAV_GROUPS) {
    for (const n of g.items) {
      idx.push({ id: `nav-${n.to}`, route: n.to, icon: n.icon, label: n.label, sub: n.desc, cat: g.title });
    }
  }
  idx.push({ id: "tabla", route: "/tabla", icon: "◱", label: "Tabla Periódica", sub: "118 elementos", cat: "Herramienta" });
  for (const el of ELEMENTS) {
    idx.push({ id: `el-${el.z}`, route: `/tabla`, icon: el.s, label: `${el.nE} (${el.s})`, sub: `${el.catN} · Z=${el.z}`, cat: "Elemento" });
  }
  for (const c of COMPUESTOS_INTERES) {
    idx.push({ id: `org-${c.id}`, route: "/catalogo/organico", icon: "🧬", label: c.nombre, sub: `${c.formula} · ${c.uso}`, cat: "Orgánico" });
  }
  for (const fam of CATALOGO_INORGANICO) {
    for (const r of fam.filas) {
      const nm = r.stock || r.trad || r.iupac || r.f;
      idx.push({ id: `inorg-${fam.id}-${r.f}`, route: "/catalogo/inorganico", icon: "🧂", label: nm, sub: `${fam.titulo} · ${r.f}`, cat: "Inorgánico" });
    }
  }
  for (const t of TOPIC_INDEX) {
    idx.push({ id: `topic-${t.id}`, route: `/aprender#topic-${t.id}`, icon: "📚", label: t.title, sub: t.summary, cat: "Tema" });
  }
  for (const c of CALCULATOR_INDEX) {
    idx.push({ id: `calc-${c.id}`, route: `/aprender#calc-${c.id}`, icon: "🧮", label: c.title, sub: c.desc, cat: "Calculadora" });
  }
  return idx;
}

function score(q: string, text: string): number {
  const lq = q.toLowerCase(), lt = text.toLowerCase();
  if (lt === lq) return 100;
  if (lt.startsWith(lq)) return 90;
  if (lt.includes(lq)) return 60;
  const words = lt.split(/\s+/);
  let hits = 0;
  for (const w of words) if (w.startsWith(lq)) hits++;
  if (hits) return 50 + hits * 5;
  return -1;
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const idx = useMemo(buildIndex, []);

  useEffect(() => { if (open) { setQ(""); setActiveIdx(0); requestAnimationFrame(() => inputRef.current?.focus()); } }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) return idx.slice(0, 25);
    return idx
      .map((e) => ({ ...e, _s: Math.max(score(q, e.label), score(q, `${e.label} ${e.sub || ""}`)) }))
      .filter((e) => e._s > 0)
      .sort((a, b) => b._s - a._s)
      .slice(0, 20);
  }, [q, idx]);

  useEffect(() => { setActiveIdx(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[activeIdx]) { navigate(results[activeIdx].route); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, activeIdx, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="cmd-overlay" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmd-panel">
        <input
          ref={inputRef}
          className="cmd-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar moléculas, elementos, temas…"
          aria-label="Buscar"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="cmd-results">
          {results.length === 0 && <div className="cmd-empty">Sin resultados</div>}
          {results.map((r, i) => (
            <button
              key={r.id}
              className={`cmd-item ${i === activeIdx ? "active" : ""}`}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => { navigate(r.route); onClose(); }}
            >
              <span className="cmd-ico">{r.icon}</span>
              <span className="cmd-txt">
                <span className="cmd-label">{r.label}</span>
                {r.sub && <span className="cmd-sub">{r.sub}</span>}
              </span>
              <span className="cmd-cat">{r.cat}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}