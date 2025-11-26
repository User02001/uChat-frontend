import React, { useState, useEffect, useRef } from 'react';
import styles from './Sidebar.module.css';
import { useSidebarLogic } from '../hooks/useSidebarLogic';

const Sidebar = ({ showMobileChat = false, showMobileSearch = false, onLogout, contacts = [], onSelectContact, activeContact, API_BASE_URL }) => {
 const [activeTab, setActiveTab] = useState('chats');
 const [showMore, setShowMore] = useState(false);
 const [clickedButtons, setClickedButtons] = useState(new Set());
 const moreMenuRef = useRef(null);

 const { isElectron } = useSidebarLogic();

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

 const handleButtonClick = (buttonId) => {
  setClickedButtons(prev => new Set(prev).add(buttonId));
 };

 const handleButtonMouseLeave = (buttonId) => {
  setClickedButtons(prev => {
   const newSet = new Set(prev);
   newSet.delete(buttonId);
   return newSet;
  });
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

 const visibleContacts = contacts.slice(0, 6);

 return (
  <div className={`${styles.navSidebar} ${showMobileChat ? styles.mobileHidden : ''} ${showMobileSearch ? styles.searchHidden : ''}`}>
   <div className={styles.navButtons}>
    <div className={styles.navLogo}>
     <img
      src="/resources/icons/sidebar_logo.svg"
      alt="uChat"
      className={styles.navLogoIcon}
      draggable="false"
     />
    </div>

    <div className={styles.navSeparator}></div>

    {visibleContacts.map((contact) => (
     <button
      key={contact.id}
      className={`${styles.navBtn} ${styles.navContactBtn} ${activeContact?.id === contact.id ? styles.active : ''} ${clickedButtons.has(`contact-${contact.id}`) ? styles.hideTooltip : ''}`}
      onClick={() => {
       handleButtonClick(`contact-${contact.id}`);
       onSelectContact && onSelectContact(contact);
      }}
      onMouseLeave={() => handleButtonMouseLeave(`contact-${contact.id}`)}
     >
      <img
       src={
        contact.avatar_url
         ? `${API_BASE_URL}${contact.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt=""
       className={styles.navContactAvatar}
       draggable="false"
      />
      <span className={styles.navTooltip}>{contact.username}</span>
     </button>
    ))}
   </div>

   <div className={styles.navBottom}>
    <div className={styles.navSeparator}></div>

    <button
     className={`${styles.navBtn} ${activeTab === 'help' ? styles.active : ''} ${clickedButtons.has('help') ? styles.hideTooltip : ''}`}
     onClick={() => {
      handleButtonClick('help');
      handleTabClick('help');
     }}
     onMouseLeave={() => handleButtonMouseLeave('help')}
    >
     <i className="fas fa-question-circle"></i>
     <span className={styles.navTooltip}>Help Center</span>
    </button>

    {!isElectron && (
     <button
      className={`${styles.navBtn} ${activeTab === 'downloads' ? styles.active : ''} ${clickedButtons.has('downloads') ? styles.hideTooltip : ''}`}
      onClick={() => {
       handleButtonClick('downloads');
       handleTabClick('downloads');
      }}
      onMouseLeave={() => handleButtonMouseLeave('downloads')}
     >
      <i className="fas fa-download"></i>
      <span className={styles.navTooltip}>Download uChat</span>
     </button>
    )}

    <button
     className={`${styles.navBtn} ${activeTab === 'profile' ? styles.active : ''} ${clickedButtons.has('profile') ? styles.hideTooltip : ''}`}
     onClick={() => {
      handleButtonClick('profile');
      handleTabClick('profile');
     }}
     onMouseLeave={() => handleButtonMouseLeave('profile')}
    >
     <i className="fas fa-user-circle"></i>
     <span className={styles.navTooltip}>Profile</span>
    </button>

    <button
     className={`${styles.navBtn} ${styles.logoutBtn} ${clickedButtons.has('logout') ? styles.hideTooltip : ''}`}
     onClick={() => {
      handleButtonClick('logout');
      onLogout();
     }}
     onMouseLeave={() => handleButtonMouseLeave('logout')}
    >
     <i className="fas fa-sign-out-alt"></i>
     <span className={styles.navTooltip}>Logout</span>
    </button>
   </div>

   <div className={styles.mobileNav}>
    <button
     className={`${styles.mobileNavBtn} ${activeTab === 'chats' ? styles.active : ''}`}
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
     className={`${styles.mobileNavBtn} ${activeTab === 'calls' ? styles.active : ''}`}
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
     className={`${styles.mobileNavBtn} ${activeTab === 'groups' ? styles.active : ''}`}
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
     className={styles.mobileNavBtn}
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
     <div className={styles.mobileMoreMenu}>
      <button
       className={styles.mobileMoreItem}
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
       className={styles.mobileMoreItem}
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
       className={`${styles.mobileMoreItem} ${styles.logoutItem}`}
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