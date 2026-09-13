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

const W = 360;
const H = 440;
const VESSEL = { cx: 180, top: 100, bottom: 356, half: 88 };

const POUR_DUR = 0.55;
const ADD_DUR = 0.6;

const GAS_COLORS: Record<string, string> = {
  NO2: "#b0512e",
  CO2: "#e8f2fa",
  O2: "#bfe3ff",
  H2: "#ffffff",
};

type RGB = [number, number, number];

function hexRgb(h: string): RGB {
  const s = h.replace("#", "");
  const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function css(c: RGB, a = 1): string {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface Pour {
  color: string;
  at: number;
  vol: number;
  label: string;
  formula?: string;
  solid: boolean;
}

interface Settled {
  x: number;
  y: number;
  color: string;
  r: number;
}

export default function SimBench({ scene }: { scene: SceneEvent[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const pours: Pour[] = [];
  const gasEvents = scene.filter((e) => e.action === "gas");
  const precipEvents = scene.filter((e) => e.action === "precipitate" && e.colorHex);
  for (const e of scene) {
    if (e.action === "pour" && e.color) pours.push({ color: e.color, at: e.t, vol: e.volume_ml ?? 30, label: e.label ?? e.formula ?? "", formula: e.formula, solid: false });
    if (e.action === "add") pours.push({ color: e.color ?? "#aab6c4", at: e.t, vol: e.mass_g ?? 5, label: e.label ?? e.formula ?? "", formula: e.formula, solid: true });
  }
  pours.sort((a, b) => a.at - b.at);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxT = Math.max(0, ...scene.map((e) => e.t)) + 1.4;
    const dur = maxT * 1600;
    let raf = 0;
    const start = performance.now();

    let liquid: RGB = [220, 232, 242];
    let ph: number | null = null;
    let dT: number | null = null;
    let gasUntil = 0;
    let gasSpecies = "";

    const settled: Settled[] = [];
    const falling: { x: number; y: number; color: string; r: number; v: number }[] = [];
    const seeded = (i: number) => {
      const s = Math.sin(i * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };

    const draw = (now: number) => {
      const t = Math.min(now - start, dur);
      const u = t / dur;
      const pt = u * maxT;

      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#1f2428";
      ctx.fillRect(0, 364, W, H - 364);
      ctx.fillStyle = "#2b3137";
      ctx.fillRect(0, 364, W, 4);

      const activePours = pours.filter((p) => p.at <= pt);
      if (activePours.length) {
        let target: RGB | null = null;
        let tw = 0;
        for (const p of activePours) {
          const w = p.solid ? 16 : Math.min(p.vol, 60);
          const c = hexRgb(p.color);
          target = target ? mix(target, c, w / (tw + w)) : c;
          tw += w;
        }
        if (target) liquid = mix(liquid, target, 0.07);
      }

      const vol = activePours.reduce((s, p) => s + Math.min(p.at + 0.6, pt) - p.at, 0) / maxT;
      const level = VESSEL.bottom - 165 * ease(Math.max(0, Math.min(vol, 1.4) / 1.4));

      ctx.beginPath();
      ctx.moveTo(VESSEL.cx - VESSEL.half, VESSEL.top);
      ctx.lineTo(VESSEL.cx - VESSEL.half, VESSEL.bottom);
      ctx.lineTo(VESSEL.cx + VESSEL.half, VESSEL.bottom);
      ctx.lineTo(VESSEL.cx + VESSEL.half, VESSEL.top);
      ctx.closePath();
      ctx.strokeStyle = "rgba(200,225,255,0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();

      if (activePours.length && level < VESSEL.bottom - 4) {
        ctx.beginPath();
        ctx.roundRect(VESSEL.cx - VESSEL.half + 4, level, VESSEL.half * 2 - 8, VESSEL.bottom - level, 8);
        ctx.fillStyle = css(liquid, 0.86);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.beginPath();
        ctx.roundRect(VESSEL.cx - VESSEL.half + 4, level, VESSEL.half * 2 - 8, 5, 4);
        ctx.fill();
      }

      const mixing = pours.some((p) => pt >= p.at && pt < p.at + 1.0);
      if (mixing && level < VESSEL.bottom - 10) {
        ctx.beginPath();
        const cy = level + (VESSEL.bottom - level) * 0.45;
        ctx.ellipse(VESSEL.cx, cy, VESSEL.half * 0.62, 14, (now / 900) * Math.PI, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(VESSEL.cx, cy, 26, 8, -(now / 1400) * Math.PI, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.stroke();
      }

      ctx.lineCap = "round";

      for (const e of gasEvents) {
        if (pt >= e.t && pt < e.t + 1.5) {
          gasUntil = now + 1700;
          gasSpecies = e.species ?? "";
        }
      }
      if (now < gasUntil && activePours.length) {
        const gcol = css(hexRgb(GAS_COLORS[gasSpecies] ?? "#e9f3fa"), 0.9);
        for (let i = 0; i < 26; i++) {
          const bx = VESSEL.cx - VESSEL.half + 14 + ((i * 41 + Math.floor(now / 700)) % (VESSEL.half * 2 - 28));
          const by = VESSEL.bottom - ((now / 17 + i * 47) % (VESSEL.bottom - level));
          ctx.beginPath();
          ctx.arc(bx, by, 2.6 + ((i * 7) % 3), 0, Math.PI * 2);
          ctx.fillStyle = gcol;
          ctx.fill();
          if (by > level) {
            ctx.beginPath();
            ctx.arc(bx, by - (VESSEL.bottom - level), 3 + ((i * 5) % 3), 0, Math.PI * 2);
            ctx.fillStyle = css(hexRgb(GAS_COLORS[gasSpecies] ?? "#e9f3fa"), 0.5);
            ctx.fill();
          }
        }
      }

      const activePrecip = precipEvents.filter((e) => pt >= e.t);
      if (activePrecip.length) {
        const lastPrec = activePrecip[activePrecip.length - 1].colorHex!;
        liquid = mix(liquid, hexRgb(lastPrec), 0.02);
        const targetCount = Math.min(46, 8 + Math.floor((pt - activePrecip[0].t) * 14));
        for (let i = falling.length + settled.length; i < targetCount; i++) {
          falling.push({
            x: VESSEL.cx - VESSEL.half + 12 + seeded(i) * (VESSEL.half * 2 - 24),
            y: level + 8 + seeded(i + 9) * 30,
            color: activePrecip[i % activePrecip.length].colorHex!,
            r: 2.6 + seeded(i + 3) * 2.2,
            v: 0.6 + seeded(i + 7) * 0.9,
          });
        }
      }
      for (let i = falling.length - 1; i >= 0; i--) {
        const f = falling[i];
        f.y += f.v;
        if (f.y >= VESSEL.bottom - 8) {
          falling.splice(i, 1);
          if (settled.length < 56) settled.push({ x: f.x, y: VESSEL.bottom - 5 - seeded(settled.length * 3 + i) * 10, color: f.color, r: f.r });
        }
      }
      for (const f of falling) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
      }
      for (const s of settled) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < pours.length; i++) {
        const p = pours[i];
        if (p.solid && pt >= p.at && pt < p.at + ADD_DUR) {
          const k = (pt - p.at) / ADD_DUR;
          for (let g = 0; g < 5; g++) {
            const gx = VESSEL.cx - 26 + (g * 13) % 52;
            const gy = VESSEL.top - 30 + k * (level - VESSEL.top + 60) + ((g * 17) % 22);
            ctx.beginPath();
            ctx.arc(gx, gy, 3 + (g % 2), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }
      }

      const activePour = pours.find((p) => !p.solid && pt >= p.at && pt < p.at + POUR_DUR);
      if (activePour) {
        const k = (pt - activePour.at) / POUR_DUR;
        const col = css(hexRgb(activePour.color), 0.85);
        ctx.fillStyle = col;
        for (let drop = 0; drop < 3; drop++) {
          const dy = VESSEL.top - 26 + ((k * (VESSEL.bottom - VESSEL.top + 50) + drop * 22) % (level - VESSEL.top + 30));
          ctx.beginPath();
          ctx.ellipse(VESSEL.cx, Math.max(6, dy), 3.5, 7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = col;
        ctx.fillRect(VESSEL.cx - 2, VESSEL.top - 22, 4, Math.max(2, level - VESSEL.top + 18));
        if (activePour.label) {
          ctx.fillStyle = "#e8e8e8";
          ctx.font = "600 14px 'Segoe UI', system-ui";
          const lw = ctx.measureText(activePour.label).width + 20;
          ctx.fillStyle = "rgba(15,20,26,0.85)";
          ctx.beginPath();
          ctx.roundRect(VESSEL.cx - lw / 2, 12, lw, 24, 8);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.fillText(activePour.label, VESSEL.cx - lw / 2 + 10, 29);
        }
      }

      if (ph != null) {
        ctx.fillStyle = "#e8e8e8";
        ctx.font = "600 15px 'Segoe UI', system-ui";
        ctx.fillText(`pH ${ph.toFixed(1)}`, VESSEL.cx - 38, VESSEL.top - 26);
      }
      if (dT != null) {
        ctx.fillStyle = "#ffb4a2";
        ctx.font = "600 14px 'Segoe UI', system-ui";
        ctx.fillText(`ΔT ${dT > 0 ? "+" : ""}${dT.toFixed(1)} °C`, 14, 26);
      }

      for (const e of scene) {
        if (e.action === "ph_change" && e.ph_estimate != null) ph = e.ph_estimate;
        if (e.action === "exothermic" && e.dT_estimate != null) dT = e.dT_estimate;
        if (e.action === "endothermic") dT = -Math.abs(e.dT_estimate ?? 0);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  const legend = pours.map((p, i) => ({ p, i })).filter((x) => x.p.label);

  return (
    <div className="simbench">
      <canvas ref={ref} width={W} height={H} aria-label="Banco de simulación" />
      {legend.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 4 }}>
          {legend.map(({ p, i }) => (
            <span key={i} className="chip" style={{ fontSize: 11 }}>
              <i
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginRight: 5,
                  background: p.color,
                  verticalAlign: -1,
                }}
              />
              {p.label}
            </span>
          ))}
        </div>
      )}
      <p className="captions">Los reactivos se añaden y mezclan: el color se difunde, precipita o desprende gas.</p>
    </div>
  );
}