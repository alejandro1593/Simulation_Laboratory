import { useState } from "react";
import { Link } from "react-router-dom";
import {
  COMPUESTOS_INTERES,
  COMPUESTOS_INTERES_NOTE,
  GHS_ORGANICOS,
  GRUPOS_FUNCIONALES,
  PRIORIDADES_GRUPOS,
  SERIES_HOMOLOGAS,
} from "../data/organic";
import SkeletalFormula from "../components/SkeletalFormula";
import GhsPictos from "../components/GhsPictos";
import Mol3D from "../components/Mol3D";
import Formula2D from "../components/Formula2D";

export default function OrganicCatalog() {
  const [q, setQ] = useState("");
  const [gid, setGid] = useState<string | null>(null);
  const [cmpOn, setCmpOn] = useState(false);
  const [cmp, setCmp] = useState<string[]>([]);
  const gq = q.trim().toLowerCase();

  type ModalState =
    | { kind: "grupo"; gid: string; eIdx: number }
    | { kind: "compuesto"; cid: string }
    | null;

  const [modal, setModal] = useState<ModalState>(null);

  const grupos = GRUPOS_FUNCIONALES.filter((g) => {
    if (gid && g.id !== gid) return false;
    if (!gq) return true;
    return (
      g.nombre.toLowerCase().includes(gq) ||
      g.formula.toLowerCase().includes(gq) ||
      g.sufijo.includes(gq) ||
      g.prefijo.toLowerCase().includes(gq) ||
      g.ejemplos.some((e) => e.nombre.toLowerCase().includes(gq) || e.iupac.toLowerCase().includes(gq) || e.comun.toLowerCase().includes(gq))
    );
  });

  const compuestos = COMPUESTOS_INTERES.filter(
    (c) =>
      !gq ||
      c.nombre.toLowerCase().includes(gq) ||
      c.iupac.toLowerCase().includes(gq) ||
      c.formula.toLowerCase().includes(gq) ||
      c.gf.toLowerCase().includes(gq) ||
      c.fuente.toLowerCase().includes(gq) ||
      c.uso.toLowerCase().includes(gq)
  );

  const cmpToggle = (id: string) => {
    setCmp((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const cmpItems = cmp.map((id) => COMPUESTOS_INTERES.find((c) => c.id === id)).filter((c): c is (typeof COMPUESTOS_INTERES)[number] => Boolean(c));
  const cmpRows: [string, (c: (typeof COMPUESTOS_INTERES)[number]) => string][] = [
    ["Fórmula", (c) => c.formula],
    ["Masa molar", (c) => `${c.masa} g/mol`],
    ["Tipo", (c) => c.gf],
    ["Fuente", (c) => c.fuente],
    ["Uso", (c) => c.uso],
    ["Riesgo", (c) => c.riesgo || "Uso cotidiano habitual"],
  ];

  return (
    <div className="page">
      <h1>Catálogo orgánico</h1>
      <p className="lead">
        Grupos funcionales con su fórmula general, sufijos/prefijos IUPAC y una estructura real
        dibujada para cada ejemplo. El grupo funcional se resalta en verde menta.
      </p>

      <div className="filters">
        <Link className="chip on" to="/catalogo/organico/aprender" style={{ textDecoration: "none" }}>
          ✏️ Aprende a nombrar
        </Link>
        <Link className="chip" to="/catalogo/organico/nombralo" style={{ textDecoration: "none" }}>
          🧬 Nómbralo
        </Link>
        <button className="chip" onClick={() => window.print()}>🖨 Imprimir fichas</button>
        <input
          className="search"
          placeholder="Buscar grupo o molécula (etanol, cetona, –OH, aldehído…)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={gid ?? ""} onChange={(e) => setGid(e.target.value || null)}>
          <option value="">Todos los grupos</option>
          {GRUPOS_FUNCIONALES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre} ({g.sufijo})
            </option>
          ))}
        </select>
        <button
          className={`chip ${cmpOn ? "on" : ""}`}
          onClick={() => setCmpOn((v) => !v)}
          style={{ cursor: "pointer" }}
          aria-pressed={cmpOn}
        >
          ⚖ Comparar
        </button>
      </div>

      {cmpOn && (
        <div className="panel cmp-panel" style={{ margin: "0 0 4px" }}>
          <div className="row">
            <span className="small muted">⚖ Selecciona hasta <b>3</b> compuestos para comparar</span>
            {cmp.length > 0 && (
              <button className="tiny" onClick={() => setCmp([])}>Limpiar</button>
            )}
          </div>
          {cmpItems.length > 0 && (
            <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
              {cmpItems.map((c) => (
                <span key={c.id} className="chip" style={{ borderColor: "var(--accent)" }}>
                  {c.nombre} <button className="tiny" style={{ marginLeft: 6 }} onClick={() => cmpToggle(c.id)} title="Quitar">✕</button>
                </span>
              ))}
              <span className="faint small">{cmpItems.length}/3 seleccionados</span>
            </div>
          )}

          {cmpItems.length >= 2 && (
            <div className="cmp-table-wrap" style={{ marginTop: 12, overflowX: "auto" }}>
              <table className="table cmp-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    {cmpItems.map((c) => (
                      <th key={c.id} className="mono">{c.nombre}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cmpRows.map(([label, fn]) => (
                    <tr key={label}>
                      <td className="muted small">{label}</td>
                      {cmpItems.map((c) => (
                        <td key={c.id} className="small">{fn(c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cmpItems.length === 1 && (
            <p className="captions" style={{ marginTop: 8 }}>Agrega al menos un segundo compuesto para ver la tabla comparativa.</p>
          )}
        </div>
      )}

      <div className="org-grid" style={{ marginTop: 8 }}>
        {grupos.map((g) => (
          <div
            className="org-card"
            key={g.id}
            style={{ cursor: "pointer" }}
            tabIndex={0}
            role="button"
            onClick={() => setModal({ kind: "grupo", gid: g.id, eIdx: 0 })}
            onKeyDown={(e) => e.key === "Enter" && setModal({ kind: "grupo", gid: g.id, eIdx: 0 })}
          >
            <h3>
              {g.nombre} <span className="gf-tag">{g.formula}</span>
            </h3>
            <p className="small muted" style={{ margin: "4px 0 0" }}>{g.grupo}</p>
            <div className="molbox molbox--big" style={{ margin: "12px 0 0" }}>
              <SkeletalFormula mol={g.ejemplos[0].mol} width={300} height={170} />
            </div>
            <div className="small" style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <div>
                <span className="hint-col" style={{ display: "block" }}>Nomenclatura</span>
                <span className="mono" style={{ fontSize: 13 }}>sufijo {g.sufijo} · prefijo {g.prefijo}</span>
              </div>
              {g.ejemplos.map((e) => (
                <div key={e.nombre}>
                  <span className="hint-col" style={{ display: "block" }}>Ejemplo: {e.nombre}</span>
                  <span style={{ fontSize: 13 }}>
                    <b>{e.iupac}</b> <span className="faint">· {e.comun}</span>
                  </span>
                </div>
              ))}
              <p className="captions" style={{ margin: 0 }}>{g.reglas}</p>
            </div>
          </div>
        ))}
      </div>

      {grupos.length === 0 && <p className="notice">Sin resultados en el catálogo orgánico.</p>}

      <hr className="hair-sep" style={{ marginTop: 34 }} />
      <h2>Series homólogas</h2>
      <p className="lead" style={{ marginBottom: 16 }}>
        Cadenas que comparten grupo funcional y difieren en –CH₂–, con la misma fórmula general.
        Fíjate en la tabla: los datos físicos las clasificaron históricamente.
      </p>
      <div className="grid-3">
        {SERIES_HOMOLOGAS.map((ser) => (
          <div className="card" key={ser.nombre}>
            <h3 className="mono" style={{ fontSize: 13 }}>{ser.nombre}</h3>
            <div className="cat-table-wrap" style={{ marginTop: 8 }}>
              <table className="table serie-table">
                <thead>
                  <tr>
                    <th>n</th>
                    <th>Nombre</th>
                    <th>Fórmula</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {ser.filas.map((f) => (
                    <tr key={f[0] as number}>
                      <td>{f[0]}</td>
                      <td>{f[1]}</td>
                      <td>{f[2]}</td>
                      <td className="muted small">{f[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <hr className="hair-sep" />
      <h2>Orden de prioridad de grupos funcionales</h2>
      <p className="lead" style={{ marginBottom: 12 }}>
        Determina qué grupo manda en el nombre y cuáles van como sufijo/prefijo.
      </p>
      <div className="cat-table-wrap" style={{ maxWidth: 460 }}>
        <table className="table">
          <tbody>
            {PRIORIDADES_GRUPOS.map((p) => (
              <tr key={p}>
                <td className="mono" style={{ fontSize: 13 }}>{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="hair-sep" />
      <h2>Compuestos de interés cotidiano</h2>
      <p className="lead" style={{ marginBottom: 12 }}>
        Fórmulas, masas molares reales, estructura esqueletal 2D y modelo 3D de moléculas que
        encontramos cada día. La estructura se dibuja solo a partir de conectividad verificada
        (SMILES curado); los carbonos quedan implícitos como en la notación esqueletal.
      </p>

      {compuestos.length === 0 ? (
        <p className="notice">Sin compuestos que coincidan con la búsqueda.</p>
      ) : (
        <div className="org-grid" style={{ marginTop: 12 }}>
          {compuestos.map((c) => (
            <div
              className="org-card"
              key={c.id}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              role="button"
              onClick={() => setModal({ kind: "compuesto", cid: c.id })}
              onKeyDown={(e) => e.key === "Enter" && setModal({ kind: "compuesto", cid: c.id })}
            >
              {cmpOn && (
                <button
                  className={`tiny cmp-add ${cmp.includes(c.id) ? "on" : ""}`}
                  style={{ position: "absolute", top: 8, right: 8, display: "grid", placeItems: "center" }}
                  onClick={(e) => { e.stopPropagation(); cmpToggle(c.id); }}
                  disabled={cmp.length >= 3 && !cmp.includes(c.id)}
                  title={cmp.includes(c.id) ? "Quitar del comparador" : cmp.length >= 3 ? "Límite de 3 alcanzado" : "Agregar al comparador"}
                  aria-label={`Comparar ${c.nombre}`}
                >
                  {cmp.includes(c.id) ? "✕" : "⚖"}
                </button>
              )}
              <h3>
                {c.nombre} <span className="gf-tag">{c.formula}</span>
              </h3>
              <p className="small muted" style={{ margin: "4px 0 0" }}>{c.iupac}</p>
              <p className="mono small" style={{ margin: "10px 0 0" }}>
                M ≈ {c.masa} g/mol · {c.gf}
              </p>
              {c.smiles ? (
                <div className="molbox" style={{ margin: "10px 0 0" }}>
                  <Formula2D smiles={c.smiles} width={280} height={150} />
                </div>
              ) : (
                <p className="captions" style={{ margin: "10px 0 0" }}>
                  Estructura esqueletal no disponible: conectividad no verificada para dibujo 2D.
                </p>
              )}
              <div className="small" style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <div>
                  <span className="hint-col" style={{ display: "block" }}>Fuente</span>
                  <span style={{ fontSize: 13 }}>{c.fuente}</span>
                </div>
                <div>
                  <span className="hint-col" style={{ display: "block" }}>Uso</span>
                  <span style={{ fontSize: 13 }}>{c.uso}</span>
                </div>
                {c.riesgo ? (
                  <span className="risk-tag" style={{ fontSize: 12 }}>{c.riesgo}</span>
                ) : (
                  <span className="ok-tag small">Uso cotidiano habitual</span>
                )}
                {GHS_ORGANICOS[c.id] && (
                  <div className="row" style={{ gap: 6 }}>
                    <span className="hint-col">Pictogramas GHS</span>
                    <GhsPictos codes={GHS_ORGANICOS[c.id]} size={26} />
                  </div>
                )}
                {c.nota && <p className="captions" style={{ margin: 0 }}>{c.nota}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="captions">ℹ {COMPUESTOS_INTERES_NOTE}</p>

      <div className="print-sheet" aria-hidden="true">
        <h2>Catálogo orgánico · grupos funcionales (MolCore Lab)</h2>
        <table>
          <thead>
            <tr><th>Grupo</th><th>Fórmula</th><th>Sufijo</th><th>Prefijo</th><th>Ejemplo (IUPAC)</th><th>Común</th></tr>
          </thead>
          <tbody>
            {GRUPOS_FUNCIONALES.map((g) => (
              <tr key={g.id}>
                <td><b>{g.nombre}</b><br /><span style={{ color: "#555", fontSize: 8 }}>{g.grupo}</span></td>
                <td className="mono">{g.formula}</td>
                <td className="mono">{g.sufijo}</td>
                <td className="mono">{g.prefijo}</td>
                <td>{g.ejemplos[0]?.iupac}</td>
                <td>{g.ejemplos[0]?.comun}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Compuestos de interés cotidiano</h2>
        <table>
          <thead>
            <tr><th>Nombre</th><th>IUPAC</th><th>Fórmula</th><th>Masa (g/mol)</th><th>Tipo</th><th>Fuente</th><th>Uso</th><th>Riesgo</th></tr>
          </thead>
          <tbody>
            {COMPUESTOS_INTERES.map((c) => (
              <tr key={c.id}>
                <td><b>{c.nombre}</b></td>
                <td>{c.iupac}</td>
                <td className="mono">{c.formula}</td>
                <td className="mono">{c.masa}</td>
                <td>{c.gf}</td>
                <td>{c.fuente}</td>
                <td>{c.uso}</td>
                <td>{c.riesgo || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footer-print">MolCore Lab · datos curados y verificados · generado el {new Date().toLocaleDateString("es")}</p>
      </div>

      {modal && (() => {
        const close = () => setModal(null);
        if (modal.kind === "grupo") {
          const g = GRUPOS_FUNCIONALES.find((x) => x.id === modal.gid);
          if (!g) return null;
          const e = g.ejemplos[modal.eIdx] ?? g.ejemplos[0];
          return (
            <div className="modal-back" onClick={close}>
              <div className="modal" onClick={(ev) => ev.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h2 style={{ marginBottom: 4 }}>
                      {g.nombre} <span className="gf-tag">{g.formula}</span>
                    </h2>
                    <p className="muted small">{g.grupo}</p>
                  </div>
                  <button className="tiny" onClick={close}>Cerrar ✕</button>
                </div>

                {g.ejemplos.length > 1 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                    {g.ejemplos.map((ej, i) => (
                      <button
                        key={ej.nombre}
                        className={i === modal.eIdx ? "primary" : "ghost"}
                        onClick={() => setModal({ ...modal, eIdx: i })}
                        style={{ fontSize: 12, padding: "4px 10px" }}
                      >
                        {ej.nombre}
                      </button>
                    ))}
                  </div>
                )}

                <div className="molbox molbox--big" style={{ margin: "16px 0", padding: 16 }}>
                  <SkeletalFormula mol={e.mol} width={340} height={230} />
                </div>

                <div style={{ marginTop: 12 }}>
                  <h3 style={{ marginBottom: 6 }}>Nomenclatura: {e.iupac}</h3>
                  <p className="small muted" style={{ margin: "0 0 10px" }}>Común: {e.comun}</p>

                  {e.detalles && e.detalles.length > 0 && (
                    <ol style={{ margin: "0 0 14px 18px", padding: 0 }}>
                      {e.detalles.map((d, i) => (
                        <li key={i} className="small" style={{ marginBottom: 6 }}>{d}</li>
                      ))}
                    </ol>
                  )}

                  <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                    <div>
                      <span className="hint-col" style={{ display: "block", marginBottom: 2 }}>Sufijo / prefijo</span>
                      <span className="mono small">{g.sufijo} / {g.prefijo}</span>
                    </div>
                  </div>

                  <p className="captions" style={{ marginTop: 12 }}>{g.reglas}</p>
                  {e.nota && <p className="notice" style={{ marginTop: 8 }}>{e.nota}</p>}
                </div>
              </div>
            </div>
          );
        }

        const c = COMPUESTOS_INTERES.find((x) => x.id === modal.cid);
        if (!c) return null;
        return (
          <div className="modal-back" onClick={close}>
            <div className="modal" onClick={(ev) => ev.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <h2>
                  {c.nombre} <span className="gf-tag">{c.formula}</span>
                </h2>
                <button className="tiny" onClick={close}>Cerrar ✕</button>
              </div>
              <p className="muted small">{c.iupac}</p>
              {c.smiles ? (
                <>
                  <div className="molbox molbox--big" style={{ margin: "10px 0", padding: 10 }}>
                    <Formula2D smiles={c.smiles} width={360} height={200} />
                  </div>
                  <Mol3D smiles={c.smiles} width={360} height={220} header={`Modelo 3D · ${c.nombre}`} />
                </>
              ) : (
                <p className="notice" style={{ marginTop: 10 }}>
                  Estructura no dibujada: no hay conectividad verificada para este compuesto.
                </p>
              )}
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                <div>
                  <span className="hint-col" style={{ display: "block" }}>Masa molar</span>
                  <span className="mono small">{c.masa} g/mol</span>
                </div>
                <div>
                  <span className="hint-col" style={{ display: "block" }}>Grupo funcional / tipo</span>
                  <span className="small">{c.gf}</span>
                </div>
                <div>
                  <span className="hint-col" style={{ display: "block" }}>Fuente</span>
                  <span className="small">{c.fuente}</span>
                </div>
                <div>
                  <span className="hint-col" style={{ display: "block" }}>Uso</span>
                  <span className="small">{c.uso}</span>
                </div>
                {c.riesgo && <span className="risk-tag" style={{ fontSize: 12, alignSelf: "start" }}>{c.riesgo}</span>}
                {!c.riesgo && <span className="ok-tag small" style={{ alignSelf: "start" }}>Uso cotidiano habitual</span>}
                {GHS_ORGANICOS[c.id] && (
                  <div>
                    <span className="hint-col" style={{ display: "block" }}>Pictogramas GHS</span>
                    <div className="row" style={{ marginTop: 4 }}>
                      <GhsPictos codes={GHS_ORGANICOS[c.id]} size={34} />
                      <span className="faint small" style={{ flex: 1 }}>Clasificación GHS de peligro publicada.</span>
                    </div>
                  </div>
                )}
                {c.nota && <p className="captions">{c.nota}</p>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}