// Catálogo de química orgánica: grupos funcionales, estructuras y nomenclatura.
// Las estructuras son dibujos 2D (notación tipo esqueleto con átomos explícitos)
// de moléculas reales. Coordenadas en unidades cuadradas, el renderer
// centra y escala automáticamente.

export interface MolAtom {
  id: string;
  s?: string;
  txt?: string;
  x: number;
  y: number;
}

export interface MolBond {
  a: string;
  b: string;
  o?: 1 | 2 | 3;
}

export interface Mol {
  atoms: MolAtom[];
  bonds: MolBond[];
  hiA?: string[];
  hiB?: string[];
}

export interface Ejemplo {
  nombre: string;
  iupac: string;
  comun: string;
  mol: Mol;
  nota?: string;
  detalles?: string[];
}

export interface GrupoFuncional {
  id: string;
  nombre: string;
  formula: string;
  grupo: string;
  sufijo: string;
  prefijo: string;
  reglas: string;
  ejemplos: Ejemplo[];
}

// Helpers para declarar estructuras sin repetir nombres de campos
const A = (id: string, x: number, y: number, txt?: string): MolAtom => ({ id, x, y, ...(txt ? { txt } : {}) });
const Bd = (a: string, b: string, o?: 1 | 2 | 3): MolBond => ({ a, b, ...(o ? { o } : {}) });

