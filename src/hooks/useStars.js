// ./hooks/useStars.js
import { useEffect, useRef } from "react";

/**
 * Universal starfield hook with floating SVG icons
 * Stars + Among Us themed emoticons going vroom vroom
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
  iconsEnabled = true,
  iconCount = 30, // Default to 30 icons
 } = options;

 const canvasRef = useRef(null);

 useEffect(() => {
  if (!enabled) return;
  if (typeof window === "undefined") return;

  const canvas = canvasRef.current;
  if (!canvas) return;

  // Stars setup
  const ctx = canvas.getContext("2d", { alpha: false });
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
  rafId = requestAnimationFrame(t => { lastTs = t; rafId = requestAnimationFrame(step); });

  // SVG Icons setup - going vroom vroom
  const icons = [
   '/resources/icons/bg-icons/;D.svg',
   '/resources/icons/bg-icons/;O.svg',
   '/resources/icons/bg-icons/grinny;D.svg',
   '/resources/icons/bg-icons/heart.svg',
   '/resources/icons/bg-icons/nosed;).svg',
   '/resources/icons/bg-icons/smirkyy.svg',
   '/resources/icons/bg-icons/sus.svg',
   '/resources/icons/bg-icons/XD.svg'
  ];

  const patterns = [
   // Slow rotations - balanced left/right (20% chance total)
   { name: 'float-right-spin', weight: 2 },
   { name: 'float-left-spin', weight: 2 },
   { name: 'float-up-spin', weight: 1 },
   { name: 'float-down-spin', weight: 1 },
   // Medium rotations - balanced directions (30% chance total)
   { name: 'diagonal-up-right-spin', weight: 3 },
   { name: 'diagonal-down-left-spin', weight: 3 },
   { name: 'diagonal-up-left-spin', weight: 3 },
   { name: 'diagonal-down-right-spin', weight: 3 },
   { name: 'zigzag-spin', weight: 2 },
   { name: 'wobble-spin', weight: 2 },
   // WILD rotations - MORE from right! (50% chance total - most common!)
   { name: 'float-right-fast-spin', weight: 5 },
   { name: 'float-left-fast-spin', weight: 5 },
   { name: 'crazy-spin-right', weight: 5 },
   { name: 'crazy-spin-left', weight: 5 },
   { name: 'ultra-spin-up', weight: 3 },
   { name: 'ultra-spin-down', weight: 3 },
   { name: 'chaotic-diagonal', weight: 4 },
   { name: 'chaotic-diagonal-reverse', weight: 4 },
   { name: 'tornado-spin', weight: 5 },
   { name: 'tornado-spin-reverse', weight: 5 }
  ];

  // Weighted random selection
  const getRandomPattern = () => {
   const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
   let random = Math.random() * totalWeight;

   for (const pattern of patterns) {
    if (random < pattern.weight) {
     return pattern.name;
    }
    random -= pattern.weight;
   }
   return patterns[0].name;
  };

  const createdIcons = [];
  const iconContainer = canvas.parentElement;

  if (iconsEnabled && iconContainer) {
   // Scale icon count with screen size, but never go below 25
   const viewportArea = window.innerWidth * window.innerHeight;
   const areaBasedCount = Math.round(viewportArea / 45000); // more area => more icons
   const baseMinCount = Math.max(iconCount, 25);
   const actualIconCount = Math.max(baseMinCount, areaBasedCount);

   for (let i = 0; i < actualIconCount; i++) {
    const img = document.createElement('img');
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomPattern = getRandomPattern();

    img.src = randomIcon;
    img.style.position = 'fixed';
    img.style.pointerEvents = 'none';
    img.style.zIndex = '1';

    // Bigger size range so screen feels fuller
    const size = Math.floor(Math.random() * 70) + 40; // 40–110px
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;

    // Random base positions; animations will sweep across from here
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;

    img.style.opacity = (Math.random() * 0.4 + 0.3).toFixed(2);

    // Base positions tuned so paths cover most of the viewport
    if (randomPattern.includes('right') && !randomPattern.includes('left') && !randomPattern.includes('reverse')) {
     // Mostly left → right
     img.style.left = '0px';
     img.style.top = `${randomY}%`;
    } else if (randomPattern.includes('left') || randomPattern.includes('reverse')) {
     // Mostly right → left
     img.style.left = '0px';
     img.style.top = `${randomY}%`;
    } else if (randomPattern.includes('up') && !randomPattern.includes('down')) {
     // Bottom → top
     img.style.left = `${randomX}%`;
     img.style.top = '0px';
    } else if (randomPattern.includes('down')) {
     // Top → bottom
     img.style.left = `${randomX}%`;
     img.style.top = '0px';
    } else if (randomPattern.includes('tornado') && !randomPattern.includes('reverse')) {
     // Center-ish tornado
     img.style.left = '0px';
     img.style.top = '0px';
    } else if (randomPattern.includes('tornado') && randomPattern.includes('reverse')) {
     // Reverse tornado
     img.style.left = '0px';
     img.style.top = '0px';
    } else {
     // Fallback: horizontal sweeps
     img.style.left = '0px';
     img.style.top = `${randomY}%`;
    }

    // Varied durations - faster for wild spins
    const isWildSpin =
     randomPattern.includes('crazy') ||
     randomPattern.includes('ultra') ||
     randomPattern.includes('tornado');
    const duration = isWildSpin
     ? Math.floor(Math.random() * 12) + 8   // 8–20s for wild
     : Math.floor(Math.random() * 20) + 15; // 15–35s for normal

    img.style.animationDuration = `${duration}s`;
    img.style.animationIterationCount = 'infinite';
    img.style.animationTimingFunction = 'linear';
    img.style.animationName = randomPattern;

    // Start each icon at a random point in its path
    // so the screen is already busy on load
    img.style.animationDelay = `-${Math.random() * duration}s`;

    iconContainer.appendChild(img);
    createdIcons.push(img);
   }

   // Inject CSS animations with ACTUAL rotation while moving
   const style = document.createElement('style');
   style.textContent = `
        /* Slow rotations */
        @keyframes float-right-spin {
          0% { transform: translateX(-150px) translateY(0) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0) rotate(360deg); }
        }
        
        @keyframes float-left-spin {
          0% { transform: translateX(calc(100vw + 150px)) translateY(0) rotate(0deg); }
          100% { transform: translateX(-150px) translateY(0) rotate(-360deg); }
        }
        
        @keyframes float-up-spin {
          0% { transform: translateY(calc(100vh + 150px)) translateX(0) rotate(0deg); }
          100% { transform: translateY(-150px) translateX(0) rotate(360deg); }
        }
        
        @keyframes float-down-spin {
          0% { transform: translateY(-150px) translateX(0) rotate(0deg); }
          100% { transform: translateY(calc(100vh + 150px)) translateX(0) rotate(-360deg); }
        }
        
        /* Medium rotations */
        @keyframes diagonal-up-right-spin {
          0% { transform: translate(-150px, calc(100vh + 150px)) rotate(0deg); }
          100% { transform: translate(calc(100vw + 150px), -150px) rotate(720deg); }
        }
        
        @keyframes diagonal-down-left-spin {
          0% { transform: translate(calc(100vw + 150px), -150px) rotate(0deg); }
          100% { transform: translate(-150px, calc(100vh + 150px)) rotate(-720deg); }
        }
        
        @keyframes diagonal-up-left-spin {
          0% { transform: translate(calc(100vw + 150px), calc(100vh + 150px)) rotate(0deg); }
          100% { transform: translate(-150px, -150px) rotate(-720deg); }
        }
        
        @keyframes diagonal-down-right-spin {
          0% { transform: translate(-150px, -150px) rotate(0deg); }
          100% { transform: translate(calc(100vw + 150px), calc(100vh + 150px)) rotate(720deg); }
        }
        
        @keyframes zigzag-spin {
          0% { transform: translate(-150px, 0) rotate(0deg); }
          25% { transform: translate(calc(25vw - 37.5px), -25vh) rotate(180deg); }
          50% { transform: translate(calc(50vw - 75px), 0) rotate(360deg); }
          75% { transform: translate(calc(75vw - 112.5px), 25vh) rotate(540deg); }
          100% { transform: translate(calc(100vw + 150px), 0) rotate(720deg); }
        }
        
        @keyframes wobble-spin {
          0% { transform: translate(-150px, 0) rotate(0deg); }
          25% { transform: translate(calc(25vw - 37.5px), -30vh) rotate(360deg); }
          50% { transform: translate(calc(50vw - 75px), 0) rotate(720deg); }
          75% { transform: translate(calc(75vw - 112.5px), 30vh) rotate(1080deg); }
          100% { transform: translate(calc(100vw + 150px), 0) rotate(1440deg); }
        }
        
        /* WILD FAST ROTATIONS */
        @keyframes float-right-fast-spin {
          0% { transform: translateX(-150px) translateY(0) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0) rotate(2880deg); }
        }
        
        @keyframes float-left-fast-spin {
          0% { transform: translateX(calc(100vw + 150px)) translateY(0) rotate(0deg); }
          100% { transform: translateX(-150px) translateY(0) rotate(-2880deg); }
        }
        
        @keyframes crazy-spin-right {
          0% { transform: translateX(-150px) translateY(0) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 150px)) translateY(0) rotate(5400deg); }
        }
        
        @keyframes crazy-spin-left {
          0% { transform: translateX(calc(100vw + 150px)) translateY(0) rotate(0deg); }
          100% { transform: translateX(-150px) translateY(0) rotate(-5400deg); }
        }
        
        @keyframes ultra-spin-up {
          0% { transform: translateY(calc(100vh + 150px)) translateX(0) rotate(0deg); }
          100% { transform: translateY(-150px) translateX(0) rotate(3600deg); }
        }
        
        @keyframes ultra-spin-down {
          0% { transform: translateY(-150px) translateX(0) rotate(0deg); }
          100% { transform: translateY(calc(100vh + 150px)) translateX(0) rotate(-3600deg); }
        }
        
        @keyframes chaotic-diagonal {
          0% { transform: translate(calc(100vw + 150px), -150px) rotate(0deg); }
          100% { transform: translate(-150px, calc(100vh + 150px)) rotate(-4320deg); }
        }
        
        @keyframes chaotic-diagonal-reverse {
          0% { transform: translate(-150px, -150px) rotate(0deg); }
          100% { transform: translate(calc(100vw + 150px), calc(100vh + 150px)) rotate(4320deg); }
        }
        
        @keyframes tornado-spin {
          0% { transform: translate(0, calc(100vh + 150px)) rotate(0deg) scale(0.5); }
          50% { transform: translate(50vw, 50vh) rotate(3600deg) scale(1.5); }
          100% { transform: translate(100vw, -150px) rotate(7200deg) scale(0.5); }
        }
        
        @keyframes tornado-spin-reverse {
          0% { transform: translate(100vw, -150px) rotate(0deg) scale(0.5); }
          50% { transform: translate(50vw, 50vh) rotate(-3600deg) scale(1.5); }
          100% { transform: translate(0, calc(100vh + 150px)) rotate(-7200deg) scale(0.5); }
        }
      `;
   document.head.appendChild(style);

   return () => {
    window.removeEventListener("resize", onResize);
    if (rafId) cancelAnimationFrame(rafId);

    createdIcons.forEach(icon => {
     if (iconContainer.contains(icon)) {
      iconContainer.removeChild(icon);
     }
    });
    if (document.head.contains(style)) {
     document.head.removeChild(style);
    }
   };
  }

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
  iconsEnabled,
  iconCount,
 ]);

 return canvasRef;
}