import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

interface ElementData {
  z: number;
  s: string;
  nE?: string;
  nN?: number;
  p: number;
  g: number | null;
  b: string;
  m?: number;
  e?: number;
  st?: string;
  family: string;
  color: string;
}

export default function PeriodicTable() {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [sel, setSel] = useState<ElementData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<ElementData[]>("/academic/periodic/elements")
      .then(setElements)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar la tabla."));
  }, []);

  function cellStyle(el: ElementData) {
    const pos = (el.p - 1) * 18 + el.z - (el.p >= 6 ? 32 : 0);
    return { gridColumn: pos + 1, backgroundColor: el.color };
  }

  return (
    <section className="page">
      <h1>Tabla periódica — 118 elementos</h1>
      {error && <p className="error">{error}</p>}
      <div className="periodic" style={{ gridTemplateColumns: `repeat(18, minmax(0, 1fr))` }}>
        {elements.map((el) => (
          <button
            key={el.z}
            className="p-cell"
            style={cellStyle(el)}
            onClick={() => setSel(el)}
            title={`${el.s} · ${el.family}`}
          >
            <span className="p-num">{el.z}</span>
            <span className="p-sym">{el.s}</span>
          </button>
        ))}
      </div>
      {sel && (
        <div className="card element-card">
          <h2>
            {sel.s} <span className="muted">(Z = {sel.z})</span>
          </h2>
          <table className="table">
            <tbody>
              <tr>
                <td>Nombre</td>
                <td>{sel.nE}</td>
              </tr>
              <tr>
                <td>Familia</td>
                <td>{sel.family}</td>
              </tr>
              <tr>
                <td>Periodo / grupo</td>
                <td>
                  {sel.p} / {sel.g ?? "—"}
                </td>
              </tr>
              <tr>
                <td>Masa atómica</td>
                <td>{sel.m ?? "—"} u</td>
              </tr>
              <tr>
                <td>Electronegatividad</td>
                <td>{sel.e ?? "—"}</td>
              </tr>
              <tr>
                <td>Configuración electrónica</td>
                <td>{sel.nN ?? "—"}</td>
              </tr>
              <tr>
                <td>Estado (25 °C)</td>
                <td>{sel.st ?? "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}