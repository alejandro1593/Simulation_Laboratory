// Catálogo de química inorgánica curado.
// Cada compuesto real se muestra con las nomenclaturas que aplican:
//  - Tradicional (sufijos -oso/-ico, hipo-/per-, anhídridos…)
//  - Stock (n.º de oxidación en números romanos)
//  - Sistemática IUPAC de composición (prefijos mono/di/tri/tetra…)
// NINGUNA estructura inventada: solo especies estables y reales.

export interface Columna {
  k: string;
  label: string;
  hint: string;
}

export interface Familia {
  id: string;
  titulo: string;
  img: string;
  intro: string;
  cols: Columna[];
  filas: Record<string, string>[];
  nota?: string;
}

export const SISTEMAS = [
  {
    nombre: "Sistemática (IUPAC)",
    d: "Prefijos multiplicadores griegos (mono-, di-, tri-, tetra-, penta-…) que indican el número de átomos. Se omite 'mono-' salvo para evitar ambigüedad.",
  },
  {
    nombre: "Stock",
    d: "Se indica el n.º de oxidación del metal con números romanos entre paréntesis: óxido de hierro(III). Solo aplica cuando el elemento tiene más de un estado.",
  },
  {
    nombre: "Tradicional",
    d: "Sufijos y prefijos clásicos: -oso (menor valencia), -ico (mayor), hipo-…-oso y per-…-ico para las no metálicas con cuatro estados.",
  },
];

