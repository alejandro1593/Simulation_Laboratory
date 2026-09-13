// Datos curados para herramientas didácticas (valores de referencia estándar).
// Regla: no inventar química; todo proviene de valores de tabla publicados.

export interface Substancia {
  key: string;
  nameEs: string;
  formula: string;
  state: "S" | "L" | "G";
  molar_mass: number;
  concentrations?: number[];
  color: string;
  strong?: "acid" | "base" | null;
  protons?: number;
}

export const SUBSTANCIAS: Substancia[] = [
  { key: "h2o", nameEs: "Agua destilada", formula: "H2O", state: "L", molar_mass: 18.015, color: "#bfe3ff" },
  { key: "hcl", nameEs: "Ácido clorhídrico (solución)", formula: "HCl", state: "L", molar_mass: 36.46, concentrations: [0.1, 1, 2, 6], strong: "acid", color: "#e6f7ff" },
  { key: "naoh", nameEs: "Hidróxido de sodio (solución)", formula: "NaOH", state: "L", molar_mass: 39.997, concentrations: [0.1, 1, 2], strong: "base", color: "#e8f5e9" },
  { key: "h2so4", nameEs: "Ácido sulfúrico (solución)", formula: "H2SO4", state: "L", molar_mass: 98.079, concentrations: [0.5, 1, 2], strong: "acid", protons: 2, color: "#f0f0f0" },
  { key: "ch3cooh", nameEs: "Ácido acético (vinagre)", formula: "CH3COOH", state: "L", molar_mass: 60.052, concentrations: [0.1, 1, 3], strong: null, color: "#fff8e1" },
  { key: "nahco3", nameEs: "Bicarbonato de sodio", formula: "NaHCO3", state: "S", molar_mass: 84.007, strong: "base", color: "#ffffff" },
  { key: "caco3", nameEs: "Carbonato de calcio (tiza)", formula: "CaCO3", state: "S", molar_mass: 100.087, strong: null, color: "#f3f3f3" },
  { key: "na2co3", nameEs: "Carbonato de sodio", formula: "Na2CO3", state: "S", molar_mass: 105.988, strong: "base", color: "#ffffff" },
  { key: "nacl", nameEs: "Cloruro de sodio (solución)", formula: "NaCl", state: "L", molar_mass: 58.44, concentrations: [0.1, 1, 2], strong: null, color: "#f4f9ff" },
  { key: "agno3", nameEs: "Nitrato de plata (solución)", formula: "AgNO3", state: "L", molar_mass: 169.873, concentrations: [0.05, 0.1, 0.5], strong: null, color: "#ffffff" },
  { key: "bacl2", nameEs: "Cloruro de bario (solución)", formula: "BaCl2", state: "L", molar_mass: 208.23, concentrations: [0.1, 0.5, 1], strong: null, color: "#ffffff" },
  { key: "na2so4", nameEs: "Sulfato de sodio (solución)", formula: "Na2SO4", state: "L", molar_mass: 142.04, concentrations: [0.1, 0.5, 1], strong: null, color: "#ffffff" },
  { key: "ki", nameEs: "Yoduro de potasio (solución)", formula: "KI", state: "L", molar_mass: 166.003, concentrations: [0.1, 0.5, 1], strong: null, color: "#ffffff" },
  { key: "pbno32", nameEs: "Nitrato de plomo (II)", formula: "Pb(NO3)2", state: "L", molar_mass: 331.21, concentrations: [0.05, 0.1, 0.5], strong: null, color: "#ffffff" },
  { key: "cuso4", nameEs: "Sulfato de cobre (II)", formula: "CuSO4", state: "L", molar_mass: 159.609, concentrations: [0.1, 0.5, 1], strong: null, color: "#4a8fe7" },
  { key: "zn", nameEs: "Zinc (granalla)", formula: "Zn", state: "S", molar_mass: 65.38, strong: null, color: "#9aaa9a" },
  { key: "cu", nameEs: "Cobre (laminado)", formula: "Cu", state: "S", molar_mass: 63.546, strong: null, color: "#d28a3c" },
  { key: "fe", nameEs: "Hierro (limadura)", formula: "Fe", state: "S", molar_mass: 55.845, strong: null, color: "#8b8f95" },
  { key: "nh3", nameEs: "Amoniaco (solución)", formula: "NH3", state: "L", molar_mass: 17.031, concentrations: [0.5, 1, 2], strong: "base", color: "#f1f8e9" },
  { key: "h2o2", nameEs: "Peróxido de hidrógeno (agua oxigenada)", formula: "H2O2", state: "L", molar_mass: 34.015, concentrations: [0.88, 3], strong: null, color: "#e3f2fd" },
  { key: "o2", nameEs: "Dioxígeno (gas)", formula: "O2", state: "G", molar_mass: 31.998, strong: null, color: "#9bd0ff" },
  { key: "ch4", nameEs: "Metano (gas)", formula: "CH4", state: "G", molar_mass: 16.043, strong: null, color: "#c8e6c9" },
  { key: "c3h8", nameEs: "Propano (gas)", formula: "C3H8", state: "G", molar_mass: 44.097, strong: null, color: "#e8d5c4" },
  { key: "c2h5oh", nameEs: "Etanol (alcohol etílico)", formula: "C2H5OH", state: "L", molar_mass: 46.069, strong: null, color: "#fff8e1" },
  { key: "mg", nameEs: "Magnesio (cinta)", formula: "Mg", state: "S", molar_mass: 24.305, strong: null, color: "#d9d9d9" },
  { key: "al", nameEs: "Aluminio (lámina)", formula: "Al", state: "S", molar_mass: 26.982, strong: null, color: "#c0c7cf" },
  { key: "mgcl2", nameEs: "Cloruro de magnesio (solución)", formula: "MgCl2", state: "L", molar_mass: 95.211, concentrations: [0.1, 0.5, 1], strong: null, color: "#f5f5f5" },
  { key: "cacl2", nameEs: "Cloruro de calcio (solución)", formula: "CaCl2", state: "L", molar_mass: 110.98, concentrations: [0.1, 0.5, 1], strong: null, color: "#f5f5f5" },
  { key: "feso4", nameEs: "Sulfato de hierro (II)", formula: "FeSO4", state: "L", molar_mass: 151.908, concentrations: [0.1, 0.5, 1], strong: null, color: "#b7e0c0" },
  { key: "fecl3", nameEs: "Cloruro de hierro (III)", formula: "FeCl3", state: "L", molar_mass: 162.204, concentrations: [0.1, 0.5, 1], strong: null, color: "#e3c35f" },
  { key: "hno3", nameEs: "Ácido nítrico (solución)", formula: "HNO3", state: "L", molar_mass: 63.012, concentrations: [1, 3, 6], strong: "acid", color: "#f5f0e1" },
];

