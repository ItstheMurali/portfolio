"use client";

import { useEffect, useRef } from "react";

/*
  Cursor — pen nib + ink particle trail on a dedicated 2D canvas.
  Desktop only (pointer: fine). Max 80 particles, additive blending,
  lerped nib position (0.12) for the dragged-pen feel.
*/

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number; // ms lived
  maxLife: number;
  mode: "trail" | "burst" | "orbit";
  color: "pen" | "clarity" | "chaos";
  angle?: number;
}

const MAX = 80;
const PEN = [232, 213, 163];
const CLARITY = [216, 210, 196];
const CHAOS = [85, 82, 76];

export default function PenCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nibRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    document.body.classList.add("pen-cursor-active");

    const canvas = canvasRef.current!;
    const nib = nibRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    let mx = -100;
    let my = -100;
    let pmx = -100;
    let pmy = -100;
    let nibX = -100;
    let nibY = -100;
    let moving = false;
    let moveTimer = 0;
    let overInteractive = false;
    let overHeading = false;
    let orbitAngle = 0;
    let headingBurstDone = false;

    const spawn = (p: Partial<Particle>): void => {
      if (particles.length >= MAX) particles.shift();
      particles.push({
        x: mx,
        y: my,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 400 + Math.random() * 300,
        mode: "trail",
        color: "pen",
        ...p,
      });
    };

    const onMove = (e: PointerEvent) => {
      pmx = mx;
      pmy = my;
      mx = e.clientX;
      my = e.clientY;
      moving = true;
      window.clearTimeout(moveTimer);
      moveTimer = window.setTimeout(() => (moving = false), 60);

      const el = e.target as HTMLElement;
      overInteractive = !!el.closest("a,button,[role='button'],input,textarea,select,label");
      const heading = !!el.closest("h1,h2,h3");
      if (heading && !overHeading) {
        headingBurstDone = false;
      }
      overHeading = heading;
    };

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = !!el.closest("a,button,[role='button']");
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 2.2;
        spawn({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          mode: "burst",
          maxLife: 500,
          color: interactive ? "clarity" : Math.random() < 0.3 ? "chaos" : "pen",
        });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });

    let visible = true;
    const onVis = () => (visible = document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(now - last, 50);
      last = now;

      // nib lerp — the dragged-pen lag
      nibX += (mx - nibX) * 0.12 * (dt / 16.67) * 1.4;
      nibY += (my - nibY) * 0.12 * (dt / 16.67) * 1.4;
      nib.style.transform = `translate(${nibX}px, ${nibY - 22}px)`;

      // spawn logic
      const speed = Math.hypot(mx - pmx, my - pmy);
      if (overInteractive) {
        // orbiting particles
        orbitAngle += (dt / 1200) * Math.PI * 2;
        if (Math.random() < 0.5) {
          const a = orbitAngle + Math.random() * 0.5;
          spawn({
            x: mx + Math.cos(a) * 20,
            y: my + Math.sin(a) * 20,
            mode: "orbit",
            color: "clarity",
            angle: a,
            maxLife: 600,
          });
        }
      } else if (moving && speed > 0.5) {
        const rate = overHeading && !headingBurstDone ? 12 : 3;
        if (overHeading && !headingBurstDone) headingBurstDone = true;
        const dirA = Math.atan2(my - pmy, mx - pmx);
        const spread = ((overHeading ? 25 : 12) * Math.PI) / 180;
        for (let i = 0; i < rate; i++) {
          const a = dirA + (Math.random() - 0.5) * 2 * spread;
          const v = speed * 0.15 * (0.5 + Math.random());
          spawn({
            vx: Math.cos(a) * v * 0.3,
            vy: Math.sin(a) * v * 0.3,
            size: overHeading ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
          });
        }
      }

      // draw
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const lifeP = p.life / p.maxLife;

        if (p.mode === "orbit" && p.angle !== undefined) {
          p.angle += (dt / 1200) * Math.PI * 2;
          p.x = mx + Math.cos(p.angle) * 20;
          p.y = my + Math.sin(p.angle) * 20;
        } else {
          p.x += p.vx * (dt / 16.67);
          p.y += p.vy * (dt / 16.67) + 0.08 * (dt / 16.67); // ink falls
          if (p.mode === "burst") {
            p.vx *= 0.94;
            p.vy *= 0.94;
          }
        }

        // color: pen → clarity across life for trail particles
        let rgb: number[];
        if (p.color === "chaos") rgb = CHAOS;
        else if (p.color === "clarity") rgb = CLARITY;
        else if (lifeP > 0.5) {
          const m = (lifeP - 0.5) * 2;
          rgb = PEN.map((c, idx) => c + (CLARITY[idx] - c) * m);
        } else rgb = PEN;

        const alpha =
          p.mode === "orbit"
            ? 0.4 + 0.6 * Math.abs(Math.sin(p.life / 200))
            : 1 - lifeP;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${alpha * 0.9})`);
        grad.addColorStop(1, `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVis);
      document.body.classList.remove("pen-cursor-active");
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[120]"
        aria-hidden="true"
      />
      <div
        ref={nibRef}
        className="pointer-events-none fixed left-0 top-0 z-[125] hidden md:block"
        aria-hidden="true"
      >
        {/* pen nib — hotspot at bottom tip */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <defs>
            <radialGradient id="nibGlow" cx="50%" cy="90%" r="60%">
              <stop offset="0%" stopColor="#E8D5A3" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E8D5A3" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="20" r="8" fill="url(#nibGlow)" />
          <path
            d="M12 22 L7 12 Q12 4 17 12 Z"
            fill="#E8D5A3"
            stroke="#0B0A09"
            strokeWidth="0.5"
          />
          <circle cx="12" cy="13" r="1.2" fill="#0B0A09" />
        </svg>
      </div>
    </>
  );
}
