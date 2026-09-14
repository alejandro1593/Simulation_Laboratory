import { useState, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Tiny helpers                                                       */
/* ------------------------------------------------------------------ */

const fmt = (n: number, d = 4) => {
  if (!Number.isFinite(n)) return "—";
  return Number(n.toPrecision(d)).toString();
};

/* ------------------------------------------------------------------ */
/*  CALCULATORS (pure client-side)                                     */
/* ------------------------------------------------------------------ */

function MolesGramos() {
  const [mass, setMass] = useState("");
  const [mm, setMm] = useState("");
  const [dir, setDir] = useState<"m2g" | "g2m">("m2g");
  const result = useMemo(() => {
    const m = parseFloat(mass);
    const molar = parseFloat(mm);
    if (!Number.isFinite(m) || !Number.isFinite(molar) || molar <= 0) return null;
    return dir === "m2g" ? m * molar : m / molar;
  }, [mass, mm, dir]);
  return (
    <div className="calc-grid">
      <div className="calc-row">
        <label>Modo
          <select value={dir} onChange={(e) => setDir(e.target.value as "m2g" | "g2m")}>
            <option value="m2g">Moles → Gramos</option>
            <option value="g2m">Gramos → Moles</option>
          </select>
        </label>
      </div>
      <div className="calc-row">
        <label>{dir === "m2g" ? "Moles (n)" : "Gramos (m)"}
          <input type="number" step="any" value={mass} onChange={(e) => setMass(e.target.value)} placeholder={dir === "m2g" ? "0.5" : "180"} />
        </label>
        <label>Masa molar (g/mol)
          <input type="number" step="any" value={mm} onChange={(e) => setMm(e.target.value)} placeholder="180.16" />
        </label>
      </div>
      {result !== null && (
        <div className="calc-result">
          <span className="calc-val">{fmt(result)}</span>
          <span className="calc-unit">{dir === "m2g" ? "gramos" : "moles"}</span>
          <span className="calc-formula muted small">{dir === "m2g" ? "m = n × M" : "n = m / M"}</span>
        </div>
      )}
    </div>
  );
}

function MolaridadCalc() {
  const [moles, setMoles] = useState("");
  const [vol, setVol] = useState("");
  const result = useMemo(() => {
    const n = parseFloat(moles);
    const v = parseFloat(vol) / 1000;
    if (!Number.isFinite(n) || !Number.isFinite(v) || v <= 0) return null;
    return n / v;
  }, [moles, vol]);
  return (
    <div className="calc-grid">
      <div className="calc-row">
        <label>Moles (n)
          <input type="number" step="any" value={moles} onChange={(e) => setMoles(e.target.value)} placeholder="0.1" />
        </label>
        <label>Volumen (mL)
          <input type="number" step="any" value={vol} onChange={(e) => setVol(e.target.value)} placeholder="500" />
        </label>
      </div>
      {result !== null && (
        <div className="calc-result">
          <span className="calc-val">{fmt(result, 3)}</span>
          <span className="calc-unit">mol/L (M)</span>
          <span className="calc-formula muted small">C = n / V</span>
        </div>
      )}
    </div>
  );
}

function DilucionCalc() {
  const [c1, setC1] = useState("");
  const [v1, setV1] = useState("");
  const [c2, setC2] = useState("");
  const [v2, setV2] = useState("");
  const solve = (field: string) => {
    const a = parseFloat(c1), b = parseFloat(v1), c = parseFloat(c2), d = parseFloat(v2);
    const known = [Number.isFinite(a), Number.isFinite(b), Number.isFinite(c), Number.isFinite(d)];
    const count = known.filter(Boolean).length;
    if (count < 3) return null;
    if (field === "v2" && Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && c > 0) return (a * b) / c;
    if (field === "c2" && Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(d) && d > 0) return (a * b) / d;
    if (field === "c1" && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d) && b > 0) return (c * d) / b;
    if (field === "v1" && Number.isFinite(a) && Number.isFinite(c) && Number.isFinite(d) && a > 0) return (c * d) / a;
    return null;
  };
  const v2r = solve("v2");
  const c2r = solve("c2");
  return (
    <div className="calc-grid">
      <p className="calc-hint muted small">Deja en blanco el campo que quieras calcular (mínimo 3 datos).</p>
      <div className="calc-row">
        <label>C₁ (M)
          <input type="number" step="any" value={c1} onChange={(e) => setC1(e.target.value)} placeholder="1.0" />
        </label>
        <label>V₁ (mL)
          <input type="number" step="any" value={v1} onChange={(e) => setV1(e.target.value)} placeholder="100" />
        </label>
        <label>C₂ (M)
          <input type="number" step="any" value={c2} onChange={(e) => setC2(e.target.value)} placeholder="0.1" />
        </label>
        <label>V₂ (mL)
          <input type="number" step="any" value={v2} onChange={(e) => setV2(e.target.value)} placeholder="" />
        </label>
      </div>
      {(v2r !== null || c2r !== null) && (
        <div className="calc-result">
          {v2r !== null && <><span className="calc-val">{fmt(v2r, 2)}</span><span className="calc-unit">mL → V₂</span></>}
          {c2r !== null && <><span className="calc-val">{fmt(c2r, 3)}</span><span className="calc-unit">M → C₂</span></>}
          <span className="calc-formula muted small">C₁V₁ = C₂V₂</span>
        </div>
      )}
    </div>
  );
}

