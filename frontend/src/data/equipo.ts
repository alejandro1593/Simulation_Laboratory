// Instrumental de laboratorio: nombres reales (ES/EN), función y notas de uso.
// Los pictogramas GHS corresponden al Sistema Globalmente Armonizado (Naciones Unidas).

export interface Instrumento {
  n: string;
  en: string;
  uso: string;
  svg: string;
  riesgo?: string;
}

export interface CategoriaEquipo {
  id: string;
  titulo: string;
  ico: string;
  intro: string;
  items: Instrumento[];
}

export const EQUIPO_LABORATORIO: CategoriaEquipo[] = [
  {
    id: "vidrio",
    titulo: "Cristalería",
    ico: "🧪",
    intro: "Recipientes y piezas de vidrio de borosilicato para contener, medir y reaccionar.",
    items: [
      { n: "Vaso de precipitados", en: "Beaker", uso: "Contener y calentar disoluciones; no mide con precisión.", svg: "vaso-precipitados", riesgo: "Puede romperse: evitar choques térmicos. No sumergirlo en baño de hielo seco." },
      { n: "Matraz Erlenmeyer", en: "Erlenmeyer flask", uso: "Mezclar y calentar con menos evaporación; ideal para valoraciones.", svg: "matraz-erlenmeyer" },
      { n: "Matraz aforado", en: "Volumetric flask", uso: "Preparar disoluciones de volumen exacto (aforo).", svg: "matraz-aforado" },
      { n: "Matraz kitasato", en: "Kitasato flask", uso: "Filtración a vacío emparejado con el embudo Büchner.", svg: "matraz-kitasato" },
      { n: "Balón de destilación", en: "Distillation flask", uso: "Destilar líquidos conectando el refrigerante.", svg: "balon-destilacion" },
      { n: "Probeta graduada", en: "Graduated cylinder", uso: "Medir volúmenes aproximados con más precisión que un vaso.", svg: "probeta-graduada" },
      { n: "Bureta", en: "Burette", uso: "Dosificar volúmenes exactos en valoraciones ácido-base.", svg: "bureta" },
      { n: "Pipeta graduada / aforada", en: "Pipette", uso: "Transferir volúmenes exactos; la aforada solo vierte su medida exacta.", svg: "pipeta" },
      { n: "Tubo de ensayo", en: "Test tube", uso: "Reacciones en pequeña escala y ensayos cualitativos.", svg: "tubo-ensayo", riesgo: "Mantener lejos de los ojos; aporrear con gradilla." },
      { n: "Embudo cónico", en: "Glass funnel", uso: "Trasvasar líquidos y filtrar por gravedad con papel.", svg: "embudo-conico" },
      { n: "Embudo Büchner", en: "Büchner funnel", uso: "Filtrar a vacío para separar sólidos rápidamente.", svg: "embudo-buchner" },
      { n: "Embudo de decantación", en: "Separatory funnel", uso: "Separar dos líquidos inmiscibles por densidades.", svg: "embudo-decantacion" },
      { n: "Refrigerante de Liebig", en: "Liebig condenser", uso: "Condensar vapores en destilación.", svg: "refrigerante-liebig" },
      { n: "Vidrio de reloj", en: "Watch glass", uso: "Pesar pequeñas cantidades y cubrir recipientes.", svg: "vidrio-reloj" },
      { n: "Varilla de vidrio", en: "Glass rod", uso: "Agitar y guiar el vertido sin rayar el vidrio.", svg: "varilla-vidrio" },
      { n: "Crisol y tapa", en: "Crucible with lid", uso: "Calcinar a alta temperatura sobre la mufla.", svg: "crisol-tapa" },
      { n: "Mortero y pistilo", en: "Mortar and pestle", uso: "Moler y homogeneizar sólidos finos.", svg: "mortero-pistilo" },
      { n: "Placa de Petri", en: "Petri dish", uso: "Cultivos microbiológicos y observación de muestras.", svg: "placa-petri" },
      { n: "Frasco lavador", en: "Wash bottle", uso: "Añadir agua destilada en puntos exactos.", svg: "frasco-lavador" },
    ],
  },
  {
    id: "medida",
    titulo: "Medición",
    ico: "⚖️",
    intro: "Instrumentos que cuantifican masa, volumen, temperatura u otras propiedades.",
    items: [
      { n: "Balanza analítica", en: "Analytical balance", uso: "Masa con precisión de 0.1 mg; recinto cerrado contra corrientes.", svg: "balanza-analitica", riesgo: "Manejo delicado; calibrar con patrones periódicamente." },
      { n: "Balanza granataria", en: "Top-loading balance", uso: "Pesadas rápidas poco exigentes (0.1–0.01 g).", svg: "balanza-granataria" },
      { n: "Termómetro", en: "Thermometer", uso: "Medir temperatura; los de mercurio están prohibidos: usar alcohol digital cuando se pueda.", svg: "termometro" },
      { n: "pH-metro", en: "pH meter", uso: "Medir pH en disolución con electrodo de vidrio; calibrar con tampones.", svg: "ph-metro" },
      { n: "Espectrofotómetro UV-Vis", en: "UV-Vis spectrophotometer", uso: "Cuantificar sustancias por absorbancia de luz.", svg: "espectrofotometro-uv-vis" },
      { n: "Refractómetro", en: "Refractometer", uso: "Medir el índice de refracción (pureza, concentración).", svg: "refractometro" },
      { n: "Densímetro / areómetro", en: "Hydrometer", uso: "Medir densidad directamente por flotación.", svg: "densimetro" },
      { n: "Viscosímetro", en: "Viscometer", uso: "Medir viscosidad de líquidos.", svg: "viscosimetro" },
      { n: "Manómetro", en: "Manometer / pressure gauge", uso: "Medir presión de gases en sistemas cerrados.", svg: "manometro" },
    ],
  },
  {
    id: "calor",
    titulo: "Calentamiento",
    ico: "🔥",
    intro: "Fuentes de calor controladas para reacciones, calcinaciones y secados.",
    items: [
      { n: "Mechero Bunsen", en: "Bunsen burner", uso: "Llama regulable para heating de vidrio y combustiones.", svg: "mechero-bunsen", riesgo: "Nunca usar con solventes inflamables abiertos." },
      { n: "Mechero de alcohol", en: "Alcohol lamp", uso: "Calefacción suave en ausencia de gas.", svg: "mechero-alcohol" },
      { n: "Manta calefactora", en: "Heating mantle", uso: "Calentar matraces esféricos de forma homogénea.", svg: "manta-calefactora" },
      { n: "Placa calefactora", en: "Hot plate", uso: "Calentar vasos; versiones con agitación magnética.", svg: "placa-calefactora" },
      { n: "Baño María", en: "Water bath", uso: "Calentamiento suave y uniforme hasta 100 °C.", svg: "bano-maria" },
      { n: "Estufa de secado", en: "Drying oven", uso: "Secar material y sólidos entre 60 y 200 °C.", svg: "estufa-secado" },
      { n: "Mufla", en: "Muffle furnace", uso: "Calcinar a temperaturas de 500–1200 °C.", svg: "mufla", riesgo: "Guantes térmicos y pinzas largas: piezas incandescentes." },
    ],
  },
  {
    id: "separacion",
    titulo: "Separación y purificación",
    ico: "🔻",
    intro: "Métodos físicos para aislar y purificar componentes.",
    items: [
      { n: "Papel de filtro", en: "Filter paper", uso: "Filtrar suspensiones por retención del sólido.", svg: "papel-filtro" },
      { n: "Embudo Büchner + kitasato", en: "Büchner filtration kit", uso: "Filtración a vacío rápida y lavado eficaz del precipitado.", svg: "buchner-kit" },
      { n: "Centrífuga", en: "Centrifuge", uso: "Sedimentar partículas suspensas por fuerza centrífuga.", svg: "centrifuga", riesgo: "Contrabalancear tubos SIEMPRE antes de girar." },
      { n: "Columna de destilación fraccionada", en: "Fractionating column", uso: "Separar líquidos con puntos de ebullición cercanos.", svg: "columna-fraccionada" },
      { n: "Cromatografía en capa fina (CCF/TLC)", en: "Thin-layer chromatography", uso: "Seguir el avance de reacciones y comprobar pureza.", svg: "ccf-tlc" },
      { n: "Tamiz / tamices", en: "Sieve set", uso: "Clasificar sólidos por tamaño de partícula.", svg: "tamiz" },
      { n: "Imán (separación magnética)", en: "Magnetic bar / hand magnet", uso: "Separar sólidos magnéticos de mezclas y agitar disoluciones.", svg: "iman" },
      { n: "Sublimador", en: "Sublimation apparatus", uso: "Purificar sólidos que subliman (yodo, naftaleno).", svg: "sublimador" },
    ],
  },
  {
    id: "soporte",
    titulo: "Soporte y sujeción",
    ico: "🧷",
    intro: "Estructuras que sostienen el equipo durante ensayos y montajes.",
    items: [
      { n: "Soporte universal", en: "Universal stand / ring stand", uso: "Base metálica pesada que equilibra el montaje.", svg: "soporte-universal" },
      { n: "Pinza de nuez", en: "Clamp with nut", uso: "Sujetar vidrio al soporte con presión regulable.", svg: "pinza-nuez" },
      { n: "Doble nuez", en: "Double-nut clamp", uso: "Fijar protecciones y extensiones a 90°.", svg: "doble-nuez" },
      { n: "Aro metálico", en: "Iron ring", uso: "Sostener embudos y rejillas sobre el mechero.", svg: "aro-metalico" },
      { n: "Rejilla de cerámica", en: "Wire gauze", uso: "Distribuir el calor del mechero sobre el vidrio.", svg: "rejilla-ceramica" },
      { n: "Trípode", en: "Tripod", uso: "Elevar el material sobre el mechero.", svg: "tripode" },
      { n: "Gradilla para tubos", en: "Test tube rack", uso: "Sostener tubos verticales; de metal, madera o plástico.", svg: "gradilla-tubos" },
      { n: "Pinzas para tubos/crisoles", en: "Tongs", uso: "Manipular material caliente sin quemaduras.", svg: "pinzas-tubos", riesgo: "Revisar el estado de las puntas de goma." },
    ],
  },
  {
    id: "seguridad",
    titulo: "Seguridad",
    ico: "🦺",
    intro: "Equipo de protección y respuesta ante emergencias en el laboratorio.",
    items: [
      { n: "Gafas de seguridad", en: "Safety goggles", uso: "Protección ocular obligatoria en todo ensayo.", svg: "gafas-seguridad" },
      { n: "Bata de laboratorio", en: "Lab coat", uso: "Aislar la piel y la ropa de salpicaduras.", svg: "bata-laboratorio", riesgo: "Mangas abotonadas; nunca suelta al trabajo." },
      { n: "Guantes", en: "Gloves", uso: "Proteger piel de ácidos, bases y disolventes; elegir material según reactivo.", svg: "guantes", riesgo: "Nunca tocar picaportes ni material limpio con guantes." },
      { n: "Mascarilla / respirador", en: "Respirator / mask", uso: "Filtrar vapores y polvos según el filtro.", svg: "mascarilla" },
      { n: "Campana extractora", en: "Fume hood", uso: "Realizar reacciones que desprenden vapores tóxicos.", svg: "campana-extractora", riesgo: "Cristal a media altura: barrera y corriente de aire." },
      { n: "Ducha de seguridad", en: "Safety shower", uso: "Lavado corporal extenso en salpicaduras mayores.", svg: "ducha-seguridad" },
      { n: "Lavaojos", en: "Eyewash station", uso: "Irrigar los ojos inmediatamente tras una salpicadura.", svg: "lavaojos" },
      { n: "Extintor", en: "Fire extinguisher", uso: "Sofocar fuegos clase A, B, C, D o K según el tipo.", svg: "extintor" },
      { n: "Botiquín de primeros auxilios", en: "First aid kit", uso: "Cura de cortes y quemaduras; acompañar siempre de aviso.", svg: "botiquin" },
      { n: "Kit de derrames", en: "Spill kit", uso: "Contener y neutralizar vertidos de ácidos, bases y mercurio.", svg: "kit-derrames" },
    ],
  },
];

