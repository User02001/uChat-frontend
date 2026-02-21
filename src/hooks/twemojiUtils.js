import twemoji from '@twemoji/api';

export const TWEMOJI_OPTIONS = {
 folder: 'svg',
 ext: '.svg',
 base: '/twemoji/',
 attributes: () => ({
  style: 'height: 1.2em; width: 1.2em; vertical-align: -0.2em; display: inline-block;',
  draggable: 'false',
 }),
};

export function getPlainText(el) {
 let text = '';
 const walker = document.createTreeWalker(el, NodeFilter.SHOW_ALL);
 let node;
 while ((node = walker.nextNode())) {
  if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
  else if (node.nodeName === 'IMG') text += node.getAttribute('alt') || '';
 }
 return text;
}

export function getCharOffset(el) {
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

export function setCharOffset(el, targetOffset) {
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