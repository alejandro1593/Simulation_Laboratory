import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATALOGO_INORGANICO, SISTEMAS, buscarInorganico } from "../data/inorganic";

export default function InorganicCatalog() {
  const [q, setQ] = useState("");
  const [familiaSel, setFamiliaSel] = useState<string | null>(null);
  const gq = q.trim().toLowerCase();

  const coincidencias = useMemo(() => buscarInorganico(q), [q]);
  const buscando = gq.length > 0;
  const familias = useMemo(() => {
    if (buscando) {
      const ids = new Set(coincidencias.map((c) => c.familia.id));
      return CATALOGO_INORGANICO.filter((f) => (familiaSel ? f.id === familiaSel : true) && ids.has(f.id));
    }
    return CATALOGO_INORGANICO.filter((f) => (familiaSel ? f.id === familiaSel : true));
  }, [buscando, coincidencias, familiaSel]);

  return (
    <div className="page">
      <h1>Catálogo inorgánico</h1>
      <p className="lead">
        Compuestos reales con sus tres nomenclaturas: sistemática (IUPAC), Stock y tradicional.
        Ninguna especie inventada: solo compuestos estables.
      </p>

      <div className="grid-3" style={{ margin: "0 0 20px" }}>
        {SISTEMAS.map((s) => (
          <div className="card" key={s.nombre}>
            <h3>{s.nombre}</h3>
            <p className="small muted" style={{ margin: "6px 0 0" }}>{s.d}</p>
          </div>
        ))}
      </div>

      <div className="filters">
        <Link className="chip" to="/catalogo/inorganico/nombralo" style={{ textDecoration: "none" }}>
          🧂 Nómbralo
        </Link>
        <input
          className="search"
          placeholder="Buscar compuesto o nomenclatura (óxido férrico, CO₂, permanganato…)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={familiaSel ?? ""} onChange={(e) => setFamiliaSel(e.target.value || null)}>
          <option value="">Todas las familias</option>
          {CATALOGO_INORGANICO.map((f) => (
            <option key={f.id} value={f.id}>
              {f.titulo}
            </option>
          ))}
        </select>
        {buscando && (
          <span className="small muted">
            {coincidencias.length} resultado{coincidencias.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {familias.length === 0 && <p className="notice">Sin resultados. Prueba con otra fórmula o nombre.</p>}

      {familias.map((fam) => {
        const filas = buscando ? coincidencias.filter((c) => c.familia.id === fam.id).map((c) => c.fila) : fam.filas;
        if (filas.length === 0) return null;
        return (
          <div className="cat-familia" key={fam.id}>
            <div className="cat-head">
              <span className="cat-badge">{fam.img}</span>
              <div>
                <h3 style={{ margin: 0 }}>{fam.titulo}</h3>
                <p className="small muted" style={{ margin: "4px 0 0", maxWidth: "80ch" }}>{fam.intro}</p>
              </div>
            </div>
            {fam.nota && <p className="notice" style={{ margin: "8px 0" }}>{fam.nota}</p>}
            <div className="cat-table-wrap">
              <table className="cat-table">
                <thead>
                  <tr>
                    {fam.cols.map((c) => (
                      <th key={c.k}>
                        {c.label}
                        <span className="hint-col">{c.hint}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, i) => (
                    <tr key={i}>
                      {fam.cols.map((c) => (
                        <td key={c.k} className={c.k === "f" ? "f-f" : ""}>
                          {fila[c.k] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}