export const PICTOGRAMAS_GHS = [
  { id: "g01", codigo: "GHS01", nombre: "Explosivo", sentido: "Sustancia o mezcla que puede explotar por choque, fricción o fuego." },
  { id: "g02", codigo: "GHS02", nombre: "Inflamable", sentido: "Se enciende con facilidad; vapores capaces de arder." },
  { id: "g03", codigo: "GHS03", nombre: "Comburente (oxidante)", sentido: "Favorece la combustión de otros materiales." },
  { id: "g04", codigo: "GHS04", nombre: "Gas a presión", sentido: "Gas comprimido o licuado; el recipiente puede estallar al calentarse." },
  { id: "g05", codigo: "GHS05", nombre: "Corrosivo", sentido: "Destruye tejidos y materiales metálicos." },
  { id: "g06", codigo: "GHS06", nombre: "Tóxico agudo", sentido: "Peligro de muerte o daño grave por ingestión, inhalación o contacto." },
  { id: "g07", codigo: "GHS07", nombre: "Irritante / nocivo", sentido: "Irrita piel, ojos o vías respiratorias." },
  { id: "g08", codigo: "GHS08", nombre: "Peligro para la salud", sentido: "Cancerígeno, mutágeno o tóxico para la reproducción." },
  { id: "g09", codigo: "GHS09", nombre: "Peligroso para el medio ambiente", sentido: "Tóxico para la vida acuática y ecosistemas." },
];