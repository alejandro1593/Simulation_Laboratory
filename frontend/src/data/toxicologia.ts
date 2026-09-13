// Datos de toxicología educativa: LD50, pictogramas GHS y peligros
// para reactivos de laboratorio y los 118 elementos.
// Valores aproximados de SDS/fichas de seguridad. Solo fines educativos.

import { ELEMENTS, type Categoría } from "./elements";

export interface ToxReactivo {
  key: string;
  nombre: string;
  formula: string;
  pictogramas: string[];
  ruta: string;
  ld50: string;
  peligro: string;
}

export interface ToxElemento {
  z: number;
  s: string;
  nE: string;
  cat: string;
  pictogramas: string[];
  ruta: string;
  peligro: string;
}

/* ------------------------------------------------------------------ */
/*  Reactivos (31, clave = key de experiments.json)                   */
/* ------------------------------------------------------------------ */

export const TOX_REACTIVOS: ToxReactivo[] = [
  { key: "h2o",    nombre: "Agua destilada",             formula: "H2O",   pictogramas: [],                ruta: "—",                 ld50: "No significativa",                peligro: "Sin peligro notable" },
  { key: "hcl",    nombre: "Ácido clorhídrico",          formula: "HCl",   pictogramas: ["g05"],           ruta: "oral/inhalación",    ld50: "~700–900",                       peligro: "Corrosivo; daño grave por inhalación de vapores" },
  { key: "naoh",   nombre: "Hidróxido de sodio",         formula: "NaOH",  pictogramas: ["g05"],           ruta: "oral/contacto",      ld50: "~273",                           peligro: "Corrosivo; quemaduras graves en piel y ojos" },
  { key: "h2so4",  nombre: "Ácido sulfúrico",            formula: "H2SO4", pictogramas: ["g05"],           ruta: "oral/contacto",      ld50: "~2140",                          peligro: "Corrosivo; libera calor al diluirse" },
  { key: "ch3cooh",nombre: "Ácido acético",              formula: "CH3COOH",pictogramas: ["g07"],          ruta: "oral",               ld50: "~3310",                          peligro: "Irritante; corrosivo en concentraciones altas" },
  { key: "nahco3", nombre: "Bicarbonato de sodio",       formula: "NaHCO3",pictogramas: [],                ruta: "oral",               ld50: "~4220",                          peligro: "Baja toxicidad aguda" },
  { key: "caco3",  nombre: "Carbonato de calcio",        formula: "CaCO3", pictogramas: [],                ruta: "oral",               ld50: "~6400",                          peligro: "Baja toxicidad aguda" },
  { key: "na2co3", nombre: "Carbonato de sodio",         formula: "Na2CO3",pictogramas: ["g07"],           ruta: "oral",               ld50: "~4890",                          peligro: "Irritante; alcalino" },
  { key: "nacl",   nombre: "Cloruro de sodio",           formula: "NaCl",  pictogramas: [],                ruta: "oral",               ld50: "No significativa",                peligro: "Sin peligro notable en disolución diluida" },
  { key: "agno3",  nombre: "Nitrato de plata",           formula: "AgNO3", pictogramas: ["g05", "g07"],    ruta: "oral/contacto",      ld50: "~1173",                          peligro: "Corrosivo; mancha la piel (argiria)" },
  { key: "bacl2",  nombre: "Cloruro de bario",           formula: "BaCl2", pictogramas: ["g06"],           ruta: "oral",               ld50: "~118",                           peligro: "TÓXICO; bloqueo del potasio; puede causar arritmia" },
  { key: "na2so4", nombre: "Sulfato de sodio",           formula: "Na2SO4",pictogramas: [],                ruta: "oral",               ld50: "~5989",                          peligro: "Baja toxicidad aguda" },
  { key: "ki",     nombre: "Yoduro de potasio",          formula: "KI",    pictogramas: ["g07"],           ruta: "oral",               ld50: "~4300",                          peligro: "Irritante en exceso; efectos tiroideos crónicos" },
  { key: "pbno32", nombre: "Nitrato de plomo (II)",      formula: "Pb(NO3)2",pictogramas: ["g06", "g08"],  ruta: "oral",               ld50: "~390",                           peligro: "TÓXICO; plomo acumulativo; neurotóxico" },
  { key: "cuso4",  nombre: "Sulfato de cobre (II)",      formula: "CuSO4", pictogramas: ["g07"],           ruta: "oral",               ld50: "~300",                           peligro: "Irritante gastrointestinal; baja ingesta tolerable" },
  { key: "zn",     nombre: "Zinc (metal)",               formula: "Zn",    pictogramas: ["g07"],           ruta: "inhalación/oral",    ld50: "—",                              peligro: "Polvo irritante; baja toxicidad oral del metal" },
  { key: "cu",     nombre: "Cobre (metal)",              formula: "Cu",    pictogramas: ["g07"],           ruta: "inhalación",         ld50: "—",                              peligro: "Polvo irritante; baja toxicidad oral del metal" },
  { key: "fe",     nombre: "Hierro (metal)",             formula: "Fe",    pictogramas: [],                ruta: "—",                  ld50: "—",                              peligro: "Baja toxicidad; riesgo por partículas inhaladas" },
  { key: "nh3",    nombre: "Amoníaco (solución)",        formula: "NH3",   pictogramas: ["g05", "g07"],    ruta: "inhalación/oral",    ld50: "~350",                           peligro: "Corrosivo; irritante de vías respiratorias" },
  { key: "h2o2",   nombre: "Peróxido de hidrógeno",      formula: "H2O2",  pictogramas: ["g05", "g03"],    ruta: "oral/contacto",      ld50: "~1518",                          peligro: "Corrosivo (concentrado); oxidante; irritante" },
  { key: "o2",     nombre: "Dioxígeno (gas)",            formula: "O2",    pictogramas: ["g03"],           ruta: "inhalación",         ld50: "—",                              peligro: "Oxidante puro; incrementa riesgo de incendio" },
  { key: "ch4",    nombre: "Metano (gas)",               formula: "CH4",   pictogramas: ["g02"],           ruta: "inhalación",         ld50: "—",                              peligro: "Inflamable; asfixiante simple en espacios confinados" },
  { key: "c3h8",   nombre: "Propano (gas)",              formula: "C3H8",  pictogramas: ["g02"],           ruta: "inhalación",         ld50: "—",                              peligro: "Inflamable; asfixiante simple" },
  { key: "c2h5oh", nombre: "Etanol",                     formula: "C2H5OH",pictogramas: ["g02", "g07"],    ruta: "oral/inhalación",    ld50: "~7060",                          peligro: "Inflamable; irritante en altas dosis" },
  { key: "mg",     nombre: "Magnesio (metal)",           formula: "Mg",    pictogramas: ["g02"],           ruta: "inhalación",         ld50: "—",                              peligro: "Polvo inflamable; baja toxicidad oral" },
  { key: "al",     nombre: "Aluminio (metal)",           formula: "Al",    pictogramas: ["g07"],           ruta: "inhalación",         ld50: "—",                              peligro: "Polvo irritante; neurotoxicidad debatida (no demostrada)" },
  { key: "mgcl2",  nombre: "Cloruro de magnesio",       formula: "MgCl2", pictogramas: [],                ruta: "oral",               ld50: "~2800",                          peligro: "Baja toxicidad aguda" },
  { key: "cacl2",  nombre: "Cloruro de calcio",          formula: "CaCl2", pictogramas: ["g07"],           ruta: "oral/contacto",      ld50: "~2400",                          peligro: "Irritante; calor al disolverse" },
  { key: "feso4",  nombre: "Sulfato de hierro (II)",     formula: "FeSO4", pictogramas: ["g07"],           ruta: "oral",               ld50: "~319",                           peligro: "Irritante gastrointestinal; tóxico en grandes dosis" },
  { key: "fecl3",  nombre: "Cloruro de hierro (III)",    formula: "FeCl3", pictogramas: ["g05", "g07"],    ruta: "oral/contacto",      ld50: "~450",                           peligro: "Corrosivo; irritante" },
  { key: "hno3",   nombre: "Ácido nítrico",              formula: "HNO3",  pictogramas: ["g05", "g03"],    ruta: "oral/inhalación",    ld50: "~240",                           peligro: "Corrosivo; oxidante; vapores tóxicos (NO2)" },
];