function GasIdealCalc() {
  const [p, setP] = useState("");
  const [v, setV] = useState("");
  const [n, setN] = useState("");
  const [t, setT] = useState("");
  const R = 0.082057;
  const solve = (field: string) => {
    const pa = parseFloat(p), va = parseFloat(v) / 1000, na = parseFloat(n), ta = parseFloat(t) + 273.15;
    const known = [Number.isFinite(pa), Number.isFinite(va), Number.isFinite(na), Number.isFinite(ta)];
    if (known.filter(Boolean).length < 3) return null;
    if (field === "p" && Number.isFinite(va) && Number.isFinite(na) && Number.isFinite(ta) && va > 0) return (na * R * ta) / va;
    if (field === "v" && Number.isFinite(pa) && Number.isFinite(na) && Number.isFinite(ta) && pa > 0) return (na * R * ta) / pa;
    if (field === "n" && Number.isFinite(pa) && Number.isFinite(va) && Number.isFinite(ta) && ta > 0) return (pa * va) / (R * ta);
    if (field === "t" && Number.isFinite(pa) && Number.isFinite(va) && Number.isFinite(na) && na > 0) return (pa * va) / (na * R) - 273.15;
    return null;
  };
  const pr = solve("p");
  const vr = solve("v");
  return (
    <div className="calc-grid">
      <p className="calc-hint muted small">Deja en blanco el campo a calcular (mín. 3 datos). T en °C, V en mL, P en atm.</p>
      <div className="calc-row">
        <label>P (atm)
          <input type="number" step="any" value={p} onChange={(e) => setP(e.target.value)} placeholder="1.0" />
        </label>
        <label>V (mL)
          <input type="number" step="any" value={v} onChange={(e) => setV(e.target.value)} placeholder="22400" />
        </label>
        <label>n (mol)
          <input type="number" step="any" value={n} onChange={(e) => setN(e.target.value)} placeholder="1.0" />
        </label>
        <label>T (°C)
          <input type="number" step="any" value={t} onChange={(e) => setT(e.target.value)} placeholder="0" />
        </label>
      </div>
      {(pr !== null || vr !== null) && (
        <div className="calc-result">
          {pr !== null && <><span className="calc-val">{fmt(pr, 3)}</span><span className="calc-unit">atm → P</span></>}
          {vr !== null && <><span className="calc-val">{fmt(vr * 1000, 1)}</span><span className="calc-unit">mL → V</span></>}
          <span className="calc-formula muted small">PV = nRT</span>
        </div>
      )}
    </div>
  );
}

function PHCalc() {
  const [val, setVal] = useState("");
  const [field, setField] = useState<"h" | "oh" | "ph" | "poh">("h");
  const result = useMemo(() => {
    const v = parseFloat(val);
    if (!Number.isFinite(v) || v <= 0) return null;
    if (field === "h") {
      const ph = -Math.log10(v);
      return { ph, poh: 14 - ph, oh: 1e-14 / v };
    }
    if (field === "oh") {
      const poh = -Math.log10(v);
      return { ph: 14 - poh, poh, oh: v };
    }
    if (field === "ph") {
      return { ph: v, poh: 14 - v, oh: Math.pow(10, -(14 - v)) };
    }
    const poh = v;
    return { ph: 14 - poh, poh, oh: Math.pow(10, -poh) };
  }, [val, field]);
  return (
    <div className="calc-grid">
      <div className="calc-row">
        <label>Unidad de entrada
          <select value={field} onChange={(e) => setField(e.target.value as "h" | "oh" | "ph" | "poh")}>
            <option value="h">[H⁺] (mol/L)</option>
            <option value="oh">[OH⁻] (mol/L)</option>
            <option value="ph">pH</option>
            <option value="poh">pOH</option>
          </select>
        </label>
        <label>Valor
          <input type="number" step="any" value={val} onChange={(e) => setVal(e.target.value)} placeholder="0.001" />
        </label>
      </div>
      {result && (
        <div className="calc-result">
          <span className="calc-val">pH = {fmt(result.ph, 2)}</span>
          <span className="calc-val">pOH = {fmt(result.poh, 2)}</span>
          <span className="calc-val">[H⁺] = {fmt(result.ph < 0 ? Math.pow(10, -result.ph) : Math.pow(10, -result.ph))}</span>
          <span className="calc-formula muted small">pH + pOH = 14</span>
        </div>
      )}
    </div>
  );
}