export const byKey = (k: string): Substancia | undefined => SUBSTANCIAS.find((s) => s.key === k);

// ------------------------------------------------ valoración ácido-base
export interface Acido {
  key: string;
  label: string;
  nombre: string;
  formula: string;
  fuerte: boolean;
  protones: number;
  ka?: number;
}
export interface Base {
  key: string;
  label: string;
  nombre: string;
  formula: string;
  fuerte: boolean;
  kb?: number;
}

export const ACIDOS: Acido[] = [
  { key: "hcl", label: "HCl (1 M)", nombre: "Ácido clorhídrico (fuerte)", formula: "HCl", fuerte: true, protones: 1 },
  { key: "h2so4", label: "H2SO4 (0,5 M)", nombre: "Ácido sulfúrico (fuerte, diprótico)", formula: "H2SO4", fuerte: true, protones: 2 },
  { key: "ch3cooh", label: "CH3COOH (1 M)", nombre: "Ácido acético (débil, Ka=1,8·10⁻⁵)", formula: "CH3COOH", fuerte: false, protones: 1, ka: 1.8e-5 },
];

export const BASES: Base[] = [
  { key: "naoh", label: "NaOH (1 M)", nombre: "Hidróxido de sodio (fuerte)", formula: "NaOH", fuerte: true },
  { key: "nh3", label: "NH3 (1 M)", nombre: "Amoniaco (débil, Kb=1,8·10⁻⁵)", formula: "NH3", fuerte: false, kb: 1.8e-5 },
];