/* ------------------------------------------------------------------ */
/*  Mapa curado de toxicología por símbolo (elementos)                */
/* ------------------------------------------------------------------ */

interface ToxEntry {
  pictogramas: string[];
  ruta: string;
  peligro: string;
}

const TOX_MAP: Record<string, ToxEntry> = {
  // ── Nobles (curados) ──
  He:  { pictogramas: ["g04"],            ruta: "inhalación",       peligro: "Inerte; asfixiante simple" },
  Ne:  { pictogramas: ["g04"],            ruta: "inhalación",       peligro: "Inerte; asfixiante simple" },
  Ar:  { pictogramas: ["g04"],            ruta: "inhalación",       peligro: "Inerte; asfixiante simple en espacios confinados" },
  Kr:  { pictogramas: ["g04"],            ruta: "inhalación",       peligro: "Inerte; asfixiante simple en espacios confinados" },
  Xe:  { pictogramas: ["g04"],            ruta: "inhalación",       peligro: "Inerte; asfixiante simple en espacios confinados" },
  Rn:  { pictogramas: ["g04"],            ruta: "inhalación",       peligro: "Inerte; radiactivo natural (emisor α); asfixiante" },

  // ── Alcalinos (curados) ──
  Li:  { pictogramas: ["g02", "g05"],     ruta: "contacto/inhalación", peligro: "Reacciona con agua; inflamable en forma metálica; corrosivo" },
  Na:  { pictogramas: ["g02", "g05"],     ruta: "contacto/inhalación", peligro: "Reacciona violentamente con agua; inflamable; corrosivo" },
  K:   { pictogramas: ["g02", "g05"],     ruta: "contacto/inhalación", peligro: "Reacciona violentamente con agua; inflamable; corrosivo" },
  Rb:  { pictogramas: ["g02", "g05"],     ruta: "contacto/inhalación", peligro: "Reacciona explosivamente con agua; inflamable; corrosivo" },
  Cs:  { pictogramas: ["g02", "g05"],     ruta: "contacto/inhalación", peligro: "Extremadamente reactivo; inflamable espontáneamente; corrosivo" },

  // ── Alcalinotérreos (curados) ──
  Be:  { pictogramas: ["g06", "g08"],     ruta: "inhalación",       peligro: "Carcinógeno (IARC 1) por inhalación de polvo" },
  Mg:  { pictogramas: ["g02"],            ruta: "inhalación/contacto", peligro: "Metal inflamable en polvo; cinta arde; baja toxicidad oral" },
  Ca:  { pictogramas: ["g02"],            ruta: "inhalación/contacto", peligro: "Reacciona con agua liberando H₂; bajo riesgo oral" },
  Sr:  { pictogramas: ["g02"],            ruta: "inhalación/contacto", peligro: "Reacciona con agua; polvo reactivo; bajo riesgo oral" },
  Ba:  { pictogramas: ["g02"],            ruta: "inhalación/oral",  peligro: "Polvo reactivo; sales solubles tóxicas (bloqueo del potasio)" },

  // ── No metales (curados) ──
  H:   { pictogramas: ["g02", "g04"],     ruta: "inhalación",       peligro: "Gas altamente inflamable; asfixiante en espacios confinados" },
  B:   { pictogramas: [],                 ruta: "inhalación",       peligro: "Baja toxicidad aguda; polvo: irritante" },
  C:   { pictogramas: [],                 ruta: "inhalación",       peligro: "Inocuo (grafito, diamante); polvo de hollín: combustible" },
  N:   { pictogramas: [],                 ruta: "inhalación",       peligro: "Inerte (N₂); asfixiante en espacios confinados" },
  O:   { pictogramas: ["g03", "g04"],     ruta: "inhalación",       peligro: "Oxidante puro; gas a presión; incrementa riesgo de incendio" },
  Si:  { pictogramas: [],                 ruta: "inhalación",       peligro: "Baja toxicidad aguda; polvo fino: irritante respiratorio" },
  P:   { pictogramas: ["g06"],            ruta: "inhalación/oral",  peligro: "Tóxico; fósforo blanco pirofórico (se autoinflama)" },
  S:   { pictogramas: ["g07"],            ruta: "inhalación",       peligro: "Irritante; polvo combustible; humos de SO₂ nocivos" },
  Se:  { pictogramas: [],                 ruta: "inhalación/oral",  peligro: "Baja toxicidad aguda; compuestos (SeO₂) tóxicos y corrosivos" },

  // ── Halógenos (curados) ──
  F:   { pictogramas: ["g05", "g06", "g03"], ruta: "inhalación/contacto", peligro: "Extremadamente tóxico y corrosivo; oxidante potente" },
  Cl:  { pictogramas: ["g05", "g06", "g03"], ruta: "inhalación/contacto", peligro: "Gas tóxico; corrosivo y oxidante" },
  Br:  { pictogramas: ["g05", "g06"],     ruta: "inhalación/contacto", peligro: "Líquido volátil tóxico; corrosivo para piel y ojos" },
  I:   { pictogramas: ["g07"],            ruta: "inhalación/contacto", peligro: "Irritante; vapores nocivos; nocivo al ingerir" },

  // ── Metales de transición (curados) ──
  Ti:  { pictogramas: [],                 ruta: "inhalación",       peligro: "Metal inerte; polvo: combustible y posible irritante" },
  V:   { pictogramas: ["g06", "g08"],     ruta: "inhalación",       peligro: "Compuestos (V₂O₅) tóxicos y cancerígenos; polvo irritante" },
  Cr:  { pictogramas: ["g06", "g08"],     ruta: "inhalación/oral",  peligro: "Cr(VI) carcinógeno y tóxico; polvo metálico irritante" },
  Mn:  { pictogramas: ["g07"],            ruta: "inhalación",       peligro: "Polvo: irritante; exposición crónica: neurotoxicidad (manganismo)" },
  Fe:  { pictogramas: [],                 ruta: "inhalación",       peligro: "Baja toxicidad; partículas inhaladas: fiebre de los metales" },
  Co:  { pictogramas: ["g08"],            ruta: "inhalación",       peligro: "Posible carcinógeno (IARC 2B); sensibilizante respiratorio" },
  Ni:  { pictogramas: ["g06", "g08"],     ruta: "inhalación/contacto", peligro: "Sensibilizante cutáneo; carcinógeno (IARC 1 en compuestos)" },
  Cu:  { pictogramas: ["g07"],            ruta: "inhalación/oral",  peligro: "Polvo: irritante; sales: irritante gastrointestinal" },
  Zn:  { pictogramas: ["g07"],            ruta: "inhalación",       peligro: "Humos: fiebre de los humos; polvo: irritante" },
  Mo:  { pictogramas: ["g07"],            ruta: "inhalación",       peligro: "Baja toxicidad; polvo: irritante" },
  Ag:  { pictogramas: ["g07"],            ruta: "inhalación",       peligro: "Polvo/sales: argiria por exposición crónica; irritante" },
  Cd:  { pictogramas: ["g06", "g08"],     ruta: "inhalación/oral",  peligro: "Tóxico acumulativo; carcinógeno (IARC 1); daño renal y óseo" },
  Hg:  { pictogramas: ["g06", "g08"],     ruta: "inhalación/oral",  peligro: "Vapores tóxicos; neurotóxico acumulativo; daño renal" },

  // ── Metales postransicionales (curados) ──
  Al:  { pictogramas: ["g07"],            ruta: "inhalación",       peligro: "Polvo: irritante; neurotoxicidad debatida (no demostrada)" },
  Ga:  { pictogramas: [],                 ruta: "inhalación",       peligro: "Baja toxicidad; bajo riesgo" },
  In:  { pictogramas: [],                 ruta: "inhalación",       peligro: "Baja toxicidad aguda" },
  Sn:  { pictogramas: [],                 ruta: "oral",             peligro: "Baja toxicidad; compuestos orgánicos de estaño más tóxicos" },
  Tl:  { pictogramas: ["g06"],            ruta: "oral",             peligro: "Extremadamente tóxico; bloquea el potasio; sales letales" },
  Pb:  { pictogramas: ["g06", "g08"],     ruta: "oral/inhalación",  peligro: "Acumulativo; neurotóxico; tóxico para la reproducción" },
  Bi:  { pictogramas: [],                 ruta: "oral",             peligro: "Baja toxicidad; usado en farmacopea" },

  // ── Metaloides (curados) ──
  As:  { pictogramas: ["g06", "g08"],     ruta: "oral/inhalación",  peligro: "Carcinógeno (IARC 1); tóxico agudo; acumulativo" },
  Te:  { pictogramas: ["g07"],            ruta: "inhalación/oral",  peligro: "Nocivo; aliento con olor a ajo; polvo irritante" },

  // ── Antimonio (metaloide en datos, clasificado como metaloide pero con GHS06) ──
  Sb:  { pictogramas: ["g06"],            ruta: "inhalación/oral",  peligro: "Compuestos tóxicos; nocivo por inhalación" },
};