export const GRUPOS_FUNCIONALES: GrupoFuncional[] = [
  {
    id: "alcanos",
    nombre: "Alcanos",
    formula: "CₙH₂ₙ₊₂",
    grupo: "Solo enlaces C–C y C–H simples (saturados)",
    sufijo: "…-ano",
    prefijo: "ciclo-…-ano (cíclicos)",
    reglas:
      "Elige la cadena continua más larga de carbonos; nómbrala con -ano. Los sustituyentes se ordenan alfabéticamente y llevan el número de la posición más baja.",
    ejemplos: [
      {
        nombre: "Etano",
        iupac: "Etano",
        comun: "Etano, gas de los pantanos",
        mol: { atoms: [A("a", 0, 0, "CH₃"), A("b", 1, 0, "CH₃")], bonds: [Bd("a", "b")] },
        detalles: [
          "Cadena continua más larga: 2 carbonos → prefijo 'et-'",
          "Solo enlaces simples → sufijo '-ano'",
          "Sin ramificaciones: nombre = Etano",
        ],
      },
      {
        nombre: "Propano",
        iupac: "Propano",
        comun: "Propano (GLP)",
        mol: {
          atoms: [A("a", 0, 0, "CH₃"), A("b", 0.85, 0, "CH₂"), A("c", 1.7, 0, "CH₃")],
          bonds: [Bd("a", "b"), Bd("b", "c")],
        },
        detalles: [
          "Cadena continua: 3 carbonos → prefijo 'prop-'",
          "Solo enlaces simples → sufijo '-ano'",
          "Sin ramificaciones: Propano",
        ],
      },
    ],
  },
  {
    id: "cicloalcanos",
    nombre: "Cicloalcanos",
    formula: "CₙH₂ₙ",
    grupo: "Alcanos en anillo (cíclicos)",
    sufijo: "ciclo…-ano",
    prefijo: "ciclo",
    reglas: "Igual que los alcanos, pero la cadena se cierra en anillo. Los sustituyentes conservan el orden alfabético y numeración localizadora más baja.",
    ejemplos: [
      {
        nombre: "Ciclohexano",
        iupac: "Ciclohexano",
        comun: "Ciclohexano (disolvente)",
        mol: {
          atoms: [
            A("a", 1, 0, "CH₂"), A("b", 1.9, 0.55, "CH₂"), A("c", 1.9, 1.55, "CH₂"),
            A("d", 1, 2.1, "CH₂"), A("e", 0.1, 1.55, "CH₂"), A("f", 0.1, 0.55, "CH₂"),
          ],
          bonds: [Bd("a", "b"), Bd("b", "c"), Bd("c", "d"), Bd("d", "e"), Bd("e", "f"), Bd("f", "a")],
        },
        detalles: [
          "6 carbonos en anillo → prefijo 'ciclo-'",
          "Solo enlaces simples → sufijo '-ano'",
          "Ciclohexano = ciclo + hex + ano",
        ],
      },
    ],
  },
  {
    id: "alquenos",
    nombre: "Alquenos",
    formula: "CₙH₂ₙ",
    grupo: "Un doble enlace C=C (insaturados)",
    sufijo: "…-eno",
    prefijo: "…-en- (localizador del doble enlace)",
    reglas: "La cadena principal es la más larga que contiene el doble enlace; se numera de modo que el C=C reciba el localizador más bajo; sufijo -eno (di-eno, tri-eno…).",
    ejemplos: [
      {
        nombre: "Eteno",
        iupac: "Eteno",
        comun: "Etileno (maduración de frutas)",
        mol: {
          atoms: [A("a", 0, 0, "CH₂"), A("b", 1.2, 0, "CH₂")],
          bonds: [Bd("a", "b", 2)],
          hiA: ["a", "b"], hiB: ["0"],
        },
        detalles: [
          "2 carbonos → 'et-'",
          "Doble enlace C=C → sufijo '-eno'",
          "Sin localizador necesario: solo hay 2 carbonos → Eteno",
        ],
      },
      {
        nombre: "But-1-eno",
        iupac: "But-1-eno",
        comun: "Butileno",
        mol: {
          atoms: [A("a", 0, 0, "CH₂"), A("b", 1, 0, "CH"), A("c", 1.9, 0, "CH₂"), A("d", 2.7, 0, "CH₃")],
          bonds: [Bd("a", "b", 2), Bd("b", "c"), Bd("c", "d")],
          hiA: ["a", "b"], hiB: ["0"],
        },
        detalles: [
          "Cadena de 4 carbonos → 'but-'",
          "Doble enlace en posición 1 → 'but-1-'",
          "Sufijo '-eno' → But-1-eno",
        ],
      },
    ],
  },
  {
    id: "alquinos",
    nombre: "Alquinos",
    formula: "CₙH₂ₙ₋₂",
    grupo: "Un triple enlace C≡C",
    sufijo: "…-ino",
    prefijo: "…-in- (localizador)",
    reglas: "Cadena principal que contiene el triple enlace, numerada para dar el localizador más bajo al C≡C; sufijo -ino.",
    ejemplos: [
      {
        nombre: "Etino",
        iupac: "Etino",
        comun: "Acetileno (soldadura oxiacetilénica)",
        mol: {
          atoms: [A("a", 0, 0, "CH"), A("b", 1.2, 0, "CH")],
          bonds: [Bd("a", "b", 3)],
          hiA: ["a", "b"], hiB: ["0"],
        },
        detalles: [
          "2 carbonos → 'et-'",
          "Triple enlace C≡C → sufijo '-ino'",
          "Sin localizador: Etino (acetileno)",
        ],
      },
    ],
  },
  {
    id: "arenos",
    nombre: "Hidrocarburos aromáticos (arenos)",
    formula: "C₆H₆ (benceno)",
    grupo: "Anillo aromático conjugado (regla de Hückel)",
    sufijo: "benceno / …-benceno",
    prefijo: "fenil- (C₆H₅–)",
    reglas: "El benceno es el núcleo básico. Sustituyentes se nombran con prefijo (cloro-, nitro-, amino-…) y se localizan (orto, meta, para o números).",
    ejemplos: [
      {
        nombre: "Benceno",
        iupac: "Benceno",
        comun: "Benceno",
        mol: {
          atoms: [
            A("a", 0.9, 0), A("b", 1.9, 0.55), A("c", 1.9, 1.55),
            A("d", 0.9, 2.1), A("e", -0.1, 1.55), A("f", -0.1, 0.55),
          ],
          bonds: [
            Bd("a", "b", 2), Bd("b", "c"), Bd("c", "d", 2),
            Bd("d", "e"), Bd("e", "f", 2), Bd("f", "a", 1),
          ],
        },
        detalles: [
          "6 carbonos en anillo aromático sexteto → nombre propio 'benceno'",
          "Los sustituyentes se nombran con prefijos (cloro-, nitro-…)",
          "Posiciones: orto (1,2), meta (1,3), para (1,4)",
        ],
      },
    ],
  },
  {
    id: "haloalcanos",
    nombre: "Halogenuros de alquilo",
    formula: "R–X (X = F, Cl, Br, I)",
    grupo: "Halógeno unido a C sp³",
    sufijo: "…-haloalcano",
    prefijo: "cloro-, bromo-, yodo-, fluoro-",
    reglas: "El halógeno es un sustituyente: se antepone fluoro/cloro/bromo/yodo- con su localizador, antes de nombrar la cadena.",
    ejemplos: [
      {
        nombre: "Clorometano",
        iupac: "Clorometano",
        comun: "Cloruro de metilo (refrigerante R-40)",
        mol: { atoms: [A("a", 0, 0, "CH₃"), A("Cl", 1.05, 0, "Cl")], bonds: [Bd("a", "Cl")] },
        nota: "Los halogenuros sencillos se nombran haloalcanos por IUPAC.",
        detalles: [
          "1 carbono → 'met-'",
          "Alcano simple → '-ano'",
          "Cloro como sustituyente → Clorometano (no se necesita localizador)",
        ],
      },
      {
        nombre: "Cloroetano",
        iupac: "Cloroetano / 1-cloroetano",
        comun: "Cloruro de etilo (anestésico local)",
        mol: {
          atoms: [A("a", 1.2, 0, "CH₃"), A("b", 0.3, 0, "CH₂"), A("Cl", -0.7, 0, "Cl")],
          bonds: [Bd("b", "Cl"), Bd("a", "b")],
        },
        detalles: [
          "2 carbonos → 'et-' + '-ano'",
          "Cloro en C1 → Cloroetano o 1-Cloroetano",
          "Solo hay una posición posible, por eso el localizador es opcional",
        ],
      },
    ],
  },
  {
    id: "alcoholes",
    nombre: "Alcoholes",
    formula: "R–OH (CₙH₂ₙ₊₁OH)",
    grupo: "Hidroxilo –OH sobre C sp³",
    sufijo: "…-ol",
    prefijo: "hidroxi-",
    reglas:
      "La cadena principal incluye el carbono del –OH; se numera para darle el localizador más bajo y se añade -ol (dioles, trioles… según número de OH).",
    ejemplos: [
      {
        nombre: "Etanol",
        iupac: "Etanol",
        comun: "Alcohol etílico (bebidas, desinfectante)",
        mol: {
          atoms: [
            A("a", 0, 0, "CH₃"), A("b", 0.9, 0, "CH₂"), A("O", 1.7, -0.4, "O"), A("h", 2.2, -1.1, "H"),
          ],
          bonds: [Bd("a", "b"), Bd("b", "O"), Bd("O", "h")],
          hiA: ["O", "h"], hiB: ["1", "2"],
        },
        detalles: [
          "Cadena principal: 2 carbonos → 'et-'",
          "–OH en C1 → sufijo '-ol' (se elimina la 'e' final de 'etano')",
          "Etano + ol → Etanol",
        ],
      },
      {
        nombre: "Propan-2-ol",
        iupac: "Propan-2-ol",
        comun: "Alcohol isopropílico (antiséptico)",
        mol: {
          atoms: [
            A("i", 0, 0.5, "CH₃"), A("c", 0.8, -0.1, "CH"), A("d", 1.6, 0.5, "CH₃"),
            A("O", 0.8, -1, "O"), A("h", 1.3, -1.7, "H"),
          ],
          bonds: [Bd("i", "c"), Bd("c", "d"), Bd("c", "O"), Bd("O", "h")],
          hiA: ["O", "h"], hiB: ["2", "3"],
        },
        detalles: [
          "3 carbonos → 'prop-'",
          "–OH en C2 → localizador 2 → 'propan-2-'",
          "Sufijo '-ol' → Propan-2-ol (o alcohol isopropílico)",
        ],
      },
    ],
  },
  {
    id: "fenoles",
    nombre: "Fenoles",
    formula: "Ar–OH",
    grupo: "Hidroxilo directamente sobre el anillo aromático",
    sufijo: "…fenol / …hidroxibenceno",
    prefijo: "hidroxi-",
    reglas: "El –OH sobre un benceno convierte la base en 'fenol'; los sustituyentes se localizan respecto a él (orto/meta/para o números).",
    ejemplos: [
      {
        nombre: "Fenol",
        iupac: "Fenol / hidroxibenceno",
        comun: "Fenol (desinfectante)",
        mol: {
          atoms: [
            A("a", 0.9, 0), A("b", 1.9, 0.55), A("c", 1.9, 1.55),
            A("d", 0.9, 2.1), A("e", -0.1, 1.55), A("f", -0.1, 0.55),
            A("O", -1.0, 0.55, "O"), A("h", -1.6, 1.1, "H"),
          ],
          bonds: [
            Bd("a", "b", 2), Bd("b", "c"), Bd("c", "d", 2), Bd("d", "e"),
            Bd("e", "f", 2), Bd("f", "a"), Bd("f", "O"), Bd("O", "h"),
          ],
          hiA: ["O", "h"], hiB: ["6", "7"],
        },
        detalles: [
          "Benceno con –OH directamente unido → nombre propio 'fenol'",
          "Los sustituyentes se numeran respecto al OH (1 en el C-OH)",
          "Si hay más OH: hidroxibencenos (difenol, etc.)",
        ],
      },
    ],
  },
  {
    id: "eteres",
    nombre: "Éteres",
    formula: "R–O–R'",
    grupo: "Oxígeno entre dos carbonos",
    sufijo: "…-oxi…ano (éter)",
    prefijo: "alcoxi-",
    reglas: "Para éteres simétricos se usa el nombre común con 'éter'. La IUPAC elige la cadena más larga como base y el resto como alcoxi-.",
    ejemplos: [
      {
        nombre: "Éter dimetílico",
        iupac: "Metoximetano",
        comun: "Éter dimetílico",
        mol: {
          atoms: [A("a", 0, 0, "CH₃"), A("O", 1, 0, "O"), A("b", 2, 0, "CH₃")],
          bonds: [Bd("a", "O"), Bd("O", "b")],
          hiA: ["O"], hiB: ["0", "1"],
        },
        detalles: [
          "Cadena base: metano (CH₃–)",
          "Resto como alcoxi: CH₃O– → 'metoxi-'",
          "Metoximetano = metoxi + metano (nombre IUPAC sistemático)",
        ],
      },
    ],
  },
  {
    id: "aldehidos",
    nombre: "Aldehídos",
    formula: "R–CHO",
    grupo: "Carbonilo terminal –CHO",
    sufijo: "…-al",
    prefijo: "oxo- (en presencia de grupos prioriores)",
    reglas: "El carbono del –CHO es el C1 de la cadena; la cadena principal debe contenerlo y termina en -al. El H del grupo se indica en la fórmula estructural.",
    ejemplos: [
      {
        nombre: "Etanal",
        iupac: "Etanal",
        comun: "Acetaldehído",
        mol: {
          atoms: [
            A("a", 0, 0, "CH₃"), A("C", 1, 0, "C"), A("O", 1.6, 0.55, "O"), A("h", 1.5, -0.5, "H"),
          ],
          bonds: [Bd("a", "C"), Bd("C", "O", 2), Bd("C", "h")],
          hiA: ["C", "O", "h"], hiB: ["1", "2"],
        },
        detalles: [
          "Cadena principal: 2 carbonos → 'et-'",
          "–CHO define C1 → sufijo '-al'",
          "Etanal (común: acetaldehído)",
        ],
      },
    ],
  },
  {
    id: "cetonas",
    nombre: "Cetonas",
    formula: "R–CO–R'",
    grupo: "Carbonilo interno C=O",
    sufijo: "…-ona",
    prefijo: "oxo-",
    reglas: "Se elige la cadena más larga que contiene el carbonilo y se numera para darle el localizador más bajo; termina en -ona.",
    ejemplos: [
      {
        nombre: "Propanona",
        iupac: "Propan-2-ona",
        comun: "Acetona (removedor de esmalte)",
        mol: {
          atoms: [
            A("i", 0, 0.5, "CH₃"), A("C", 0.9, 0, "C"), A("d", 1.8, 0.5, "CH₃"), A("O", 0.9, -0.8, "O"),
          ],
          bonds: [Bd("i", "C"), Bd("C", "d"), Bd("C", "O", 2)],
          hiA: ["C", "O"], hiB: ["2"],
        },
        detalles: [
          "3 carbonos → 'prop-'",
          "C=O en C2 → localizador 2 → 'propan-2-'",
          "Sufijo '-ona' → Propan-2-ona (o propanona / acetona)",
        ],
      },
    ],
  },
  {
    id: "acidos",
    nombre: "Ácidos carboxílicos",
    formula: "R–COOH",
    grupo: "Carboxilo terminal –COOH",
    sufijo: "…-oico (ácido …)",
    prefijo: "carboxi-",
    reglas:
      "El grupo –COOH define el carbono 1. Nombre: 'ácido …oico'. Los radicales que requieran mayor prioridad (sales, ésteres, amidas) reemplazan el H y usan carboxtratamientos.",
    ejemplos: [
      {
        nombre: "Ácido etanoico",
        iupac: "Ácido etanoico",
        comun: "Ácido acético (vinagre)",
        mol: {
          atoms: [
            A("a", 0, 0, "CH₃"), A("C", 1, 0, "C"), A("O", 1.7, 0.6, "O"),
            A("O2", 1.6, -0.6, "O"), A("h", 2.2, -1.2, "H"),
          ],
          bonds: [Bd("a", "C"), Bd("C", "O", 2), Bd("C", "O2"), Bd("O2", "h")],
          hiA: ["C", "O", "O2", "h"], hiB: ["1", "2", "3"],
        },
        detalles: [
          "2 carbonos → 'et-'",
          "–COOH define C1 → sufijo '-oico' con 'ácido'",
          "Ácido etanoico (vinagre) = ácido + et + ano + oico",
        ],
      },
    ],
  },
  {
    id: "esteres",
    nombre: "Ésteres",
    formula: "R–COO–R'",
    grupo: "Carboxilato: C(=O)–O–R'",
    sufijo: "…-oato de …",
    prefijo: "alcoxicarbonil-",
    reglas: "Nombre como sal del ácido: la parte del ácido termina en -oato y la del radical alquilo al final: 'etanoato de etilo'.",
    ejemplos: [
      {
        nombre: "Acetato de etilo",
        iupac: "Etanoato de etilo",
        comun: "Acetato de etilo (pegamento)",
        mol: {
          atoms: [
            A("a", 3.3, 0.7, "CH₃"), A("b", 2.45, 0.7, "CH₂"), A("O", 1.75, 0.1, "O"),
            A("C", 0.95, 0.7, "C"), A("O2", 1.6, 1.35, "O"), A("d", 0, 0.7, "CH₃"),
          ],
          bonds: [Bd("a", "b"), Bd("b", "O"), Bd("O", "C"), Bd("C", "O2", 2), Bd("C", "d")],
          hiA: ["O", "C", "O2"], hiB: ["1", "2", "3"],
        },
        detalles: [
          "Ácido origen: ácido etanoico → 'etanoato'",
          "Radical unido al oxígeno: etilo (C₂H₅–)",
          "Nombre: Etanoato de etilo",
        ],
      },
    ],
  },
  {
    id: "aminas",
    nombre: "Aminas",
    formula: "R–NH₂, R₂NH, R₃N",
    grupo: "Nitrógeneo con pares libres (1ª, 2ª, 3ª)",
    sufijo: "…-amina",
    prefijo: "amino- (como sustituyente)",
    reglas: "La amina más sencilla es la base (-amina). Se añade número y letras N para localizar sustituyentes sobre el nitrógeneo (N-metil…).",
    ejemplos: [
      {
        nombre: "Metilamina",
        iupac: "Metanamina",
        comun: "Metilamina",
        mol: {
          atoms: [
            A("a", 0, 0, "CH₃"), A("N", 1, 0, "N"), A("h1", 1.45, 0.55, "H"), A("h2", 1.45, -0.55, "H"),
          ],
          bonds: [Bd("a", "N"), Bd("N", "h1"), Bd("N", "h2")],
          hiA: ["N"], hiB: ["0"],
        },
        detalles: [
          "1 carbono → 'met-'",
          "–NH₂ como grupo principal → sufijo '-amina'",
          "Metanamina (nombre IUPAC) / metilamina (nombre común)",
        ],
      },
    ],
  },
  {
    id: "amidas",
    nombre: "Amidas",
    formula: "R–CONH₂, R–CONHR', R–CONR'₂",
    grupo: "Carbonilo unido a N (N=primaria, secundaria, terciaria)",
    sufijo: "…-amida",
    prefijo: "carbamoil-",
    reglas: "Se nombra con el ácido de origen reemplazando -oico por -amida. Sustituyentes sobre el N se anotan como N-metil….",
    ejemplos: [
      {
        nombre: "Etanamida",
        iupac: "Etanamida",
        comun: "Acetamida",
        mol: {
          atoms: [
            A("a", 0, 0, "CH₃"), A("C", 1, 0, "C"), A("O", 1.7, 0.55, "O"),
            A("N", 1.1, -0.8, "N"), A("h1", 1.6, -1.4, "H"), A("h2", 0.6, -1.4, "H"),
          ],
          bonds: [Bd("a", "C"), Bd("C", "O", 2), Bd("C", "N"), Bd("N", "h1"), Bd("N", "h2")],
          hiA: ["C", "O", "N"], hiB: ["1", "2"],
        },
        detalles: [
          "Ácido origen: ácido etanoico → quitar '-oico' + añadir '-amida'",
          "Cadena de 2 carbonos → 'etanamida'",
          "Común: acetamida",
        ],
      },
    ],
  },
  {
    id: "nitrilos",
    nombre: "Nitrilos",
    formula: "R–C≡N",
    grupo: "Ciano (triple enlace C≡N)",
    sufijo: "…-nitrilo",
    prefijo: "ciano-",
    reglas: "Se nombran añadiendo -nitrilo al nombre de la cadena que contiene el carbono del –C≡N; con nombres de adición se usa ciano-.",
    ejemplos: [
      {
        nombre: "Etanonitrilo",
        iupac: "Etanonitrilo / acetonitrilo",
        comun: "Acetonitrilo (disolvente)",
        mol: {
          atoms: [A("a", 0, 0, "CH₃"), A("C", 0.9, 0, "C"), A("N", 1.7, 0, "N")],
          bonds: [Bd("a", "C"), Bd("C", "N", 3)],
          hiA: ["C", "N"], hiB: ["1"],
        },
        detalles: [
          "2 carbonos incluyendo el C del C≡N → 'et-'",
          "C≡N como grupo principal → sufijo '-nitrilo'",
          "Etanonitrilo (o acetonitrilo)",
        ],
      },
    ],
  },
  {
    id: "nitro",
    nombre: "Compuestos nitro",
    formula: "R–NO₂",
    grupo: "Grupo nitro –NO₂",
    sufijo: "…-nitro compuesto",
    prefijo: "nitro-",
    reglas: "El grupo –NO₂ se comporta como sustituyente nitro- con su localizador; no define la cadena principal.",
    ejemplos: [
      {
        nombre: "Nitrometano",
        iupac: "Nitrometano",
        comun: "Nitrometano (combustible de modelismo)",
        mol: {
          atoms: [
            A("a", 0, 0, "CH₃"), A("N", 1, 0, "N"), A("O1", 1.6, 0.55, "O"), A("O2", 1.6, -0.55, "O"),
          ],
          bonds: [Bd("a", "N"), Bd("N", "O1", 2), Bd("N", "O2", 2)],
          hiA: ["N", "O1", "O2"], hiB: ["1", "2"],
        },
        detalles: [
          "1 carbono → 'met-'",
          "–NO₂ como sustituyente → prefijo 'nitro-'",
          "Nitrometano (nitro + metano)",
        ],
      },
    ],
  },
  {
    id: "tioles",
    nombre: "Tioles",
    formula: "R–SH",
    grupo: "Sulfhidrilo –SH",
    sufijo: "…-tiol",
    prefijo: "mercapto-",
    reglas: "Analogos del alcohol con azufre: -ol → -tiol. El nombre común usa mercaptano.",
    ejemplos: [
      {
        nombre: "Metanotiol",
        iupac: "Metanotiol",
        comun: "Metil mercaptano (olor del gas natural)",
        mol: {
          atoms: [A("a", 0, 0, "CH₃"), A("S", 1.05, 0, "S"), A("h", 1.6, -0.6, "H")],
          bonds: [Bd("a", "S"), Bd("S", "h")],
          hiA: ["S", "h"], hiB: ["1"],
        },
        detalles: [
          "1 carbono → 'met-'",
          "–SH como grupo principal → sufijo '-tiol'",
          "Metanotiol (antes: metil mercaptano)",
        ],
      },
    ],
  },
  {
    id: "sulfoxidos",
    nombre: "Sulfóxidos y sulfonas",
    formula: "R₂S=O / R₂SO₂",
    grupo: "Azufre oxidado con enlaces S=O",
    sufijo: "…-sulfóxido / …-sulfona",
    prefijo: "…sulfinil- / …sulfonil-",
    reglas: "Grupos con azufre en alto estado de oxidación. El nombre 'óxido' se reserva para el S; derivados con funciones ácidas usan -sulfónico.",
    ejemplos: [
      {
        nombre: "Dimetilsulfóxido",
        iupac: "Dimetilsulfóxido (DMSO)",
        comun: "DMSO (disolvente polar, patrón industrial)",
        mol: {
          atoms: [
            A("a", -0.7, 0.3, "CH₃"), A("S", 0.1, 0, "S"), A("b", 0.9, 0.3, "CH₃"), A("O", 0.1, -0.8, "O"),
          ],
          bonds: [Bd("a", "S"), Bd("S", "b"), Bd("S", "O", 2)],
          hiA: ["S", "O"], hiB: ["2"],
        },
        detalles: [
          "Dos grupos metilo sobre el azufre → 'dimetil-'",
          "Azufre oxidado con S=O → sufijo '-sulfóxido'",
          "Dimetilsulfóxido (DMSO)",
        ],
      },
    ],
  },
];

