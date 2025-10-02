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

  const routes = {
   profile: '/profile',
   help: '/help',
   downloads: '/downloads',
   terms: '/terms',
   privacy: '/privacy',
   calls: '/calls',
   groups: '/groups',
   stories: '/stories',
   settings: '/settings'
  };

  if (routes[tab]) {
   window.location.href = routes[tab];
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
   document.addEventListener('touchstart', handleClickOutside);
  }

  return () => {
   document.removeEventListener('mousedown', handleClickOutside);
   document.removeEventListener('touchstart', handleClickOutside);
  };
 }, [showMore]);

 const createTouchHandler = (action) => ({
  onClick: (e) => {
   e.preventDefault();
   e.stopPropagation();
   action();
  },
  onTouchEnd: (e) => {
   e.preventDefault();
   e.stopPropagation();
   action();
  },
  style: {
   cursor: 'pointer',
   userSelect: 'none',
   WebkitTapHighlightColor: 'transparent',
   touchAction: 'manipulation'
  }
 });

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

    <button
     className={`nav-btn ${activeTab === 'downloads' ? 'active' : ''}`}
     title="Downloads"
     onClick={() => handleTabClick('downloads')}
    >
     <i className="fas fa-download"></i>
    </button>

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
     {...createTouchHandler(() => handleTabClick('chats'))}
    >
     <i className="fas fa-comment-dots"></i>
     <span>Chats</span>
    </button>

    <button
     className={`mobile-nav-btn ${activeTab === 'calls' ? 'active' : ''}`}
     {...createTouchHandler(() => handleTabClick('calls'))}
    >
     <i className="fas fa-phone"></i>
     <span>Calls</span>
    </button>

    <button
     className={`mobile-nav-btn ${activeTab === 'groups' ? 'active' : ''}`}
     {...createTouchHandler(() => handleTabClick('groups'))}
    >
     <i className="fas fa-users"></i>
     <span>Groups</span>
    </button>

    <button
     className="mobile-nav-btn"
     {...createTouchHandler(() => setShowMore(!showMore))}
     ref={moreMenuRef}
    >
     <i className="fas fa-ellipsis-h"></i>
     <span>More</span>
    </button>

    {showMore && (
     <div className="mobile-more-menu">
      <button
       className="mobile-more-item"
       {...createTouchHandler(() => {
        handleTabClick('stories');
        setShowMore(false);
       })}
      >
       <i className="fas fa-circle-play"></i>
       <span>Stories</span>
      </button>

      <button
       className="mobile-more-item"
       {...createTouchHandler(() => {
        handleTabClick('settings');
        setShowMore(false);
       })}
      >
       <i className="fas fa-cog"></i>
       <span>Settings</span>
      </button>

      <button
       className="mobile-more-item"
       {...createTouchHandler(() => {
        handleTabClick('help');
        setShowMore(false);
       })}
      >
       <i className="fas fa-question-circle"></i>
       <span>Help Center</span>
      </button>

      <button
       className="mobile-more-item"
       {...createTouchHandler(() => {
        handleTabClick('profile');
        setShowMore(false);
       })}
      >
       <i className="fas fa-user-circle"></i>
       <span>Profile</span>
      </button>

      <button
       className="mobile-more-item"
       {...createTouchHandler(() => {
        handleTabClick('terms');
        setShowMore(false);
       })}
      >
       <i className="fas fa-file-contract"></i>
       <span>T&C</span>
      </button>

      <button
       className="mobile-more-item"
       {...createTouchHandler(() => {
        handleTabClick('privacy');
        setShowMore(false);
       })}
      >
       <i className="fas fa-user-shield"></i>
       <span>Privacy</span>
      </button>

      <button
       className="mobile-more-item logout-item"
       {...createTouchHandler(() => {
        setShowMore(false);
        if (onLogout) onLogout();
       })}
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