/* ------------------------------------------------------------------ */
/*  Fallback por categoría (sin entrada curada)                       */
/* ------------------------------------------------------------------ */

const FALLBACK: Record<Categoría, ToxEntry> = {
  noble:             { pictogramas: ["g04"],               ruta: "inhalación",       peligro: "Inerte; asfixiante simple en espacios confinados" },
  alcalino:          { pictogramas: ["g02", "g05"],        ruta: "contacto/inhalación", peligro: "Reacciona con agua; inflamable en forma metálica; corrosivo" },
  alcalinoterreo:    { pictogramas: ["g02"],               ruta: "inhalación/contacto", peligro: "Polvos reactivos; bajo riesgo oral" },
  transicion:        { pictogramas: [],                    ruta: "inhalación",       peligro: "Metal; polvo: posible irritante" },
  postransicion:     { pictogramas: [],                    ruta: "inhalación",       peligro: "Metal; polvo: posible irritante" },
  metaloide:         { pictogramas: ["g07"],               ruta: "inhalación/oral",  peligro: "Semimetal; polvo: posible irritante" },
  nometal:           { pictogramas: [],                    ruta: "inhalación",       peligro: "Polvo o gas: posible irritante; variar según especie" },
  halogeno:          { pictogramas: ["g05", "g06", "g03"], ruta: "inhalación/contacto", peligro: "Tóxicos; oxidantes; corrosivos" },
  lantanido:         { pictogramas: [],                    ruta: "inhalación",       peligro: "Polvos: irritantes; metal: baja toxicidad" },
  actinido:          { pictogramas: ["g06", "g08"],        ruta: "inhalación/oral",  peligro: "Radioactivos; tóxicos acumulativos" },
};

/* ------------------------------------------------------------------ */
/*  Elementos: 118 entradas (curados + fallback)                      */
/* ------------------------------------------------------------------ */

export const TOX_ELEMENTOS: ToxElemento[] = ELEMENTS.map((el) => {
  const cur = TOX_MAP[el.s];
  const fb = FALLBACK[el.cat];
  return {
    z: el.z,
    s: el.s,
    nE: el.nE,
    cat: el.cat,
    pictogramas: cur?.pictogramas ?? fb.pictogramas,
    ruta: cur?.ruta ?? fb.ruta,
    peligro: cur?.peligro ?? fb.peligro,
  };
});

export const NOTA_TOX =
  "Valores aproximados de referencia (ratón/rata, oral) con fines educativos. " +
  "En caso de emergencia consultar siempre la SDS / ficha de seguridad del laboratorio " +
  "y contactar a los servicios de toxicología.";
