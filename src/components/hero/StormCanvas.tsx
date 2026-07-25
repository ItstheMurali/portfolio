"use client";

import { useEffect, useRef } from "react";
import type { BufferAttribute } from "three";
import { stormFragments } from "@/lib/defaultContent";

/*
  The Storm — Three.js fragment field.

  150 (desktop) / 80 (tablet) / 40 (mobile) text fragments fall through a
  dark volume. All fragments share one PlaneGeometry and one material; a
  texture atlas holds the 12 fragment strings, selected per-instance via a
  UV-row attribute. States: FALLING → SETTLING (clarity wave) → AMBIENT.
*/

type Phase = "storm" | "settling" | "ambient";

interface StormCanvasProps {
  /** Wave origin in viewport-normalized coords (0..1), fired once. */
  waveTrigger?: number; // timestamp; changes when the wave should fire
  /** Start already settled: quiet ambient drift, no storm phase (sub-pages). */
  ambient?: boolean;
  onReady?: () => void;
}

export default function StormCanvas({
  waveTrigger,
  ambient = false,
  onReady,
}: StormCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<number | undefined>(waveTrigger);
  const apiRef = useRef<{ fireWave: () => void } | null>(null);

  useEffect(() => {
    if (waveTrigger && apiRef.current && waveTrigger !== waveRef.current) {
      waveRef.current = waveTrigger;
      apiRef.current.fireWave();
    }
  }, [waveTrigger]);

  // Registered synchronously so a wave fired before the async Three.js
  // setup completes is remembered and applied once the scene is ready.
  useEffect(() => {
    const onHeroWave = () => {
      if (apiRef.current) apiRef.current.fireWave();
      else waveRef.current = Date.now();
    };
    window.addEventListener("hero:wave", onHeroWave);
    return () => window.removeEventListener("hero:wave", onHeroWave);
  }, []);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      if (disposed || !mountRef.current) return;

      const mount = mountRef.current;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const COUNT = isMobile ? 40 : isTablet ? 80 : 150;

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.z = 14;

      /* ---------- texture atlas: 12 fragment strings ---------- */
      const ROWS = stormFragments.length;
      const atlasW = 1024;
      const rowH = 56;
      const canvas = document.createElement("canvas");
      canvas.width = atlasW;
      canvas.height = rowH * ROWS;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "26px 'JetBrains Mono', monospace";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      stormFragments.forEach((text, i) => {
        ctx.fillText(text, 8, i * rowH + rowH / 2, atlasW - 16);
      });
      const atlas = new THREE.CanvasTexture(canvas);
      atlas.minFilter = THREE.LinearFilter;
      atlas.magFilter = THREE.LinearFilter;

      /* ---------- instanced fragments ---------- */
      const geo = new THREE.PlaneGeometry(6, 6 * (rowH / atlasW));
      const rowAttr = new Float32Array(COUNT);
      const settleAttr = new Float32Array(COUNT);
      const heatAttr = new Float32Array(COUNT); // cursor-proximity warmth

      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uAtlas: { value: atlas },
          uRows: { value: ROWS },
          uChaos: { value: new THREE.Color("#55524C") },
          uClarity: { value: new THREE.Color("#D8D2C4") },
          uPen: { value: new THREE.Color("#E8D5A3") },
        },
        vertexShader: /* glsl */ `
          attribute float aRow;
          attribute float aSettle;
          attribute float aHeat;
          varying vec2 vUv;
          varying float vRow;
          varying float vSettle;
          varying float vHeat;
          void main() {
            vUv = uv;
            vRow = aRow;
            vSettle = aSettle;
            vHeat = aHeat;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uAtlas;
          uniform float uRows;
          uniform vec3 uChaos;
          uniform vec3 uClarity;
          uniform vec3 uPen;
          varying vec2 vUv;
          varying float vRow;
          varying float vSettle;
          varying float vHeat;
          void main() {
            vec2 uv = vec2(vUv.x, (vUv.y + (uRows - 1.0 - vRow)) / uRows);
            vec4 tex = texture2D(uAtlas, uv);
            vec3 col = mix(uChaos, uClarity, vSettle);
            col = mix(col, uPen, vHeat * 0.6);
            // settled fragments recede into ambient background quiet
            float alpha = tex.a * (mix(0.28, 0.15, vSettle) + vHeat * 0.3);
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });

      const mesh = new THREE.InstancedMesh(geo, material, COUNT);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute("aRow", new THREE.InstancedBufferAttribute(rowAttr, 1));
      geo.setAttribute("aSettle", new THREE.InstancedBufferAttribute(settleAttr, 1));
      geo.setAttribute("aHeat", new THREE.InstancedBufferAttribute(heatAttr, 1));
      scene.add(mesh);

      /* ---------- fragment state (object pool, created once) ---------- */
      const spanX = 26;
      const spanY = 18;
      interface Frag {
        x: number;
        y: number;
        z: number;
        vy: number;
        vx: number;
        scale: number;
        settle: number; // 0 falling → 1 settled
        settleTarget: number;
        heat: number;
        seed: number;
      }
      const frags: Frag[] = [];
      for (let i = 0; i < COUNT; i++) {
        rowAttr[i] = i % ROWS;
        frags.push({
          x: (Math.random() - 0.5) * spanX,
          y: (Math.random() - 0.5) * spanY * 1.6,
          z: -6 + Math.random() * 8,
          vy: 0.4 + Math.random() * 0.9,
          vx: (Math.random() - 0.5) * 0.15,
          scale: (isMobile ? 0.45 : 0.6) + Math.random() * 0.55,
          settle: ambient ? 1 : 0,
          settleTarget: ambient ? 1 : 0,
          heat: 0,
          seed: Math.random() * 1000,
        });
      }

      /* ---------- clarity wave ---------- */
      let wavePhase: Phase = ambient ? "ambient" : "storm";
      let waveRadius = 0;
      let waveActive = false;
      apiRef.current = {
        fireWave: () => {
          waveActive = true;
          waveRadius = 0;
        },
      };
      if (waveRef.current) {
        // trigger already requested before scene was ready
        waveActive = true;
      }

      /* ---------- cursor interaction ---------- */
      const mouse = new THREE.Vector2(-100, -100);
      const onPointerMove = (e: PointerEvent) => {
        const r = mount.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      /* ---------- animation loop ---------- */
      const dummy = new THREE.Object3D();
      const proj = new THREE.Vector3();
      const clock = new THREE.Clock();
      let raf = 0;
      let visible = true;

      const onVisibility = () => {
        visible = document.visibilityState === "visible";
      };
      document.addEventListener("visibilitychange", onVisibility);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;

        if (waveActive) {
          waveRadius += dt * 22;
          if (waveRadius > 40) {
            waveActive = false;
            wavePhase = "ambient";
          } else {
            wavePhase = "settling";
          }
        }

        for (let i = 0; i < COUNT; i++) {
          const f = frags[i];

          // wave settling
          if (wavePhase !== "storm") {
            const d = Math.hypot(f.x, f.y);
            if (wavePhase === "ambient" || d < waveRadius) f.settleTarget = 1;
          }
          f.settle += (f.settleTarget - f.settle) * Math.min(1, dt * 2.2);

          // motion: falling slows to near-stillness when settled
          const speedMul = 1 - f.settle * 0.94;
          f.y -= f.vy * dt * (reduced ? 0.15 : speedMul);
          f.x += f.vx * dt * speedMul + Math.sin(t * 0.4 + f.seed) * 0.002 * (1 - f.settle);

          // recycle at bottom
          if (f.y < -spanY * 0.9) {
            f.y = spanY * 0.9;
            f.x = (Math.random() - 0.5) * spanX;
            rowAttr[i] = Math.floor(Math.random() * ROWS);
          }

          // cursor proximity heat (repel + warm)
          proj.set(f.x, f.y, f.z).project(camera);
          const dx = proj.x - mouse.x;
          const dy = proj.y - mouse.y;
          const distN = Math.hypot(dx, dy);
          if (distN < 0.18) {
            f.heat = Math.min(1, f.heat + dt * 5);
            f.x += (dx / (distN + 0.001)) * dt * 1.6 * (1 - f.settle * 0.6);
            f.y += (dy / (distN + 0.001)) * dt * 1.6 * (1 - f.settle * 0.6);
          } else {
            f.heat = Math.max(0, f.heat - dt * 2.5);
          }

          settleAttr[i] = f.settle;
          heatAttr[i] = f.heat;

          dummy.position.set(f.x, f.y, f.z);
          dummy.scale.setScalar(f.scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        (geo.getAttribute("aSettle") as BufferAttribute).needsUpdate = true;
        (geo.getAttribute("aHeat") as BufferAttribute).needsUpdate = true;

        renderer.render(scene, camera);
      };

      renderer.compile(scene, camera);
      tick();
      onReady?.();

      const onResize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("visibilitychange", onVisibility);
        geo.dispose();
        material.dispose();
        atlas.dispose();
        renderer.dispose();
        if (renderer.domElement.parentElement === mount)
          mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
