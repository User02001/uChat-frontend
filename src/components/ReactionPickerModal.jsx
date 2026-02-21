import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { ReactionPickerStyles as styles } from '../styles/reaction_picker_modal';
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

function getSpriteStyle(native, size = 20) {
 const unified = [...native]
  .map(c => c.codePointAt(0).toString(16).padStart(4, '0'))
  .join('-');
 const e = emojiByUnified.get(unified) || emojiByUnified.get(unified.replace(/-fe0f/g, ''));
 if (!e) return null;
 const sheetPx = SHEET_SIZE + 2;
 const scale = size / SHEET_SIZE;
 return {
  display: 'inline-block',
  width: size,
  height: size,
  backgroundImage: `url(${SHEET_URL})`,
  backgroundSize: `${Math.round(SHEET_COLS * sheetPx * scale)}px ${Math.round(SHEET_ROWS * sheetPx * scale)}px`,
  backgroundPosition: `${-Math.round((e.sheet_x * sheetPx + 1) * scale)}px ${-Math.round((e.sheet_y * sheetPx + 1) * scale)}px`,
  backgroundRepeat: 'no-repeat',
 };
}

const CATEGORY_ICONS = {
 people: '😀',
 nature: '🐶',
 foods: '🍎',
 activity: '⚽',
 places: '✈️',
 objects: '💡',
 symbols: '❤️',
 flags: '🏳️',
};

const COLS = 9;
const ROW_HEIGHT = 42;
const HEADER_HEIGHT = 30;
const SCROLL_HEIGHT = 340;
const RECENT_KEY = 'uchat_recent_emoji';
const MAX_RECENT = 24;

function getRecent() {
 try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(native) {
 const prev = getRecent().filter(e => e !== native);
 localStorage.setItem(RECENT_KEY, JSON.stringify([native, ...prev].slice(0, MAX_RECENT)));
}

const EmojiBtn = React.memo(({ emojiId, native, onSelect }) => {
 const sprite = getSpriteStyle(native, 20);
 return (
  <li role="gridcell" style={{ listStyle: 'none' }}>
   <button
    {...stylex.props(styles.emojiBtn)}
    onClick={() => onSelect(native)}
    type="button"
    title={native}
    data-skip-twemoji
   >
    {sprite
     ? <span style={sprite} />
     : <span style={{ fontSize: 18, lineHeight: 1 }}>{native}</span>
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
   padding: '0 6px',
   boxSizing: 'border-box',
   width: '100%',
  }}
 >
  {emojis.map((emoji, i) => (
   <EmojiBtn key={i} emojiId={emoji.id} native={emoji.native} onSelect={onSelect} />
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
  <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`} />
 </div>
));

const ReactionPickerModal = ({ messageId, onAddReaction, onClose }) => {
 const [search, setSearch] = useState('');
 const [recent, setRecent] = useState(getRecent);
 const [collapsed, setCollapsed] = useState({});
 const inputRef = useRef(null);
 const scrollRef = useRef(null);

 useEffect(() => { inputRef.current?.focus(); }, []);

 const toggleCollapse = useCallback((id) =>
  setCollapsed(p => ({ ...p, [id]: !p[id] })), []);

 const categories = useMemo(() =>
  data.categories.map(cat => ({
   id: cat.id,
   label: cat.id.charAt(0).toUpperCase() + cat.id.slice(1),
   icon: CATEGORY_ICONS[cat.id] || '😀',
   emojis: cat.emojis
    .map(id => ({ id, native: data.emojis[id]?.skins?.[0]?.native }))
    .filter(e => e.native),
  })), []);

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

  const addSection = (id, label, icon, emojis) => {
   rows.push({ type: 'header', id, label, icon });
   if (!collapsed[id]) {
    for (let i = 0; i < emojis.length; i += COLS)
     rows.push({ type: 'emojis', emojis: emojis.slice(i, i + COLS) });
   }
  };

  const recentEmojis = recent
   .map(native => {
    const entry = Object.entries(data.emojis).find(([, e]) => e.skins?.[0]?.native === native);
    return entry ? { id: entry[0], native } : null;
   })
   .filter(Boolean);

  if (recentEmojis.length) addSection('recent', 'Recently Used', '🕐', recentEmojis);
  categories.forEach(cat => addSection(cat.id, cat.label, cat.icon, cat.emojis));

  return rows;
 }, [search, categories, recent, collapsed]);

 const virtualizer = useVirtualizer({
  count: virtualRows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: i => virtualRows[i]?.type === 'header' ? HEADER_HEIGHT : ROW_HEIGHT,
  overscan: 0,
 });

 const handleSelect = useCallback((native) => {
  onAddReaction(messageId, native);
  saveRecent(native);
  setRecent(getRecent());
  onClose();
 }, [messageId, onAddReaction, onClose]);

 return (
  <div
   {...stylex.props(styles.picker)}
   onClick={e => e.stopPropagation()}
   data-reaction-picker
   data-skip-twemoji
  >
   <div {...stylex.props(styles.searchBar)}>
    <input
     ref={inputRef}
     {...stylex.props(styles.searchInput)}
     placeholder="Search emoji..."
     value={search}
     onChange={e => setSearch(e.target.value)}
    />
   </div>

   <div ref={scrollRef} {...stylex.props(styles.scrollArea)} role="grid">
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
     {virtualizer.getVirtualItems().map(vItem => {
      const row = virtualRows[vItem.index];
      const style = {
       position: 'absolute',
       top: vItem.start,
       left: 0,
       width: '100%',
       height: vItem.size,
      };

      if (row.type === 'empty') return (
       <div key={vItem.key} style={style} {...stylex.props(styles.emptyState)}>
        <span {...stylex.props(styles.emptyIcon)}>🔍</span>
        No results
       </div>
      );

      if (row.type === 'header') return (
       <HeaderRow
        key={vItem.key}
        style={style}
        id={row.id}
        icon={row.icon}
        label={row.label}
        collapsed={collapsed[row.id]}
        onToggle={toggleCollapse}
       />
      );

      if (row.type === 'emojis') return (
       <EmojiRow
        key={vItem.key}
        style={style}
        emojis={row.emojis}
        onSelect={handleSelect}
       />
      );

      return null;
     })}
    </div>
   </div>
  </div>
 );
};

export default ReactionPickerModal;