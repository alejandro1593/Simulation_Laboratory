import { useEffect, useMemo, useState } from "react";
import { CATEGORIAS, ELEMENTS, estado_en } from "../data/elements";
import type { ElementRow, Categoría } from "../data/elements";
import ShellDiagram, { poblacionDesdeConfig } from "../components/ShellDiagram";
import { ISOTOPOS, USOS } from "../data/herramientas";

const CAT_KEYS: Categoría[] = [
  "noble",
  "alcalino",
  "alcalinoterreo",
  "transicion",
  "postransicion",
  "metaloide",
  "nometal",
  "halogeno",
  "lantanido",
  "actinido",
];

type Modo = "ninguna" | "estado" | "tipo" | "electroneg" | "densidad";

interface Tip {
  el: ElementRow;
  x: number;
  y: number;
}

const ES_TIPO: Record<Categoría, string> = {
  noble: "No metal",
  alcalino: "Metal",
  alcalinoterreo: "Metal",
  transicion: "Metal",
  postransicion: "Metal",
  metaloide: "Semimetal",
  nometal: "No metal",
  halogeno: "No metal",
  lantanido: "Metal",
  actinido: "Metal",
};

function esMetal(cat: Categoría) {
  return ES_TIPO[cat] === "Metal";
}
function esNoMetal(cat: Categoría) {
  return ES_TIPO[cat] === "No metal";
}

const NUM_BOUNDS = (() => {
  const pick = (f: (e: ElementRow) => number | null): [number, number] => {
    const vals = ELEMENTS.map(f).filter((v): v is number => v != null);
    return [Math.min(...vals), Math.max(...vals)];
  };
  return {
    masa: pick((e) => e.m),
    electroneg: pick((e) => e.e),
    fusion: pick((e) => e.mp),
    densidad: pick((e) => e.den),
  };
})();

type NumFilt = keyof typeof NUM_BOUNDS;

function tableCol(e: ElementRow): number {
  if (e.g != null) return e.g;
  return 3 + (e.z - (e.p === 6 ? 57 : 89));
}

