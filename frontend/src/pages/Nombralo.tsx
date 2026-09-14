import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SkeletalFormula from "../components/SkeletalFormula";
import { NOMBRALO, type NombraloEntry } from "../data/nombralo";

const empty = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[·\-–—]/g, " ")
    .replace(/[\s,._'’]+/g, " ")
    .trim();

const ACEPTADOS: Record<number, string[]> = {
  16078: ["tetrahidrocannabinol", "thc", "delta 9 tetrahidrocannabinol", "d9 thc", "delta 9 thc", "delta9thc", "delta 9 tch"],
  2519: ["cafeina", "teina", "1 3 7 trimetilxantina", "trimetilxantina"],
  2244: ["aspirina", "acido acetilsalicilico", "aspirin"],
  1983: ["paracetamol", "acetaminofen", "acetaminofeno"],
  5816: ["adrenalina", "epinefrina"],
  54670067: ["vitamina c", "acido ascorbico", "acido l ascorbico"],
};

const SYMJ_A = { O: "oxígeno", N: "nitrógeno", S: "azufre", Cl: "cloro", Br: "bromo", F: "flúor", I: "yodo" };

function buildHighlight(entry: NombraloEntry) {
  const hiA: string[] = [];
  const hiB: number[] = [];
  entry.mol.atoms.forEach((a) => {
    if (a.s && a.s !== "C" && a.s !== "H") hiA.push(a.id);
  });
  entry.mol.bonds.forEach((b, i) => {
    if (hiA.includes(b.a) || hiA.includes(b.b)) hiB.push(i);
  });
  return { hiA, hiB: hiB.map((n) => String(n)) };
}

export default function Nombralo() {
  const [mi, setMi] = useState(0);
  const [status, setStatus] = useState<"guess" | "solved">("guess");
  const [win, setWin] = useState(false);
  const [tmp, setTmp] = useState("");
  const [err, setErr] = useState(false);
  const [hint, setHint] = useState(false);
  const [hl, setHl] = useState(true);
  const [score, setScore] = useState({ ok: 0, no: 0, racha: 0, mejor: 0 });
  const [hov, setHov] = useState<{ t: "atom" | "bond"; i: number } | null>(null);

  const entry = NOMBRALO[Math.min(mi, NOMBRALO.length - 1)];

  const mol = useMemo(() => {
    if (!hl) return entry.mol;
    const { hiA, hiB } = buildHighlight(entry);
    return { ...entry.mol, hiA, hiB };
  }, [entry, hl]);

  const fin = status === "solved" && mi >= NOMBRALO.length - 1;

  const aceptado = (v: string) => (ACEPTADOS[entry.cid] ?? [entry.nombre]).some((a) => empty(a) === v);

  const enviar = () => {
    const v = empty(tmp);
    if (!v || status === "solved") return;
    if (aceptado(v)) {
      setStatus("solved");
      setWin(true);
      setScore((s) => ({ ...s, ok: s.ok + 1, racha: s.racha + 1, mejor: Math.max(s.mejor, s.racha + 1) }));
    } else {
      setErr(true);
      setHint(true);
      setScore((s) => ({ ...s, racha: 0 }));
    }
  };

  const verRespuesta = () => {
    if (status === "solved") return;
    setStatus("solved");
    setWin(false);
    setScore((s) => ({ ...s, no: s.no + 1, racha: 0 }));
  };

  const siguiente = () => { setMi(mi + 1); reset(); };
  const reiniciar = () => { setMi(Math.floor(Math.random() * NOMBRALO.length)); reset(); setScore({ ok: 0, no: 0, racha: 0, mejor: 0 }); };
  const reset = () => { setStatus("guess"); setWin(false); setTmp(""); setErr(false); setHint(false); setHov(null); };

  const heteros = entry.mol.atoms.filter((a) => a.s && a.s !== "C" && a.s !== "H");
  const hovInfo = (() => {
    if (!hov) return null;
    if (hov.t === "atom") {
      const a = entry.mol.atoms[hov.i];
      if (!a) return null;
      const isC = a.s === undefined || a.s === "C" || (a.txt ?? "").startsWith("CH");
      const cn = entry.mol.bonds.filter((b) => b.a === a.id || b.b === a.id).length;
      return isC
        ? { k: "C", sym: "Carbono" as string, extra: `esqueleto · ${cn} vecinos` }
        : {
            k: a.s || a.txt || "",
            sym: (a.s ? SYMJ_A[a.s as keyof typeof SYMJ_A] : a.txt) || a.s || "átomo",
            extra: `${cn} vecinos${a.txt === "H" ? " (H del grupo funcional)" : ""}`,
          };
    }
    const b = entry.mol.bonds[hov.i];
    if (!b) return null;
    const sa = entry.mol.atoms.find((x) => x.id === b.a);
    const sb = entry.mol.atoms.find((x) => x.id === b.b);
    const sym = (a: typeof sa) => (a?.s ? a.s : "C");
    return { k: b.o === 2 ? "Enlace doble" : b.o === 3 ? "Enlace triple" : "Enlace simple", sym: "enlace" as string, extra: `${sym(sa)}–${sym(sb)}` };
  })();

  return (
    <div className="page">
      <div className="filters" style={{ marginBottom: 6 }}>
        <Link className="chip" to="/catalogo/organico" style={{ textDecoration: "none" }}>🧬 Catálogo orgánico</Link>
        <Link className="chip" to="/catalogo/organico/aprender" style={{ textDecoration: "none" }}>✏️ Nomenclatura</Link>
      </div>

      <h1>Nómbralo: moléculas de la vida cotidiana</h1>
      <p className="lead">
        Miro el esqueleto de la molécula (estilo ficha de Wikipedia: carbonos implícitos, heteroátomos
        etiquetados y grupos funcionales resaltados en verde menta) y escribo el nombre del compuesto.
        Pasa el cursor por los átomos y enlaces para inspeccionarlos. Estructuras 2D reales vía
        <b> PubChem</b> (CID {entry.cid}), nada inventado.
      </p>

      <div className="filters" style={{ marginTop: 10 }}>
        {NOMBRALO.map((n, i) => (
          <button
            key={n.cid}
            className={i === mi ? "chip on" : "chip"}
            onClick={() => { setMi(i); reset(); }}
            style={{ cursor: "pointer" }}
          >
            {n.nombre}
          </button>
        ))}
      </div>

      <div className="qcard" style={{ marginTop: 14 }}>
        <div className="qstats">
          <span className="chip">Molécula {mi + 1} / {NOMBRALO.length}</span>
          <span className="chip okchip">✅ {score.ok}</span>
          <span className="chip badchip">❌ {score.no}</span>
          <span className="chip racha">🔥 Racha: {score.racha} · mejor {score.mejor}</span>
          <button className="tiny" onClick={reiniciar}>Reiniciar</button>
        </div>

        <div className="molbox molbox--big" style={{ margin: "12px 0 8px" }}>
          <SkeletalFormula
            mol={mol}
            width={460}
            height={240}
            interactive
            onAtom={(i) => setHov(i === null ? null : { t: "atom", i })}
            onBond={(i) => setHov(i === null ? null : { t: "bond", i })}
          />
        </div>

        <div className="insp">
          {hovInfo ? (
            <>
              <span className="mono" style={{ color: "var(--accent)" }}>{hovInfo.k}</span>
              <span className="muted small">{hovInfo.sym}</span>
              <span className="faint small">{hovInfo.extra}</span>
            </>
          ) : (
            <span className="faint small">🖱 Pasa el cursor por el esqueleto para inspeccionar átomos y enlaces.</span>
          )}
        </div>

        <div className="filters" style={{ margin: "0 0 2px", justifyContent: "center" }}>
          <button className={hl ? "chip on" : "chip"} onClick={() => setHl(!hl)} style={{ cursor: "pointer" }}>
            ✨ {hl ? "Resaltado activo" : "Resaltar función química"}
          </button>
          {!hint && heteros.length > 0 && (
            <button className="chip" onClick={() => setHint(true)} style={{ cursor: "pointer" }}>💡 Pista</button>
          )}
        </div>

        {hint && (
          <p className="captions" style={{ margin: "0 0 2px", textAlign: "center" }}>
            Pista: tiene {heteros.length === 1 ? "un heteroátomo" : `${heteros.length} heteroátomos`}:{" "}
            {heteros.map((a) => SYMJ_A[a.s as keyof typeof SYMJ_A]).filter(Boolean).join(" y ") || "⋯"}. Es un compuesto de la vida cotidiana.
          </p>
        )}

        {status === "guess" ? (
          <div className="qform" style={{ justifyContent: "center" }}>
            <input
              className="search"
              style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
              placeholder="¿Cómo se llama este compuesto?"
              value={tmp}
              onChange={(ev) => { setTmp(ev.target.value); setErr(false); }}
              onKeyDown={(ev) => ev.key === "Enter" && enviar()}
              aria-label="Nombre del compuesto"
            />
            <button className="primary" onClick={enviar} disabled={!tmp.trim()}>Comprobar</button>
            {err && <button className="ghost" onClick={verRespuesta}>Ver respuesta</button>}
          </div>
        ) : (
          <div className={win ? "qres ok" : "qres bad"} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <b>{win ? "¡Correcto! 🎉" : "La respuesta era:"}</b>
              <span className="mono">{entry.nombre}</span>
              <span className="faint small">· fórmula {entry.formula}</span>
            </div>
            <div className="fact">
              <div><span className="hint-col">Nombre IUPAC</span><span className="small">{entry.iupac}</span></div>
              <div><span className="hint-col">Fórmula molecular</span><span className="mono small">{entry.formula}</span></div>
              <div><span className="hint-col">Uso / rol</span><span className="small">{entry.uso}</span></div>
              <div><span className="hint-col">Estructura 2D</span><span className="small">PubChem CID {entry.cid}</span></div>
            </div>
            <div style={{ marginTop: 12 }}>
              {fin ? (
                <button className="primary" onClick={reiniciar}>🔁 Empezar de nuevo</button>
              ) : (
                <button className="primary" onClick={siguiente}>Siguiente molécula →</button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="captions" style={{ marginTop: 14 }}>
        En la fórmula esqueletal cada vértice y extremo de línea es un carbono (sus hidrógenos no se
        dibujan) y solo se etiquetan los heteroátomos (O, N…) y los H de los grupos funcionales.
      </p>
    </div>
  );
}