import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface Mol3DProps {
  smiles: string;
  width?: number;
  height?: number;
  header?: string;
}

export default function Mol3D({ smiles, width = 260, height = 230, header }: Mol3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.$3Dmol);
  const viewerRef = useRef<any>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const ensure = () => {
      if (cancelled) return;
      if (window.$3Dmol) {
        setReady(true);
        return;
      }
      setTimeout(ensure, 150);
    };
    // esperar a que cargue el script diferido de 3Dmol
    ensure();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !ref.current || !window.$3Dmol || initRef.current) return;
    initRef.current = true;
    try {
      const $3Dmol = window.$3Dmol;
      const viewer = $3Dmol.createViewer(ref.current, {
        backgroundColor: "black",
        antialias: true,
      });
      viewerRef.current = viewer;
      const model = viewer.addModel(smiles, "smi");
      if (typeof $3Dmol.generate3DCoordinates === "function") {
        $3Dmol.generate3DCoordinates(model);
      }
      model.computeMolecularProps?.();
      viewer.setStyle({}, {
        stick: { radius: 0.18, colorscheme: "Jmol" },
        sphere: { scale: 0.32, colorscheme: "Jmol" },
      });
      viewer.zoomTo();
      viewer.spin("y", 0.8);
      viewer.render();
    } catch (err) {
      console.error("Mol3D error", err);
    }
  }, [ready, smiles]);

  useEffect(() => {
    return () => {
      viewerRef.current?.clear?.();
      initRef.current = false;
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      {header && <span className="faint small" style={{ display: "block", marginBottom: 2 }}>{header}</span>}
      <div
        ref={ref}
        style={{
          width,
          height,
          borderRadius: 10,
          border: "1px solid var(--hair)",
          background: "transparent",
          position: "relative",
        }}
      />
      {!ready && <span className="muted small">Cargando visor 3D…</span>}
    </div>
  );
}