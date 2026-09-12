import { useEffect, useRef } from "react";

export interface SceneEvent {
  t: number;
  action: string;
  substance?: string;
  label?: string;
  formula?: string;
  volume_ml?: number | null;
  mass_g?: number | null;
  color?: string;
  species?: string;
  colorHex?: string;
  target?: string | number;
  ph_estimate?: number | null;
  dT_estimate?: number | null;
  note?: string;
}

const W = 340;
const H = 420;
const VESSEL = { cx: 170, top: 96, bottom: 340, half: 84 };

function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function SimBench({ scene }: { scene: SceneEvent[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxT = Math.max(0, ...scene.map((e) => e.t)) + 1;
    const dur = maxT * 1600; // ms por unidad de tiempo de escena
    let raf = 0;
    const start = performance.now();

    // estado del líquido
    const pours: { color: string; at: number }[] = [];
    const precipitates: { color: string; at: number }[] = [];
    let ph: number | null = null;
    let dT: number | null = null;
    let gasActive = false;

    const eventAt = (t: number) => {
      for (const e of scene) {
        const pt = (t / dur) * maxT;
        if (e.t > pt) continue;
        if (e.action === "pour" && e.color) pours.push({ color: e.color, at: e.t });
        if (e.action === "gas") {
          gasActive = true;
          setTimeout(() => (gasActive = false), 1800);
        }
        if (e.action === "precipitate" && e.colorHex)
          precipitates.push({ color: e.colorHex, at: e.t });
        if (e.action === "ph_change" && e.ph_estimate != null) ph = e.ph_estimate;
        if (e.action === "exothermic" && e.dT_estimate != null) dT = e.dT_estimate;
        if (e.action === "endothermic") dT = -Math.abs(e.dT_estimate ?? 0);
      }
    };

    const draw = (now: number) => {
      const t = Math.min(now - start, dur);
      const u = t / dur;
      const pt = u * maxT;
      eventAt(t);

      ctx.clearRect(0, 0, W, H);

      // mesa
      ctx.fillStyle = "#1f2428";
      ctx.fillRect(0, 346, W, H - 346);
      ctx.fillStyle = "#2b3137";
      ctx.fillRect(0, 346, W, 4);

      // vaso
      ctx.beginPath();
      ctx.moveTo(VESSEL.cx - VESSEL.half, VESSEL.top);
      ctx.lineTo(VESSEL.cx - VESSEL.half, VESSEL.bottom);
      ctx.lineTo(VESSEL.cx + VESSEL.half, VESSEL.bottom);
      ctx.lineTo(VESSEL.cx + VESSEL.half, VESSEL.top);
      ctx.closePath();
      ctx.strokeStyle = "rgba(200,225,255,0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // líquido (crece con los pour)
      const active = pours.filter((p) => p.at <= pt);
      if (active.length) {
        const fill = active[active.length - 1].color;
        const vol = active.reduce((s, p) => s + Math.min(p.at + 0.6, pt) - p.at, 0) / maxT;
        const level = VESSEL.bottom - 150 * ease(Math.max(0, Math.min(vol, 1.4) / 1.4));
        ctx.beginPath();
        ctx.roundRect(VESSEL.cx - VESSEL.half + 4, level, VESSEL.half * 2 - 8, VESSEL.bottom - level, 8);
        ctx.fillStyle = fill;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // burbujas por gas
      if (gasActive && active.length) {
        for (let i = 0; i < 22; i++) {
          const bx = VESSEL.cx - VESSEL.half + 12 + ((i * 37) % (VESSEL.half * 2 - 24));
          const by = VESSEL.bottom - ((now / 18 + i * 53) % 210);
          ctx.beginPath();
          ctx.arc(bx, by, 3 + ((i * 7) % 4), 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fill();
        }
      }

      // precipitado
      for (const p of precipitates.slice(0, Math.floor(pt * 6))) {
        const px = VESSEL.cx - VESSEL.half + 18 + ((p.at * 41) % (VESSEL.half * 2 - 40));
        const py = VESSEL.bottom - 10 - ((p.at * 29) % 36);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // indicador de pH
      if (ph != null) {
        ctx.fillStyle = "#e8e8e8";
        ctx.font = "600 15px 'Segoe UI', system-ui";
        ctx.fillText(`pH ${ph.toFixed(1)}`, VESSEL.cx - 38, VESSEL.top - 20);
      }
      // termómetro ΔT
      if (dT != null) {
        ctx.fillStyle = "#ffb4a2";
        ctx.fillText(`ΔT ${dT > 0 ? "+" : ""}${dT.toFixed(1)} °C`, 14, 26);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  return (
    <div className="simbench">
      <canvas ref={ref} width={W} height={H} aria-label="Banco de simulación" />
      <p className="captions">Reproduce la escena determinista generada por el backend.</p>
    </div>
  );
}