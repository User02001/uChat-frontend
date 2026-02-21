import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { EmojiPickerSheetStyles as styles } from '../styles/emoji_picker_sheet';
import { useVirtualizer } from '@tanstack/react-virtual';
import data from '@emoji-mart/data';
import emojiData from 'emoji-datasource-twitter/emoji.json';

const emojiByUnified = new Map();
for (const e of emojiData) {
 if (e.has_img_twitter) emojiByUnified.set(e.unified.toLowerCase(), e);
 if (e.non_qualified) emojiByUnified.set(e.non_qualified.toLowerCase(), e);
}

const SHEET_URL = '/emoji-sheet.png';
const SHEET_SIZE = 64;
const SHEET_COLS = 62;
const SHEET_ROWS = 62;

function getSpriteStyle(native, size = 26) {
 const unified = [...native]
  .map(c => c.codePointAt(0).toString(16).padStart(4, '0'))
  .join('-');
 const e = emojiByUnified.get(unified) || emojiByUnified.get(unified.replace(/-fe0f/g, ''));
 if (!e) return null;
 const px = SHEET_SIZE + 2;
 const scale = size / SHEET_SIZE;
 return {
  display: 'inline-block', width: size, height: size,
  backgroundImage: `url(${SHEET_URL})`,
  backgroundSize: `${Math.round(SHEET_COLS * px * scale)}px ${Math.round(SHEET_ROWS * px * scale)}px`,
  backgroundPosition: `${-Math.round((e.sheet_x * px + 1) * scale)}px ${-Math.round((e.sheet_y * px + 1) * scale)}px`,
  backgroundRepeat: 'no-repeat',
 };
}

const CATEGORY_ICONS = {
 people: '😀', nature: '🐶', foods: '🍎',
 activity: '⚽', places: '✈️', objects: '💡',
 symbols: '❤️', flags: '🏳️',
};

const COLS = 9;
const ROW_HEIGHT = 46;
const HEADER_HEIGHT = 32;
const RECENT_KEY = 'uchat_recent_emoji';
const MAX_RECENT = 24;

