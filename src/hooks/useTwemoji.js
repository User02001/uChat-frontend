import { useEffect } from 'react';
import twemoji from '@twemoji/api';

const TWEMOJI_OPTIONS = {
 folder: 'svg',
 ext: '.svg',
 base: '/twemoji/',
 attributes: () => ({
  style: 'height: 1.2em; width: 1.2em; vertical-align: -0.2em; display: inline-block;',
  draggable: 'false',
 }),
};

function isSafeToparse(node) {
 if (node.closest?.('[data-skip-twemoji]')) return false;
 if (node.closest?.('[data-twemoji-input]')) return false;
 if (node.closest?.('[data-twemoji-parsing]')) return false;
 const inputEl = document.querySelector('[data-twemoji-input]');
 if (inputEl && (node === inputEl || inputEl.contains(node) || node.contains?.(inputEl))) return false;
 return true;
}

function parseNode(node) {
 if (!isSafeToparse(node)) return;
 twemoji.parse(node, TWEMOJI_OPTIONS);
}

export function useTwemoji() {
 useEffect(() => {
  parseNode(document.body);

  const inputEl = () => document.querySelector('[data-twemoji-input]');

  let scheduled = false;
  const pending = new Set();

  const schedule = () => {
   if (scheduled) return;
   scheduled = true;
   queueMicrotask(() => {
    scheduled = false;
    const inp = inputEl();
    for (const node of pending) {
     if (!node.isConnected) continue;
     if (!isSafeToparse(node)) continue;
     if (inp && (node === inp || inp.contains(node) || node.contains?.(inp))) continue;
     twemoji.parse(node, TWEMOJI_OPTIONS);
    }
    pending.clear();
   });
  };

  const observer = new MutationObserver((mutations) => {
   for (const m of mutations) {
    for (const node of m.addedNodes) {
     if (node instanceof Element) {
      if (!isSafeToparse(node)) continue;
      if (node.tagName === 'IMG' && node.classList.contains('emoji')) continue;
      pending.add(node);
     }
     if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
      if (!isSafeToparse(node.parentElement)) continue;
      pending.add(node.parentElement);
     }
    }
   }
   if (pending.size > 0) schedule();
  });

  window.__twemojiObserver = observer;

  observer.observe(document.body, {
   childList: true,
   subtree: true,
   characterData: false,
  });

  return () => observer.disconnect();
 }, []);
}