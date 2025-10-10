import React from 'react';

/**
 * Linkify utility - converts URLs in text to clickable links and displays GIFs inline
 */

// URL regex pattern that matches http(s), www, and common TLDs
const URL_REGEX =
 /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

// GIF URL patterns (Tenor, Giphy, direct .gif links)
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

// Extract actual GIF URL from Tenor page URL
const getTenorGifUrl = (url) => {
 // If it's already a direct media URL, return it
 if (url.includes('media.tenor.com') || url.includes('media1.tenor.com')) {
  return url;
 }

 // For tenor.com/view/ URLs, try to extract the GIF ID and construct media URL
 const viewMatch = url.match(/tenor\.com\/view\/.*-(\d+)$/i);
 if (viewMatch) {
  const gifId = viewMatch[1];
  // Note: This is a fallback - ideally the backend should handle Tenor API
  return `https://media.tenor.com/${gifId}/tenor.gif`;
 }

 return url;
};

/**
 * Converts plain text with URLs into an array of React elements with clickable links and inline GIFs
 * @param {string} text - The text to linkify
 * @returns {Array} Array of strings, React link elements, and GIF elements
 */
export const linkify = (text) => {
 if (!text) return text;

 const parts = [];
 let lastIndex = 0;
 let match;

 // Create a new regex instance for each call
 const regex = new RegExp(URL_REGEX.source, URL_REGEX.flags);

 while ((match = regex.exec(text)) !== null) {
  const url = match[0];
  const index = match.index;

  // Add text before the URL
  if (index > lastIndex) {
   parts.push(text.substring(lastIndex, index));
  }

  // Determine the full URL with protocol
  let href = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
   href = 'https://' + url;
  }

  // Check if this is a GIF URL
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
      // Fallback to showing the link if GIF fails to load
      e.target.style.display = 'none';
      const fallbackLink = document.createElement('a');
      fallbackLink.href = href;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      fallbackLink.textContent = url;
      fallbackLink.style.color = 'var(--link-color, #0066cc)';
      fallbackLink.style.textDecoration = 'underline';
      e.target.parentNode.appendChild(fallbackLink);
     }}
     loading="lazy"
    />
   );
  } else {
   // Regular link
   parts.push(
    <a
     key={`link-${index}`}
     href={href}
     target="_blank"
     rel="noopener noreferrer"
     onClick={(e) => e.stopPropagation()}
     style={{
      color: 'var(--link-color, #0066cc)',
      textDecoration: 'underline',
      wordBreak: 'break-all',
     }}
    >
     {url}
    </a>
   );
  }

  lastIndex = regex.lastIndex;
 }

 // Add remaining text after the last URL
 if (lastIndex < text.length) {
  parts.push(text.substring(lastIndex));
 }

 return parts.length > 0 ? parts : text;
};

/**
 * React component wrapper for linkified text
 */
export const Linkify = ({ children }) => {
 if (typeof children !== 'string') return children;
 return <>{linkify(children)}</>;
};

export default linkify;