function getRecent() {
 try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(native) {
 const prev = getRecent().filter(e => e !== native);
 localStorage.setItem(RECENT_KEY, JSON.stringify([native, ...prev].slice(0, MAX_RECENT)));
}

const EmojiBtn = React.memo(({ native, onSelect }) => {
 const sprite = getSpriteStyle(native, 26);
 return (
  <li role="gridcell" style={{ listStyle: 'none', flex: 1 }}>
   <button
    {...stylex.props(styles.emojiBtn)}
    style={{ width: '100%' }}
    onClick={() => onSelect(native)}
    type="button"
    title={native}
    data-skip-twemoji
   >
    {sprite
     ? <span style={sprite} />
     : <span style={{ fontSize: 24, lineHeight: 1 }}>{native}</span>
    }
   </button>
  </li>
 );
});

const EmojiRow = React.memo(({ emojis, onSelect, style }) => (
 <ul
  role="row"
  style={{
   ...style,
   display: 'flex',
   listStyle: 'none',
   margin: 0,
   padding: '0 4px',
   boxSizing: 'border-box',
   width: '100%',
  }}
 >
  {emojis.map((emoji, i) => (
   <EmojiBtn key={i} native={emoji.native} onSelect={onSelect} />
  ))}
  {emojis.length < COLS && Array.from({ length: COLS - emojis.length }).map((_, i) => (
   <li key={`pad-${i}`} style={{ flex: 1, listStyle: 'none' }} />
  ))}
 </ul>
));

const HeaderRow = React.memo(({ id, icon, label, collapsed, onToggle, style }) => (
 <div
  role="rowheader"
  style={{ ...style, boxSizing: 'border-box', width: '100%' }}
  {...stylex.props(styles.categoryHeader)}
  onClick={() => onToggle(id)}
 >
  <span>{icon} {label}</span>
  <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`} style={{ fontSize: 10, opacity: 0.45 }} />
 </div>
));

const EmojiPickerSheet = ({ messageId, onAddReaction, onClose }) => {
 const [isClosing, setIsClosing] = useState(false);
 const [search, setSearch] = useState('');
 const [recent, setRecent] = useState(getRecent);
 const [collapsed, setCollapsed] = useState({});
 const [activeCategory, setActiveCategory] = useState('recent');
 const sheetRef = useRef(null);
 const handleAreaRef = useRef(null);
 const scrollRef = useRef(null);
 const inputRef = useRef(null);

 useEffect(() => { inputRef.current?.focus(); }, []);

 const handleClose = useCallback(() => {
  setIsClosing(true);
  setTimeout(onClose, 200);
 }, [onClose]);

 const toggleCollapse = useCallback((id) =>
  setCollapsed(p => ({ ...p, [id]: !p[id] })), []);

 // Drag to dismiss
 useEffect(() => {
  const sheet = sheetRef.current;
  if (!sheet) return;
  let startY = 0, curr = 0, drag = false;
  const onDown = (e) => {
   if (!handleAreaRef.current?.contains(e.target)) return;
   drag = true; startY = e.clientY; curr = 0;
   sheet.style.transition = 'none';
  };
  const onMove = (e) => {
   if (!drag) return;
   const d = e.clientY - startY;
   if (d > 0) { curr = d; sheet.style.transform = `translateY(${d}px)`; }
  };
  const onUp = () => {
   if (!drag) return; drag = false;
   if (curr > 80) handleClose();
   else { sheet.style.transition = 'transform 0.2s ease'; sheet.style.transform = 'translateY(0)'; }
  };
  sheet.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  return () => {
   sheet.removeEventListener('pointerdown', onDown);
   window.removeEventListener('pointermove', onMove);
   window.removeEventListener('pointerup', onUp);
   window.removeEventListener('pointercancel', onUp);
  };
 }, [handleClose]);

 const categories = useMemo(() =>
  data.categories.map(cat => ({
   id: cat.id,
   label: cat.id.charAt(0).toUpperCase() + cat.id.slice(1),
   icon: CATEGORY_ICONS[cat.id] || '😀',
   emojis: cat.emojis
    .map(id => ({ id, native: data.emojis[id]?.skins?.[0]?.native }))
    .filter(e => e.native),
  })), []);

 const allCategories = useMemo(() => {
  const recentEmojis = recent
   .map(native => {
    const entry = Object.entries(data.emojis).find(([, e]) => e.skins?.[0]?.native === native);
    return entry ? { id: entry[0], native } : null;
   })
   .filter(Boolean);
  return [
   ...(recentEmojis.length ? [{ id: 'recent', label: 'Recently Used', icon: '🕐', emojis: recentEmojis }] : []),
   ...categories,
  ];
 }, [categories, recent]);

 const virtualRows = useMemo(() => {
  const rows = [];
  if (search.trim()) {
   const q = search.toLowerCase();
   const matched = Object.entries(data.emojis)
    .filter(([, e]) => e.name?.toLowerCase().includes(q) || e.keywords?.some(k => k.includes(q)))
    .map(([id, e]) => ({ id, native: e.skins?.[0]?.native }))
    .filter(e => e.native);
   if (!matched.length) return [{ type: 'empty' }];
   for (let i = 0; i < matched.length; i += COLS)
    rows.push({ type: 'emojis', emojis: matched.slice(i, i + COLS) });
   return rows;
  }
  allCategories.forEach(cat => {
   rows.push({ type: 'header', id: cat.id, label: cat.label, icon: cat.icon });
   if (!collapsed[cat.id]) {
    for (let i = 0; i < cat.emojis.length; i += COLS)
     rows.push({ type: 'emojis', emojis: cat.emojis.slice(i, i + COLS) });
   }
  });
  return rows;
 }, [search, allCategories, collapsed]);

 const virtualizer = useVirtualizer({
  count: virtualRows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: i => virtualRows[i]?.type === 'header' ? HEADER_HEIGHT : ROW_HEIGHT,
  overscan: 4,
 });

 const handleSelect = useCallback((native) => {
  onAddReaction(messageId, native);
  saveRecent(native);
  setRecent(getRecent());
  handleClose();
 }, [messageId, onAddReaction, handleClose]);

 const scrollToCategory = useCallback((id) => {
  const idx = virtualRows.findIndex(r => r.type === 'header' && r.id === id);
  if (idx !== -1) virtualizer.scrollToIndex(idx, { align: 'start', behavior: 'smooth' });
  setActiveCategory(id);
 }, [virtualRows, virtualizer]);

 return (
  <>
   <div
    {...stylex.props(styles.overlay, isClosing && styles.overlayClosing)}
    onClick={handleClose}
   />
   <div ref={sheetRef} {...stylex.props(styles.sheet, isClosing && styles.sheetClosing)}>

    <div ref={handleAreaRef} {...stylex.props(styles.handleArea)}>
     <div {...stylex.props(styles.handle)} />
    </div>

    <div {...stylex.props(styles.header)}>
     <span {...stylex.props(styles.title)}>Pick a Reaction</span>
     <button {...stylex.props(styles.closeBtn)} onClick={handleClose} type="button">
      <i className="fas fa-times" />
     </button>
    </div>

    <div {...stylex.props(styles.searchWrap)}>
     <input
      ref={inputRef}
      {...stylex.props(styles.searchInput)}
      placeholder="Search emoji..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      data-skip-twemoji
     />
    </div>

    {!search && (
     <div {...stylex.props(styles.categoryTabs)}>
      {allCategories.map(cat => (
       <button
        key={cat.id}
        {...stylex.props(styles.catTab, activeCategory === cat.id && styles.catTabActive)}
        onClick={() => scrollToCategory(cat.id)}
        type="button"
        title={cat.label}
       >
        {cat.icon}
       </button>
      ))}
     </div>
    )}

    {/* scrollArea has flex:1 + minHeight:0 — this is what actually fixes the cutoff */}
    <div ref={scrollRef} {...stylex.props(styles.scrollArea)} role="grid" data-skip-twemoji>
     <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map(vItem => {
       const row = virtualRows[vItem.index];
       const style = {
        position: 'absolute', top: vItem.start, left: 0,
        width: '100%', height: vItem.size,
       };

       if (row.type === 'empty') return (
        <div key={vItem.key} style={{ ...style, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, gap: 8 }}>
         <span style={{ fontSize: 28 }}>🔍</span>
         No results
        </div>
       );

       if (row.type === 'header') return (
        <HeaderRow key={vItem.key} style={style} id={row.id} icon={row.icon} label={row.label} collapsed={collapsed[row.id]} onToggle={toggleCollapse} />
       );

       if (row.type === 'emojis') return (
        <EmojiRow key={vItem.key} style={style} emojis={row.emojis} onSelect={handleSelect} />
       );

       return null;
      })}
     </div>
    </div>

   </div>
  </>
 );
};

export default EmojiPickerSheet;