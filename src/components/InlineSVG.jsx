import { useEffect, useRef } from 'react';

export default function InlineSVG({ src, className, alt, style, ...props }) {
 const containerRef = useRef(null);

 useEffect(() => {
  fetch(src)
   .then(res => res.text())
   .then(svgText => {
    if (containerRef.current) {
     containerRef.current.innerHTML = svgText;
     const svg = containerRef.current.querySelector('svg');
     if (svg) {
      if (className) {
       svg.setAttribute('class', className);
      }
      if (style) {
       Object.assign(svg.style, style);
      }
      if (alt) {
       const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
       title.textContent = alt;
       svg.insertBefore(title, svg.firstChild);
      }
     }
    }
   })
   .catch(err => console.error('Error loading SVG:', err));
 }, [src, className, alt, style]);

 return <span ref={containerRef} style={{ display: 'inline-flex', lineHeight: 0 }} {...props} />;
}