import React, { useState, useEffect, useRef } from 'react';
import './Gifs.css';

const Gifs = ({ onSelectGif, onClose }) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [gifs, setGifs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [featured, setFeatured] = useState(true);
 const modalRef = useRef(null);

 const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2';
 const TENOR_KEY = 'AIzaSyDMchXk1LmxF_UmEuiXV-HjkKNl40UDbjc'; // your real key
 const CLIENT_KEY = 'uChat'; // arbitrary name for your app

 useEffect(() => {
  loadTrendingGifs();
 }, []);

 useEffect(() => {
  const handleClickOutside = (e) => {
   if (modalRef.current && !modalRef.current.contains(e.target)) {
    onClose();
   }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
 }, [onClose]);

 const loadTrendingGifs = async () => {
  setLoading(true);
  try {
   const response = await fetch(
    `${TENOR_BASE_URL}/featured?key=${TENOR_KEY}&client_key=${CLIENT_KEY}&limit=30`
   );
   if (!response.ok) throw new Error('Bad response');
   const data = await response.json();
   setGifs(data.results || []);
   setFeatured(true);
  } catch (err) {
   console.error('Failed to load trending GIFs:', err);
  } finally {
   setLoading(false);
  }
 };

 const searchGifs = async (query) => {
  if (!query.trim()) {
   loadTrendingGifs();
   return;
  }
  setLoading(true);
  setFeatured(false);
  try {
   const response = await fetch(
    `${TENOR_BASE_URL}/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&client_key=${CLIENT_KEY}&limit=30`
   );
   if (!response.ok) throw new Error('Bad response');
   const data = await response.json();
   setGifs(data.results || []);
  } catch (err) {
   console.error('Failed to search GIFs:', err);
  } finally {
   setLoading(false);
  }
 };

 const handleSearch = (e) => {
  e.preventDefault();
  searchGifs(searchQuery);
 };

 const handleGifClick = (gif) => {
  const gifUrl =
   gif.media_formats?.gif?.url ||
   gif.media_formats?.mediumgif?.url ||
   gif.media_formats?.tinygif?.url;
  onSelectGif(gifUrl);
  onClose();
 };

 return (
  <div className="gif-picker-overlay">
   <div className="gif-picker-modal" ref={modalRef}>
    <div className="gif-picker-header">
     <h3>{featured ? 'Trending GIFs' : 'Search Results'}</h3>
     <button className="gif-picker-close" onClick={onClose}>
      <i className="fas fa-times"></i>
     </button>
    </div>

    <form className="gif-search-form" onSubmit={handleSearch}>
     <input
      type="text"
      placeholder="Search for GIFs..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="gif-search-input"
      autoFocus
     />
     <button type="submit" className="gif-search-btn">
      <i className="fas fa-search"></i>
     </button>
    </form>

    <div className="gif-grid-container">
     {loading ? (
      <div className="gif-loading">
       <div className="loading-spinner"></div>
       <p>Loading GIFs...</p>
      </div>
     ) : gifs.length === 0 ? (
      <div className="gif-empty">
       <p>No GIFs found</p>
      </div>
     ) : (
      <div className="gif-grid">
       {gifs.map((gif) => (
        <div
         key={gif.id}
         className="gif-item"
         onClick={() => handleGifClick(gif)}
        >
         <img
          src={
           gif.media_formats?.tinygif?.url ||
           gif.media_formats?.gif?.url
          }
          alt={gif.content_description || 'GIF'}
          loading="lazy"
         />
        </div>
       ))}
      </div>
     )}
    </div>

    <div className="gif-picker-footer">
     <span>Powered by Tenor</span>
    </div>
   </div>
  </div>
 );
};

export default Gifs;