export const CATALOGO_INORGANICO: Familia[] = [
  {
    id: "oxidos-metal",
    titulo: "Óxidos metálicos (básicos)",
    img: "Ox",
    intro:
      "Metal + oxígeno. Con 2 O²⁻. Si el metal tiene un solo estado de oxidación los nombres Stock y tradicional coinciden; si tiene varios (Fe, Cu, Pb, Sn, Mn…) se distinguen con sufijos o números romanos.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Fórmula molecular real" },
      { k: "trad", label: "Tradicional", hint: "-oso / -ico" },
      { k: "stock", label: "Stock", hint: "n.º de oxidación romano" },
      { k: "iupac", label: "Sistemática", hint: "prefijos de composición" },
    ],
    filas: [
      { f: "Na₂O", trad: "Óxido sódico", stock: "Óxido de sodio", iupac: "Monóxido de disodio" },
      { f: "K₂O", trad: "Óxido potásico", stock: "Óxido de potasio", iupac: "Monóxido de dipotasio" },
      { f: "CaO", trad: "Óxido cálcico", stock: "Óxido de calcio", iupac: "Óxido de calcio" },
      { f: "MgO", trad: "Óxido magnésico", stock: "Óxido de magnesio", iupac: "Óxido de magnesio" },
      { f: "BaO", trad: "Óxido bárico", stock: "Óxido de bario", iupac: "Óxido de bario" },
      { f: "Al₂O₃", trad: "Óxido alumínico", stock: "Óxido de aluminio", iupac: "Trióxido de dialuminio" },
      { f: "FeO", trad: "Óxido ferroso", stock: "Óxido de hierro(II)", iupac: "Monóxido de hierro" },
      { f: "Fe₂O₃", trad: "Óxido férrico", stock: "Óxido de hierro(III)", iupac: "Trióxido de dihierro" },
      { f: "Cu₂O", trad: "Óxido cuproso", stock: "Óxido de cobre(I)", iupac: "Monóxido de dicobre" },
      { f: "CuO", trad: "Óxido cúprico", stock: "Óxido de cobre(II)", iupac: "Monóxido de cobre" },
      { f: "PbO", trad: "Óxido plumboso", stock: "Óxido de plomo(II)", iupac: "Monóxido de plomo" },
      { f: "PbO₂", trad: "Óxido plúmbico", stock: "Óxido de plomo(IV)", iupac: "Dióxido de plomo" },
      { f: "SnO", trad: "Óxido estannoso", stock: "Óxido de estaño(II)", iupac: "Monóxido de estaño" },
      { f: "SnO₂", trad: "Óxido estánnico", stock: "Óxido de estaño(IV)", iupac: "Dióxido de estaño" },
      { f: "ZnO", trad: "Óxido de zinc", stock: "Óxido de zinc", iupac: "Óxido de zinc" },
      { f: "MnO", trad: "Óxido manganoso", stock: "Óxido de manganeso(II)", iupac: "Monóxido de manganeso" },
      { f: "MnO₂", trad: "Dióxido de manganeso", stock: "Óxido de manganeso(IV)", iupac: "Dióxido de manganeso" },
      { f: "HgO", trad: "Óxido mercúrico", stock: "Óxido de mercurio(II)", iupac: "Óxido de mercurio" },
    ],
  },
  {
    id: "oxidos-nometal",
    titulo: "Óxidos no metálicos (ácidos / anhídridos)",
    img: "An",
    intro:
      "No metal + oxígeno. En nomenclatura tradicional se nombran como 'anhídrido + ácido del que derivan'. El Stock usa números romanos también para el no metal y la sistemática indica el número real de átomos.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Fórmula molecular real" },
      { k: "trad", label: "Tradicional", hint: "anhídrido …" },
      { k: "stock", label: "Stock", hint: "n.º de oxidación romano" },
      { k: "iupac", label: "Sistemática", hint: "prefijos de composición" },
    ],
    filas: [
      { f: "CO", trad: "Anhídrido carbonoso (monóxido de carbono)", stock: "Óxido de carbono(II)", iupac: "Monóxido de carbono" },
      { f: "CO₂", trad: "Anhídrido carbónico (dióxido de carbono)", stock: "Óxido de carbono(IV)", iupac: "Dióxido de carbono" },
      { f: "SO₂", trad: "Anhídrido sulfuroso", stock: "Óxido de azufre(IV)", iupac: "Dióxido de azufre" },
      { f: "SO₃", trad: "Anhídrido sulfúrico", stock: "Óxido de azufre(VI)", iupac: "Trióxido de azufre" },
      { f: "N₂O", trad: "Óxido nitroso", stock: "Óxido de nitrógeno(I)", iupac: "Monóxido de dinitrógeno" },
      { f: "NO", trad: "Óxido nítrico", stock: "Óxido de nitrógeno(II)", iupac: "Monóxido de nitrógeno" },
      { f: "NO₂", trad: "Óxido nitroso (dióxido de nitrógeno)", stock: "Óxido de nitrógeno(IV)", iupac: "Dióxido de nitrógeno" },
      { f: "N₂O₅", trad: "Anhídrido nítrico", stock: "Óxido de nitrógeno(V)", iupac: "Pentaóxido de dinitrógeno" },
      { f: "P₂O₅", trad: "Anhídrido fosfórico", stock: "Óxido de fósforo(V)", iupac: "Pentaóxido de difósforo" },
      { f: "P₂O₃", trad: "Anhídrido fosforoso", stock: "Óxido de fósforo(III)", iupac: "Trióxido de difósforo" },
      { f: "Cl₂O", trad: "Anhídrido hipocloroso", stock: "Óxido de cloro(I)", iupac: "Monóxido de dicloro" },
      { f: "Cl₂O₅", trad: "Anhídrido clórico", stock: "Óxido de cloro(V)", iupac: "Pentaóxido de dicloro" },
      { f: "Cl₂O₇", trad: "Anhídrido perclórico", stock: "Óxido de cloro(VII)", iupac: "Heptaóxido de dicloro" },
      { f: "Br₂O₅", trad: "Anhídrido brómico", stock: "Óxido de bromo(V)", iupac: "Pentaóxido de dibromo" },
      { f: "I₂O₅", trad: "Anhídrido yódico", stock: "Óxido de yodo(V)", iupac: "Pentaóxido de diyodo" },
    ],
  },
  {
    id: "peroxidos",
    titulo: "Peróxidos",
    img: "Px",
    intro:
      "Contienen el grupo O₂²⁻ (dos oxígenos unidos entre sí, n.º de oxidación −1). El más famoso es el agua oxigenada. La sistemática usa el anión 'peróxido' (o 'dióxido' según IUPAC 2005).",
    cols: [
      { k: "f", label: "Fórmula", hint: "Contiene O₂²⁻" },
      { k: "nb", label: "Nombre habitual", hint: "uso común" },
      { k: "iupac", label: "Sistemática", hint: "peróxido + elemento" },
    ],
    filas: [
      { f: "H₂O₂", nb: "Agua oxigenada", iupac: "Peróxido de hidrógeno" },
      { f: "Na₂O₂", nb: "Soda de oxígeno", iupac: "Peróxido de disodio" },
      { f: "K₂O₂", nb: "—", iupac: "Peróxido de dipotasio" },
      { f: "BaO₂", nb: "Peróxido de bario", iupac: "Peróxido de bario" },
      { f: "CaO₂", nb: "—", iupac: "Peróxido de calcio" },
    ],
  },
  {
    id: "hidruros",
    titulo: "Hidruros (metálicos y elementos del bloque p)",
    img: "Hd",
    intro:
      "Compuestos binarios con hidrógeno. Con metales el H actúa como H⁻ (n.º 1−) y se nombran 'hidruro de …'. Con no metales muy electronegativos se nombran 'X-uro de hidrógeno' (nomenclatura de hidrógeno) y sus disoluciones acuosas como ácidos.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Binario con H" },
      { k: "nb", label: "Nombre habitual", hint: "uso común" },
      { k: "iupac", label: "Nomenclatura de hidrógeno", hint: "IUPAC actual" },
    ],
    filas: [
      { f: "NaH", nb: "Hidruro de sodio", iupac: "Hidruro de sodio" },
      { f: "KH", nb: "Hidruro de potasio", iupac: "Hidruro de potasio" },
      { f: "LiH", nb: "Hidruro de litio", iupac: "Hidruro de litio" },
      { f: "CaH₂", nb: "Hidruro de calcio", iupac: "Dihidruro de calcio" },
      { f: "BaH₂", nb: "Hidruro de bario", iupac: "Dihidruro de bario" },
      { f: "AlH₃", nb: "Hidruro de aluminio", iupac: "Trihidruro de aluminio" },
      { f: "HCl", nb: "Ácido clorhídrico (acuoso)", iupac: "Cloruro de hidrógeno" },
      { f: "HBr", nb: "Ácido bromhídrico", iupac: "Bromuro de hidrógeno" },
      { f: "HF", nb: "Ácido fluorhídrico", iupac: "Fluoruro de hidrógeno" },
      { f: "HI", nb: "Ácido yodhídrico", iupac: "Yoduro de hidrógeno" },
      { f: "H₂S", nb: "Ácido sulfhídrico", iupac: "Sulfuro de hidrógeno" },
      { f: "HCN", nb: "Ácido cianhídrico", iupac: "Cianuro de hidrógeno" },
      { f: "NH₃", nb: "Amoniaco", iupac: "Nitruro de hidrógeno (azano)" },
      { f: "PH₃", nb: "Fosfina", iupac: "Fosfuro de hidrógeno (fosfano)" },
      { f: "SiH₄", nb: "Silano", iupac: "Silicano (tetrahidruro de silicio)" },
    ],
  },
  {
    id: "hidroxidos",
    titulo: "Hidróxidos (bases)",
    img: "Oh",
    intro:
      "Metal + grupo OH⁻. Se obtienen del óxido metálico con agua. Los de metales alcalinos y alcalinotérreos son bases fuertes solubles.",
    cols: [
      { k: "f", label: "Fórmula", hint: "M(OH)ₙ" },
      { k: "nb", label: "Nombre habitual", hint: "tradicional = Stock (monovalentes)" },
      { k: "iupac", label: "Sistemática", hint: "prefijos + hidróxido" },
    ],
    filas: [
      { f: "NaOH", nb: "Hidróxido de sodio (sosa cáustica)", iupac: "Hidróxido de sodio" },
      { f: "KOH", nb: "Hidróxido de potasio (potasa cáustica)", iupac: "Hidróxido de potasio" },
      { f: "Ca(OH)₂", nb: "Hidróxido de calcio (cal apagada)", iupac: "Dihidróxido de calcio" },
      { f: "Ba(OH)₂", nb: "Hidróxido de bario", iupac: "Dihidróxido de bario" },
      { f: "Mg(OH)₂", nb: "Hidróxido de magnesio (leche de magnesia)", iupac: "Dihidróxido de magnesio" },
      { f: "Al(OH)₃", nb: "Hidróxido de aluminio", iupac: "Trihidróxido de aluminio" },
      { f: "Fe(OH)₂", nb: "Hidróxido ferroso", iupac: "Dihidróxido de hierro" },
      { f: "Fe(OH)₃", nb: "Hidróxido férrico", iupac: "Trihidróxido de hierro" },
      { f: "Cu(OH)₂", nb: "Hidróxido cúprico", iupac: "Dihidróxido de cobre" },
      { f: "Zn(OH)₂", nb: "Hidróxido de zinc", iupac: "Dihidróxido de zinc" },
      { f: "NH₄OH", nb: "Hidróxido amónico (amoníaco acuoso)", iupac: "Hidróxido de amonio" },
    ],
  },
  {
    id: "oxoacidos",
    titulo: "Ácidos oxoácidos",
    img: "Ao",
    intro:
      "Contienen H, un no metal central y O. La sistemática moderna se construye sobre el anión oxo (añade 'de hidrógeno'); la tradicional recuerda la valencia del central con sufijos. Junto a cada ácido se indica su anión conjugado.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Ácido" },
      { k: "trad", label: "Tradicional", hint: "-oso / -ico / hipo- / per-" },
      { k: "ox", label: "N.º oxidación", hint: "del no metal central" },
      { k: "iupac", label: "Sistemática (óxidos de hidrógeno)", hint: "oxoanión + de hidrógeno" },
      { k: "anion", label: "Anión", hint: "base conjugada" },
    ],
    filas: [
      { f: "H₂SO₄", trad: "Ácido sulfúrico", ox: "+6", iupac: "Tetraoxosulfato (VI) de hidrógeno", anion: "SO₄²⁻ sulfato" },
      { f: "H₂SO₃", trad: "Ácido sulfuroso", ox: "+4", iupac: "Trioxosulfato (IV) de hidrógeno", anion: "SO₃²⁻ sulfito" },
      { f: "HNO₃", trad: "Ácido nítrico", ox: "+5", iupac: "Trioxonitrato (V) de hidrógeno", anion: "NO₃⁻ nitrato" },
      { f: "HNO₂", trad: "Ácido nitroso", ox: "+3", iupac: "Dioxonitrato (III) de hidrógeno", anion: "NO₂⁻ nitrito" },
      { f: "H₃PO₄", trad: "Ácido fosfórico", ox: "+5", iupac: "Tetraoxofosfato (V) de hidrógeno", anion: "PO₄³⁻ fosfato" },
      { f: "H₃PO₃", trad: "Ácido fosforoso", ox: "+3", iupac: "Trioxofosfato (III) de hidrógeno", anion: "PO₃³⁻ fosfito" },
      { f: "H₂CO₃", trad: "Ácido carbónico", ox: "+4", iupac: "Trioxocarbonato (IV) de hidrógeno", anion: "CO₃²⁻ carbonato" },
      { f: "HClO₄", trad: "Ácido perclórico", ox: "+7", iupac: "Tetraoxoclorato (VII) de hidrógeno", anion: "ClO₄⁻ perclorato" },
      { f: "HClO₃", trad: "Ácido clórico", ox: "+5", iupac: "Trioxoclorato (V) de hidrógeno", anion: "ClO₃⁻ clorato" },
      { f: "HClO₂", trad: "Ácido cloroso", ox: "+3", iupac: "Dioxoclorato (III) de hidrógeno", anion: "ClO₂⁻ clorito" },
      { f: "HClO", trad: "Ácido hipocloroso", ox: "+1", iupac: "Oxoclorato (I) de hidrógeno", anion: "ClO⁻ hipoclorito" },
      { f: "HBrO₃", trad: "Ácido brómico", ox: "+5", iupac: "Trioxobromato (V) de hidrógeno", anion: "BrO₃⁻ bromato" },
      { f: "HIO₃", trad: "Ácido yódico", ox: "+5", iupac: "Trioxoyodato (V) de hidrógeno", anion: "IO₃⁻ yodato" },
      { f: "H₂CrO₄", trad: "Ácido crómico", ox: "+6", iupac: "Tetraoxocromato (VI) de hidrógeno", anion: "CrO₄²⁻ cromato" },
      { f: "H₂Cr₂O₇", trad: "Ácido dicrómico", ox: "+6", iupac: "Heptaoxodicromato (VI) de hidrógeno", anion: "Cr₂O₇²⁻ dicromato" },
      { f: "HMnO₄", trad: "Ácido permangánico", ox: "+7", iupac: "Tetraoxomanganato (VII) de hidrógeno", anion: "MnO₄⁻ permanganato" },
    ],
  },
  {
    id: "oxisales",
    titulo: "Oxisales (sales de oxoácidos)",
    img: "Os",
    intro:
      "Anión oxo + catión metálico. Conservan el nombre del anión acompañado del metal; el Stock añade la valencia del metal cuando es variable.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Oxisal" },
      { k: "trad", label: "Tradicional", hint: "anión + sufijo/-ico del metal" },
      { k: "stock", label: "Stock", hint: "n.º de oxidación romano" },
    ],
    filas: [
      { f: "Na₂SO₄", trad: "Sulfato sódico", stock: "Sulfato de sodio" },
      { f: "K₂SO₄", trad: "Sulfato potásico", stock: "Sulfato de potasio" },
      { f: "MgSO₄", trad: "Sulfato magnésico", stock: "Sulfato de magnesio" },
      { f: "CuSO₄", trad: "Sulfato cúprico", stock: "Sulfato de cobre(II)" },
      { f: "Fe₂(SO₄)₃", trad: "Sulfato férrico", stock: "Sulfato de hierro(III)" },
      { f: "Al₂(SO₄)₃", trad: "Sulfato alumínico", stock: "Sulfato de aluminio" },
      { f: "NaNO₃", trad: "Nitrato sódico", stock: "Nitrato de sodio" },
      { f: "KNO₃", trad: "Nitrato potásico", stock: "Nitrato de potasio" },
      { f: "AgNO₃", trad: "Nitrato de plata", stock: "Nitrato de plata" },
      { f: "Ca(NO₃)₂", trad: "Nitrato cálcico", stock: "Nitrato de calcio" },
      { f: "KNO₂", trad: "Nitrito potásico", stock: "Nitrito de potasio" },
      { f: "Na₂CO₃", trad: "Carbonato sódico", stock: "Carbonato de sodio" },
      { f: "CaCO₃", trad: "Carbonato cálcico", stock: "Carbonato de calcio" },
      { f: "NaHCO₃", trad: "Bicarbonato sódico", stock: "Hidrogenocarbonato de sodio" },
      { f: "Ca₃(PO₄)₂", trad: "Fosfato cálcico", stock: "Fosfato de calcio" },
      { f: "Na₃PO₄", trad: "Fosfato sódico", stock: "Fosfato de sodio" },
      { f: "KMnO₄", trad: "Permanganato potásico", stock: "Permanganato de potasio" },
      { f: "K₂Cr₂O₇", trad: "Dicromato potásico", stock: "Dicromato de potasio" },
      { f: "KClO₃", trad: "Clorato potásico", stock: "Clorato de potasio" },
      { f: "NaClO", trad: "Hipoclorito sódico (lejía)", stock: "Hipoclorito de sodio" },
      { f: "K₂CrO₄", trad: "Cromato potásico", stock: "Cromato de potasio" },
    ],
  },
  {
    id: "sales-binarias",
    titulo: "Sales binarias (haluros y sulfuros)",
    img: "Sb",
    intro:
      "Metal + no metal (halógeno o azufre). Nombre del anión (X-uro / sulfuro) + metal. Con metales polivalentes se distingue la valencia como en los óxidos.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Sales binarias" },
      { k: "trad", label: "Tradicional", hint: "-uro + -oso/-ico" },
      { k: "stock", label: "Stock", hint: "n.º de oxidación romano" },
      { k: "iupac", label: "Sistemática", hint: "prefijos" },
    ],
    filas: [
      { f: "NaCl", trad: "Cloruro sódico (sal común)", stock: "Cloruro de sodio", iupac: "Cloruro de sodio" },
      { f: "KCl", trad: "Cloruro potásico", stock: "Cloruro de potasio", iupac: "Cloruro de potasio" },
      { f: "CaCl₂", trad: "Cloruro cálcico", stock: "Cloruro de calcio", iupac: "Dicloruro de calcio" },
      { f: "AlCl₃", trad: "Cloruro alumínico", stock: "Cloruro de aluminio", iupac: "Tricloruro de aluminio" },
      { f: "FeCl₂", trad: "Cloruro ferroso", stock: "Cloruro de hierro(II)", iupac: "Dicloruro de hierro" },
      { f: "FeCl₃", trad: "Cloruro férrico", stock: "Cloruro de hierro(III)", iupac: "Tricloruro de hierro" },
      { f: "CuCl", trad: "Cloruro cuproso", stock: "Cloruro de cobre(I)", iupac: "Cloruro de cobre" },
      { f: "CuCl₂", trad: "Cloruro cúprico", stock: "Cloruro de cobre(II)", iupac: "Dicloruro de cobre" },
      { f: "PbCl₂", trad: "Cloruro plumboso", stock: "Cloruro de plomo(II)", iupac: "Dicloruro de plomo" },
      { f: "AgCl", trad: "Cloruro de plata", stock: "Cloruro de plata", iupac: "Cloruro de plata" },
      { f: "Na₂S", trad: "Sulfuro sódico", stock: "Sulfuro de sodio", iupac: "Monosulfuro de disodio" },
      { f: "FeS", trad: "Sulfuro ferroso", stock: "Sulfuro de hierro(II)", iupac: "Monosulfuro de hierro" },
      { f: "Cu₂S", trad: "Sulfuro cuproso", stock: "Sulfuro de cobre(I)", iupac: "Monosulfuro de dicobre" },
      { f: "ZnS", trad: "Sulfuro de zinc (blenda)", stock: "Sulfuro de zinc", iupac: "Monosulfuro de zinc" },
      { f: "HgS", trad: "Sulfuro mercúrico (cinabrio)", stock: "Sulfuro de mercurio(II)", iupac: "Monosulfuro de mercurio" },
      { f: "CaF₂", trad: "Fluoruro cálcico (fluorita)", stock: "Fluoruro de calcio", iupac: "Difluoruro de calcio" },
      { f: "NaBr", trad: "Bromuro sódico", stock: "Bromuro de sodio", iupac: "Bromuro de sodio" },
      { f: "KI", trad: "Yoduro potásico", stock: "Yoduro de potasio", iupac: "Yoduro de potasio" },
    ],
  },
  {
    id: "iones",
    titulo: "Iones y oxoaniones comunes",
    img: "Io",
    intro:
      "Referencia rápida de cationes y aniones que aparecen en la mayoría de fórmulas. Los nombres en negrita son los aceptados por la IUPAC actual.",
    cols: [
      { k: "f", label: "Fórmula", hint: "Carga incluida" },
      { k: "nb", label: "Nombre", hint: "nombre IUPAC/habitual" },
      { k: "ox", label: "N.º oxidación", hint: "del elemento central" },
      { k: "de", label: "Deriva de", hint: "ácido al que corresponde" },
    ],
    filas: [
      { f: "H⁺", nb: "Catión hidrógeno (protón)", ox: "+1", de: "Cualquier ácido" },
      { f: "Na⁺, K⁺, Li⁺", nb: "Cationes alcalinos", ox: "+1", de: "Metales del grupo 1" },
      { f: "Ca²⁺, Mg²⁺, Ba²⁺", nb: "Cationes alcalinotérreos", ox: "+2", de: "Metales del grupo 2" },
      { f: "Fe²⁺ / Fe³⁺", nb: "Catión hierro(II) / hierro(III)", ox: "+2 / +3", de: "Sales ferrosas / férricas" },
      { f: "Cu⁺ / Cu²⁺", nb: "Catión cobre(I) / cobre(II)", ox: "+1 / +2", de: "Sales cuprosas / cúpricas" },
      { f: "NH₄⁺", nb: "Catión amonio", ox: "N(−3)", de: "Amoniaco protonado" },
      { f: "OH⁻", nb: "Hidróxido", ox: "O(−2), H(+1)", de: "Bases" },
      { f: "NO₃⁻", nb: "Nitrato", ox: "N(+5)", de: "HNO₃ ácido nítrico" },
      { f: "NO₂⁻", nb: "Nitrito", ox: "N(+3)", de: "HNO₂ ácido nitroso" },
      { f: "SO₄²⁻", nb: "Sulfato", ox: "S(+6)", de: "H₂SO₄ ácido sulfúrico" },
      { f: "SO₃²⁻", nb: "Sulfito", ox: "S(+4)", de: "H₂SO₃ ácido sulfuroso" },
      { f: "PO₄³⁻", nb: "Fosfato", ox: "P(+5)", de: "H₃PO₄ ácido fosfórico" },
      { f: "CO₃²⁻", nb: "Carbonato", ox: "C(+4)", de: "H₂CO₃ ácido carbónico" },
      { f: "HCO₃⁻", nb: "Hidrogenocarbonato (bicarbonato)", ox: "C(+4)", de: "H₂CO₃ parcialmente neutralizado" },
      { f: "ClO₄⁻", nb: "Perclorato", ox: "Cl(+7)", de: "HClO₄ ácido perclórico" },
      { f: "ClO₃⁻", nb: "Clorato", ox: "Cl(+5)", de: "HClO₃ ácido clórico" },
      { f: "ClO₂⁻", nb: "Clorito", ox: "Cl(+3)", de: "HClO₂ ácido cloroso" },
      { f: "ClO⁻", nb: "Hipoclorito", ox: "Cl(+1)", de: "HClO ácido hipocloroso" },
      { f: "MnO₄⁻", nb: "Permanganato", ox: "Mn(+7)", de: "HMnO₄ ácido permangánico" },
      { f: "CrO₄²⁻", nb: "Cromato", ox: "Cr(+6)", de: "H₂CrO₄ ácido crómico" },
      { f: "Cr₂O₇²⁻", nb: "Dicromato", ox: "Cr(+6)", de: "H₂Cr₂O₇ ácido dicrómico" },
      { f: "CN⁻", nb: "Cianuro", ox: "C(+2), N(−3)", de: "HCN ácido cianhídrico" },
      { f: "O₂²⁻", nb: "Peróxido", ox: "O(−1)", de: "Peróxidos (H₂O₂…)" },
    ],
  },
];

export function buscarInorganico(q: string): { familia: Familia; fila: Record<string, string> }[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return CATALOGO_INORGANICO.flatMap((familia) =>
    familia.filas
      .filter((fila) => Object.values(fila).some((v) => v.toLowerCase().includes(t)))
      .map((fila) => ({ familia, fila })),
  );
}

// Utilidades de renderizado de subíndices / superíndices
export function subinterna(s: string): string {
  return s;
}