// ------------------------------------------------ retos: balanceo
export const RETOS_BALANCEO: { eq: string; coefs: number[]; partes: string[] }[] = [
  { eq: "H2 + O2 → H2O", coefs: [2, 1, 2], partes: ["H2", "O2", "H2O"] },
  { eq: "N2 + H2 → NH3", coefs: [1, 3, 2], partes: ["N2", "H2", "NH3"] },
  { eq: "CH4 + O2 → CO2 + H2O", coefs: [1, 2, 1, 2], partes: ["CH4", "O2", "CO2", "H2O"] },
  { eq: "Al + O2 → Al2O3", coefs: [4, 3, 2], partes: ["Al", "O2", "Al2O3"] },
  { eq: "KClO3 → KCl + O2", coefs: [2, 2, 3], partes: ["KClO3", "KCl", "O2"] },
  { eq: "Na + Cl2 → NaCl", coefs: [2, 1, 2], partes: ["Na", "Cl2", "NaCl"] },
  { eq: "C3H8 + O2 → CO2 + H2O", coefs: [1, 5, 3, 4], partes: ["C3H8", "O2", "CO2", "H2O"] },
  { eq: "Fe + O2 → Fe2O3", coefs: [4, 3, 2], partes: ["Fe", "O2", "Fe2O3"] },
  { eq: "Cu + HNO3 → Cu(NO3)2 + NO2 + H2O", coefs: [1, 4, 1, 2, 2], partes: ["Cu", "HNO3", "Cu(NO3)2", "NO2", "H2O"] },
  { eq: "CaCO3 → CaO + CO2", coefs: [1, 1, 1], partes: ["CaCO3", "CaO", "CO2"] },
];

// ------------------------------------------------ retos: estequiometría
export const RETOS_ESTEQ: {
  q: string;
  ecuacion: string;
  rel: [number, number];
  datoGramos: number;
  M: number[];
  fmt: number;
}[] = [
  { q: "Si reaccionan 6,5 g de Zn con HCl, ¿cuántos gramos de H2 se obtienen?", ecuacion: "Zn + 2 HCl → ZnCl2 + H2", rel: [1, 1], datoGramos: 6.5, M: [65.38, 2.016], fmt: 3 },
  { q: "Con 8 g de H2 (H2 + O2 → H2O), ¿cuántos gramos de agua se forman?", ecuacion: "2 H2 + O2 → 2 H2O", rel: [2, 2], datoGramos: 8, M: [2.016, 18.015], fmt: 2 },
  { q: "¿Cuántos gramos de CO2 produce la combustión de 4 g de CH4?", ecuacion: "CH4 + 2 O2 → CO2 + 2 H2O", rel: [1, 1], datoGramos: 4, M: [16.043, 44.01], fmt: 2 },
  { q: "Al quemar 44 g de propano (C3H8), ¿cuántos gramos de CO2 salen?", ecuacion: "C3H8 + 5 O2 → 3 CO2 + 4 H2O", rel: [1, 3], datoGramos: 44, M: [44.097, 44.01], fmt: 1 },
  { q: "Si se disuelven 4 g de NaOH en agua, ¿qué masa de NaCl se obtiene al neutralizar con HCl?", ecuacion: "NaOH + HCl → NaCl + H2O", rel: [1, 1], datoGramos: 4, M: [39.997, 58.44], fmt: 2 },
  { q: "Con 10 g de Mg reaccionando con HCl, ¿cuántos gramos de H2 se liberan?", ecuacion: "Mg + 2 HCl → MgCl2 + H2", rel: [1, 1], datoGramos: 10, M: [24.305, 2.016], fmt: 2 },
];

// ------------------------------------------------ retos: nomenclatura
export const RETOS_NOMEN: { q: string; a: string; opts: string[] }[] = [
  { q: "CH4", a: "Metano", opts: ["Metano", "Eteno", "Etino", "Propano"] },
  { q: "C2H6", a: "Etano", opts: ["Metano", "Etano", "Etanol", "Eteno"] },
  { q: "C2H4", a: "Eteno", opts: ["Etino", "Etano", "Eteno", "Etanol"] },
  { q: "CH3OH", a: "Metanol", opts: ["Metanal", "Metanol", "Metano", "Metanamina"] },
  { q: "C2H5OH", a: "Etanol", opts: ["Etanol", "Etanal", "Ácido etanoico", "Etoxietano"] },
  { q: "CH3COOH", a: "Ácido etanoico (acético)", opts: ["Ácido etanoico (acético)", "Etanol", "Etanoato de metilo", "Metanal"] },
  { q: "CH3COCH3 / CH3-CO-CH3", a: "Propanona (acetona)", opts: ["Propanona (acetona)", "Propanal", "Propanol", "Propano"] },
  { q: "CH3-CH2-CH2-CH3", a: "Butano", opts: ["Butano", "2-metilpropano", "Buteno", "Butanol"] },
  { q: "CH3NH2", a: "Metanamina", opts: ["Metanamina", "Metanol", "Metano", "Nitrometano"] },
  { q: "C2H6O (éter)", a: "Metoximetano (éter dimetílico)", opts: ["Metoximetano", "Etanol", "Metanal", "Ácido metanoico"] },
];

