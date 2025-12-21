import { useMemo } from 'react';

// SVGs: Inlined as raw text (no network requests, with hashing)
const svgIcons = import.meta.glob('/src/assets/icons/*.svg', {
 query: '?raw',
 eager: true,
 import: 'default'
});

// PNGs: Bundled with hashed URLs (cached, optimized)
const pngIcons = import.meta.glob('/src/assets/icons/*.png', {
 eager: true,
 import: 'default'
});

export const useIcon = (name) => {
 return useMemo(() => {
  // Try SVG first
  const svgPath = `/src/assets/icons/${name}.svg`;
  if (svgIcons[svgPath]) {
   return { type: 'svg', content: svgIcons[svgPath] };
  }

  // Try PNG
  const pngPath = `/src/assets/icons/${name}.png`;
  if (pngIcons[pngPath]) {
   return { type: 'png', content: pngIcons[pngPath] };
  }

  return null;
 }, [name]);
};