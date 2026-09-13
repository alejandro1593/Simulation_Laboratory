import { useState } from "react";
import { TERMO } from "../data/herramientas";

type Filtro = "todas" | "exo" | "endo" | "esp" | "noesp";

export default function Termoquimica() {
  const [f, setFiltro] = useState<Filtro>("todas");
  const list = TERMO.filter((t) => {
    if (f === "exo") return t.dH < 0;
    if (f === "endo") return t.dH > 0;
    if (f === "esp") return t.espontanea;
    if (f === "noesp") return !t.espontanea;
    return true;
  });

  return (
    <section className="page">
      <h1>Termoquímica</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        Cálculo de ΔH y ΔG para reacciones de referencia (25 °C, 1 atm). Los valores (kJ/mol) son datos de tabla publicados.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
        {([["todas", "Todas"], ["exo", "Exotérmicas"], ["endo", "Endotérmicas"], ["esp", "Espontáneas"], ["noesp", "No espontáneas"]] as [Filtro, string][]).map(([k, lbl]) => (
          <button key={k} className={f === k ? "primary" : "ghost"} onClick={() => setFiltro(k)}>{lbl}</button>
        ))}
      </div>

      <div className="grid-2">
        {list.map((t) => {
          const exo = t.dH < 0;
          const esp = t.espontanea;
          return (
            <div className="card" key={t.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <h2 style={{ marginBottom: 0 }}>{t.nombre}</h2>
                <span className={`tag ${esp ? "green" : "red"}`}>{esp ? "Espontánea" : "No espontánea"}</span>
              </div>
              <div className="muted" style={{ fontFamily: "var(--mono)" }}>{t.ecuacion}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div className="stat"><span>ΔH (kJ/mol)</span><b style={{ color: exo ? "#5ce8c0" : "#ff9aa0" }}>{exo ? "−" : "+"}{Math.abs(t.dH)}</b></div>
                <div className="stat"><span>ΔG (kJ/mol)</span><b style={{ color: esp ? "#5ce8c0" : "#f2b263" }}>{t.dG < 0 ? "−" : "+"}{Math.abs(t.dG)}</b></div>
                <div className="stat"><span>Tipo</span><b style={{ fontSize: 13 }}>{t.tipo === "exotermica" ? "Exotérmica" : t.tipo === "endotermica" ? "Endotérmica" : t.tipo === "fotosintesis" ? "Endotérmica (luz)" : "No espontánea (elect.)"}</b></div>
              </div>
              {t.condicion && <div className="notice" style={{ padding: "6px 10px" }}>Necesita: {t.condicion}</div>}
              {t.nota && <div className="muted small">{t.nota}</div>}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Para recordar</h2>
        <div className="grid-2">
          <div><b>ΔG = ΔH − T·ΔS</b><div className="muted small">Si ΔG &lt; 0 la reacción es espontánea a esa temperatura (no implica que sea rápida: cinética aparte).</div></div>
          <div><b>Exotérmica</b> (ΔH &lt; 0) libera calor; <b>endotérmica</b> (ΔH &gt; 0) lo absorbe. Una ϕ reacción endotérmica puede ser espontánea si ΔS es grande y T alta (no en estos ejemplos a 25 °C).</div>
        </div>
      </div>
    </section>
  );
}