import { useEffect, useRef } from "react";

/**
 * Liquid layers animation hook
 */
export default function useLiquidLayers(options = {}) {
 const {
  enabled = true,
  speed1 = 320,
  speed2 = 260,
  dx = 4,
  base1 = 0.34,
  base2 = 0.67,
  amp1 = 0.030,
  amp2 = 0.034,
  L1 = 720,
  L2 = 420,
  L3 = 980,
  minGap = 0.10
 } = options;

 const canvasRef = useRef(null);

 useEffect(() => {
  if (!enabled) return;
  if (typeof window === "undefined") return;

  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const CFG = { speed1, speed2, dx, base1, base2, amp1, amp2, L1, L2, L3, minGap };

  function buildXSamples(w) {
   const dx = Math.max(2, CFG.dx);
   const n = Math.floor(w / dx) + 1;
   const xs = new Float32Array(n);
   for (let i = 0; i < n; i++) xs[i] = i * dx;
   xs[n - 1] = w;
   return xs;
  }

  function boundaryY(x, t, basePx, ampPx, speed, h) {
   const TWO_PI = Math.PI * 2;
   const k1 = TWO_PI / CFG.L1;
   const k2 = TWO_PI / CFG.L2;
   const k3 = TWO_PI / CFG.L3;

   const s1 = Math.sin(k1 * x - k1 * speed * t);
   const s2 = Math.sin(k2 * x - k2 * (speed * 0.78) * t + 1.4);
   const s3 = Math.sin(k3 * x - k3 * (speed * 1.18) * t + 2.7);

   const v = (1.00 * s1 + 0.55 * s2 + 0.35 * s3) / (1.00 + 0.55 + 0.35);
   return basePx + v * ampPx;
  }

  function appendCatmullRom(ctx, xs, ys) {
   const n = xs.length;
   if (n < 2) return;

   for (let i = 0; i < n - 1; i++) {
    const i0 = Math.max(0, i - 1);
    const i1 = i;
    const i2 = i + 1;
    const i3 = Math.min(n - 1, i + 2);

    const x0 = xs[i0], y0 = ys[i0];
    const x1 = xs[i1], y1 = ys[i1];
    const x2 = xs[i2], y2 = ys[i2];
    const x3 = xs[i3], y3 = ys[i3];

    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;

    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
   }
  }

  function appendCatmullRomReversed(ctx, xs, ys) {
   const n = xs.length;
   if (n < 2) return;

   for (let ri = 0; ri < n - 1; ri++) {
    const i = (n - 1) - ri;
    const j = (n - 2) - ri;

    const i0 = Math.min(n - 1, i + 1);
    const i1 = i;
    const i2 = j;
    const i3 = Math.max(0, j - 1);

    const x0 = xs[i0], y0 = ys[i0];
    const x1 = xs[i1], y1 = ys[i1];
    const x2 = xs[i2], y2 = ys[i2];
    const x3 = xs[i3], y3 = ys[i3];

    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;

    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x2, y2);
   }
  }

  let W = 0, H = 0, xs = null, y1 = null, y2 = null, dpr = 1;

  function resize() {
   W = window.innerWidth;
   H = window.innerHeight;

   dpr = Math.max(1, window.devicePixelRatio || 1);
   canvas.width = Math.floor(W * dpr);
   canvas.height = Math.floor(H * dpr);
   ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

   xs = buildXSamples(W);
   y1 = new Float32Array(xs.length);
   y2 = new Float32Array(xs.length);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  const t0 = performance.now();
  let rafId;

  function tick(now) {
   const t = reduceMotion ? 0 : (now - t0) / 1000;

   const base1 = H * CFG.base1;
   const base2 = H * CFG.base2;
   const amp1 = H * CFG.amp1;
   const amp2 = H * CFG.amp2;
   const minGap = H * CFG.minGap;

   for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    y1[i] = boundaryY(x, t, base1, amp1, CFG.speed1, H);
    y2[i] = boundaryY(x, t, base2, amp2, CFG.speed2, H);
    if (y2[i] < y1[i] + minGap) y2[i] = y1[i] + minGap;
   }

   ctx.fillStyle = "#fff";
   ctx.fillRect(0, 0, W, H);

   ctx.beginPath();
   ctx.moveTo(0, 0);
   ctx.lineTo(W, 0);
   ctx.lineTo(W, y1[y1.length - 1]);
   appendCatmullRomReversed(ctx, xs, y1);
   ctx.closePath();
   ctx.fillStyle = "#f9edbc";
   ctx.fill();

   ctx.beginPath();
   ctx.moveTo(xs[0], y1[0]);
   appendCatmullRom(ctx, xs, y1);
   ctx.lineTo(W, y2[y2.length - 1]);
   appendCatmullRomReversed(ctx, xs, y2);
   ctx.closePath();
   ctx.fillStyle = "#f6dd88";
   ctx.fill();

   ctx.beginPath();
   ctx.moveTo(xs[0], y2[0]);
   appendCatmullRom(ctx, xs, y2);
   ctx.lineTo(W, H);
   ctx.lineTo(0, H);
   ctx.closePath();
   ctx.fillStyle = "#FEA605";
   ctx.fill();

   rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return () => {
   window.removeEventListener("resize", resize);
   if (rafId) cancelAnimationFrame(rafId);
  };
 }, [enabled, speed1, speed2, dx, base1, base2, amp1, amp2, L1, L2, L3, minGap]);

 return canvasRef;
}
