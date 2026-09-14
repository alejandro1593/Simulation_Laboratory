import { useId } from "react";
import { PICTOGRAMAS_GHS } from "../data/equipo";

/* Pictogramas GHS dibujados en SVG (formas simplificadas reconocibles de la familia
   de diamantes GHS: cuadrado girado de 45°). No se cargan imágenes externas. */

const S = {
  flame: (
    <path
      d="M50 6 C58 22 70 36 70 58 C70 69 61 78 50 78 C39 78 30 69 30 58 C30 44 40 34 46 24 C48 34 56 40 60 44 C58 32 54 17 50 6Z"
      fill="#111"
    />
  ),
};

function Diamond({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" role="img" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}>
          <polygon points="50,5 95,50 50,95 5,50" />
        </clipPath>
      </defs>
      <polygon points="50,0 100,50 50,100 0,50" fill="#fff" stroke="#111" strokeWidth="5" />
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

export default function GhsPictos({ codes, size = 30 }: { codes: string[]; size?: number }) {
  const uid = useId();
  const id = `ghs-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  if (codes.length === 0) return null;

  const sym = (code: string): React.ReactNode => {
    switch (code) {
      case "g01": // Explosivo: bomba
        return (
          <g>
            <circle cx="52" cy="56" r="20" fill="#111" />
            <path d="M52 38 C52 32 56 28 60 24" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
            <g stroke="#111" strokeWidth="3" strokeLinecap="round">
              <path d="M66 18 l3 -5 M72 21 l3 -4 M74 29 l5 -2" />
            </g>
          </g>
        );
      case "g02": // Inflamable: llama
        return S.flame;
      case "g03": // Comburente: llama sobre círculo
        return (
          <g>
            <circle cx="50" cy="64" r="20" fill="none" stroke="#111" strokeWidth="5" />
            {S.flame}
          </g>
        );
      case "g04": // Gas a presión: cilindro
        return (
          <g fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round">
            <rect x="32" y="38" width="36" height="38" rx="10" />
            <rect x="44" y="24" width="12" height="16" rx="2" />
            <path d="M50 14 v6 M46 14 h8" />
            <rect x="26" y="76" width="48" height="4" rx="2" fill="#111" stroke="none" />
          </g>
        );
      case "g05": // Corrosivo: tubos vertiendo sobre barra
        return (
          <g fill="none" stroke="#111" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="20" y="22" width="16" height="30" rx="7" />
            <path d="M28 52 v18" />
            <rect x="56" y="18" width="16" height="30" rx="7" />
            <path d="M64 48 v14" />
            <path d="M22 62 l8 12 M30 62 l-8 12" />
            <path d="M30 62 l18 10 M30 62 l14 -2" />
            <path d="M20 82 h60" />
            <path d="M28 86 h8 M52 86 h12" />
          </g>
        );
      case "g06": // Tóxico agudo: cráneo
        return (
          <g fill="#111" stroke="#111" strokeWidth="3">
            <path d="M66 34 L50 18 L34 34 Z" fill="none" />
            <path d="M28 30 L22 24 L28 18 Z" fill="none" />
            <circle cx="50" cy="52" r="19" />
            <circle cx="43" cy="50" r="5" fill="#fff" />
            <circle cx="57" cy="50" r="5" fill="#fff" />
            <path d="M48 62 h4 l-2 5 Z" />
            <path d="M42 64 s4 3 8 0" fill="none" />
          </g>
        );
      case "g07": // Irritante / nocivo: exclamación
        return (
          <g fill="#111">
            <rect x="44" y="22" width="12" height="38" rx="6" />
            <circle cx="50" cy="70" r="7" />
          </g>
        );
      case "g08": // Peligro para la salud: torso + estrella
        return (
          <g fill="#111">
            <circle cx="50" cy="30" r="13" />
            <path d="M30 34 L70 34 L74 66 A24 24 0 0 0 26 66 Z" />
            <rect x="50" y="44" width="4.5" height="30" transform="rotate(90 50 59)" />
            <rect x="27" y="46" width="5.5" height="30" transform="rotate(30 50 59)" />
            <rect x="73" y="46" width="5.5" height="30" transform="rotate(150 50 59)" />
          </g>
        );
      case "g09": // Peligroso para el medio ambiente: pez y árbol
        return (
          <g fill="none" stroke="#111" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="40" cy="52" r="12" />
            <circle cx="36" cy="49" r="2.2" fill="#111" stroke="none" />
            <path d="M40 49 v6 M43 46 l-6 6 M37 46 l6 6" strokeWidth="2.5" />
            <path d="M62 62 L76 66 L62 70 Z" fill="#111" />
            <path d="M64 60 a16 16 0 0 1 10 0" fill="#111" />
            <path d="M78 20 v26 M70 30 l8 8 l8 -8 Z" fill="#111" stroke="none" />
          </g>
        );
      default:
        return null;
    }
  };

  const known = codes.filter((c) => PICTOGRAMAS_GHS.some((p) => p.id === c));
  if (known.length === 0) return null;

  return (
    <span className="ghs-row" style={{ display: "inline-flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
      {known.map((c) => {
        const p = PICTOGRAMAS_GHS.find((g) => g.id === c);
        return (
          <span
            key={c}
            title={`${p?.codigo ?? c} · ${p?.nombre ?? ""}: ${p?.sentido ?? ""}`}
            style={{ width: size, height: size, display: "inline-block", flexShrink: 0 }}
          >
            <Diamond id={`${id}-${c}`}>{sym(c)}</Diamond>
          </span>
        );
      })}
    </span>
  );
}

export { PICTOGRAMAS_GHS };