// ------------------------------------------------ termoquímica (25 °C, 1 atm)
export interface TermoRxn {
  id: string;
  nombre: string;
  ecuacion: string;
  dH: number;
  dG: number;
  tipo: "exotermica" | "endotermica" | "electrolisis" | "fotosintesis";
  espontanea: boolean;
  condicion?: string;
  nota?: string;
}

export const TERMO: TermoRxn[] = [
  { id: "t-ohm", nombre: "Formación del agua", ecuacion: "2 H2 (g) + O2 (g) → 2 H2O (l)", dH: -571.6, dG: -474.2, tipo: "exotermica", espontanea: true, condicion: "Requiere chispa inicial", nota: "Entalpía de formación ΔHf°(H2O, l) = −285,8 kJ/mol." },
  { id: "t-ch4", nombre: "Combustión del metano", ecuacion: "CH4 (g) + 2 O2 (g) → CO2 (g) + 2 H2O (l)", dH: -890.0, dG: -818.0, tipo: "exotermica", espontanea: true, condicion: "Encendido", nota: "Combustión del gas natural a 25 °C." },
  { id: "t-c", nombre: "Combustión del carbono", ecuacion: "C (s) + O2 (g) → CO2 (g)", dH: -393.5, dG: -394.4, tipo: "exotermica", espontanea: true, nota: "ΔHc° del grafito." },
  { id: "t-co", nombre: "Oxidación del CO", ecuacion: "2 CO (g) + O2 (g) → 2 CO2 (g)", dH: -566.0, dG: -514.4, tipo: "exotermica", espontanea: true, nota: "ΔHc°(CO) = −283,0 kJ/mol." },
  { id: "t-haber", nombre: "Síntesis del amoniaco (Haber)", ecuacion: "N2 (g) + 3 H2 (g) → 2 NH3 (g)", dH: -92.2, dG: -32.8, tipo: "exotermica", espontanea: true, condicion: "Catalizador Fe, 400–500 °C, alta presión", nota: "ΔG° < 0 pero la cinética requiere catalizador." },
  { id: "t-neutro", nombre: "Neutralización HCl + NaOH", ecuacion: "HCl (ac) + NaOH (ac) → NaCl (ac) + H2O (l)", dH: -57.2, dG: -79.9, tipo: "exotermica", espontanea: true, condicion: "Rápida y total", nota: "ΔG° de la neutralización H⁺ + OH⁻ ≈ −79,9 kJ/mol." },
  { id: "t-neutro2", nombre: "Neutralización con H2SO4", ecuacion: "H2SO4 (ac) + 2 NaOH (ac) → Na2SO4 (ac) + 2 H2O (l)", dH: -111.7, dG: -159.8, tipo: "exotermica", espontanea: true, nota: "Dos equivalentes de neutralización." },
  { id: "t-foto", nombre: "Fotosíntesis (glucosa)", ecuacion: "6 CO2 (g) + 6 H2O (l) → C6H12O6 (s) + 6 O2 (g)", dH: 2803, dG: 2879, tipo: "fotosintesis", espontanea: false, condicion: "Requiere luz (energía solar)", nota: "Proceso endotérmico no espontáneo: la energía de la luz lo impulsa." },
  { id: "t-caco3", nombre: "Descomposición del carbonato", ecuacion: "CaCO3 (s) → CaO (s) + CO2 (g)", dH: 178.3, dG: 130.4, tipo: "endotermica", espontanea: false, condicion: "Calcinación a >800 °C", nota: "No espontánea a 25 °C; se logra por calor en horno." },
  { id: "t-elec", nombre: "Electrólisis del agua", ecuacion: "2 H2O (l) → 2 H2 (g) + O2 (g)", dH: 571.6, dG: 474.2, tipo: "electrolisis", espontanea: false, condicion: "Energía eléctrica", nota: "El trabajo eléctrico (ΔG) impulsa una reacción no espontánea." },
];

// ------------------------------------------------ VSEPR
export interface VseprMol {
  id: string;
  formula: string;
  nombre: string;
  axe: string;
  central: string;
  atomos: number;
  paresLibres: number;
  forma: string;
  angulo: string;
  hijos: Record<string, number>; // ligandos por posición angular (en grados respecto al eje Y)
}