export default function PeriodicTable() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Categoría | null>(null);
  const [modo, setModo] = useState<Modo>("ninguna");
  const [sel, setSel] = useState<ElementRow | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [rngOn, setRngOn] = useState(false);
  const [rango, setRango] = useState<Record<NumFilt, [number, number]>>({
    masa: [...NUM_BOUNDS.masa],
    electroneg: [...NUM_BOUNDS.electroneg],
    fusion: [...NUM_BOUNDS.fusion],
    densidad: [...NUM_BOUNDS.densidad],
  });

  const setRangoDe = (k: NumFilt, par: 0 | 1, v: number) =>
    setRango((prev) => {
      const cur = prev[k];
      const next: [number, number] = par === 0 ? [Math.min(v, cur[1]), cur[1]] : [cur[0], Math.max(v, cur[0])];
      return { ...prev, [k]: next };
    });

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const checked = useMemo(() => {
    const gq = q.trim().toLowerCase();
    return (e: ElementRow) => {
      if (!gq) return true;
      return (
        e.s.toLowerCase() === gq ||
        e.nE.toLowerCase().includes(gq) ||
        e.nN.toLowerCase().includes(gq) ||
        String(e.z) === gq
      );
    };
  }, [q]);

  const oculto = (e: ElementRow) => {
    if (cat && e.cat !== cat) return true;
    return !checked(e);
  };

  const dim = (e: ElementRow) => {
    if (oculto(e)) return true;
    if (rngOn) {
      const activo = (k: NumFilt) => rango[k][0] > NUM_BOUNDS[k][0] || rango[k][1] < NUM_BOUNDS[k][1];
      const [mlo, mhi] = rango.masa;
      const [elo, ehi] = rango.electroneg;
      const [flo, fhi] = rango.fusion;
      const [dlo, dhi] = rango.densidad;
      if (activo("masa") && (e.m < mlo || e.m > mhi)) return true;
      if (activo("electroneg") && (e.e == null || e.e < elo || e.e > ehi)) return true;
      if (activo("fusion") && (e.mp == null || e.mp < flo || e.mp > fhi)) return true;
      if (activo("densidad") && (e.den == null || e.den < dlo || e.den > dhi)) return true;
    }
    if (modo === "estado") return false;
    if (modo === "tipo") return false;
    if (modo === "electroneg") return e.e == null;
    if (modo === "densidad") return e.den == null;
    return false;
  };

  const estiloModo = (e: ElementRow): React.CSSProperties => {
    if (oculto(e)) return {};
    if (modo === "estado") {
      const map: Record<string, string> = { S: "#5ce8c0", L: "#7aa2ff", G: "#f2b263" };
      return { boxShadow: `inset 0 0 0 2px ${map[e.st] ?? "transparent"}` };
    }
    if (modo === "tipo") {
      const c = esNoMetal(e.cat) ? "#f2b263" : esMetal(e.cat) ? "#5ce8c0" : "#b08ce8";
      return { boxShadow: `inset 0 0 0 2px ${c}` };
    }
    if (modo === "electroneg" && e.e != null) {
      const t = (e.e - 0.7) / (3.98 - 0.7);
      const h = 160 - t * 140;
      return {
        boxShadow: `inset 0 0 22px ${`hsl(${h} 60% 52% / 0.8)`}`,
        borderColor: `hsl(${h} 70% 55%)`,
      };
    }
    if (modo === "densidad" && e.den != null) {
      const logMin = -4;
      const logMax = 1.4;
      const t = Math.max(0, Math.min(1, (Math.log10(Math.max(e.den, 1e-6)) - logMin) / (logMax - logMin)));
      const h = 240 - t * 240;
      return {
        boxShadow: `inset 0 0 20px hsl(${h} 55% 55% / 0.75)`,
        borderColor: `hsl(${h} 65% 60%)`,
      };
    }
    return {};
  };

  const gc = (e: ElementRow) => tableCol(e) + 1;
  const gr = (e: ElementRow) => {
    if (e.g != null) return e.p + 1;
    return e.p === 6 ? 10 : 11;
  };
  const sep = (col: number) => [4, 14].includes(col) ? " sep" : "";

  const cell = (e: ElementRow, extraStyle?: React.CSSProperties) => (
    <button
      key={e.s}
      className={`p-cell c-${e.cat} ${dim(e) ? "dim" : ""}${sep(gc(e))}`}
      style={{ gridColumn: gc(e), gridRow: gr(e), ...extraStyle, ...estiloModo(e) }}
      title={`${e.nE} (${e.s}) · Z=${e.z}`}
      onClick={() => setSel(e)}
      onMouseEnter={(ev) => {
        const r = ev.currentTarget.getBoundingClientRect();
        setTip({ el: e, x: r.left, y: r.top });
      }}
      onMouseLeave={() => setTip(null)}
    >
      <span className="p-num">{e.z}</span>
      <span className="p-sym">{e.s}</span>
    </button>
  );

  return (
    <div className="page">
      <h1>Tabla periódica</h1>
      <p className="lead">Los 118 elementos confirmados, ordenados por número atómico. Haz clic en cualquier casilla para abrir su ficha.</p>

      <div className="filters">
        <input
          className="search"
          placeholder="Buscar (H, Hierro, iron, 26)…"
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
        />
        <button className={modo === "ninguna" ? "chip on" : "chip"} onClick={() => setModo("ninguna")}>
          Normal
        </button>
        <button className={modo === "estado" ? "chip on" : "chip"} onClick={() => setModo("estado")}>
          Estado a 20 °C
        </button>
        <button className={modo === "tipo" ? "chip on" : "chip"} onClick={() => setModo("tipo")}>
          Metal / no metal
        </button>
        <button className={modo === "electroneg" ? "chip on" : "chip"} onClick={() => setModo("electroneg")}>
          Electronegatividad
        </button>
        <button className={modo === "densidad" ? "chip on" : "chip"} onClick={() => setModo("densidad")}>
          Densidad
        </button>
      </div>

      <div className="filters">
        {CAT_KEYS.map((k) => (
          <button
            key={k}
            className={cat === k ? "chip on" : "chip"}
            onClick={() => setCat(cat === k ? null : k)}
          >
            {CATEGORIAS[k]}
          </button>
        ))}
        {cat && (
          <button className="tiny" onClick={() => setCat(null)}>
            Limpiar filtros
          </button>
        )}
        <button
          className={rngOn ? "chip on" : "chip"}
          onClick={() => setRngOn((v) => !v)}
          aria-pressed={rngOn}
        >
          Filtros numéricos {rngOn ? "✓" : ""}
        </button>
      </div>

      {rngOn && (
        <div className="panel numfilt" style={{ margin: "-4px 0 18px", padding: "12px 14px" }}>
          {(
            [
              ["masa", "Masa atómica", "u", 0.1],
              ["electroneg", "Electronegatividad", "", 0.01],
              ["fusion", "Pto. de fusión", "°C", 1],
              ["densidad", "Densidad", "g/cm³", 0.01],
            ] as [NumFilt, string, string, number][]
          ).map(([k, label, unidad, step]) => {
            const [lo, hi] = rango[k];
            return (
              <div key={k} className="numfilt-row">
                <span className="nf-label small">{label}</span>
                <span className="nf-readout mono small">
                  {k === "masa" || k === "fusion" ? lo.toFixed(0) : lo.toFixed(2)}–{k === "masa" || k === "fusion" ? hi.toFixed(0) : hi.toFixed(2)} {unidad}
                </span>
                <div className="nf-range">
                  <input
                    type="range"
                    min={NUM_BOUNDS[k][0]}
                    max={NUM_BOUNDS[k][1]}
                    step={step}
                    value={lo}
                    onChange={(ev) => setRangoDe(k, 0, Number(ev.target.value))}
                    aria-label={`Mínimo de ${label}`}
                  />
                  <input
                    type="range"
                    min={NUM_BOUNDS[k][0]}
                    max={NUM_BOUNDS[k][1]}
                    step={step}
                    value={hi}
                    onChange={(ev) => setRangoDe(k, 1, Number(ev.target.value))}
                    aria-label={`Máximo de ${label}`}
                  />
                </div>
              </div>
            );
          })}
          <div className="numfilt-row" style={{ marginTop: 2 }}>
            <span className="nf-label small muted visibles">{ELEMENTS.filter((e) => !dim(e)).length} de {ELEMENTS.length} elementos visibles</span>
            <button
              className="tiny"
              onClick={() => {
                setRango({ masa: [...NUM_BOUNDS.masa], electroneg: [...NUM_BOUNDS.electroneg], fusion: [...NUM_BOUNDS.fusion], densidad: [...NUM_BOUNDS.densidad] });
                setRngOn(false);
              }}
            >
              Quitar filtros numéricos
            </button>
          </div>
        </div>
      )}

      <div className="periodic-wrap panel">
        <div className="periodic">
          <div className="p-corner" style={{ gridColumn: 1, gridRow: 1 }}>P</div>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={`per${i + 1}`} className="p-period" style={{ gridColumn: 1, gridRow: i + 2 }}>
              {i + 1}
            </div>
          ))}
          {Array.from({ length: 18 }, (_, i) => {
            const g = i + 1;
            const col = g + 1;
            return (
              <div key={`h${g}`} className={`p-hdr${[4, 14].includes(col) ? " sep" : ""}`} style={{ gridColumn: col, gridRow: 1 }}>
                {g}
              </div>
            );
          })}
          <div className="p-period" style={{ gridColumn: 1, gridRow: 10 }}>
            Ln
          </div>
          <div className="p-period" style={{ gridColumn: 1, gridRow: 11 }}>
            An
          </div>
          <div className="p-ln-sep" style={{ gridColumn: "1 / -1", gridRow: 9 }}></div>
          {ELEMENTS.map((e) => cell(e))}
        </div>

        <div className="legend">
          {(Object.keys(CATEGORIAS) as Categoría[]).map((k) => (
            <span key={k}>
              <i className={`c-${k}`} /> {CATEGORIAS[k]}
            </span>
          ))}
        </div>

        <p className="captions" style={{ marginTop: 12 }}>
          Forma clásica: los 118 elementos, los lantánidos (57–71) y actínidos (89–103) aparecen en
          filas separadas bajo el bloque principal. Grupo = columna; período = fila.
        </p>
      </div>

      {sel && <Ficha el={sel} onClose={() => setSel(null)} />}

      {tip && (
        <div
          className="p-tip"
          role="tooltip"
          style={{ left: tip.x, top: tip.y }}
        >
          <div className="p-tip-name">{tip.el.nE} ({tip.el.s})</div>
          <div className="p-tip-row"><span>Z</span><b>{tip.el.z}</b></div>
          <div className="p-tip-row"><span>Masa</span><b>{tip.el.m} u</b></div>
          <div className="p-tip-row"><span>Estado 20 °C</span><b>{estado_en(tip.el.st)}</b></div>
          <div className="p-tip-row"><span>Electroneg.</span><b>{tip.el.e != null ? tip.el.e.toFixed(2).replace(".", ",") : "—"}</b></div>
          <div className="p-tip-row"><span>Clasificación</span><b>{CATEGORIAS[tip.el.cat]}</b></div>
          {modo === "densidad" && tip.el.den != null && (
            <div className="p-tip-row"><span>Densidad</span><b>{tip.el.den < 0.01 ? `${(tip.el.den * 1000).toFixed(2)} g/L` : `${tip.el.den.toFixed(2)} g/cm³`}</b></div>
          )}
        </div>
      )}
    </div>
  );
}

