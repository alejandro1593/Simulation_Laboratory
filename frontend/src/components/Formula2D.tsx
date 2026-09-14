import { useEffect, useRef } from "react";
import SmilesDrawer from "smiles-drawer";

interface Props {
  smiles: string;
  width?: number;
  height?: number;
}

// Fórmula esqueletal 2D generada de forma determinista a partir de SMILES curados.
// Solo se dibuja lo que la conectividad verifica; los carbonos quedan como vértices
// implícitos y los heteroátomos se etiquetan con el color de elemento.

const DARK_THEME = {
  FOREGROUND: "#dfe7f4",
  BACKGROUND: "#121530",
  C: "#eef3fa",
  O: "#ff7b7b",
  N: "#7aa2ff",
  F: "#58d6c8",
  CL: "#7ce08a",
  BR: "#c77cf0",
  I: "#b06ce8",
  P: "#f2b263",
  S: "#f2b263",
  B: "#f2b263",
  SI: "#b9c4d8",
  H: "#e5ecf8",
};

export default function Formula2D({ smiles, width = 300, height = 180 }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const drawer = new SmilesDrawer.SvgDrawer(
      {
        width,
        height,
        bondThickness: 2.6,
        bondLength: 62,
        shortBondLength: 46,
        bondSpacing: 12,
        padding: 10,
        showCarbons: "none",
        explicitHydrogens: false,
        isomeric: true,
        fontSizeLarge: 15,
        fontSizeSmall: 12,
        themes: { dark: DARK_THEME },
      },
      true,
    );
    let disposed = false;
    SmilesDrawer.parse(
      smiles,
      (tree) => {
        if (disposed || !svg.isConnected) return;
        try {
          drawer.draw(tree, svg, "dark", false);
        } catch {
          // SMILES inválido: se deja el lienzo vacío en lugar de romper la UI.
        }
      },
      () => {
        // SMILES no parseable: lienzo vacío.
      },
    );
    return () => {
      disposed = true;
    };
  }, [smiles, width, height]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Fórmula esqueletal 2D"
    />
  );
}