const POS_2 = { arriba: 180, abajo: 0 };
const POS_3 = { izq: 150, der: 30, abajo: 270 };
export const VSEPR: VseprMol[] = [
  { id: "becl2", formula: "BeCl2", nombre: "Dicloruro de berilio", axe: "AX2", central: "Be", atomos: 2, paresLibres: 0, forma: "Lineal", angulo: "180°", hijos: POS_2 },
  { id: "co2", formula: "CO2", nombre: "Dióxido de carbono", axe: "AX2", central: "C", atomos: 2, paresLibres: 0, forma: "Lineal", angulo: "180°", hijos: POS_2 },
  { id: "bcl3", formula: "BCl3", nombre: "Tricloruro de boro", axe: "AX3", central: "B", atomos: 3, paresLibres: 0, forma: "Trigonal plana", angulo: "120°", hijos: POS_3 },
  { id: "ch2o", formula: "CH2O", nombre: "Metanal (formaldehído)", axe: "AX3", central: "C", atomos: 3, paresLibres: 0, forma: "Trigonal plana", angulo: "120°", hijos: POS_3 },
  { id: "ch4", formula: "CH4", nombre: "Metano", axe: "AX4", central: "C", atomos: 4, paresLibres: 0, forma: "Tetraédrica", angulo: "109,5°", hijos: { izq: 215, der: 325, frente: 90, atras: -45 } },
  { id: "ccl4", formula: "CCl4", nombre: "Tetracloruro de carbono", axe: "AX4", central: "C", atomos: 4, paresLibres: 0, forma: "Tetraédrica", angulo: "109,5°", hijos: { izq: 215, der: 325, frente: 90, atras: -45 } },
  { id: "nh3", formula: "NH3", nombre: "Amoniaco", axe: "AX3E", central: "N", atomos: 3, paresLibres: 1, forma: "Pirámide trigonal", angulo: "107°", hijos: { izq: 210, der: 330, abajo: 45 } },
  { id: "h2o", formula: "H2O", nombre: "Agua", axe: "AX2E2", central: "O", atomos: 2, paresLibres: 2, forma: "Angular (V)", angulo: "104,5°", hijos: { izq: 200, der: 340 } },
  { id: "so2", formula: "SO2", nombre: "Dióxido de azufre", axe: "AX2E", central: "S", atomos: 2, paresLibres: 1, forma: "Angular", angulo: "≈119°", hijos: { izq: 160, der: 20 } },
  { id: "pcl5", formula: "PCl5", nombre: "Pentacloruro de fósforo", axe: "AX5", central: "P", atomos: 5, paresLibres: 0, forma: "Bipirámide trigonal", angulo: "90° / 120°", hijos: { izq: 150, der: 30, up: 225, down: 315, vertical: 90 } },
  { id: "xef2", formula: "XeF2", nombre: "Difluoruro de xenón", axe: "AX2E3", central: "Xe", atomos: 2, paresLibres: 3, forma: "Lineal", angulo: "180°", hijos: POS_2 },
  { id: "sf6", formula: "SF6", nombre: "Hexafluoruro de azufre", axe: "AX6", central: "S", atomos: 6, paresLibres: 0, forma: "Octaédrica", angulo: "90°", hijos: { izq: 180, der: 0, up: 90, down: 270, frente: 45, atras: 135 } },
  { id: "xef4", formula: "XeF4", nombre: "Tetrafluoruro de xenón", axe: "AX4E2", central: "Xe", atomos: 4, paresLibres: 2, forma: "Cuadrado planar", angulo: "90°", hijos: { up: 0, der: 90, down: 180, izq: 270 } },
  { id: "sf4", formula: "SF4", nombre: "Tetrafluoruro de azufre", axe: "AX4E", central: "S", atomos: 4, paresLibres: 1, forma: "Balancín (see-saw)", angulo: "≈101,5° / 173°", hijos: { izq: 145, der: 35, up: 250, down: 110 } },
  { id: "clf3", formula: "ClF3", nombre: "Trifluoruro de cloro", axe: "AX3E2", central: "Cl", atomos: 3, paresLibres: 2, forma: "Forma de T", angulo: "≈87,5°", hijos: { up: 90, down: 270, izq: 160 } },
  { id: "if5", formula: "IF5", nombre: "Pentafluoruro de yodo", axe: "AX5E", central: "I", atomos: 5, paresLibres: 1, forma: "Pirámide de base cuadrada", angulo: "≈90°", hijos: { up: 0, der: 90, down: 180, izq: 270, vertical: 60 } },
];

// ------------------------------------------------ isomería
export interface Isomero {
  id: string;
  tipo: "cadena" | "posicion" | "funcion" | "geometrica" | "optica";
  grupo: string;
  moleculas: { nombre: string; formula: string; esqueleto: string; nota: string }[];
}

