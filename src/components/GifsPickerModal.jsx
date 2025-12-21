import React, { useState, useEffect, useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { GifsPickerModalStyles as styles } from "../styles/gifs_picker_modal";

const GifsPickerModal = ({ onSelectGif, onClose }) => {
 const [searchQuery, setSearchQuery] = useState("");
 const [gifs, setGifs] = useState([]);
 const [loading, setLoading] = useState(false);
 const [featured, setFeatured] = useState(true);
 const modalRef = useRef(null);

 const TENOR_BASE_URL = "https://tenor.googleapis.com/v2";
 const TENOR_KEY = "AIzaSyDMchXk1LmxF_UmEuiXV-HjkKNl40UDbjc";
 const CLIENT_KEY = "uChat";

 useEffect(() => {
  loadTrendingGifs();
 }, []);

 useEffect(() => {
  const handleClickOutside = (e) => {
   if (modalRef.current && !modalRef.current.contains(e.target)) {
    onClose();
   }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [onClose]);

 const loadTrendingGifs = async () => {
  setLoading(true);
  try {
   const response = await fetch(
    `${TENOR_BASE_URL}/featured?key=${TENOR_KEY}&client_key=${CLIENT_KEY}&limit=30`
   );
   if (!response.ok) throw new Error("Bad response");
   const data = await response.json();
   setGifs(data.results || []);
   setFeatured(true);
  } catch (err) {
   console.error("Failed to load trending GIFs:", err);
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
    `${TENOR_BASE_URL}/search?q=${encodeURIComponent(
     query
    )}&key=${TENOR_KEY}&client_key=${CLIENT_KEY}&limit=30`
   );
   if (!response.ok) throw new Error("Bad response");
   const data = await response.json();
   setGifs(data.results || []);
  } catch (err) {
   console.error("Failed to search GIFs:", err);
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
  <div {...stylex.props(styles.overlay)}>
   <div {...stylex.props(styles.modal)} ref={modalRef}>
    <div {...stylex.props(styles.header)}>
     <h3 {...stylex.props(styles.headerTitle)}>
      {featured ? "Trending GIFs" : "Search Results"}
     </h3>
     <button {...stylex.props(styles.closeButton)} onClick={onClose} type="button">
      <i className="fas fa-times"></i>
     </button>
    </div>

    <form {...stylex.props(styles.searchForm)} onSubmit={handleSearch}>
     <input
      type="text"
      placeholder="Search for GIFs..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      {...stylex.props(styles.searchInput)}
      autoFocus
     />
     <button type="submit" {...stylex.props(styles.searchButton)}>
      <i className="fas fa-search"></i>
     </button>
    </form>

    <div {...stylex.props(styles.gridContainer)}>
     {loading ? (
      <div {...stylex.props(styles.loadingEmptyWrap)}>
       <div {...stylex.props(styles.spinner)}></div>
       <p>Loading GIFs...</p>
      </div>
     ) : gifs.length === 0 ? (
      <div {...stylex.props(styles.loadingEmptyWrap)}>
       <p>No GIFs found</p>
      </div>
     ) : (
      <div {...stylex.props(styles.grid)}>
       {gifs.map((gif) => (
        <div
         key={gif.id}
         {...stylex.props(styles.gifItem)}
         onClick={() => handleGifClick(gif)}
        >
         <img
          src={gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url}
          alt={gif.content_description || "GIF"}
          loading="lazy"
          {...stylex.props(styles.gifImg)}
         />
        </div>
       ))}
      </div>
     )}
    </div>

    <div {...stylex.props(styles.footer)}>
     <span>Powered by Tenor</span>
    </div>
   </div>
  </div>
 );
};

export default GifsPickerModal;
