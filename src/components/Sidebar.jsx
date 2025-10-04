import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';

const Sidebar = ({ showMobileChat = false, onLogout }) => {
 const [activeTab, setActiveTab] = useState('chats');
 const [showMore, setShowMore] = useState(false);
 const [isDarkMode, setIsDarkMode] = useState(false);
 const moreMenuRef = useRef(null);

 const [isElectron, setIsElectron] = useState(false); // detect electron who we dont have to display downloads button

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

 useEffect(() => {
  // Detect if running in Electron
  setIsElectron(window.navigator.userAgent.toLowerCase().includes('electron'));
 }, []);

 const handleTabClick = (tab) => {
  setActiveTab(tab);

  if (tab === 'profile') {
   window.location.href = '/profile';
  }
  if (tab === 'help') {
   window.location.href = '/help';
  }
  if (tab === 'downloads') {
   window.location.href = '/downloads';
  }
  if (tab === 'terms') {
   window.location.href = '/terms';
  }
  if (tab === 'privacy') {
   window.location.href = '/privacy';
  }
  if (tab === 'calls') {
   window.location.href = '/calls';
  }
  if (tab === 'groups') {
   window.location.href = '/groups';
  }
  if (tab === 'stories') {
   window.location.href = '/stories';
  }
  if (tab === 'settings') {
   window.location.href = '/settings';
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
     className={`nav-btn ${activeTab === 'help' ? 'active' : ''}`}
     title="Help Center"
     onClick={() => handleTabClick('help')}
    >
     <i className="fas fa-question-circle"></i>
    </button>

    {!isElectron && (
     <button
      className={`nav-btn ${activeTab === 'downloads' ? 'active' : ''}`}
      title="Downloads"
      onClick={() => handleTabClick('downloads')}
     >
      <i className="fas fa-download"></i>
     </button>
    )}

    <button
     className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
     title="Profile"
     onClick={() => handleTabClick('profile')}
    >
     <i className="fas fa-user-circle"></i>
    </button>

    <button
     className={`nav-btn ${activeTab === 'terms' ? 'active' : ''}`}
     title="Terms & Conditions"
     onClick={() => handleTabClick('terms')}
    >
     <i className="fas fa-file-contract"></i>
    </button>

    <button
     className={`nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
     title="Privacy Policy"
     onClick={() => handleTabClick('privacy')}
    >
     <i className="fas fa-user-shield"></i>
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
     onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTabClick('chats');
     }}
     onTouchStart={() => { }}
     onTouchEnd={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTabClick('chats');
     }}
     style={{
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
     }}
    >
     <i className="fas fa-comment-dots"></i>
     <span>Chats</span>
    </button>
    <button
     className={`mobile-nav-btn ${activeTab === 'calls' ? 'active' : ''}`}
     onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTabClick('calls');
     }}
     onTouchStart={() => { }}
     onTouchEnd={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTabClick('calls');
     }}
     style={{
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
     }}
    >
     <i className="fas fa-phone"></i>
     <span>Calls</span>
    </button>
    <button
     className={`mobile-nav-btn ${activeTab === 'groups' ? 'active' : ''}`}
     onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTabClick('groups');
     }}
     onTouchStart={() => { }}
     onTouchEnd={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTabClick('groups');
     }}
     style={{
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
     }}
    >
     <i className="fas fa-users"></i>
     <span>Groups</span>
    </button>
    <button
     className="mobile-nav-btn"
     onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowMore(!showMore);
     }}
     onTouchStart={() => { }}
     onTouchEnd={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowMore(!showMore);
     }}
     ref={moreMenuRef}
     style={{
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
     }}
    >
     <i className="fas fa-ellipsis-h"></i>
     <span>More</span>
    </button>

    {showMore && (
     <div className="mobile-more-menu">
      <button
       className="mobile-more-item"
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTabClick('help');
        setShowMore(false);
       }}
       onTouchStart={() => { }}
       onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTabClick('help');
        setShowMore(false);
       }}
       style={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
       }}
      >
       <i className="fas fa-question-circle"></i>
       <span>Help Center</span>
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
       className="mobile-more-item"
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTabClick('terms');
        setShowMore(false);
       }}
       onTouchStart={() => { }}
       onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTabClick('terms');
        setShowMore(false);
       }}
       style={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
       }}
      >
       <i className="fas fa-file-contract"></i>
       <span>T&C</span>
      </button>
      <button
       className="mobile-more-item"
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTabClick('privacy');
        setShowMore(false);
       }}
       onTouchStart={() => { }}
       onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTabClick('privacy');
        setShowMore(false);
       }}
       style={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
       }}
      >
       <i className="fas fa-user-shield"></i>
       <span>Privacy</span>
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