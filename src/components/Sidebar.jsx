import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';

const Sidebar = ({ showMobileChat = false, onLogout }) => {
 const [activeTab, setActiveTab] = useState('chats');
 const [showMore, setShowMore] = useState(false);
 const [isDarkMode, setIsDarkMode] = useState(false);
 const moreMenuRef = useRef(null);

 useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  setIsDarkMode(mediaQuery.matches);

  const handleChange = (e) => setIsDarkMode(e.matches);
  mediaQuery.addEventListener('change', handleChange);

  return () => mediaQuery.removeEventListener('change', handleChange);
 }, []);

 useEffect(() => {
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
 }, [isDarkMode]);

 const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === 'profile') {
   window.location.href = '/profile';
  }
 };

 useEffect(() => {
  const handleClickOutside = (event) => {
   if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
    setShowMore(false);
   }
  };

  if (showMore) {
   document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
   document.removeEventListener('mousedown', handleClickOutside);
  };
 }, [showMore]);

 return (
  <div className={`nav-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}>
   <div className="nav-buttons">
    <button
     className={`nav-btn ${activeTab === 'chats' ? 'active' : ''}`}
     title="Chats"
     onClick={() => handleTabClick('chats')}
    >
     <i className="fas fa-comment-dots"></i>
    </button>
   </div>


   <div className="nav-bottom">
    <button
     className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
     title="Profile"
     onClick={() => handleTabClick('profile')}
    >
     <i className="fas fa-user-circle"></i>
    </button>

    <button
     className="nav-btn logout-btn"
     title="Logout"
     onClick={onLogout}
    >
     <i className="fas fa-sign-out-alt"></i>
    </button>
   </div>

   <div className="mobile-nav">
    <button
     className={`mobile-nav-btn ${activeTab === 'chats' ? 'active' : ''}`}
     onClick={() => handleTabClick('chats')}
    >
     <i className="fas fa-comment-dots"></i>
     <span>Chats</span>
    </button>
    <button
     className={`mobile-nav-btn ${activeTab === 'calls' ? 'active' : ''}`}
     onClick={() => handleTabClick('calls')}
    >
     <i className="fas fa-phone"></i>
     <span>Calls</span>
    </button>
    <button
     className={`mobile-nav-btn ${activeTab === 'groups' ? 'active' : ''}`}
     onClick={() => handleTabClick('groups')}
    >
     <i className="fas fa-users"></i>
     <span>Groups</span>
    </button>
    <button className="mobile-nav-btn" onClick={() => setShowMore(!showMore)} ref={moreMenuRef}>
     <i className="fas fa-ellipsis-h"></i>
     <span>More</span>
    </button>

    {showMore && (
     <div className="mobile-more-menu">
      <button
       className="mobile-more-item"
       onClick={() => {
        handleTabClick('stories');
        setShowMore(false);
       }}
      >
       <i className="fas fa-circle-play"></i>
       <span>Stories</span>
      </button>
      <button
       className="mobile-more-item"
       onClick={() => {
        handleTabClick('settings');
        setShowMore(false);
       }}
      >
       <i className="fas fa-cog"></i>
       <span>Settings</span>
      </button>
      <button
       className="mobile-more-item"
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(false);
        handleTabClick('profile');
       }}
       onTouchStart={() => { }}
       onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(false);
        handleTabClick('profile');
       }}
       style={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
       }}
      >
       <i className="fas fa-user-circle"></i>
       <span>Profile</span>
      </button>
      <button
       className="mobile-more-item logout-item"
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(false);
        if (onLogout) {
         onLogout();
        }
       }}
       onTouchStart={() => { }}
       onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMore(false);
        if (onLogout) {
         onLogout();
        }
       }}
       style={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
       }}
      >
       <i className="fas fa-sign-out-alt"></i>
       <span>Logout</span>
      </button>
     </div>
    )}
   </div>
  </div>
 );
};

export default Sidebar;