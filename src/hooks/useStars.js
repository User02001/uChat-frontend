import { useEffect, useRef } from "react";

/**
 * Universal starfield hook
 */
export default function useStars(options = {}) {
 const {
  enabled = true,
  areaPerStar = 4000,
  speedMin = 20,
  speedMax = 30,
  radiusMin = 0.6,
  radiusMax = 1.8,
  alphaMin = 0.55,
  alphaMax = 1.0,
  direction = "ltr",
 } = options;

 const canvasRef = useRef(null);

 useEffect(() => {
  if (!enabled) return;
  if (typeof window === "undefined") return;

  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let width = 0, height = 0, dpr = 1;
  let stars = [];
  let lastTs = 0;
  let rafId = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function makeStar(randomX = false) {
   const depth = Math.random();
   const r = rand(radiusMin, radiusMax) * (0.6 + depth * 0.8);
   const speed = rand(speedMin, speedMax) * (0.5 + depth * 0.8);
   const alpha = rand(alphaMin, alphaMax) * (0.6 + depth * 0.6);
   const spawnLeft = direction === "ltr";
   const offscreenX = spawnLeft ? rand(-width * 0.15, -r * 2) : rand(width + r * 2, width * 1.15);

   return {
    x: randomX ? Math.random() * width : offscreenX,
    y: Math.random() * height,
    r, speed, alpha
   };
  }

  function resize() {
   dpr = Math.min(window.devicePixelRatio || 1, 2);
   width = Math.max(1, Math.floor(window.innerWidth));
   height = Math.max(1, Math.floor(window.innerHeight));
   canvas.width = Math.floor(width * dpr);
   canvas.height = Math.floor(height * dpr);
   ctx.setTransform(1, 0, 0, 1, 0, 0);
   ctx.scale(dpr, dpr);

   const targetCount = Math.max(200, Math.round((width * height) / areaPerStar));
   if (stars.length < targetCount) {
    for (let i = stars.length; i < targetCount; i++) stars.push(makeStar(true));
   } else if (stars.length > targetCount) {
    stars.length = targetCount;
   }
  }

  function step(ts) {
   const dt = Math.min((ts - lastTs) / 1000 || 0, 0.033);
   lastTs = ts;

   ctx.clearRect(0, 0, width, height);
   ctx.fillStyle = "#fff";

   const move = direction === "ltr" ? 1 : -1;
   for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.x += s.speed * dt * move;

    const leftGone = s.x - s.r > width;
    const rightGone = s.x + s.r < 0;
    if ((direction === "ltr" && leftGone) || (direction === "rtl" && rightGone)) {
     stars[i] = makeStar(false);
    }

    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
   }
   ctx.globalAlpha = 1;

   rafId = requestAnimationFrame(step);
  }

  let resizeQueued = false;
  const onResize = () => {
   if (resizeQueued) return;
   resizeQueued = true;
   requestAnimationFrame(() => {
    resizeQueued = false;
    resize();
   });
  };

  window.addEventListener("resize", onResize, { passive: true });
  resize();
  rafId = requestAnimationFrame(t => {
   lastTs = t;
   rafId = requestAnimationFrame(step);
  });

  return () => {
   window.removeEventListener("resize", onResize);
   if (rafId) cancelAnimationFrame(rafId);
  };
 }, [
  enabled,
  areaPerStar,
  speedMin,
  speedMax,
  radiusMin,
  radiusMax,
  alphaMin,
  alphaMax,
  direction,
 ]);

 return canvasRef;
}
