import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";

interface Atom {
  id: string;
  symbol: string;
  x: number;
  y: number;
}

interface Bond {
  a: string;
  b: string;
  order: number;
}

interface Preset {
  name: string;
  atoms: { id: string; symbol: string; x: number; y: number }[];
  bonds: { a: string; b: string; order: number }[];
  notes?: string;
}

const PALETTE: { s: string; v: string; c: string }[] = [
  { s: "H", v: "1", c: "#e7ecf5" },
  { s: "C", v: "4", c: "#bcc8dd" },
  { s: "N", v: "3", c: "#7aa2ff" },
  { s: "O", v: "2", c: "#ff7b7b" },
  { s: "F", v: "1", c: "#58d6c8" },
  { s: "Cl", v: "1", c: "#7ce08a" },
  { s: "Br", v: "1", c: "#c77cf0" },
  { s: "I", v: "1", c: "#b06ce8" },
  { s: "P", v: "3", c: "#f2b263" },
  { s: "S", v: "2", c: "#f2d83c" },
  { s: "Na", v: "1", c: "#5fc7d8" },
  { s: "K", v: "1", c: "#8fd8c0" },
  { s: "Mg", v: "2", c: "#9db4ff" },
  { s: "Ca", v: "2", c: "#b49e6f" },
  { s: "Zn", v: "2", c: "#b8c0c8" },
  { s: "Cu", v: "1,2", c: "#e0a05c" },
  { s: "Fe", v: "2,3", c: "#d8d3e0" },
  { s: "B", v: "3", c: "#9fc9e8" },
];

type Modo = "add" | "link" | "erase" | "move";

const W = 680;
const H = 460;
const SCALE = 55;

const cx = (x: number) => W / 2 + x * SCALE;
const cy = (y: number) => H / 2 - y * SCALE;
const invX = (px: number) => (px - W / 2) / SCALE;
const invY = (py: number) => (H / 2 - py) / SCALE;

const RADII: Record<string, number> = { H: 13, F: 15, Cl: 19, Br: 22, I: 25, Na: 20, K: 24, Mg: 19, Ca: 22, Zn: 19, Cu: 19, Fe: 18, B: 18, P: 19, S: 19, Si: 19, C: 18, N: 17, O: 16 };
const rAtom = (s: string) => RADII[s] ?? 18;

const symColor = (s: string) => PALETTE.find((p) => p.s === s)?.c ?? "#b8c8dc";

let ID = 0;
const nextId = () => `A${++ID}`;

