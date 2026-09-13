import { useMemo, useState } from "react";
import { CATEGORIAS } from "../data/elements";
import { PICTOGRAMAS_GHS } from "../data/equipo";
import { TOX_REACTIVOS, TOX_ELEMENTOS, NOTA_TOX } from "../data/toxicologia";

type Tab = "reactivos" | "elementos" | "ambos";

function PictChips({ codes }: { codes: string[] }) {
  if (codes.length === 0) return <span className="muted">—</span>;
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
      {codes.map((c) => {
        const p = PICTOGRAMAS_GHS.find((g) => g.id === c);
        return (
          <span key={c} className="gf-tag" title={p?.nombre ?? c}>
            {p?.codigo ?? c}
          </span>
        );
      })}
    </span>
  );
}

export default function Toxicologia() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("ambos");
  const [pict, setPict] = useState("todos");

  const gq = q.trim().toLowerCase();

  const filteredR = useMemo(
    () =>
      TOX_REACTIVOS.filter((r) => {
        if (gq && !r.nombre.toLowerCase().includes(gq) && !r.formula.toLowerCase().includes(gq)) return false;
        if (pict !== "todos" && !r.pictogramas.includes(pict)) return false;
        return true;
      }),
    [gq, pict],
  );

  const filteredE = useMemo(
    () =>
      TOX_ELEMENTOS.filter((el) => {
        if (gq && !el.s.toLowerCase().includes(gq) && !el.nE.toLowerCase().includes(gq) && !el.cat.toLowerCase().includes(gq)) return false;
        if (pict !== "todos" && !el.pictogramas.includes(pict)) return false;
        return true;
      }),
    [gq, pict],
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "ambos",     label: "Ambos" },
    { key: "reactivos", label: "Reactivos" },
    { key: "elementos", label: "Elementos" },
  ];

  const showR = tab === "reactivos" || tab === "ambos";
  const showE = tab === "elementos" || tab === "ambos";

  return (
    <div className="page">
      <h1>Tabla de toxicología</h1>
      <p className="lead">
        LD50, pictogramas GHS y clasificación de peligros para reactivos de laboratorio
        y los 118 elementos de la tabla periódica. Valores de referencia educativos.
      </p>

      <div className="filters">
        <input
          className="search"
          placeholder="Buscar sustancia, fórmula, símbolo o categoría…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={pict} onChange={(e) => setPict(e.target.value)}>
          <option value="todos">Todos los pictogramas</option>
          {PICTOGRAMAS_GHS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.codigo} · {p.nombre}
            </option>
          ))}
        </select>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "chip on" : "chip"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showR && (
        <section style={{ marginTop: 6 }}>
          <h2>
            Reactivos de laboratorio
            <span className="muted small" style={{ fontWeight: 400, marginLeft: 8 }}>
              {filteredR.length} de {TOX_REACTIVOS.length}
            </span>
          </h2>
          <div className="cat-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sustancia</th>
                  <th>Fórmula</th>
                  <th>Pictograma(s)</th>
                  <th>Ruta</th>
                  <th>LD50 aprox.</th>
                  <th>Peligro</th>
                </tr>
              </thead>
              <tbody>
                {filteredR.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">Sin resultados.</td>
                  </tr>
                ) : (
                  filteredR.map((r) => (
                    <tr key={r.key}>
                      <td>{r.nombre}</td>
                      <td className="mono">{r.formula}</td>
                      <td><PictChips codes={r.pictogramas} /></td>
                      <td className="small">{r.ruta}</td>
                      <td className="mono">{r.ld50}</td>
                      <td className="small">{r.peligro}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showE && (
        <section style={{ marginTop: showR ? 26 : 6 }}>
          <h2>
            Elementos químicos (118)
            <span className="muted small" style={{ fontWeight: 400, marginLeft: 8 }}>
              {filteredE.length} de {TOX_ELEMENTOS.length}
            </span>
          </h2>
          <div className="cat-table-wrap" style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Z</th>
                  <th>Símbolo</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Pictograma(s)</th>
                  <th>Ruta</th>
                  <th>Peligro</th>
                </tr>
              </thead>
              <tbody>
                {filteredE.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted">Sin resultados.</td>
                  </tr>
                ) : (
                  filteredE.map((el) => (
                    <tr key={el.z}>
                      <td className="mono">{el.z}</td>
                      <td className="mono" style={{ fontWeight: 700, color: "var(--accent)" }}>{el.s}</td>
                      <td>{el.nE}</td>
                      <td className="small">{CATEGORIAS[el.cat as keyof typeof CATEGORIAS] ?? el.cat}</td>
                      <td><PictChips codes={el.pictogramas} /></td>
                      <td className="small">{el.ruta}</td>
                      <td className="small">{el.peligro}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="captions" style={{ marginTop: 20 }}>{NOTA_TOX}</p>
    </div>
  );
}
