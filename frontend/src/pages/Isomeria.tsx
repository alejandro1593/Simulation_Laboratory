import { useState } from "react";
import { ISOMERIA } from "../data/herramientas";

const TIPO_LABEL: Record<string, string> = {
  cadena: "Cadena",
  posicion: "Posición",
  funcion: "Función",
  geometrica: "Geométrica (cis/trans)",
  optica: "Óptica",
};

export default function Isomeria() {
  const [activo, setActivo] = useState(ISOMERIA[0].id);

  return (
    <section className="page">
      <h1>Isomería orgánica</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Moléculas con la misma fórmula molecular (o esqueleto) pero distinta estructura o disposición espacial.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
        {ISOMERIA.map((g) => (
          <button key={g.id} className={activo === g.id ? "primary" : "ghost"} onClick={() => setActivo(g.id)}>
            {TIPO_LABEL[g.tipo]}
          </button>
        ))}
      </div>

      {ISOMERIA.map((g) => {
        if (g.id !== activo) return null;
        return (
          <div key={g.id}>
            <h2 style={{ margin: "6px 0 12px" }}>{g.grupo}</h2>
            <div className={`grid-${g.moleculas.length === 2 ? 2 : 3}`}>
              {g.moleculas.map((m) => (
                <div className="card" key={m.nombre} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <h3 style={{ marginBottom: 0 }}>{m.nombre}</h3>
                  <div className="muted" style={{ fontFamily: "var(--mono)" }}>{m.formula}</div>
                  <div style={{
                    fontFamily: "var(--mono)",
                    fontSize: 14,
                    color: "var(--accent)",
                    background: "rgba(92,232,192,0.06)",
                    border: "1px solid rgba(92,232,192,0.15)",
                    borderRadius: 8,
                    padding: "9px 11px",
                    lineHeight: 1.6,
                  }}>{m.esqueleto}</div>
                  <div className="muted small">{m.nota}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="card" style={{ marginTop: 14 }}>
        <h2>¿Por qué existen los isómeros?</h2>
        <div className="grid-2">
          <div><b>Isómeros estructurales:</b> difieren en el orden en que se unen los átomos (cadena, posición, función).</div>
          <div><b>Estereoisómeros:</b> misma conectividad, distinta disposición en el espacio (cis/trans frente a dobles enlaces rígidos; enantiómeros por carbonos quirales).</div>
        </div>
      </div>
    </section>
  );
}