export const ISOMERIA: Isomero[] = [
  {
    id: "iso-cadena", tipo: "cadena", grupo: "Isomería de cadena (C4H10, C5H12)",
    moleculas: [
      { nombre: "Butano", formula: "C4H10", esqueleto: "C-C-C-C", nota: "Cadena lineal." },
      { nombre: "2-metilpropano (isobutano)", formula: "C4H10", esqueleto: "C-C(C)-C", nota: "Cadena ramificada; ambos C4H10." },
      { nombre: "2,2-dimetilpropano (neopentano)", formula: "C5H12", esqueleto: "C-C(C)(C)-C", nota: "Uno de los 3 isómeros de C5H12." },
    ],
  },
  {
    id: "iso-posicion", tipo: "posicion", grupo: "Isomería de posición (C3H8O / C3H7Cl)",
    moleculas: [
      { nombre: "1-propanol", formula: "C3H8O", esqueleto: "HO-C-C-C", nota: "Grupo –OH en el C1." },
      { nombre: "2-propanol", formula: "C3H8O", esqueleto: "C-C(OH)-C", nota: "Grupo –OH en el C2." },
      { nombre: "1-cloropropano", formula: "C3H7Cl", esqueleto: "Cl-C-C-C", nota: "Cloro terminal." },
      { nombre: "2-cloropropano", formula: "C3H7Cl", esqueleto: "C-C(Cl)-C", nota: "Cloro interno." },
    ],
  },
  {
    id: "iso-funcion", tipo: "funcion", grupo: "Isomería de función (C2H6O / C3H6O)",
    moleculas: [
      { nombre: "Etanol", formula: "C2H6O", esqueleto: "C-C-OH", nota: "Alcohol." },
      { nombre: "Metoximetano (éter dimetílico)", formula: "C2H6O", esqueleto: "C-O-C", nota: "Éter; misma fórmula empírica, distinta función." },
      { nombre: "Propanal", formula: "C3H6O", esqueleto: "CHO-C-C", nota: "Aldehído." },
      { nombre: "Propanona (acetona)", formula: "C3H6O", esqueleto: "C-CO-C", nota: "Cetona." },
    ],
  },
  {
    id: "iso-geo", tipo: "geometrica", grupo: "Isomería geométrica (cis/trans)",
    moleculas: [
      { nombre: "cis-2-buteno", formula: "C4H8", esqueleto: "CH3 | C=C | CH3 (mismo lado)", nota: "Los grupos CH3 en el mismo lado del doble enlace." },
      { nombre: "trans-2-buteno", formula: "C4H8", esqueleto: "CH3 | C=C | CH3 (lados opuestos)", nota: "Menor polaridad; punto de ebullición más bajo." },
      { nombre: "cis-1,2-dicloroeteno", formula: "C2H2Cl2", esqueleto: "Cl en el mismo lado", nota: "Cl2C=C... geometría cis." },
    ],
  },
  {
    id: "iso-optica", tipo: "optica", grupo: "Isomería óptica (quiralidad)",
    moleculas: [
      { nombre: "2-butanol (quiral)", formula: "C4H10O", esqueleto: "C-C(OH)-C-C", nota: "C2 con 4 sustituyentes distintos: carbono quiral." },
      { nombre: "Alanina (L/D)", formula: "C3H7NO2", esqueleto: "H2N-CH(CH3)-COOH", nota: "Aminoácido con carbono α quiral." },
      { nombre: "Ácido láctico", formula: "C3H6O3", esqueleto: "CH3-CH(OH)-COOH", nota: "Enantiómeros L (+) y D (−)." },
    ],
  },
];

// ------------------------------------------------ compatibilidad (laboratorio libre)
export interface CompatRule {
  a: string;
  b: string;
  tipo: "reacciona" | "precipita" | "gas" | "peligro" | "inert";
  titulo: string;
  detalle: string;
  colores?: [string, string];
}

