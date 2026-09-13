import { useState } from "react";
import { EQUIPO_LABORATORIO, PICTOGRAMAS_GHS } from "../data/equipo";
import InstrumentSVG from "../components/InstrumentSVG";

export default function Ensayos() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("todas");
  const gq = q.trim().toLowerCase();

  const visible = EQUIPO_LABORATORIO.filter(
    (c) => cat === "todas" || c.id === cat
  ).map((c) => ({
    cat: c,
    items: c.items.filter(
      (it) =>
        !gq ||
        it.n.toLowerCase().includes(gq) ||
        it.en.toLowerCase().includes(gq) ||
        it.uso.toLowerCase().includes(gq)
    ),
  }));

  return (
    <div className="page">
      <h1>Ensayos de laboratorio</h1>
      <p className="lead">
        Guía del instrumental de un laboratorio químico real: cristalería, equipos
        de medición y calentamiento, sistemas de separación, soportes y seguridad.
      </p>

      <div className="filters">
        <input
          className="search"
          placeholder="Buscar instrumento (bureta, mufla, pH-metro, campana…)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="todas">Todas las categorías</option>
          {EQUIPO_LABORATORIO.map((c) => (
            <option key={c.id} value={c.id}>
              {c.ico} {c.titulo} ({c.items.length})
            </option>
          ))}
        </select>
      </div>

      {visible.map(({ cat, items }) => (
        <section key={cat.id} style={{ marginTop: 26 }}>
          <h2
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span>{cat.ico}</span> {cat.titulo}
            <span className="muted small" style={{ fontWeight: 400 }}>
              · {items.length} instrumentos
            </span>
          </h2>
          <p className="lead" style={{ marginBottom: 14 }}>
            {cat.intro}
          </p>
          {items.length === 0 ? (
            <p className="notice">Sin instrumentos que coincidan en esta categoría.</p>
          ) : (
            <div className="grid-3">
              {items.map((it) => (
                <div className="card" key={it.n} style={{ margin: 0 }}>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: 8 }}>
                    <InstrumentSVG kind={it.svg} size={80} />
                  </div>
                  <h3 style={{ marginBottom: 2 }}>
                    {it.n} <span className="muted small">{it.en}</span>
                  </h3>
                  <p className="small" style={{ margin: "8px 0 0" }}>
                    {it.uso}
                  </p>
                  {it.riesgo && (
                    <span className="risk-tag" style={{ display: "inline-block", marginTop: 10, fontSize: 12 }}>
                      {it.riesgo}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      <hr className="hair-sep" />
      <h2>Pictogramas de seguridad GHS</h2>
      <p className="lead" style={{ marginBottom: 14 }}>
        Sistema Globalmente Armonizado de clasificación y etiquetado de productos químicos (Naciones Unidas).
        Cada envase real lleva los pictogramas que corresponden a sus riesgos.
      </p>
      <div className="cat-table-wrap" style={{ maxWidth: 760 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Pictograma</th>
              <th>Significado</th>
            </tr>
          </thead>
          <tbody>
            {PICTOGRAMAS_GHS.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.codigo}</td>
                <td>{p.nombre}</td>
                <td className="small muted">{p.sentido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="captions">
        En el simulador los riesgos aparecen como avisos textuales; en un laboratorio
        real los pictogramas y el equipo de protección son obligatorios.
      </p>
    </div>
  );
}