function ConcentracionesCalc() {
  const [mass, setMass] = useState("");
  const [mm, setMm] = useState("");
  const [vol, setVol] = useState("");
  const [density, setDensity] = useState("");
  const result = useMemo(() => {
    const m = parseFloat(mass), molar = parseFloat(mm), v = parseFloat(vol) / 1000, d = parseFloat(density) || 1;
    if (!Number.isFinite(m) || !Number.isFinite(molar) || molar <= 0 || !Number.isFinite(v) || v <= 0) return null;
    const moles = m / molar;
    const molarity = moles / v;
    const massPercent = (m / (d * v * 1000)) * 100;
    const molality = moles / (d * v - m / 1000);
    return { moles, molarity, massPercent, molality };
  }, [mass, mm, vol, density]);
  return (
    <div className="calc-grid">
      <div className="calc-row">
        <label>Masa soluto (g)
          <input type="number" step="any" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="58.44" />
        </label>
        <label>Masa molar (g/mol)
          <input type="number" step="any" value={mm} onChange={(e) => setMm(e.target.value)} placeholder="58.44" />
        </label>
        <label>Volumen solución (mL)
          <input type="number" step="any" value={vol} onChange={(e) => setVol(e.target.value)} placeholder="1000" />
        </label>
        <label>Densidad (g/mL, opc.)
          <input type="number" step="any" value={density} onChange={(e) => setDensity(e.target.value)} placeholder="1.0" />
        </label>
      </div>
      {result && (
        <div className="calc-result">
          <span className="calc-val">Molaridad = {fmt(result.molarity, 3)} M</span>
          <span className="calc-val">Molalidad = {fmt(result.molality, 3)} m</span>
          <span className="calc-val">% peso = {fmt(result.massPercent, 2)}%</span>
          <span className="calc-val">Moles = {fmt(result.moles, 4)}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MODULE DATA                                                        */
/* ------------------------------------------------------------------ */

type Level = "basico" | "intermedio" | "avanzado" | "industria";

interface Topic {
  id: string;
  title: string;
  level: Level;
  summary: string;
  sections: { heading: string; body: string; formulas?: string[]; example?: string }[];
}

const LEVEL_LABEL: Record<Level, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  industria: "Industria",
};

const LEVEL_COLOR: Record<Level, string> = {
  basico: "#5ce8c0",
  intermedio: "#5cb8ff",
  avanzado: "#c89bff",
  industria: "#f59e42",
};

const TOPICS: Topic[] = [
  /* ── FUNDAMENTOS ────────────────────────────────────────────── */
  {
    id: "atomos",
    title: "El átomo: estructura y componentes",
    level: "basico",
    summary: "Protones, neutrones, electrones, número atómico, masa atómica e isótopos.",
    sections: [
      {
        heading: "Estructura del átomo",
        body: "Un átomo está compuesto por un núcleo denso (protones Z + neutrones N) rodeado por una nube de electrones (Z en un átomo neutro). La fuerza nuclear fuerte mantiene unidos al núcleo; la fuerza electromagnética atrae los electrones al núcleo.",
        formulas: ["Número atómico: Z = número de protones", "Número másico: A = Z + N", "Número de neutrones: N = A − Z"],
      },
      {
        heading: "Isótopos",
        body: "Átomos con mismo Z pero diferente N (y por tanto diferente A). Ejemplos: ¹H (protio), ²H (deuterio), ³H (tritio). El carbono-14 (Z=6, N=8) se usa en datación por radiocarbono.",
        example: "¹²C: 6p + 6n → A = 12; ¹³C: 6p + 7n → A = 13; ¹⁴C: 6p + 8n → A = 14",
      },
      {
        heading: "Masa atómica",
        body: "La masa atómica estándar de un elemento es el promedio ponderado de las masas de sus isótopos naturales, en unidades de masa atónica (u). 1 u ≈ 1.66054 × 10⁻²⁷ kg. Se define tomando ¹²C como exactamente 12 u.",
        formulas: ["Masa atómica (tabla) = Σ(fᵢ × Aᵢ) donde fᵢ es la fracción isotópica"],
      },
    ],
  },
  {
    id: "tabla-periodica",
    title: "Tabla Periódica: organización y tendencias",
    level: "basico",
    summary: "Periodos, grupos, bloques s/p/d/f, metales, no metales, metaloides y propiedades periódicas.",
    sections: [
      {
        heading: "Organización",
        body: "La tabla periódica ordena los 118 elementos por número atómico creciente. Las filas son períodos (1–7), las columnas son grupos (1–18). Los bloques s, p, d, f corresponden al subnivel del último electrón. Los lantánidos (La–Lu) y actinidos (Ac–Lr) se muestran aparte.",
      },
      {
        heading: "Propiedades periódicas",
        body: "A la izquierda y abajo → más metálico, radio atómico mayor, energía de ionización menor, electronegatividad menor. A la derecha y arriba → más no metálico, radio menor, IE mayor, electronegatividad mayor.",
        formulas: ["Radio atómico: aumenta ↙ (misma familia, abajo), disminuye ↗ (mismo período, derecha)", "Energía de ionización: aumenta ↗, disminuye ↙", "Electronegatividad (Pauling): F = 3.98 (máx.), Cs = 0.79 (mín.)"],
        example: "Na (Z=11): [Ne] 3s¹ → pierde 1e⁻ fácilmente → IE baja, muy electropositivo. Cl (Z=17): [Ne] 3s²3p⁵ → gana 1e⁻ → alta EN, muy electronegativo.",
      },
    ],
  },
  {
    id: "enlaces",
    title: "Enlaces químicos",
    level: "basico",
    summary: "Enlace iónico, covalente, metálico, polaridad, número de oxidación y reglas de Lewis.",
    sections: [
      {
        heading: "Enlace iónico",
        body: "Transferencia de electrones de un metal a un no metal. Los iones opuestos se atraen electrostáticamente (energía reticular). Forma cristales iónicos (NaCl, CaF₂). Alto punto de fusión, conductor en disolución/fundido.",
        formulas: ["Na → Na⁺ + e⁻; Cl + e⁻ → Cl⁻ → Na⁺Cl⁻"],
      },
      {
        heading: "Enlace covalente",
        body: "Compartición de pares de electrones entre dos no metales. Puede ser simple (1 par compartido), doble o triple. Polar: diferencia de electronegatividad > 0.4; no polar: < 0.4.",
        formulas: ["H₂: H–H (covalente no polar)", "HCl: Hδ⁺–Clδ⁻ (covalente polar)", "O₂: O=O (doble enlace)"],
      },
      {
        heading: "Enlace metálico",
        body: "Los electrones de valencia se deslocalizan formando un 'mar de electrones'. Explica la conductividad eléctrica, maleabilidad, ductilidad y brillo de los metales.",
      },
      {
        heading: "Estructuras de Lewis",
        body: "Para escribir Lewis: contar electrones de valencia totales, asignar enlaces, completar octetos (o duetos para H). Regla del octeto: C, N, O, F tienden a rodearse de 8e⁻.",
        example: "H₂O: O tiene 6e⁻ de valencia + 2 de H = 8 → dos enlaces O–H + 2 pares solitarios.",
      },
    ],
  },
  {
    id: "estados-materia",
    title: "Estados de la materia y cambios de fase",
    level: "basico",
    summary: "Sólido, líquido, gaseoso, plasma. Diagramas de fase, calor latente, presión de vapor.",
    sections: [
      {
        heading: "Los tres estados clásicos",
        body: "Sólido: partículas ordenadas, vibran en posiciones fijas (cristalino) o desordenadas (amorfo). Líquido: partículas cercanas pero móviles, flujo viscoso. Gaseoso: partículas separadas a alta velocidad, llenan el volumen del recipiente.",
      },
      {
        heading: "Diagrama de fases",
        body: "Gráfico presión vs temperatura mostrando las curvas de equilibrio sólido-líquido (fusión), líquido-gaseoso (ebullición), sólido-gaseoso (sublimación). Triple punto: T, P donde coexisten las tres fases. Punto crítico: por encima de Tc y Pc, la distinción líquido-gas desaparece (supercrítico).",
        formulas: ["Ecuación de Clapeyron: dP/dT = ΔH/(TΔV)"],
        example: "Agua: punto triple = 0.01 °C, 611.73 Pa; punto crítico = 374 °C, 22.06 MPa.",
      },
      {
        heading: "Calor latente",
        body: "Calor necesario para un cambio de fase sin variación de temperatura. Calor de fusión (solidificación), vaporización (condensación), sublimación.",
        formulas: ["q = n × ΔHfus", "q = n × ΔHvap", "q = m × Lv (calor latente específico)"],
        example: "Calor para fundir 1 mol de hielo: q = 1 mol × 6.01 kJ/mol = 6.01 kJ.",
      },
    ],
  },
  {
    id: "nomenclatura-inorg",
    title: "Nomenclatura inorgánica básica",
    level: "basico",
    summary: "Reglas IUPAC para nombrar compuestos iónicos, covalentes, ácidos y oxoácidos.",
    sections: [
      {
        heading: "Compuestos binarios iónicos",
        body: "Metal + no metal. El metal mantiene su nombre; el no metal termina en -uro. Para metales con varios estados de oxidación, se usa la nomenclatura clásica (nummeral romano) o la Stock (número entre paréntesis).",
        example: "NaCl = cloruro de sodio; FeCl₃ = cloruro de hierro(III) = cloruro férrico; FeCl₂ = cloruro de hierro(II) = cloruro ferroso.",
      },
      {
        heading: "Compuestos binarios covalentes",
        body: "No metal + no metal. Se usan prefijos greco-latinos (mono-, di-, tri-, tetra-, penta-, hexa-, hepta-, octa-, nona-, deca-). El primero lleva mono- solo si hay un solo átomo del elemento.",
        example: "CO₂ = dióxido de carbono; N₂O₅ = pentóxido de dinitrógeno; PCl₅ = pentocloruro de fósforo.",
      },
      {
        heading: "Ácidos",
        body: "Si el anión termina en -uro → ácido ...hídrico. Si termina en -ato o -ito → ácido ...ico / ...oso.",
        example: "HCl(g disuelto) = ácido clorhídrico; H₂SO₄ = ácido sulfúrico (sulfato); H₂SO₃ = ácido sulfuroso (sulfito); HNO₃ = ácido nítrico.",
      },
    ],
  },
  /* ── QUÍMICA GENERAL ────────────────────────────────────────── */
  {
    id: "estequiometria",
    title: "Estequiometría: moles y masas",
    level: "intermedio",
    summary: "Concepto de mol, masa molar, coeficientes estequiométricos, rendimiento y reacción limitante.",
    sections: [
      {
        heading: "El mol y la masa molar",
        body: "1 mol = 6.02214076 × 10²³ entidades (constante de Avogadro). La masa molar M de una sustancia es la masa en gramos de 1 mol. Para compuestos: sumar las masas atómicas de todos los átomos en la fórmula.",
        formulas: ["n = m / M  (moles = masa / masa molar)", "m = n × M"],
        example: "Masa molar de H₂O: 2(1.008) + 15.999 = 18.015 g/mol. 36.03 g de H₂O = 36.03 / 18.015 = 2.00 mol.",
      },
      {
        heading: "Coeficientes estequiométricos",
        body: "En una ecuación balanceada, los coeficientes indican la proporción molar entre reactivos y productos. Se usan para convertir de una sustancia a otra.",
        example: "2H₂ + O₂ → 2H₂O. 3 mol H₂ × (1 mol O₂ / 2 mol H₂) = 1.5 mol O₂ necesarios.",
      },
      {
        heading: "Reactivo limitante y rendimiento",
        body: "El reactivo limitante se agota primero y determina la cantidad máxima de producto. El rendimiento real es la cantidad obtenida sobre la teórica × 100%.",
        formulas: ["Rendimiento (%) = (masa real / masa teórica) × 100"],
      },
    ],
  },
  {
    id: "concentraciones",
    title: "Concentraciones y soluciones",
    level: "intermedio",
    summary: "Molaridad, molalidad, fracción molar, dilución, propiedades coligativas.",
    sections: [
      {
        heading: "Unidades de concentración",
        body: "Molaridad (M) = mol soluto / L solución. Molalidad (m) = mol soluto / kg disolvente. Fracción molar (χ) = mol componente / mol total. % peso/peso, % peso/volumen.",
        formulas: ["C = n/V  (mol/L)", "m = n_soluto / kg_disolvente", "χ_A = n_A / (n_A + n_B + …)"],
      },
      {
        heading: "Dilución",
        body: "Al añadir disolvente a una solución, los moles de soluto no cambian.",
        formulas: ["C₁V₁ = C₂V₂"],
        example: "Preparar 250 mL de 0.1 M NaCl a partir de 1.0 M: V₁ = (0.1 × 250) / 1.0 = 25 mL de solución concentrada + 225 mL de agua.",
      },
      {
        heading: "Propiedades coligativas",
        body: "Dependen solo del número de partículas de soluto, no de su identidad. Elevación del punto de ebullición, depresión del punto de congelación, presión osmótica.",
        formulas: ["ΔTb = Kb × m × i", "ΔTf = Kf × m × i", "π = MRT × i"],
        example: "Disolución 0.5 m NaCl (i=2): ΔTf = 1.86 × 0.5 × 2 = 1.86 °C de descenso.",
      },
    ],
  },
  {
    id: "reacciones",
    title: "Reacciones químicas y balanceo",
    level: "intermedio",
    summary: "Tipos de reacciones, balanceo por tanteo e inspectivo, balanceo redox.",
    sections: [
      {
        heading: "Tipos principales",
        body: "Síntesis: A + B → C. Descomposición: AB → A + B. Sustitución simple: A + BC → AC + B. Sustitución doble (metátesis): AB + CD → AD + CB. Combustión: combustible + O₂ → CO₂ + H₂O. Redox: transferencia de electrones.",
      },
      {
        heading: "Balanceo de ecuaciones",
        body: "Conservación de masa: igual número de átomos de cada elemento a cada lado. Método inspectivo: balancear metales primero, luego no metales, O, H y finalmente verificar.",
        example: "Fe₂O₃ + 3CO → 2Fe + 3CO₂ (Fe: 2=2, O: 3+3=6, C: 3=3).",
      },
      {
        heading: "Balanceo redox (método ión-electrón)",
        body: "1) Separar en semirreacciones (oxidación y reducción). 2) Balancear átomos (no e⁻). 3) Balancear carga con e⁻. 4) Igualar electrones transferidos. 5) Sumar. En medio ácido: H₂O y H⁺ para balancear O y H. En medio básico: OH⁻ y H₂O.",
      },
    ],
  },
  {
    id: "acides-base",
    title: "Ácidos, bases y pH",
    level: "intermedio",
    summary: "Definiciones (Brønsted-Lowry, Lewis), constante de acidez, pKa,缓冲, titulación.",
    sections: [
      {
        heading: "Definiciones",
        body: "Brønsted-Lowry: ácido = donador de protones, base = aceptor de protones. Lewis: ácido = aceptor de pares de electrones, base = donador. Ácidos fuertes: HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄ (se disocian completamente). Bases fuertes: NaOH, KOH, Ba(OH)₂.",
      },
      {
        heading: "pH y escala",
        body: "El pH mide la acidez/basicidad de una disolución acuosa. A 25 °C, pH + pOH = 14.",
        formulas: ["pH = −log₁₀[H⁺]", "pOH = −log₁₀[OH⁻]", "pH + pOH = 14", "Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴"],
      },
      {
        heading: "Constante de acidez (Ka) y pKa",
        body: "Ka mide la fuerza de un ácido débil. pKa = −log Ka. Menor pKa → ácido más fuerte.",
        formulas: ["Ka = [H⁺][A⁻] / [HA]", "pH = pKa + log([A⁻]/[HA])  (ecuación de Henderson-Hasselbalch)"],
        example: "Ácido acético: Ka = 1.8 × 10⁻⁵ → pKa = 4.74. Solución 0.1 M: pH = ½(pKa − log C) = ½(4.74 + 1) = 2.87.",
      },
      {
        heading: "Curva de titulación",
        body: "Al añadir volumen de base (titulante) a un ácido (analito), el pH cambia. Punto de equivalencia: moles de ácido = moles de base. Punto medio: pH = pKa. El indicador cambia de color cerca del punto de equivalencia.",
      },
    ],
  },
  {
    id: "equilibrio",
    title: "Equilibrio químico",
    level: "intermedio",
    summary: "Constante de equilibrio Kc/Kp, principio de Le Chatelier,關係 entre Kc y Kp.",
    sections: [
      {
        heading: "Constante de equilibrio",
        body: "Para una reacción en equilibrio: aA + bB ⇌ cC + dD, Kc = [C]^c[D]^d / [A]^a[B]^b. Kp usa presiones parciales. Kp = Kc(RT)^Δn, donde Δn = (c+d) − (a+b) en moles de gas.",
        example: "N₂ + 3H₂ ⇌ 2NH₃. Kc = [NH₃]² / ([N₂][H₂]³). A alta T, K disminuye (reacción exotérmica → Le Chatelier).",
      },
      {
        heading: "Principio de Le Chatelier",
        body: "Si un sistema en equilibrio se perturba (concentración, presión, temperatura), el sistema se desplaza para contrarrestar el cambio. Un catalizador NO desplaza el equilibrio; solo acelera alcanzarlo.",
      },
    ],
  },
  {
    id: "cinetica",
    title: "Cinética química",
    level: "intermedio",
    summary: "Velocidad de reacción, orden, ley de velocidad, energía de activación, ecuación de Arrhenius.",
    sections: [
      {
        heading: "Ley de velocidad",
        body: "Velocidad = −Δ[reactivo]/Δt = Δ[producto]/t. La ley de velocidad relaciona velocidad con concentraciones: v = k[A]^m[B]^n, donde m, n son los órdenes (se determinan experimentalmente, NO por coeficientes).",
        formulas: ["v = k[A]^m[B]^n", "k = constante de velocidad (unidades dependen del orden)"],
      },
      {
        heading: "Ecuación de Arrhenius",
        body: "Relaciona la constante k con la temperatura: k = A·e^(−Ea/RT). Temperaturas más altas → k mayor → reacción más rápida.",
        formulas: ["k = A × e^(−Ea/RT)", "ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂)", "R = 8.314 J/(mol·K)"],
        example: "Si Ea = 50 kJ/mol y T sube de 300K a 310K: k₂/k₁ = e^((50000/8.314)(1/300 − 1/310)) ≈ e^0.646 ≈ 1.91 → casi se duplica.",
      },
    ],
  },
  /* ── QUÍMICA ORGÁNICA ───────────────────────────────────────── */
  {
    id: "hidrocarburos",
    title: "Hidrocarburos: alcanos, alquenos, alquinos, aromáticos",
    level: "intermedio",
    summary: "Nomenclatura, isomería, propiedades y reacciones de hidrocarburos.",
    sections: [
      {
        heading: "Alcanos (CₙH₂ₙ₊₂)",
        body: "Enlace simple C–C, hibridación sp³, geometría tetraédrica. Nomenclatura: metano (C1), etano (C2), propano (C3), butano (C4), pentano (C5), hexano (C6), heptano, octano, nonano, decano. Isomería de cadena: 2-metilpropano vs butano.",
        formulas: ["CₙH₂ₙ₊₂", "Reacción: CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → nCO₂ + (n+1)H₂O (combustión)"],
      },
      {
        heading: "Alquenos (CₙH₂ₙ) y alquinos (CₙH₂ₙ₋₂)",
        body: "Alquenos: doble enlace C=C, sp², reacción de adición (H₂, HX, H₂O, halógenos). Alquinos: triple enlace C≡C, sp, también adición. Transposición cis-trans en alquenos.",
      },
      {
        heading: "Aromáticos",
        body: "Benceno (C₆H₆) y derivados. Aromaticidad:环 de 4n+2 electrones π (regla de Hückel). Sustitución electrofílica aromática (SEAr): nitración, halogenación, sulfonación, Friedel-Crafts.",
      },
    ],
  },
  {
    id: "polimeros",
    title: "Polímeros y macromoléculas",
    level: "industria",
    summary: "Polimerización por adición y condensación, termoplásticos, elastómeros, termoestables.",
    sections: [
      {
        heading: "Polimerización por adición",
        body: "Monómeros con doble enlace se enlazan abriendo el π. Ejemplos: polietileno (PE), polipropileno (PP), PVC (cloruro de polivinilo), poliestireno (PS). Se inicia con radicales libres, catálisis Ziegler-Natta o metallocenos.",
      },
      {
        heading: "Polimerización por condensación",
        body: "Monómeros bifuncionales reaccionan eliminando una molécula pequeña (H₂O, HCl). Ejemplos: nailon (poliamida), Dacron (poliéster), policarbonato. Forman enlaces éster o amida.",
      },
      {
        heading: "Clasificación por comportamiento térmico",
        body: "Termoplásticos: se ablandan al calentar (PE, PP, PET). Elastómeros: gomas (caucho vulcanizado, neopreno). Termoestables: una vez curados no se funden (resina epoxi, baquelita, melanina).",
      },
    ],
  },
  {
    id: "farmaceutica",
    title: "Química farmacéutica",
    level: "industria",
    summary: "Diseño de fármacos, farmacocinética (ADME), fármacos de referencia vs genéricos.",
    sections: [
      {
        heading: "Proceso de desarrollo",
        body: "1) Descubrimiento del blanco biológico. 2) screening de compuestos activos. 3) Optimización de estructura-actividad (SAR). 4) Estudios preclínicos (in vitro, in vivo). 5) Ensayos clínicos (Fase I–IV). 6) Registro y comercialización.",
      },
      {
        heading: "Farmacocinética (ADME)",
        body: "Absorción: entrada al organismo (VO, IV, IM). Distribución: transporte a tejidos. Metabolismo: transformación hepática (citocromo P450). Excreción: eliminación (renal, biliar).",
        formulas: ["Vida media (t½) = 0.693 / ke", "Depuración total: Cl = ke × Vd"],
      },
    ],
  },
  {
    id: "industria-procesos",
    title: "Procesos industriales clave",
    level: "industria",
    summary: "Haber-Bosch, proceso de Contacto, Solvay, cracking, electrólisis del aluminio.",
    sections: [
      {
        heading: "Proceso Haber-Bosch (amoníaco)",
        body: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = −92 kJ/mol. Condiciones: 400–500 °C, 150–300 atm, catalizador Fe₃O₄ promovido con K₂O/Al₂O₃. Producción ~180 Mt/año, alimenta fertilizantes para ~50% de la población mundial.",
        formulas: ["Keq baja a alta T (exotérmica) → se compensa con alta P y recirculación."],
      },
      {
        heading: "Proceso de Contacto (H₂SO₄)",
        body: "2SO₂ + O₂ ⇌ 2SO₃ (V₂O₅ catalizador, 450 °C, 1–2 atm). SO₃ se absorbe en H₂SO₄ oleum (H₂S₂O₇) → dilución → H₂SO₄. Producción ~260 Mt/año, compuesto industrial más producido del mundo.",
      },
      {
        heading: "Electrólisis del aluminio (Hall-Héroult)",
        body: "Al₂O₃ disuelto en criolita fundida (Na₃AlF₆) a 960 °C. Cátodo: carbono (reducción: Al³⁺ + 3e⁻ → Al). Ánodo: carbono (oxidación: 2O²⁻ → O₂ + 4e⁻, que reacciona con C → CO₂). Consumo: ~13–15 kWh/kg Al.",
      },
    ],
  },
  {
    id: "energia-ambiente",
    title: "Energía, baterías y medio ambiente",
    level: "industria",
    summary: "Pilas, baterías Li-ion, hidrógeno verde, captura de CO₂, contaminación y reciclaje.",
    sections: [
      {
        heading: "Principios de baterías",
        body: "Una celda galvánica convierte energía química en eléctrica. ánodo (oxidación, −) | electrolito | cátodo (reducción, +). FEM = E°cátodo − E°ánodo. Baterías recargables: Li-ion (LiCoO₂ / grafito), Na-ion, fosfato de hierro-litio (LiFePO₄).",
        formulas: ["E°(Cu²⁺/Cu) = +0.34 V", "E°(Zn²⁺/Zn) = −0.76 V", "Pila Daniell: Zn|Zn²⁺||Cu²⁺|Cu → E° = 1.10 V"],
      },
      {
        heading: "Hidrógeno verde",
        body: "Producción de H₂ por electrólisis del agua usando energía renovable. 2H₂O → 2H₂ + O₂. Celda PEM (membrana polímero) o alcalina. Eficiencia: 60–80%. El H₂ se usa en pilas de combustible (2H₂ + O₂ → 2H₂O, η~50–60%).",
      },
      {
        heading: "Captura y secuestro de carbono (CCS)",
        body: "Capturar CO₂ de gases de combustión o directamente del aire (DAC). Mecanismos: absorción con aminas, adsorción con zeolitas, membranas, mineralización. Transporte por tubería o barco. Almacenamiento en acuíferos salinos o yacimientos agotados.",
      },
    ],
  },
  /* ── QUÍMICA CUÁNTICA Y AVANZADA ───────────────────────────── */
  {
    id: "orbitales",
    title: "Modelo cuántico: orbitales y configuración electrónica",
    level: "avanzado",
    summary: "Números cuánticos, forma de orbitales, principio de Aufbau, Hund y Pauli.",
    sections: [
      {
        heading: "Números cuánticos",
        body: "n (principal, 1–7): tamaño del orbital. l (azimutal, 0–n−1): forma (s, p, d, f). ml (magnético, −l a +l): orientación. ms (spin, +½ o −½). No dos electrones pueden tener los 4 números iguales (principio de Pauli).",
      },
      {
        heading: "Orden de llenado (Aufbau)",
        body: "1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p → 6s → 4f → 5d → 6p → 7s → 5f → 6d → 7p. Hund: electrones llenan orbitales degenerados de forma paralela antes de emparejar. Excepciones: Cr [Ar]3d⁵4s¹ (no 3d⁴4s²) y Cu [Ar]3d¹⁰4s¹.",
        example: "Fe (Z=26): [Ar] 3d⁶ 4s². Configuración completa: 1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s².",
      },
      {
        heading: "Forma de orbitales",
        body: "s: esfera. p: dumbbell (3 orientaciones: px, py, pz). d: clover (5 orientaciones, excepto dz² que es dumbbell+aro). f: formas complejas (7 orientaciones). Los nodos aumentan con n.",
      },
    ],
  },
  {
    id: "termoquimica-adv",
    title: "Termoquímica: entalpía, entropía y Gibbs",
    level: "avanzado",
    summary: "Leyes de Hess, entalpías de formación y enlace, entropía, energía libre de Gibbs.",
    sections: [
      {
        heading: "Leyes de Hess",
        body: "La variación de entalpía de una reacción es independiente del camino, solo depende de los estados inicial y final. Se pueden sumar ecuaciones para obtener la reacción objetivo.",
        formulas: ["ΔH°rxn = Σ ΔHf°(productos) − Σ ΔHf°(reactivos)", "ΔH°rxn = Σ(bond energies reactants) − Σ(bond energies products)"],
      },
      {
        heading: "Entropía (S)",
        body: "Medida del desorden. ΔS = Sproductos − Sreactivos. El gas tiene más entropía que el líquido, que tiene más que el sólido. Aumenta con T, V, y número de moléculas de gas.",
        formulas: ["ΔS° = Σ S°(productos) − Σ S°(reactivos)"],
      },
      {
        heading: "Energía libre de Gibbs",
        body: "Determina la espontaneidad. ΔG < 0 → espontáneo (exergónico). ΔG > 0 → no espontáneo (endergónico). ΔG = 0 → equilibrio.",
        formulas: ["ΔG = ΔH − TΔS", "ΔG° = −RT ln K", "ΔG = ΔG° + RT ln Q"],
        example: "Haber-Bosch: ΔH° = −92 kJ, ΔS° = −199 J/K. A 298K: ΔG° = −92 − 298(−0.199) = −33 kJ → espontáneo. Pero a alta T, −TΔS dominaria → menos favorable.",
      },
    ],
  },
  {
    id: "electroquimica",
    title: "Electroquímica",
    level: "avanzado",
    summary: "Potenciales estándar, Nernst, pilas galvánicas, electrólisis, corrosion.",
    sections: [
      {
        heading: "Potenciales estándar de reducción",
        body: "Tabla de valores E° para semirreacciones. La FEM de una pila = E°cátodo − E°ánodo. Mayor FEM → mayor tendencia a reacción espontánea.",
        example: "Zn|Zn²⁺||Cu²⁺|Cu: E°(Cu²⁺/Cu)=+0.34V, E°(Zn²⁺/Zn)=−0.76V. FEM = 0.34−(−0.76) = 1.10V.",
      },
      {
        heading: "Ecuación de Nernst",
        body: "Describe cómo varía el potencial con concentraciones y temperatura.",
        formulas: ["E = E° − (RT/nF) ln Q", "A 25°C: E = E° − (0.0592/n) log Q"],
      },
      {
        heading: "Electrólisis",
        body: "Aplicar voltaje para forzar reacción no espontánea. Leyes de Faraday: 1 mol e⁻ = 96 485 C (constante de Faraday). Masas depositadas: m = (I × t × M) / (n × F).",
        formulas: ["m = (I × t × M) / (n × F)", "F = 96 485 C/mol"],
      },
    ],
  },
  {
    id: "quimica-ambiental",
    title: "Química ambiental y sostenibilidad",
    level: "avanzado",
    summary: "Ciclo del carbono, ozono, contaminación del agua, química verde.",
    sections: [
      {
        heading: "Ciclo del carbono",
        body: "CO₂ se disuelve en océanos, es fijado por fotosíntesis, liberado por respiración y combustión. El exceso de CO₂ antropogénico provoca acidificación oceánica (pH ↓ 0.1 desde era preindustrial) y calentamiento global.",
      },
      {
        heading: "Contaminación del agua",
        body: "DBO (demanda biológica de oxígeno): indica materia orgánica biodegradable. Metales pesados (Pb, Hg, Cd, Cr⁶⁺) son tóxicos y bioacumulativos. Nitratos de fertilizantes causan eutrofización.",
      },
      {
        heading: "Principios de química verde",
        body: "12 principios de Anastas y Warner: prevención, atom economy, síntesis menos peligrosa, diseño más seguro, solventes auxiliares, eficiencia energética, renovables, reducir derivados, catálisis, degradación, análisis en tiempo real, prevención de accidentes.",
      },
    ],
  },
];

const CALCULATORS = [
  { id: "mol-gram", title: "Moles ↔ Gramos", desc: "Convierte entre moles y gramos usando la masa molar", Comp: MolesGramos },
  { id: "molaridad", title: "Molaridad (C = n/V)", desc: "Calcula la concentración molar de una solución", Comp: MolaridadCalc },
  { id: "diluciones", title: "Diluciones (C₁V₁ = C₂V₂)", desc: "Resuelve problemas de dilución de soluciones", Comp: DilucionCalc },
  { id: "gas-ideal", title: "Gas Ideal (PV = nRT)", desc: "Calcula presión, volumen, moles o temperatura", Comp: GasIdealCalc },
  { id: "ph", title: "pH / pOH", desc: "Convierte entre [H⁺], [OH⁻], pH y pOH", Comp: PHCalc },
  { id: "concentraciones", title: "Concentraciones completas", desc: "Molaridad, molalidad, % peso a partir de masa, MM y volumen", Comp: ConcentracionesCalc },
];

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function Aprender() {
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [filter, setFilter] = useState<Level | "todos">("todos");
  const [openCalc, setOpenCalc] = useState<string | null>(null);

  const filtered = filter === "todos" ? TOPICS : TOPICS.filter((t) => t.level === filter);
  const groupOrder: Level[] = ["basico", "intermedio", "avanzado", "industria"];
  const grouped = groupOrder.map((lv) => ({
    level: lv,
    items: filtered.filter((t) => t.level === lv),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="aprender">
      <header className="aprender-head">
        <h1>Aprender Química</h1>
        <p className="lead">
          Desde los fundamentos del átomo hasta procesos industriales. Todo con datos reales, fórmulas verificables y calculadoras interactivas.
        </p>
      </header>

      {/* ── LEVEL FILTER ──────────────────────────────────────── */}
      <div className="filters" style={{ marginBottom: 24 }}>
        <button className={`chip ${filter === "todos" ? "on" : ""}`} onClick={() => setFilter("todos")}>Todos</button>
        <button className={`chip ${filter === "basico" ? "on" : ""}`} onClick={() => setFilter("basico")} style={{ borderColor: LEVEL_COLOR.basico }}>Básico</button>
        <button className={`chip ${filter === "intermedio" ? "on" : ""}`} onClick={() => setFilter("intermedio")} style={{ borderColor: LEVEL_COLOR.intermedio }}>Intermedio</button>
        <button className={`chip ${filter === "avanzado" ? "on" : ""}`} onClick={() => setFilter("avanzado")} style={{ borderColor: LEVEL_COLOR.avanzado }}>Avanzado</button>
        <button className={`chip ${filter === "industria" ? "on" : ""}`} onClick={() => setFilter("industria")} style={{ borderColor: LEVEL_COLOR.industria }}>Industria</button>
      </div>

      {/* ── TOPIC MODULES ─────────────────────────────────────── */}
      {grouped.map((g) => (
        <section key={g.level} id={g.level === "basico" ? "fundamentos" : g.level === "intermedio" ? "general" : g.level === "industria" ? "industria" : undefined}>
          <h2 style={{ color: LEVEL_COLOR[g.level], marginTop: 28, marginBottom: 12, fontSize: 18 }}>
            {LEVEL_LABEL[g.level]}
          </h2>
          <div className="topic-list">
            {g.items.map((t) => {
              const isOpen = openTopic === t.id;
              return (
                <div key={t.id} className={`topic-card ${isOpen ? "open" : ""}`}>
                  <button
                    className="topic-header"
                    onClick={() => setOpenTopic(isOpen ? null : t.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="topic-title">{t.title}</span>
                    <span className="topic-level" style={{ color: LEVEL_COLOR[t.level] }}>{LEVEL_LABEL[t.level]}</span>
                    <span className="topic-chevron">{isOpen ? "▾" : "▸"}</span>
                  </button>
                  {isOpen && (
                    <div className="topic-body">
                      <p className="topic-summary">{t.summary}</p>
                      {t.sections.map((s, i) => (
                        <div key={i} className="topic-section">
                          <h4>{s.heading}</h4>
                          <p>{s.body}</p>
                          {s.formulas && (
                            <div className="topic-formulas">
                              {s.formulas.map((f, j) => <code key={j}>{f}</code>)}
                            </div>
                          )}
                          {s.example && (
                            <div className="topic-example">
                              <span className="topic-ex-label">Ejemplo:</span> {s.example}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* ── CALCULATORS ───────────────────────────────────────── */}
      <section id="calculadoras" style={{ marginTop: 40 }}>
        <h2 style={{ color: "#f59e42", marginBottom: 12, fontSize: 18 }}>Calculadoras</h2>
        <div className="calc-list">
          {CALCULATORS.map((c) => {
            const isOpen = openCalc === c.id;
            return (
              <div key={c.id} className={`calc-card ${isOpen ? "open" : ""}`}>
                <button
                  className="calc-header"
                  onClick={() => setOpenCalc(isOpen ? null : c.id)}
                  aria-expanded={isOpen}
                >
                  <div>
                    <span className="calc-title">{c.title}</span>
                    <span className="calc-desc">{c.desc}</span>
                  </div>
                  <span className="topic-chevron">{isOpen ? "▾" : "▸"}</span>
                </button>
                {isOpen && <div className="calc-body"><c.Comp /></div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}