export const COMPAT: CompatRule[] = [
  { a: "hcl", b: "naoh", tipo: "reacciona", titulo: "Reacción de neutralización", detalle: "Ácido fuerte + base fuerte: se forma sal y agua con liberación de calor (ΔH ≈ −57 kJ/mol)." },
  { a: "hcl", b: "nh3", tipo: "reacciona", titulo: "Nube de humo blanco", detalle: "HCl + NH3 → NH4Cl (s): se forman vapores blancos de cloruro de amonio." },
  { a: "hcl", b: "zn", tipo: "gas", titulo: "Desprendimiento de H2", detalle: "Ácido + metal: Zn + 2 HCl → ZnCl2 + H2 (g). Gas inflamable." },
  { a: "hcl", b: "mg", tipo: "gas", titulo: "Desprendimiento de H2", detalle: "Mg + 2 HCl → MgCl2 + H2 (g)." },
  { a: "hcl", b: "al", tipo: "gas", titulo: "Desprendimiento de H2", detalle: "2 Al + 6 HCl → 2 AlCl3 + 3 H2 (g)." },
  { a: "hcl", b: "fe", tipo: "gas", titulo: "Desprendimiento de H2", detalle: "Fe + 2 HCl → FeCl2 + H2 (g)." },
  { a: "hcl", b: "caco3", tipo: "gas", titulo: "Efervescencia: CO2", detalle: "CaCO3 + 2 HCl → CaCl2 + CO2 (g) + H2O." },
  { a: "hcl", b: "nahco3", tipo: "gas", titulo: "Efervescencia: CO2", detalle: "NaHCO3 + HCl → NaCl + CO2 (g) + H2O." },
  { a: "hcl", b: "na2co3", tipo: "gas", titulo: "Efervescencia: CO2", detalle: "Na2CO3 + 2 HCl → 2 NaCl + CO2 (g) + H2O." },
  { a: "hno3", b: "cu", tipo: "gas", titulo: "Gas NO2 pardo", detalle: "Cu + 4 HNO3 → Cu(NO3)2 + 2 NO2 (g) + 2 H2O. Oxidación del cobre." },
  { a: "hno3", b: "c2h5oh", tipo: "peligro", titulo: "Riesgo de incendio", detalle: "Ácido nítrico concentrado es oxidante y puede reaccionar violentamente con alcoholes/orgánicos." },
  { a: "h2o2", b: "ki", tipo: "gas", titulo: "Descomposición catalítica: O2", detalle: "KI cataliza 2 H2O2 → 2 H2O + O2 (g): 'pasta de dientes de elefante'." },
  { a: "h2o2", b: "fe", tipo: "gas", titulo: "Descomposición acelerada", detalle: "El hierro cataliza la descomposición del H2O2 con desprendimiento de oxígeno y calor." },
  { a: "h2o2", b: "c2h5oh", tipo: "peligro", titulo: "Mezcla oxidante + combustible", detalle: "El peróxido concentrado es oxidante: evitar contacto con sustancias inflamables como el etanol." },
  { a: "agno3", b: "nacl", tipo: "precipita", titulo: "Precipitado blanco", detalle: "AgNO3 + NaCl → AgCl (s) + NaNO3." },
  { a: "bacl2", b: "na2so4", tipo: "precipita", titulo: "Precipitado blanco", detalle: "BaCl2 + Na2SO4 → BaSO4 (s) + 2 NaCl." },
  { a: "pbno32", b: "ki", tipo: "precipita", titulo: "Lluvia dorada", detalle: "Pb(NO3)2 + 2 KI → PbI2 (s, amarillo) + 2 KNO3." },
  { a: "cuso4", b: "naoh", tipo: "precipita", titulo: "Precipitado azul", detalle: "CuSO4 + 2 NaOH → Cu(OH)2 (s) + Na2SO4." },
  { a: "zn", b: "cuso4", tipo: "reacciona", titulo: "Desplazamiento redox", detalle: "Zn + CuSO4 → ZnSO4 + Cu (s). El cobre se deposita sobre el zinc." },
  { a: "cu", b: "agno3", tipo: "reacciona", titulo: "Árbol de plata", detalle: "Cu + 2 AgNO3 → Cu(NO3)2 + 2 Ag (s). Plata depositada." },
  { a: "mgcl2", b: "naoh", tipo: "precipita", titulo: "Precipitado blanco", detalle: "MgCl2 + 2 NaOH → Mg(OH)2 (s) + 2 NaCl." },
  { a: "feso4", b: "naoh", tipo: "precipita", titulo: "Precipitado verdoso", detalle: "FeSO4 + 2 NaOH → Fe(OH)2 (s) + Na2SO4." },
  { a: "fecl3", b: "naoh", tipo: "precipita", titulo: "Precipitado pardo", detalle: "FeCl3 + 3 NaOH → Fe(OH)3 (s) + 3 NaCl." },
  { a: "cacl2", b: "na2co3", tipo: "precipita", titulo: "Precipitado blanco", detalle: "CaCl2 + Na2CO3 → CaCO3 (s) + 2 NaCl." },
  { a: "h2so4", b: "c2h5oh", tipo: "peligro", titulo: "Deshidratación violenta", detalle: "El H2SO4 concentrado deshidrata el etanol con fuerte calor: usar en frío y con cuidado." },
  { a: "h2so4", b: "cu", tipo: "inert", titulo: "Sin reacción apreciable a 25 °C", detalle: "El cobre no es atacado por H2SO4 diluido en frío (solo gases calientes oxidantes lo atacan)." },
];