export const SERIES_HOMOLOGAS = [
  {
    nombre: "Alcanos CₙH₂ₙ₊₂",
    filas: [
      [1, "Metano", "CH₄", "Usado como gas natural"],
      [2, "Etano", "C₂H₆", "Componente del gas natural"],
      [3, "Propano", "C₃H₈", "Gas licuado (GLP)"],
      [4, "Butano", "C₄H₁₀", "Encendedores"],
      [5, "Pentano", "C₅H₁₂", "Disolvente"],
      [6, "Hexano", "C₆H₁₄", "Extracción de aceites"],
      [7, "Heptano", "C₇H₁₆", "Patrón de octanaje (0)"],
      [8, "Octano", "C₈H₁₈", "Patrón de octanaje (100)"],
      [9, "Nonano", "C₉H₂₀", "Combustible"],
      [10, "Decano", "C₁₀H₂₂", "Combustibles diésel"],
    ],
  },
  {
    nombre: "1-Alquenos CₙH₂ₙ (terminales)",
    filas: [
      [2, "Eteno", "C₂H₄", "Etileno; maduración"],
      [3, "Propeno", "C₃H₆", "Propileno; polímeros"],
      [4, "But-1-eno", "C₄H₈", "Butileno; industrias copolímeros"],
      [5, "Pent-1-eno", "C₅H₁₀", "Monómero"],
      [6, "Hex-1-eno", "C₆H₁₂", "Copolímero del polietileno"],
    ],
  },
  {
    nombre: "1-Alquinos CₙH₂ₙ₋₂ (terminales)",
    filas: [
      [2, "Etino", "C₂H₂", "Acetileno; soldadura"],
      [3, "Propino", "C₃H₄", "Combustible MAP"],
      [4, "But-1-ino", "C₄H₆", "Monómero"],
      [5, "Pent-1-ino", "C₅H₈", "Derivados industriales"],
    ],
  },
];

