import type { JSX } from "react";

const G = "#8fb3cf";
const M = "#9aa7b5";
const LIQ = "#4a9ee8";
const LIQ2 = "#57d9c3";
const FILL = "#d7dee8";
const FLAME = "#ff9f43";
const RED = "#e2585a";

interface Props {
  kind: string;
  size?: number;
}

export default function InstrumentSVG({ kind, size = 96 }: Props): JSX.Element {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} role="img" aria-label={kind}>
      {renderInstrument(kind)}
    </svg>
  );
}

function renderInstrument(kind: string): JSX.Element {
  switch (kind) {
    case "vaso-precipitados":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M28 16 L28 72 Q28 78 34 78 L62 78 Q68 78 68 72 L68 16" />
          <path d="M68 16 L74 10" />
          <path d="M30 48 L30 72 Q30 76 34 76 L62 76 Q66 76 66 72 L66 48 Z" fill={LIQ} opacity="0.55" stroke="none" />
          <line x1="30" y1="32" x2="36" y2="32" strokeWidth="1.5" opacity="0.4" />
          <line x1="30" y1="44" x2="34" y2="44" strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    case "matraz-erlenmeyer":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M42 14 L42 30 M54 14 L54 30" />
          <line x1="39" y1="14" x2="57" y2="14" />
          <path d="M42 30 L22 78 L74 78 L54 30" />
          <path d="M32 58 L22 78 L74 78 L64 58 Z" fill={LIQ} opacity="0.5" stroke="none" />
        </g>
      );
    case "matraz-aforado":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M44 8 L44 38 M52 8 L52 38" />
          <line x1="41" y1="8" x2="55" y2="8" />
          <path d="M44 38 Q34 48 30 60 Q26 72 48 80 Q70 72 66 60 Q62 48 52 38" />
          <line x1="44" y1="24" x2="52" y2="24" strokeWidth="1.5" opacity="0.5" />
          <ellipse cx="48" cy="66" rx="14" ry="8" fill={LIQ} opacity="0.45" stroke="none" />
        </g>
      );
    case "matraz-kitasato":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M42 16 L42 32 M54 16 L54 32" />
          <line x1="39" y1="16" x2="57" y2="16" />
          <path d="M42 32 L22 78 L74 78 L54 32" />
          <path d="M54 24 L72 24 L72 16" />
        </g>
      );
    case "balon-destilacion":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <circle cx="44" cy="60" r="22" />
          <path d="M40 38 L40 14 M48 38 L48 14" />
          <line x1="37" y1="14" x2="51" y2="14" />
          <path d="M48 24 L70 14" />
          <ellipse cx="44" cy="68" rx="15" ry="8" fill={LIQ} opacity="0.45" stroke="none" />
        </g>
      );
    case "probeta-graduada":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M38 10 L38 76 Q38 80 42 80 L54 80 Q58 80 58 76 L58 10" />
          <path d="M32 80 L64 80" />
          <line x1="35" y1="10" x2="61" y2="10" />
          <line x1="40" y1="24" x2="46" y2="24" strokeWidth="1.5" opacity="0.4" />
          <line x1="40" y1="38" x2="44" y2="38" strokeWidth="1.5" opacity="0.4" />
          <line x1="40" y1="52" x2="46" y2="52" strokeWidth="1.5" opacity="0.4" />
          <line x1="40" y1="66" x2="44" y2="66" strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    case "bureta":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M46 6 L46 68 M50 6 L50 68" />
          <line x1="43" y1="6" x2="53" y2="6" />
          <circle cx="48" cy="72" r="4" />
          <path d="M47 76 L48 90 L49 76" />
          <line x1="46" y1="20" x2="50" y2="20" strokeWidth="1.5" opacity="0.35" />
          <line x1="46" y1="36" x2="50" y2="36" strokeWidth="1.5" opacity="0.35" />
          <line x1="46" y1="52" x2="50" y2="52" strokeWidth="1.5" opacity="0.35" />
        </g>
      );
    case "pipeta":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M48 4 L48 32 M48 62 L48 90" />
          <ellipse cx="48" cy="47" rx="8" ry="15" />
          <line x1="44" y1="18" x2="52" y2="18" strokeWidth="1.5" opacity="0.35" />
          <line x1="44" y1="72" x2="52" y2="72" strokeWidth="1.5" opacity="0.35" />
        </g>
      );
    case "tubo-ensayo":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M36 12 L36 70 Q36 82 48 82 Q60 82 60 70 L60 12" />
          <line x1="33" y1="12" x2="63" y2="12" />
          <path d="M38 52 L38 70 Q38 80 48 80 Q58 80 58 70 L58 52 Z" fill={LIQ} opacity="0.5" stroke="none" />
        </g>
      );
    case "embudo-conico":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M18 18 L48 62 L78 18" />
          <line x1="14" y1="18" x2="82" y2="18" />
          <path d="M45 62 L45 84 M51 62 L51 84" />
          <path d="M28 38 L68 38 L52 58 L44 58 Z" fill={LIQ} opacity="0.45" stroke="none" />
        </g>
      );
    case "embudo-buchner":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M26 10 L26 32 L70 32 L70 10" />
          <line x1="26" y1="10" x2="70" y2="10" />
          <circle cx="40" cy="21" r="1.5" fill={M} stroke="none" />
          <circle cx="56" cy="21" r="1.5" fill={M} stroke="none" />
          <line x1="48" y1="32" x2="48" y2="40" />
          <path d="M48 40 L34 76 L62 76 L48 40" />
        </g>
      );
    case "embudo-decantacion":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M38 14 L38 36 Q26 50 26 64 Q26 80 48 80 Q70 80 70 64 Q70 50 58 36 L58 14" />
          <line x1="35" y1="14" x2="61" y2="14" />
          <line x1="48" y1="80" x2="48" y2="88" />
          <circle cx="48" cy="84" r="3" />
        </g>
      );
    case "refrigerante-liebig":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="30" y="4" width="36" height="88" rx="5" />
          <path d="M48 4 L48 92" />
          <path d="M30 68 L18 68 L18 60" />
          <path d="M66 28 L78 28 L78 36" />
        </g>
      );
    case "vidrio-reloj":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M10 52 Q48 74 86 52" />
          <path d="M10 52 L86 52" />
        </g>
      );
    case "varilla-vidrio":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <line x1="20" y1="78" x2="76" y2="18" />
        </g>
      );
    case "crisol-tapa":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M30 40 L30 68 Q30 78 48 78 Q66 78 66 68 L66 40" />
          <line x1="28" y1="40" x2="68" y2="40" />
          <path d="M34 36 Q48 26 62 36" />
          <circle cx="48" cy="30" r="3" />
        </g>
      );
    case "mortero-pistilo":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M20 44 Q20 78 48 78 Q76 78 76 44" />
          <line x1="20" y1="44" x2="76" y2="44" />
          <path d="M54 40 L72 18" strokeWidth="5" />
          <circle cx="72" cy="18" r="4" fill={FILL} />
        </g>
      );
    case "placa-petri":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <ellipse cx="48" cy="60" rx="34" ry="12" />
          <ellipse cx="48" cy="46" rx="34" ry="12" />
          <path d="M14 46 L14 60 M82 46 L82 60" />
        </g>
      );
    case "frasco-lavador":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M32 40 L32 78 Q32 82 36 82 L60 82 Q64 82 64 78 L64 40" />
          <path d="M38 22 L38 40 M58 22 L58 40" />
          <rect x="36" y="16" width="24" height="6" rx="2" strokeWidth="2.5" />
          <path d="M48 16 L48 8 L68 8 L72 22" />
        </g>
      );
    case "balanza-analitica":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="16" y="12" width="64" height="52" rx="3" />
          <rect x="22" y="18" width="52" height="36" rx="2" stroke={G} />
          <rect x="38" y="48" width="20" height="4" rx="1" fill={FILL} opacity="0.8" />
          <rect x="22" y="70" width="52" height="16" rx="3" />
          <line x1="30" y1="76" x2="66" y2="76" strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    case "balanza-granataria":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="16" y="60" width="64" height="20" rx="4" />
          <ellipse cx="36" cy="56" rx="18" ry="6" />
          <path d="M28 60 L28 54 M44 60 L44 54" strokeWidth="2" />
          <rect x="56" y="64" width="20" height="12" rx="2" />
        </g>
      );
    case "termometro":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M46 8 L46 72 M50 8 L50 72" />
          <circle cx="48" cy="80" r="6" fill={RED} opacity="0.7" />
          <line x1="46" y1="20" x2="50" y2="20" strokeWidth="1.5" opacity="0.35" />
          <line x1="46" y1="36" x2="50" y2="36" strokeWidth="1.5" opacity="0.35" />
          <line x1="46" y1="52" x2="50" y2="52" strokeWidth="1.5" opacity="0.35" />
          <path d="M48 20 L48 72" stroke={RED} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "ph-metro":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="24" y="10" width="48" height="36" rx="4" />
          <rect x="30" y="16" width="36" height="14" rx="2" fill={LIQ} opacity="0.18" />
          <path d="M48 46 L48 72" strokeWidth="2" />
          <path d="M45 72 L48 88 L51 72" strokeWidth="2" />
          <path d="M24 28 L16 28 Q12 28 12 32 L12 44" strokeWidth="2" />
        </g>
      );
    case "espectrofotometro-uv-vis":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="12" y="22" width="72" height="52" rx="5" />
          <rect x="46" y="28" width="32" height="18" rx="3" fill={LIQ} opacity="0.15" />
          <rect x="18" y="34" width="20" height="18" rx="2" stroke={G} />
          <circle cx="54" cy="60" r="4" />
          <line x1="62" y1="56" x2="62" y2="64" strokeWidth="2" opacity="0.5" />
        </g>
      );
    case "refractometro":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="20" y="28" width="56" height="42" rx="5" />
          <rect x="38" y="10" width="20" height="18" rx="4" />
          <circle cx="48" cy="16" r="5" stroke={G} />
          <rect x="24" y="36" width="48" height="8" rx="2" />
        </g>
      );
    case "densimetro":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M34 10 L34 82 Q34 86 38 86 L58 86 Q62 82 62 82 L62 10" />
          <rect x="36" y="18" width="24" height="64" fill={LIQ} opacity="0.3" stroke="none" />
          <path d="M46 16 L46 62 M50 16 L50 62" stroke={M} />
          <ellipse cx="48" cy="66" rx="6" ry="4" stroke={M} />
        </g>
      );
    case "viscosimetro":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="42" y="4" width="8" height="58" />
          <rect x="30" y="62" width="32" height="6" rx="2" />
          <path d="M46 14 L24 14 L24 26" />
          <line x1="24" y1="26" x2="24" y2="58" />
          <circle cx="24" cy="58" r="4" />
          <path d="M16 48 L16 72 Q16 78 24 78 Q32 78 32 72 L32 48" stroke={G} />
        </g>
      );
    case "manometro":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <circle cx="48" cy="30" r="22" />
          <line x1="48" y1="30" x2="62" y2="20" stroke={RED} strokeWidth="2" />
          <path d="M30 56 L30 78 Q30 86 40 86 L52 86 Q56 86 56 82 L56 56" />
          <line x1="34" y1="56" x2="60" y2="56" stroke={M} strokeWidth="2.5" />
        </g>
      );
    case "mechero-bunsen":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M44 78 L44 32 M52 78 L52 32" />
          <rect x="32" y="78" width="32" height="8" rx="3" />
          <rect x="40" y="56" width="16" height="10" rx="2" />
          <path d="M44 32 Q48 14 52 32" fill={FLAME} opacity="0.7" stroke="none" />
          <path d="M46 32 Q48 22 50 32" fill="#5b9bd5" opacity="0.5" stroke="none" />
        </g>
      );
    case "mechero-alcohol":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M32 44 Q32 80 48 80 Q64 80 64 44" />
          <path d="M38 44 L38 34 M58 44 L58 34" />
          <ellipse cx="48" cy="34" rx="12" ry="4" strokeWidth="2.5" />
          <line x1="48" y1="30" x2="48" y2="24" strokeWidth="2" />
          <path d="M44 24 Q48 12 52 24" fill={FLAME} opacity="0.7" stroke="none" />
        </g>
      );
    case "manta-calefactora":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M14 46 Q14 84 48 84 Q82 84 82 46" />
          <path d="M36 30 Q28 38 28 46 L68 46 Q68 38 60 30" stroke={G} />
          <path d="M42 14 L42 30 M54 14 L54 30" stroke={G} />
          <circle cx="88" cy="58" r="5" strokeWidth="2" />
        </g>
      );
    case "placa-calefactora":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="14" y="36" width="68" height="8" rx="2" />
          <path d="M26 40 L26 30 Q26 26 30 26 L30 40 Z" strokeWidth="1.5" opacity="0.5" />
          <circle cx="44" cy="40" r="8" strokeWidth="1.5" opacity="0.5" />
          <circle cx="66" cy="40" r="8" strokeWidth="1.5" opacity="0.5" />
          <rect x="18" y="44" width="60" height="24" rx="4" />
          <circle cx="34" cy="56" r="5" />
        </g>
      );
    case "bano-maria":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="18" y="34" width="60" height="48" rx="4" />
          <rect x="14" y="28" width="68" height="8" rx="3" strokeWidth="2.5" />
          <rect x="22" y="40" width="52" height="38" fill={LIQ} opacity="0.25" stroke="none" />
          <circle cx="32" cy="32" r="2.5" strokeWidth="1.5" />
          <circle cx="48" cy="32" r="2.5" strokeWidth="1.5" />
          <circle cx="64" cy="32" r="2.5" strokeWidth="1.5" />
        </g>
      );
    case "estufa-secado":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="16" y="10" width="64" height="68" rx="4" />
          <rect x="22" y="16" width="52" height="48" rx="3" />
          <rect x="28" y="22" width="40" height="30" rx="2" stroke={G} />
          <path d="M28 58 L68 58" strokeWidth="2" stroke={G} />
          <path d="M70 46 L78 46" strokeWidth="2.5" />
          <line x1="70" y1="46" x2="74" y2="46" strokeWidth="1.5" opacity="0.4" />
        </g>
      );
    case "mufla":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="14" y="16" width="68" height="60" rx="5" />
          <rect x="20" y="22" width="38" height="42" rx="3" />
          <rect x="26" y="28" width="26" height="30" rx="2" />
          <rect x="64" y="28" width="14" height="10" rx="2" stroke={G} />
          <line x1="66" y1="33" x2="76" y2="33" strokeWidth="1.5" opacity="0.5" />
        </g>
      );
    case "papel-filtro":
      return (
        <g stroke={G} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3">
          <path d="M20 16 L48 80 L76 16" />
          <line x1="20" y1="16" x2="76" y2="16" />
        </g>
      );
    case "buchner-kit":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M30 10 L30 30 L66 30 L66 10" />
          <line x1="30" y1="10" x2="66" y2="10" />
          <line x1="48" y1="30" x2="48" y2="42" />
          <path d="M48 42 L32 74 L64 74 L48 42" />
          <path d="M64 56 L74 56 L74 48" />
        </g>
      );
    case "centrifuga":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <ellipse cx="48" cy="58" rx="34" ry="26" />
          <ellipse cx="48" cy="40" rx="34" ry="10" />
          <ellipse cx="48" cy="40" rx="20" ry="6" stroke={G} />
          <line x1="38" y1="40" x2="36" y2="50" stroke={G} strokeWidth="2" />
          <line x1="58" y1="40" x2="60" y2="50" stroke={G} strokeWidth="2" />
        </g>
      );
    case "columna-fraccionada":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M42 8 L42 52 M54 8 L54 52" />
          <line x1="42" y1="8" x2="54" y2="8" />
          <circle cx="46" cy="18" r="2" fill={FILL} opacity="0.5" stroke="none" />
          <circle cx="50" cy="30" r="2" fill={FILL} opacity="0.5" stroke="none" />
          <circle cx="46" cy="42" r="2" fill={FILL} opacity="0.5" stroke="none" />
          <circle cx="48" cy="2" r="3" />
          <path d="M42 52 Q32 62 32 74 Q32 84 48 84 Q64 84 64 74 Q64 62 54 52" />
        </g>
      );
    case "ccf-tlc":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="28" y="8" width="40" height="72" rx="2" />
          <line x1="30" y1="32" x2="66" y2="32" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 2" />
          <line x1="30" y1="66" x2="66" y2="66" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 2" />
          <circle cx="42" cy="44" r="3" fill={LIQ} opacity="0.6" stroke="none" />
          <circle cx="54" cy="38" r="2.5" fill={LIQ2} opacity="0.6" stroke="none" />
        </g>
      );
    case "tamiz":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <circle cx="48" cy="36" r="28" />
          <circle cx="48" cy="36" r="22" />
          <line x1="48" y1="14" x2="48" y2="58" strokeWidth="1" opacity="0.35" />
          <line x1="26" y1="36" x2="70" y2="36" strokeWidth="1" opacity="0.35" />
          <line x1="32" y1="22" x2="64" y2="50" strokeWidth="1" opacity="0.35" />
          <line x1="32" y1="50" x2="64" y2="22" strokeWidth="1" opacity="0.35" />
          <path d="M22 70 L22 80 Q22 84 26 84 L70 84 Q74 84 74 80 L74 70" />
        </g>
      );
    case "iman":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="16" y="36" width="64" height="24" rx="4" />
          <line x1="48" y1="36" x2="48" y2="60" />
          <text x="32" y="52" textAnchor="middle" fontSize="14" fontWeight="700" fill={RED} stroke="none" fontFamily="sans-serif">N</text>
          <text x="64" y="52" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5b9bd5" stroke="none" fontFamily="sans-serif">S</text>
        </g>
      );
    case "sublimador":
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <circle cx="48" cy="66" r="18" />
          <path d="M44 48 L44 40 M52 48 L52 40" />
          <path d="M42 20 L42 44 M54 20 L54 44" />
          <path d="M42 20 Q48 12 54 20" />
          <line x1="44" y1="30" x2="42" y2="34" strokeWidth="1.5" opacity="0.35" />
          <line x1="52" y1="30" x2="54" y2="34" strokeWidth="1.5" opacity="0.35" />
        </g>
      );
    case "soporte-universal":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="14" y="76" width="68" height="8" rx="3" />
          <path d="M28 76 L28 10" />
          <path d="M28 24 L56 24" strokeWidth="2" />
        </g>
      );
    case "pinza-nuez":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M18 36 L40 36 L40 48 L18 48" />
          <path d="M56 36 L78 36 L78 48 L56 48" />
          <circle cx="48" cy="42" r="6" />
          <line x1="48" y1="36" x2="48" y2="48" strokeWidth="1.5" />
        </g>
      );
    case "doble-nuez":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="14" y="38" width="28" height="12" rx="2" />
          <rect x="54" y="38" width="28" height="12" rx="2" />
          <circle cx="28" cy="44" r="5" strokeWidth="2.5" />
          <circle cx="68" cy="44" r="5" strokeWidth="2.5" />
          <line x1="42" y1="44" x2="54" y2="44" strokeWidth="2" />
        </g>
      );
    case "aro-metalico":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <circle cx="54" cy="48" r="22" />
          <path d="M32 48 L14 48 L14 42" strokeWidth="2.5" />
          <circle cx="14" cy="42" r="3" />
        </g>
      );
    case "rejilla-ceramica":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="16" y="30" width="64" height="40" rx="3" />
          <line x1="16" y1="40" x2="80" y2="40" strokeWidth="1" opacity="0.35" />
          <line x1="16" y1="50" x2="80" y2="50" strokeWidth="1" opacity="0.35" />
          <line x1="16" y1="60" x2="80" y2="60" strokeWidth="1" opacity="0.35" />
          <line x1="32" y1="30" x2="32" y2="70" strokeWidth="1" opacity="0.35" />
          <line x1="48" y1="30" x2="48" y2="70" strokeWidth="1" opacity="0.35" />
          <line x1="64" y1="30" x2="64" y2="70" strokeWidth="1" opacity="0.35" />
        </g>
      );
    case "tripode":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <ellipse cx="48" cy="30" rx="26" ry="8" />
          <path d="M23 30 L15 84" />
          <path d="M48 38 L48 84" />
          <path d="M73 30 L81 84" />
          <path d="M44 56 Q48 46 52 56" fill={FLAME} opacity="0.6" stroke="none" />
        </g>
      );
    case "gradilla-tubos":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="12" y="74" width="72" height="6" rx="2" />
          <path d="M18 74 L18 40 M78 74 L78 40" />
          <path d="M18 40 L78 40" />
          <circle cx="30" cy="58" r="6" />
          <circle cx="48" cy="58" r="6" />
          <circle cx="66" cy="58" r="6" />
        </g>
      );
    case "pinzas-tubos":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M24 12 L48 50 L72 12" />
          <path d="M24 84 L48 46 L72 84" />
          <circle cx="48" cy="48" r="4" fill={FILL} />
        </g>
      );
    case "gafas-seguridad":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <ellipse cx="28" cy="48" rx="15" ry="14" />
          <ellipse cx="68" cy="48" rx="15" ry="14" />
          <path d="M43 48 L53 48" />
          <path d="M13 44 L4 44 Q2 44 2 48 L2 52 Q2 56 4 56 L13 52" />
          <path d="M83 44 L92 44 Q94 44 94 48 L94 52 Q94 56 92 56 L83 52" />
        </g>
      );
    case "bata-laboratorio":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M36 12 L36 80 L60 80 L60 12" />
          <path d="M36 12 Q48 6 60 12" />
          <path d="M36 22 L16 38 L16 50 L26 44" />
          <path d="M60 22 L80 38 L80 50 L70 44" />
          <circle cx="42" cy="30" r="1.5" fill={M} stroke="none" />
          <circle cx="42" cy="42" r="1.5" fill={M} stroke="none" />
          <circle cx="42" cy="54" r="1.5" fill={M} stroke="none" />
        </g>
      );
    case "guantes":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M10 36 L10 72 Q10 82 18 82 L30 82 Q38 82 38 72 L38 36 L34 24 L28 36 L22 28 L16 36 Z" />
          <path d="M58 36 L58 72 Q58 82 66 82 L78 82 Q86 82 86 72 L86 36 L82 24 L76 36 L70 28 L64 36 Z" />
        </g>
      );
    case "mascarilla":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M26 32 Q26 64 48 64 Q70 64 70 32" />
          <path d="M26 32 Q48 24 70 32" />
          <circle cx="16" cy="48" r="8" strokeWidth="2.5" />
          <circle cx="80" cy="48" r="8" strokeWidth="2.5" />
          <path d="M24 36 L8 36" strokeWidth="2" />
          <path d="M72 36 L88 36" strokeWidth="2" />
        </g>
      );
    case "campana-extractora":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="10" y="10" width="76" height="62" rx="3" />
          <rect x="16" y="16" width="64" height="32" rx="2" stroke={G} />
          <line x1="16" y1="32" x2="80" y2="32" strokeWidth="1.5" />
          <rect x="14" y="52" width="68" height="5" rx="1" fill={FILL} opacity="0.3" />
          <line x1="40" y1="48" x2="56" y2="48" strokeWidth="2.5" />
        </g>
      );
    case "ducha-seguridad":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M48 4 L48 18" />
          <path d="M34 18 L62 18" />
          <path d="M36 18 L36 24 M60 18 L60 24" />
          <line x1="40" y1="26" x2="40" y2="36" strokeWidth="1.5" opacity="0.4" />
          <line x1="48" y1="26" x2="48" y2="40" strokeWidth="1.5" opacity="0.4" />
          <line x1="56" y1="26" x2="56" y2="36" strokeWidth="1.5" opacity="0.4" />
          <path d="M62 18 L62 52 Q62 56 58 56" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      );
    case "lavaojos":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M18 54 Q18 78 48 78 Q78 78 78 54" />
          <line x1="18" y1="54" x2="78" y2="54" />
          <path d="M34 54 L34 40 L31 36" />
          <path d="M62 54 L62 40 L65 36" />
          <circle cx="31" cy="32" r="2" fill={LIQ} opacity="0.6" stroke="none" />
          <circle cx="65" cy="32" r="2" fill={LIQ} opacity="0.6" stroke="none" />
        </g>
      );
    case "extintor":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="28" y="24" width="40" height="56" rx="8" fill={RED} opacity="0.2" />
          <rect x="28" y="24" width="40" height="56" rx="8" />
          <path d="M40 24 L40 14 L56 14 L56 24" />
          <path d="M56 14 L72 8 L76 14" strokeWidth="2" />
          <circle cx="48" cy="18" r="2" fill={M} stroke="none" />
        </g>
      );
    case "botiquin":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <rect x="16" y="24" width="64" height="52" rx="5" />
          <path d="M36 24 L36 18 Q36 14 40 14 L56 14 Q60 14 60 18 L60 24" />
          <path d="M44 40 L44 62 M38 51 L50 51" strokeWidth="5" strokeLinecap="butt" stroke="#ffffff" />
        </g>
      );
    case "kit-derrames":
      return (
        <g stroke={M} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M24 36 L28 78 L68 78 L72 36" />
          <ellipse cx="48" cy="36" rx="24" ry="6" />
          <rect x="36" y="44" width="24" height="16" rx="2" fill={LIQ2} opacity="0.3" />
          <line x1="40" y1="48" x2="40" y2="56" strokeWidth="1" opacity="0.4" />
          <line x1="48" y1="48" x2="48" y2="56" strokeWidth="1" opacity="0.4" />
          <line x1="56" y1="48" x2="56" y2="56" strokeWidth="1" opacity="0.4" />
        </g>
      );
    default:
      return (
        <g stroke={G} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M40 16 L40 34 M56 16 L56 34" />
          <line x1="37" y1="16" x2="59" y2="16" />
          <path d="M40 34 L22 78 L74 78 L56 34" />
          <path d="M32 60 L22 78 L74 78 L64 60 Z" fill={LIQ} opacity="0.5" stroke="none" />
        </g>
      );
  }
}