function Ficha({ el, onClose }: { el: ElementRow; onClose: () => void }) {
  const shells = poblacionDesdeConfig(el.cfg);
  const fmt = (v: number | null | undefined, suf = "") =>
    v == null ? "—" : `${v.toLocaleString("es")}${suf}`;

  function descargar() {
    const txt = [
      "FICHA DE ELEMENTO · MOLCORE LAB",
      "--------------------------------",
      `${el.s} — ${el.nE} (${el.nN})`,
      `Número atómico: ${el.z}`,
      `Masa: ${el.m} u`,
      `Clasificación: ${CATEGORIAS[el.cat]}`,
      `Estado a 20 °C: ${estado_en(el.st)}`,
      `Configuración: ${el.cfg}`,
      `Periodo / grupo: ${el.p} / ${el.g ?? "— (f)"}`,
      `Electronegatividad: ${el.e != null ? el.e.toFixed(2).replace(".", ",") : "—"}`,
      `Estados de oxidación: ${el.ox}`,
      `Punto de fusión: ${fmt(el.mp, " °C")}`,
      `Punto de ebullición: ${fmt(el.bp, " °C")}`,
      el.den != null
        ? `Densidad: ${el.den < 0.01 ? fmt(el.den * 1000, " g/L") : fmt(el.den, " g/cm³")}`
        : "Densidad: —",
      `Descubrimiento: ${el.dis}`,
      ISOTOPOS[el.z] ? `Isótopos naturales: ${ISOTOPOS[el.z]}` : "",
      USOS[el.z] ? `Usos: ${USOS[el.z]}` : "",
      "--------------------------------",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha-${el.s.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="el-head">
          <div className={`el-symbol-box c-${el.cat}`}>
            <span className={`p-sym c-${el.cat}-txt`} style={{ fontSize: 34 }}>
              {el.s}
            </span>
          </div>
          <div className="el-title">
            <h2>{el.nE}</h2>
            <div className="el-sub">
              {el.nN} · Z = {el.z} · {CATEGORIAS[el.cat]}
            </div>
            <div className="row" style={{ marginTop: 6 }}>
              <span className="zone-tag">M ≈ {fmt(el.m)} u</span>
              <span className="zone-tag" style={{ borderColor: "rgba(122,162,255,0.35)", color: "var(--accent-2)" }}>
                {estado_en(el.st)} a 20 °C
              </span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Cerrar" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="el-grid">
          <div>
            <h3>Propiedades</h3>
            <dl className="data-kv" style={{ marginTop: 8 }}>
              <dt>Config. electrónica</dt>
              <dd className="mono">{el.cfg}</dd>
              <dt>Periodo / grupo</dt>
              <dd className="mono">
                {el.p} / {el.g ?? "— (f)"}
              </dd>
              <dt>Bloque</dt>
              <dd className="mono">{el.b}</dd>
              <dt>Electronegatividad</dt>
              <dd className="mono">{el.e != null ? el.e.toFixed(2).replace(".", ",") : "—"}</dd>
              <dt>Estados de oxidación</dt>
              <dd title="Estados de oxidación más habituales">
                <span className="ox-tags" style={{ textTransform: "none" }}>
                  {el.ox.split(",").map((o) => (
                    <span key={o} className="ox-tag">
                      {o.trim()}
                    </span>
                  ))}
                </span>
              </dd>
              <dt>Pto. fusión</dt>
              <dd className="mono">{fmt(el.mp, " °C")}</dd>
              <dt>Pto. ebullición</dt>
              <dd className="mono">{fmt(el.bp, " °C")}</dd>
              <dt>Densidad</dt>
              <dd className="mono">
                {el.den != null ? (el.den < 0.01 ? fmt(el.den * 1000, " g/L") : fmt(el.den, " g/cm³")) : "—"}
              </dd>
              <dt>Descubrimiento</dt>
              <dd>{el.dis}</dd>
            </dl>

            {ISOTOPOS[el.z] && (
              <>
                <h3 style={{ marginTop: 18 }}>Isótopos</h3>
                <p className="muted small">{ISOTOPOS[el.z]}</p>
              </>
            )}
            {USOS[el.z] && (
              <>
                <h3 style={{ marginTop: 18 }}>Usos</h3>
                <p className="muted small">{USOS[el.z]}</p>
              </>
            )}
            <button className="primary" onClick={descargar} style={{ marginTop: 16 }} aria-label="Descargar ficha">
              ⬇ Descargar ficha (.txt)
            </button>
          </div>
          <div>
            <h3>Modelo de capas</h3>
            <div className="shells">
              <ShellDiagram shells={shells} />
            </div>
            <p className="captions" style={{ textAlign: "center", marginTop: 2 }}>
              {shells.length} capas · {shells.join(" – ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}