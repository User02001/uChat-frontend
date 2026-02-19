import React from 'react';

const URL_REGEX =
 /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

const isGifUrl = (url) => {
 const gifPatterns = [
  /tenor\.com\/view\//i,
  /tenor\.com\/.*\.gif/i,
  /media\.tenor\.com/i,
  /giphy\.com\/gifs\//i,
  /media\.giphy\.com/i,
  /\.gif(\?|$)/i,
 ];
 return gifPatterns.some((pattern) => pattern.test(url));
};

const getTenorGifUrl = (url) => {
 if (url.includes('media.tenor.com') || url.includes('media1.tenor.com')) {
  return url;
 }
 const viewMatch = url.match(/tenor\.com\/view\/.*-(\d+)$/i);
 if (viewMatch) {
  const gifId = viewMatch[1];
  return `https://media.tenor.com/${gifId}/tenor.gif`;
 }
 return url;
};

export const linkify = (text) => {
 if (!text) return text;

 const parts = [];
 let lastIndex = 0;
 let match;

 const regex = new RegExp(URL_REGEX.source, URL_REGEX.flags);

 while ((match = regex.exec(text)) !== null) {
  const url = match[0];
  const index = match.index;

  if (index > lastIndex) {
   parts.push(text.substring(lastIndex, index));
  }

  let href = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
   href = 'https://' + url;
  }

  if (isGifUrl(href)) {
   const gifUrl = getTenorGifUrl(href);
   parts.push(
    <img
     key={`gif-${index}`}
     src={gifUrl}
     alt="GIF"
     className="shared-image"
     style={{
      display: 'block',
      maxWidth: '300px',
      width: '100%',
      height: 'auto',
      maxHeight: '400px',
      objectFit: 'cover',
      cursor: 'pointer',
      borderRadius: '8px',
      marginTop: '4px',
      marginBottom: '4px',
     }}
     onError={(e) => {
      e.target.style.display = 'none';
      const fallbackLink = document.createElement('a');
      fallbackLink.href = href;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.textContent = url;
      fallbackLink.style.color = 'var(--link-color)';
      fallbackLink.style.textDecoration = 'underline';
      e.target.parentNode.appendChild(fallbackLink);
     }}
     loading="lazy"
    />
   );
  } else {
   parts.push(
    <a
     key={`link-${index}`}
     href={href}
     target="_blank"
     rel="noopener noreferrer"
     onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      if (window.__linkWarningConfirm) {
       window.__linkWarningConfirm(href);
      } else {
       window.open(href, '_blank', 'noopener,noreferrer');
      }
     }}
     className="linkified-url"
    >
     {url}
    </a>
   );
  }

  lastIndex = regex.lastIndex;
 }

 if (lastIndex < text.length) {
  parts.push(text.substring(lastIndex));
 }

 return parts.length > 0 ? parts : text;
};

export const Linkify = ({ children }) => {
 if (typeof children !== 'string') return children;
 return <>{linkify(children)}</>;
};

export default linkify;