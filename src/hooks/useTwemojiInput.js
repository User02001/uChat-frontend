import { useEffect, useRef } from 'react';
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

function getPlainText(el) {
 let text = '';
 const walker = document.createTreeWalker(el, NodeFilter.SHOW_ALL);
 let node;
 while ((node = walker.nextNode())) {
  if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
  else if (node.nodeName === 'IMG') text += node.getAttribute('alt') || '';
 }
 return text;
}

function getCharOffset(el) {
 const sel = window.getSelection();
 if (!sel || sel.rangeCount === 0) return 0;
 const range = sel.getRangeAt(0);
 let offset = 0;
 const walker = document.createTreeWalker(el, NodeFilter.SHOW_ALL);
 let node;
 while ((node = walker.nextNode())) {
  if (node === range.endContainer) { offset += range.endOffset; break; }
  if (node.nodeType === Node.TEXT_NODE) offset += node.textContent.length;
  else if (node.nodeName === 'IMG') offset += (node.getAttribute('alt') || '').length;
 }
 return offset;
}

function setCharOffset(el, targetOffset) {
 const sel = window.getSelection();
 if (!sel) return;
 let offset = 0;
 const walker = document.createTreeWalker(el, NodeFilter.SHOW_ALL);
 let node;
 while ((node = walker.nextNode())) {
  if (node.nodeType === Node.TEXT_NODE) {
   const len = node.textContent.length;
   if (offset + len >= targetOffset) {
    const range = document.createRange();
    range.setStart(node, targetOffset - offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
   }
   offset += len;
  } else if (node.nodeName === 'IMG') {
   const len = (node.getAttribute('alt') || '').length;
   offset += len;
   if (offset >= targetOffset) {
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
   }
  }
 }
 const range = document.createRange();
 range.selectNodeContents(el);
 range.collapse(false);
 sel.removeAllRanges();
 sel.addRange(range);
}

export function useTwemojiInput(inputRef, onTextChange) {
 const onTextChangeRef = useRef(onTextChange);
 onTextChangeRef.current = onTextChange;
 const parsingRef = useRef(false);

 useEffect(() => {
  const el = inputRef.current;
  if (!el) return;

  const handleInput = () => {
   if (parsingRef.current) return;
   parsingRef.current = true;
   if (window.__twemojiObserver) window.__twemojiObserver.disconnect();
   const offset = getCharOffset(el);
   el.querySelectorAll('img.emoji').forEach(img => {
    const text = document.createTextNode(img.getAttribute('alt') || '');
    img.replaceWith(text);
   });
   twemoji.parse(el, TWEMOJI_OPTIONS);
   setCharOffset(el, offset);
   onTextChangeRef.current(getPlainText(el));
   queueMicrotask(() => {
    parsingRef.current = false;
    if (window.__twemojiObserver) {
     window.__twemojiObserver.observe(document.body, { childList: true, subtree: true, characterData: false });
    }
   });
  };

  el.addEventListener('input', handleInput);
  return () => el.removeEventListener('input', handleInput);
 }, [inputRef.current]);
}