// ------------------------------------------------ isótopos y usos (elementos comunes)
export const ISOTOPOS: Record<number, string> = {
  1: "¹H (99,98 %), ²H deuterio (0,015 %), ³H tritio (trazas)",
  6: "¹²C (98,9 %), ¹³C (1,1 %), ¹⁴C (radiactivo, datación)",
  7: "¹⁴N (99,6 %), ¹⁵N (0,4 %)",
  8: "¹⁶O (99,76 %), ¹⁷O (0,04 %), ¹⁸O (0,20 %)",
  9: "¹⁹F (100 %)",
  11: "²³Na (100 %)",
  12: "²⁴Mg (79 %), ²⁵Mg (10 %), ²⁶Mg (11 %)",
  13: "²⁷Al (100 %)",
  14: "²⁸Si (92,2 %), ²⁹Si (4,7 %), ³⁰Si (3,1 %)",
  15: "³¹P (100 %)",
  16: "³²S (94,9 %), ³³S (0,76 %), ³⁴S (4,3 %), ³⁶S (0,02 %)",
  17: "³⁵Cl (75,8 %), ³⁷Cl (24,2 %)",
  19: "³⁹K (93,3 %), ⁴⁰K (0,01 %), ⁴¹K (6,7 %)",
  20: "⁴⁰Ca (96,9 %), ⁴²Ca (0,6 %)…",
  26: "⁵⁴Fe (5,8 %), ⁵⁶Fe (91,7 %), ⁵⁷Fe (2,2 %), ⁵⁸Fe (0,3 %)",
  29: "⁶³Cu (69,2 %), ⁶⁵Cu (30,8 %)",
  30: "⁶⁴Zn (49,2 %), ⁶⁶Zn (27,7 %), ⁶⁸Zn (18,4 %)",
  42: "⁹²Mo (14,8 %), ⁹⁸Mo (24,1 %), ¹⁰⁰Mo (9,6 %)…",
  47: "¹⁰⁷Ag (51,8 %), ¹⁰⁹Ag (48,2 %)",
  53: "¹²⁷I (100 %)",
  56: "¹³⁸Ba (71,7 %), ¹³⁷Ba (11,2 %)…",
  79: "¹⁹⁷Au (100 %)",
  80: "²⁰²Hg?, ²⁰⁰Hg (23,1 %), ¹⁹⁹Hg (16,9 %)…",
  82: "²⁰⁷Pb (22,1 %), ²⁰⁸Pb (52,4 %)…",
  92: "²³⁴U (0,005 %), ²³⁵U (0,72 %), ²³⁸U (99,27 %)",
};

export const USOS: Record<number, string> = {
  1: "Combustible de cohetes (H2), síntesis de amoniaco, hidrogenación, celdas de combustible.",
  2: "Globos y dirigibles, atmósferas protectoras, criogenia, respiraciones de buceo (mezcla heliox).",
  6: "Combustibles fósiles, acero, grafito de lápices y lubricantes, diamante, materiales compuestos.",
  7: "Fertilizantes (amoniaco), explosivos, conservantes, refrigerantes.",
  8: "Respiración, soldadura oxiacetilénica, acero en altos hornos, medicina (tanques de oxígeno).",
  9: "Pastas de dientes (fija el flúor), refrigerantes, polímeros como el PTFE.",
  11: "Sal común, sosa cáustica, bicarbonato, metalurgia del aluminio.",
  13: "Latas y papel de aluminio, aviación y transporte, conductores, aviones.",
  14: "Silicio para electrónica y paneles solares, vidrio, cemento y cerámica.",
  15: "Fertilizantes, cerillas, aceros, ácido fosfórico de bebidas cola.",
  16: "Ácido sulfúrico (la sustancia química más producida), vulcanización del caucho, baterías.",
  17: "Agua de piscinas, PVC, desinfección de agua, disolventes industriales.",
  19: "Fertilizantes de potasa, electrolitos, vidrio y jabones.",
  26: "Acero y hierro fundido (construcción y maquinaria), imanes, biomedicina.",
  29: "Cables eléctricos, fontanería, monedas, industria electrónica.",
  30: "Galvanizado del acero (anticorrosión), baterías, aleaciones de latón.",
  47: "Joyería, fotografía, electrónica, espejos (plata metálica).",
  53: "Desinfectantes, hormonas tiroideas, contraste radiológico, fotografía.",
  79: "Joyería, contactos eléctricos (no se oxida), reserva monetaria, odontología.",
  92: "Combustible de reactores nucleares (U-235), armamento nuclear, blindaje (U empobrecido).",
};