export const PRIORIDADES_GRUPOS = [
  "1. Ácido carboxílico –COOH",
  "2. Éster –COO– / anhídrido",
  "3. Amida –CONH₂",
  "4. Nitrilo –C≡N",
  "5. Aldehído –CHO",
  "6. Cetona –C=O",
  "7. Alcohol –OH  (fenol)",
  "8. Amina –NH₂",
  "9. Éter –O–",
  "10. Alqueno / alquino",
  "11. Halogenuro –X",
  "12. Nitro –NO₂",
];

export interface CompuestoInteres {
  id: string;
  nombre: string;
  iupac: string;
  formula: string;
  masa: number;
  gf: string;
  fuente: string;
  uso: string;
  riesgo?: string;
  nota?: string;
  smiles?: string;
}

// Compuestos de interés cotidiano: datos reales (fórmula, masa molar de
// valores de referencia, fuente, uso). El SMILES solo se incluye si está
// verificado; si falta, no se dibuja estructura (regla: no inventar química).
export const COMPUESTOS_INTERES: CompuestoInteres[] = [
  {
    id: "cafeina",
    nombre: "Cafeína",
    iupac: "1,3,7-trimetilxantina",
    formula: "C₈H₁₀N₄O₂",
    masa: 194.19,
    gf: "Amina (xantina con N metilados)",
    fuente: "Café, té, cacao y mate",
    uso: "Estimulante del sistema nervioso central en bebidas y fármacos",
    riesgo: "Dosis altas: ansiedad, insomnio y taquicardia",
    smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
  },
  {
    id: "aspirina",
    nombre: "Ácido acetilsalicílico",
    iupac: "Ácido 2-acetoxibenzoico",
    formula: "C₉H₈O₄",
    masa: 180.16,
    gf: "Éster + ácido carboxílico",
    fuente: "Derivada de la salicina del sauce; sintetizada a gran escala",
    uso: "Analgésico, antipirético y antiinflamatorio",
    riesgo: "Contraindicado en algunos trastornos de coagulación",
    smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
  },
  {
    id: "paracetamol",
    nombre: "Paracetamol",
    iupac: "N-(4-hidroxifenil)etanamida",
    formula: "C₈H₉NO₂",
    masa: 151.16,
    gf: "Amida + fenol",
    fuente: "Síntesis farmacéutica",
    uso: "Analgésico y antipirético",
    riesgo: "Hepatotóxico en sobredosis",
    smiles: "CC(=O)NC1=CC=C(C=C1)O",
  },
  {
    id: "ibuprofeno",
    nombre: "Ibuprofeno",
    iupac: "Ácido (±)-2-(4-isobutilfenil)propiónico",
    formula: "C₁₃H₁₈O₂",
    masa: 206.28,
    gf: "Ácido carboxílico sobre anillo aromático",
    fuente: "Síntesis farmacéutica",
    uso: "Antiinflamatorio no esteroideo (AINE)",
    riesgo: "Puede irritar el estómago a dosis altas",
    smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
  },
  {
    id: "nicotina",
    nombre: "Nicotina",
    iupac: "(S)-3-(1-metilpirrolidin-2-il)piridina",
    formula: "C₁₀H₁₄N₂",
    masa: 162.23,
    gf: "Amina (piridina + pirrolidina)",
    fuente: "Tabaco (Nicotiana tabacum)",
    uso: "Es el alcaloide que dota al tabaco de su efecto estimulante",
    riesgo: "Altamente adictiva; no consumir. No es una sustancia inofensiva",
    nota: "Se estudia por su química; su consumo está asociado a graves problemas de salud.",
    smiles: "CN1CCCC1C1=CC=CN=C1",
  },
  {
    id: "thc",
    nombre: "Δ⁹-tetrahidrocannabinol (THC)",
    iupac: "(-)-trans-Δ⁹-tetrahidrocannabinol",
    formula: "C₂₁H₃₀O₂",
    masa: 314.46,
    gf: "Fenol (aromático) + enlace éter; terpeno ciclado",
    fuente: "Fitoquímico de Cannabis sativa (tricomas de las flores)",
    uso: "Principio psicoactivo del cannabis; estudiado en farmacología",
    riesgo:
      "Sustancia psicoactiva con efectos sobre el sistema nervioso; su cultivo, venta y consumo están regulados (varía según el país).",
    nota: "Solo se enumera su química a nivel educativo: estructura grande con anillo terpénico y fenol, sin dibujo simplificado para no mostrar conectividad incorrecta.",
  },
  {
    id: "cbd",
    nombre: "Cannabidiol (CBD)",
    iupac: "2-[(1R,6R)-3-metil-6-(prop-1-en-2-il)ciclohex-2-en-1-il]-5-pentilbenceno-1,3-diol",
    formula: "C₂₁H₃₀O₂",
    masa: 314.46,
    gf: "Dos fenoles (resorcinol) + terpeno ciclado",
    fuente: "Fitoquímico de Cannabis/hemp (cañamo industrial)",
    uso: "No psicoactivo; estudiado por su potencial terapéutico",
    riesgo:
      "Misma fórmula molecular que el THC: son isómeros estructurales. Su estatus legal también depende del país.",
    nota: "C₂₁H₃₀O₂ es un bonito ejemplo de isomería: misma fórmula, estructura distinta y efectos opuestos.",
  },
  {
    id: "glucosa",
    nombre: "D-glucosa",
    iupac: "(2R,3S,4R,5R)-2,3,4,5,6-pentahidroxihexanal",
    formula: "C₆H₁₂O₆",
    masa: 180.16,
    gf: "Aldehído; polialcohol (aldosa)",
    fuente: "Frutas, miel y sangre (combustible celular)",
    uso: "Principal azúcar que usan las células para obtener energía",
    smiles: "OCC1OC(O)C(O)C(O)C1O",
  },
  {
    id: "fructosa",
    nombre: "Fructosa",
    iupac: "(2R,3S,4S,5R)-2,3,4,5-tetrahidroxi-2-hexanona",
    formula: "C₆H₁₂O₆",
    masa: 180.16,
    gf: "Cetona; polialcohol (cetosa)",
    fuente: "Frutas y miel",
    uso: "Endulzante",
  },
  {
    id: "sacarosa",
    nombre: "Sacarosa",
    iupac: "α-D-glucopiranosil-(1→2)-β-D-fructofuranósido",
    formula: "C₁₂H₂₂O₁₁",
    masa: 342.3,
    gf: "Disacárido (enlace glicosídico)",
    fuente: "Caña de azúcar y remolacha",
    uso: "El azúcar de mesa común",
    nota: "Si n = glucosa + fructosa − H₂O: 180.16 + 180.16 − 18.02 = 342.30 g/mol.",
  },
  {
    id: "etanol",
    nombre: "Etanol",
    iupac: "Etanol",
    formula: "C₂H₆O",
    masa: 46.07,
    gf: "Alcohol (–OH)",
    fuente: "Fermentación de azúcares por levaduras",
    uso: "Bebidas alcohólicas, desinfectante, combustible (bioetanol)",
    riesgo: "Consumo excesivo tóxico; inflamable",
    smiles: "CCO",
  },
  {
    id: "metanol",
    nombre: "Metanol",
    iupac: "Metanol",
    formula: "CH₄O",
    masa: 32.04,
    gf: "Alcohol (–OH)",
    fuente: "Destilación de madera e industria",
    uso: "Disolvente y precursor químico",
    riesgo: "MUY tóxico: puede causar ceguera; jamás ingerir",
    smiles: "CO",
  },
  {
    id: "acido-citrico",
    nombre: "Ácido cítrico",
    iupac: "Ácido 2-hidroxipropano-1,2,3-tricarboxílico",
    formula: "C₆H₈O₇",
    masa: 192.12,
    gf: "3 ácidos carboxílicos + 1 alcohol",
    fuente: "Cítricos (limón, naranja) y metabolismo celular",
    uso: "Acidulante en alimentos y ciclo de Krebs",
    smiles: "OC(CC(=O)O)(CC(=O)O)C(=O)O",
  },
  {
    id: "limoneno",
    nombre: "d-Limoneno",
    iupac: "(R)-4-isopropenil-1-metilciclohex-1-eno",
    formula: "C₁₀H₁₆",
    masa: 136.23,
    gf: "Alqueno cíclico (terpeno)",
    fuente: "Cáscara de cítricos",
    uso: "Aroma característico del limón; disolvente verde",
    smiles: "CC1=CCC(CC1)C(=C)C",
  },
  {
    id: "mentol",
    nombre: "Mentol",
    iupac: "(1R,2S,5R)-5-metil-2-(propan-2-il)ciclohexanol",
    formula: "C₁₀H₂₀O",
    masa: 156.27,
    gf: "Alcohol terpénico",
    fuente: "Menta",
    uso: "Sensación de frescor; productos bucales y ungüentos",
    smiles: "CC(C)C1CCC(C)CC1O",
  },
  {
    id: "eucaliptol",
    nombre: "Eucaliptol (cineol)",
    iupac: "1,8-cineol",
    formula: "C₁₀H₁₈O",
    masa: 154.25,
    gf: "Éter cíclico",
    fuente: "Hojas de eucalipto",
    uso: "Descongestionante; aroma de jarabes y bálsamos",
  },
  {
    id: "vainillina",
    nombre: "Vainillina",
    iupac: "4-hidroxi-3-metoxibenzaldehído",
    formula: "C₈H₈O₃",
    masa: 152.15,
    gf: "Aldehído + fenol + éter",
    fuente: "Vaina de vainilla (y síntesis industrial)",
    uso: "El aroma principal de la vainilla",
    smiles: "COc1cc(C=O)ccc1O",
  },
  {
    id: "cinamaldehido",
    nombre: "Cinamaldehído",
    iupac: "(E)-3-fenilprop-2-enal",
    formula: "C₉H₈O",
    masa: 132.16,
    gf: "Aldehído + alqueno conjugado al anillo",
    fuente: "Canela",
    uso: "El aroma característico de la canela",
    smiles: "O=CC=CC1=CC=CC=C1",
  },
  {
    id: "acido-salicilico",
    nombre: "Ácido salicílico",
    iupac: "Ácido 2-hidroxibenzoico",
    formula: "C₇H₆O₃",
    masa: 138.12,
    gf: "Ácido carboxílico + fenol",
    fuente: "Corteza de sauce",
    uso: "Precursor de la aspirina; queratolítico en cosmética",
    smiles: "OC(=O)C1=CC=CC=C1O",
  },
  {
    id: "vitamina-c",
    nombre: "Vitamina C (ácido ascórbico)",
    iupac: "Ácido L-ascórbico",
    formula: "C₆H₈O₆",
    masa: 176.12,
    gf: "Lactona + diol; γ-lactona",
    fuente: "Frutas y verduras frescas",
    uso: "Antioxidante; previene el escorbuto",
    smiles: "OC[C@@H](O)[C@H]1OC(=O)C(O)=C1O",
  },
  {
    id: "colesterol",
    nombre: "Colesterol",
    iupac: "(3β)-Colest-5-en-3-ol",
    formula: "C₂₇H₄₆O",
    masa: 386.65,
    gf: "Alcohol esteroide (4 anillos fusionados)",
    fuente: "Sintetizado por el hígado y en alimentos animales",
    uso: "Componente esencial de membranas; precursor de hormonas",
    nota: "Estructura grande (27 C) con 4 anillos fusionados: cuádruple anillo del ciclopentanoperhidrofenantreno.",
    smiles: "CC(C)C(C)CCC(C)C1CCC2C3CC=C4CC(O)CCC4(C)C3CCC12C",
  },
  {
    id: "clorofila-a",
    nombre: "Clorofila a",
    iupac: "Clorofila A",
    formula: "C₅₅H₇₂MgN₄O₅",
    masa: 893.49,
    gf: "Porforina con metal central Mg (macrociclo)",
    fuente: "Fotosíntesis en plantas y algas",
    uso: "Pigmento que absorbe la luz en la fotosíntesis",
    nota:
      "El metal protagonista es el magnesio en el centro de una porfirina; la masa molar refleja la fórmula común de referencia.",
  },
  {
    id: "formaldehido",
    nombre: "Formaldehído",
    iupac: "Metanal",
    formula: "CH₂O",
    masa: 30.03,
    gf: "Aldehído",
    fuente: "Combustión incompleta; síntesis industrial",
    uso: "Preservantes, resinas y desinfectantes",
    riesgo: "Tóxico e irritante; vapores peligrosos. Nunca en espacios cerrados",
    smiles: "C=O",
  },
  {
    id: "acetona",
    nombre: "Acetona",
    iupac: "Propan-2-ona",
    formula: "C₃H₆O",
    masa: 58.08,
    gf: "Cetona",
    fuente: "Síntesis industrial (proceso del cumeno)",
    uso: "Disolvente de uso cotidiano (quitaesmalte, limpieza)",
    riesgo: "Inflamable; vapores irritantes",
    smiles: "CC(=O)C",
  },
  {
    id: "glicerol",
    nombre: "Glicerol (glicerina)",
    iupac: "Propano-1,2,3-triol",
    formula: "C₃H₈O₃",
    masa: 92.09,
    gf: "Polialcohol (triol)",
    fuente: "Hidrólisis de grasas y aceites",
    uso: "Humectante en cosmética y alimentos; precursor de la nitroglicerina",
    nota: "Sus tres grupos –OH la hacen excelente humectante.",
    smiles: "OCC(O)CO",
  },
  {
    id: "urea",
    nombre: "Urea",
    iupac: "Urea (diamida del ácido carbónico)",
    formula: "CH₄N₂O",
    masa: 60.06,
    gf: "Amida",
    fuente: "Metabolismo de proteínas; síntesis de Wöhler (1828)",
    uso: "Fertilizante nitrogenado y materia prima química",
    nota: "Primer compuesto orgánico obtenido en laboratorio a partir de un precursor inorgánico.",
    smiles: "NC(=O)N",
  },
  {
    id: "tolueno",
    nombre: "Tolueno",
    iupac: "Metilbenceno",
    formula: "C₇H₈",
    masa: 92.14,
    gf: "Hidrocarburo aromático (alquilbenceno)",
    fuente: "Petróleo (reformado catalítico)",
    uso: "Disolvente y precursor (TNT, ácido benzoico)",
    riesgo: "Tóxico por inhalación; inflamable",
    smiles: "CC1=CC=CC=C1",
  },
  {
    id: "anilina",
    nombre: "Anilina",
    iupac: "Fenilamina (bencenamina)",
    formula: "C₆H₇N",
    masa: 93.13,
    gf: "Amina aromática",
    fuente: "Síntesis industrial (nitrobenceno + H₂)",
    uso: "Tintes, polímeros (MDI) y farmacia",
    riesgo: "Tóxica; sospecha de carcinogenicidad",
    smiles: "NC1=CC=CC=C1",
  },
  {
    id: "naftaleno",
    nombre: "Naftaleno",
    iupac: "Biciclo[4.4.0]deca-1,3,5,7,9-pentaeno",
    formula: "C₁₀H₈",
    masa: 128.17,
    gf: "Hidrocarburo aromático policíclico (2 anillos fusionados)",
    fuente: "Alquitrán de hulla y petróleo",
    uso: "Clásicas «bolas antipelillas»; química de colorantes",
    riesgo: "Nocivo por inhalación; posible carcinógeno",
    nota: "Dos anillos bencénicos fusionados; su olor pungente es inconfundible.",
    smiles: "C1=CC2=CC=CC=C2C=C1",
  },
  {
    id: "acido-lactico",
    nombre: "Ácido láctico",
    iupac: "Ácido 2-hidroxipropanoico",
    formula: "C₃H₆O₃",
    masa: 90.08,
    gf: "Ácido carboxílico + alcohol (α-hidroxiácido)",
    fuente: "Músculo (fermentación láctica) y bacterias lácticas",
    uso: "Alimentos, cosmética (AHA) y bioplásticos (PLA)",
    smiles: "CC(O)C(=O)O",
  },
  {
    id: "butirato-de-etilo",
    nombre: "Butirato de etilo",
    iupac: "Butanoato de etilo",
    formula: "C₆H₁₂O₂",
    masa: 116.16,
    gf: "Éster",
    fuente: "Esterificación de etanol + ácido butírico",
    uso: "Aroma artificial de piña",
    nota: "Los ésteres de ácidos carboxílicos producen muchos aromas frutales.",
    smiles: "CCCC(=O)OCC",
  },
  {
    id: "adrenalina",
    nombre: "Adrenalina (epinefrina)",
    iupac: "(R)-4-(1-hidroxi-2-(metilamino)etil)benceno-1,2-diol",
    formula: "C₉H₁₃NO₃",
    masa: 183.2,
    gf: "Catecolamina (fenol + alcohol + amina)",
    fuente: "Glándulas suprarrenales",
    uso: "Hormona de «lucha o huida»; fármaco de emergencia",
    smiles: "CNC[C@H](O)c1cc(O)c(O)cc1",
  },
  {
    id: "serotonina",
    nombre: "Serotonina (5-hidroxitriptamina)",
    iupac: "3-(2-aminoetil)-1H-indol-5-ol",
    formula: "C₁₀H₁₂N₂O",
    masa: 176.22,
    gf: "Triptamina (indol + amina + fenol)",
    fuente: "Células del intestino y cerebro",
    uso: "Neurotransmisor que regula ánimo, sueño y apetito",
    smiles: "NCCC1=CNC2=CC=C(O)C=C12",
  },
  {
    id: "acido-butirico",
    nombre: "Ácido butírico",
    iupac: "Ácido butanoico",
    formula: "C₄H₈O₂",
    masa: 88.11,
    gf: "Ácido carboxílico",
    fuente: "Fermentación de la mantequilla ranciosa",
    uso: "Olor penetrante; precursor de ésteres frutales",
    smiles: "CCCC(=O)O",
  },
  {
    id: "alcanfor",
    nombre: "Alcanfor",
    iupac: "(1R,4R)-1,7,7-trimetilbiciclo[2.2.1]heptan-2-ona",
    formula: "C₁₀H₁₆O",
    masa: 152.23,
    gf: "Cetona terpénica (bicíclica)",
    fuente: "Canforero (Cinnamomum camphora) y síntesis",
    uso: "Ungüentos, repelentes y fragancias",
    smiles: "CC1(C)C2CCC1(C)C(=O)C2",
  },
];