export default function Builder() {
  const [modo, setModo] = useState<Modo>("add");
  const [palSym, setPalSym] = useState("C");
  const [presets, setPresets] = useState<Preset[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { valid: boolean; message: string; issues: { atom: string; msg: string }[]; total_charge: number }>(null);
  const [notes, setNotes] = useState("");

  const atoms = useRef<Atom[]>([]);
  const bonds = useRef<Bond[]>([]);
  const sel = useRef<string | null>(null);
  const hover = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, force] = useState(0);
  const redraw = useCallback(() => force((n) => n + 1), []);

  useEffect(() => {
    api<Record<string, Preset>>("/academic/builder/presets", { authed: true })
      .then((p) => {
        setPresets(Object.values(p));
        setNotes(p.agua?.notes ?? "");
        loadPreset(p.agua);
      })
      .catch(() => setPresets([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadPreset(p: Preset | undefined) {
    if (!p) return;
    ID = 0;
    atoms.current = p.atoms.map((a) => ({ ...a }));
    bonds.current = p.bonds.map((b) => ({ ...b }));
    sel.current = null;
    setResult(null);
    setNotes(p.notes ?? "");
    redraw();
  }

  function validate() {
    setLoading(true);
    setResult(null);
    api<{ valid: boolean; message: string; issues: { atom: string; msg: string }[]; total_charge: number }>(
      "/academic/builder/validate",
      { method: "POST", authed: true, body: { atoms: atoms.current, bonds: bonds.current } },
    )
      .then(setResult)
      .catch((e) => setResult({ valid: false, message: e.message, issues: [], total_charge: 0 }))
      .finally(() => setLoading(false));
  }

  const clearAll = () => {
    atoms.current = [];
    bonds.current = [];
    sel.current = null;
    setResult(null);
    redraw();
  };

  const hmm = useRef<{ x: number; y: number; id: string | null; moved: boolean }>({
    x: 0,
    y: 0,
    id: null,
    moved: false,
  });

  function hitAtom(wx: number, wy: number): string | null {
    let best: string | null = null;
    let bestD = 26;
    for (const a of atoms.current) {
      const d = Math.hypot(a.x - wx, a.y - wy) * SCALE;
      if (d < Math.max(rAtom(a.symbol), 14) && d < bestD) {
        bestD = d;
        best = a.id;
      }
    }
    return best;
  }

  function hitBond(wx: number, wy: number): number | null {
    const px = cx(wx);
    const py = cy(wy);
    for (let i = 0; i < bonds.current.length; i++) {
      const b = bonds.current[i];
      const A = atoms.current.find((a) => a.id === b.a);
      const B = atoms.current.find((a) => a.id === b.b);
      if (!A || !B) continue;
      const ax = cx(A.x);
      const ay = cy(A.y);
      const bx = cx(B.x);
      const by = cy(B.y);
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d < 9) return i;
    }
    return null;
  }

  function onPointerDown(ev: React.PointerEvent<HTMLCanvasElement>) {
    const rect = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * W;
    const py = ((ev.clientY - rect.top) / rect.height) * H;
    const wx = invX(px);
    const wy = invY(py);
    hmm.current = { x: px, y: py, id: null, moved: false };

    if (modo === "move") {
      const id = hitAtom(wx, wy);
      hmm.current.id = id;
      return;
    }

    if (modo === "add") {
      if (!hitAtom(wx, wy)) {
        atoms.current.push({ id: nextId(), symbol: palSym, x: round1(wx), y: round1(wy) });
        redraw();
      }
      return;
    }

    if (modo === "link") {
      const id = hitAtom(wx, wy);
      if (!id) {
        sel.current = null;
        redraw();
        return;
      }
      if (!sel.current) {
        sel.current = id;
        redraw();
        return;
      }
      if (sel.current === id) {
        sel.current = null;
        redraw();
        return;
      }
      const a = sel.current;
      sel.current = null;
      const ex = bonds.current.find((b) => (b.a === a && b.b === id) || (b.a === id && b.b === a));
      if (ex) {
        ex.order = ((ex.order % 3) + 1) as Bond["order"];
      } else {
        bonds.current.push({ a, b: id, order: 1 });
      }
      redraw();
      return;
    }

    if (modo === "erase") {
      const id = hitAtom(wx, wy);
      if (id) {
        atoms.current = atoms.current.filter((a) => a.id !== id);
        bonds.current = bonds.current.filter((b) => b.a !== id && b.b !== id);
        if (sel.current === id) sel.current = null;
        redraw();
        return;
      }
      const bi = hitBond(wx, wy);
      if (bi != null) {
        bonds.current.splice(bi, 1);
        redraw();
      }
    }
  }

  function onPointerMove(ev: React.PointerEvent<HTMLCanvasElement>) {
    const rect = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * W;
    const py = ((ev.clientY - rect.top) / rect.height) * H;
    const wx = invX(px);
    const wy = invY(py);

    const h = hitAtom(wx, wy);
    if (h !== hover.current) {
      hover.current = h;
      redraw();
    }

    if (modo === "move" && hmm.current.id) {
      const dx = px - hmm.current.x;
      const dy = py - hmm.current.y;
      if (Math.hypot(dx, dy) > 3) hmm.current.moved = true;
      const a = atoms.current.find((at) => at.id === hmm.current.id);
      if (a) {
        a.x = round2(a.x + (dx / SCALE));
        a.y = round2(a.y - (dy / SCALE));
        hmm.current.x = px;
        hmm.current.y = py;
        redraw();
      }
    }
  }

  function onPointerUp() {
    hmm.current.id = null;
    hmm.current.moved = false;
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    for (const b of bonds.current) {
      const A = atoms.current.find((a) => a.id === b.a);
      const B = atoms.current.find((a) => a.id === b.b);
      if (!A || !B) continue;
      const ax = cx(A.x);
      const ay = cy(A.y);
      const bx = cx(B.x);
      const by = cy(B.y);
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.max(Math.hypot(dx, dy), 1e-6);
      const nx = -dy / len;
      const ny = dx / len;
      ctx.strokeStyle = "#7d8aa0";
      ctx.lineWidth = 4;
      if (b.order === 1) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      } else {
        const s = [0, 0, 7][b.order - 1] ?? 7;
        for (let k = -1; k <= 1; k += (b.order === 2 ? 2 : 1)) {
          ctx.beginPath();
          ctx.moveTo(ax + nx * s * k, ay + ny * s * k);
          ctx.lineTo(bx + nx * s * k, by + ny * s * k);
          ctx.stroke();
        }
      }
    }

    for (const a of atoms.current) {
      const px = cx(a.x);
      const py = cy(a.y);
      const r = rAtom(a.symbol);
      const col = symColor(a.symbol);
      const isSel = sel.current === a.id;
      const isHov = hover.current === a.id;

      ctx.beginPath();
      ctx.arc(px, py, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.13;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.lineWidth = isSel || (modo === "erase" && isHov) ? 3 : 2;
      ctx.strokeStyle = isSel ? "#5ce8c0" : modo === "erase" && isHov ? "#ff6b6b" : "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.stroke();

      if (a.symbol.length > 1) {
        ctx.font = "700 14px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = a.symbol === "Fe" ? "#3a3a4a" : "#081018";
        ctx.fillText(a.symbol, px, py);
      } else {
        ctx.font = "700 15px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#081018";
        ctx.fillText(a.symbol, px, py);
      }
    }
  }

  useEffect(() => {
    draw();
  });

  const round1 = (v: number) => Math.round(v * 10) / 10;
  const round2 = (v: number) => Math.round(v * 100) / 100;

  useEffect(() => {
    setResult(null);
  }, [modo]);

  return (
    <div className="page">
      <h1>Constructor de moléculas</h1>
      <p className="lead">
        Arma moléculas con el mouse y valida la estructura contra las reglas de valencia de la API.
      </p>

      <div className="modebar">
        <button className={modo === "add" ? "toolbar-btn on" : "toolbar-btn"} onClick={() => setModo("add")}>
          ● Añadir átomo
        </button>
        <button className={modo === "link" ? "toolbar-btn on" : "toolbar-btn"} onClick={() => setModo("link")}>
          ┄ Enlazar (clics ×2)
        </button>
        <button className={modo === "erase" ? "toolbar-btn on" : "toolbar-btn"} onClick={() => setModo("erase")}>
          ✕ Borrar
        </button>
        <button className={modo === "move" ? "toolbar-btn on" : "toolbar-btn"} onClick={() => setModo("move")}>
          ⇕ Arrastrar
        </button>
        <button className="tiny" onClick={clearAll} style={{ marginLeft: "auto", color: "var(--danger)" }}>
          Limpiar lienzo
        </button>
      </div>

      <div className="chemlab">
        <div className="card">
          <h3>Paleta</h3>
          <p className="small muted" style={{ margin: "0 0 10px" }}>
            Elige el elemento para el modo «Añadir».
          </p>
          <div className="paleta">
            {PALETTE.map((p) => (
              <button
                key={p.s}
                className="pal-item"
                style={palSym === p.s ? { borderColor: p.c, boxShadow: `0 0 0 2px ${p.c}` } : {}}
                onClick={() => {
                  setPalSym(p.s);
                  setModo("add");
                }}
              >
                <b style={{ color: p.c }}>{p.s}</b>
                <small>val {p.v}</small>
              </button>
            ))}
          </div>
          <hr className="hair-sep" />
          <h3>Presets</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {presets
              ? presets.map((p) => (
                  <button key={p.name} className="tiny" onClick={() => loadPreset(p)}>
                    {p.name.replace("_", " ")}
                  </button>
                ))
              : "Cargando presets…"}
          </div>
          {notes && <p className="notice" style={{ marginTop: 10 }}>{notes}</p>}
        </div>

        <div className="canvas-scroll">
          <div className="canvas-wrap">
            {modo === "link" && sel.current && (
              <span className="tt" style={{ top: 6, left: 6 }}>
                Átomo seleccionado · clic en otro para enlazar
              </span>
            )}
            <canvas
              ref={canvasRef}
              className="builder-canvas"
              width={W}
              height={H}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={() => {
                hover.current = null;
                redraw();
              }}
            />
          </div>
        </div>

        <div className="card">
          <h3>Validación</h3>
          <p className="small muted" style={{ margin: "0 0 10px" }}>
            Envía la estructura al kernel de valencias del backend.
          </p>
          <button className="primary" onClick={validate} disabled={loading || atoms.current.length === 0}>
            {loading ? "Validando…" : "Validar molécula"}
          </button>
          {result && (
            <div style={{ marginTop: 12 }}>
              <p
                className={result.valid ? "ok" : "error"}
                style={{ margin: 0, fontWeight: 600 }}
              >
                {result.valid ? "✓ " : "✗ "}
                {result.message} <span className="muted">(carga {result.total_charge > 0 ? "+" : ""}{result.total_charge})</span>
              </p>
              {result.issues.length > 0 && (
                <dl className="data-kv" style={{ marginTop: 10 }}>
                  {result.issues.map((i) => (
                    <div key={i.atom + i.msg}>
                      <dt>{i.atom}</dt>
                      <dd>{i.msg}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
          <hr className="hair-sep" />
          <p className="captions">
            Bits de uso: paleta → añadir, clic en 2 átomos → enlazar (repite para subir orden),
            doble clic en el modo Enlazar deselecciona. El enlace se valida en la API.
          </p>
        </div>
      </div>
    </div>
  );
}