export const COMPUESTOS_INTERES_NOTE =
  "Los organismos y la industria producen millones de compuestos orgánicos distintos. " +
  "Esta es una muestra representativa de los más cotidianos, con sus fórmulas y masas molares reales. " +
  "Las estructuras complejas (siempre por encima de ~15 átomos) no se dibujan aquí: preferimos no mostrar una conectividad incorrecta en lugar de inventarla.";

/* Clasificación GHS para compuestos con peligrosidad bien establecida
   (clasificaciones publicadas tipo CLP/REACH). Los compuestos sin entrada
   no tienen un conjunto GHS consensuado (p. ej. gluten, colesterol). */
export const GHS_ORGANICOS: Record<string, string[]> = {
  cafeina: ["g07"],
  aspirina: ["g07"],
  paracetamol: ["g07"],
  ibuprofeno: ["g07"],
  "acido-salicilico": ["g07"],
  nicotina: ["g06", "g08", "g09"],
  etanol: ["g02"],
  metanol: ["g02", "g06", "g08"],
  acetona: ["g02"],
  formaldehido: ["g06", "g08", "g07"],
  tolueno: ["g02", "g07", "g08", "g09"],
  anilina: ["g06", "g07", "g08", "g09"],
  naftaleno: ["g07", "g08", "g09"],
  "acido-lactico": ["g05"],
  "acido-butirico": ["g02", "g05"],
};