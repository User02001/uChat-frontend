import React, { useState, useEffect, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { styles } from '../styles/sidebar';
import { useSidebarLogic } from '../hooks/useSidebarLogic';
import Icon from './Icon';

const Sidebar = ({ showMobileChat = false, showMobileSearch = false, onLogout, contacts = [], onSelectContact, activeContact, API_BASE_URL }) => {
 const [activeTab, setActiveTab] = useState('chats');
 const [showMore, setShowMore] = useState(false);
 const [clickedButtons, setClickedButtons] = useState(new Set());
 const [hoveredButton, setHoveredButton] = useState(null);
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
  <div {...stylex.props(
   styles.navSidebar,
   showMobileChat && styles.mobileHidden,
   showMobileSearch && styles.searchHidden
  )}>
   <div {...stylex.props(styles.navButtons)}>
    <div {...stylex.props(styles.navLogo)}>
     <Icon
      name="sidebar_logo"
      alt="uChat"
      {...stylex.props(styles.navLogoIcon)}
      draggable="false"
     />
    </div>

    <div {...stylex.props(styles.navSeparator)}></div>

    {visibleContacts.map((contact) => (
     <button
      key={contact.id}
      {...stylex.props(
       styles.navBtn,
       styles.navContactBtn,
       activeContact?.id === contact.id && styles.active,
       activeContact?.id === contact.id && styles.navContactBtnActive,
      )}
      onClick={() => {
       handleButtonClick(`contact-${contact.id}`);
       onSelectContact && onSelectContact(contact);
      }}
      onMouseEnter={() => !clickedButtons.has(`contact-${contact.id}`) && setHoveredButton(`contact-${contact.id}`)}
      onMouseLeave={() => {
       handleButtonMouseLeave(`contact-${contact.id}`);
       setHoveredButton(null);
      }}
     >
      <img
       src={
        contact.avatar_url
         ? `${API_BASE_URL}${contact.avatar_url}`
         : "/resources/default_avatar.png"
       }
       alt=""
       {...stylex.props(styles.navContactAvatar)}
       draggable="false"
      />
      <span {...stylex.props(
       styles.navTooltip,
       hoveredButton === `contact-${contact.id}` && !clickedButtons.has(`contact-${contact.id}`) && styles.navTooltipVisible
      )}>{contact.username}</span>
     </button>
    ))}
   </div>

   <div {...stylex.props(styles.navBottom)}>
    <div {...stylex.props(styles.navSeparator)}></div>

    <button
     {...stylex.props(
      styles.navBtn,
      activeTab === 'help' && styles.active,
     )}
     onClick={() => {
      handleButtonClick('help');
      handleTabClick('help');
     }}
     onMouseEnter={() => !clickedButtons.has('help') && setHoveredButton('help')}
     onMouseLeave={() => {
      handleButtonMouseLeave('help');
      setHoveredButton(null);
     }}
    >
     <i className="fas fa-question-circle"></i>
     <span {...stylex.props(
      styles.navTooltip,
      hoveredButton === 'help' && !clickedButtons.has('help') && styles.navTooltipVisible
     )}>Help Center</span>
    </button>

    {!isElectron && (
     <button
      {...stylex.props(
       styles.navBtn,
       activeTab === 'downloads' && styles.active,
      )}
      onClick={() => {
       handleButtonClick('downloads');
       handleTabClick('downloads');
      }}
      onMouseEnter={() => !clickedButtons.has('downloads') && setHoveredButton('downloads')}
      onMouseLeave={() => {
       handleButtonMouseLeave('downloads');
       setHoveredButton(null);
      }}
     >
      <i className="fas fa-download"></i>
      <span {...stylex.props(
       styles.navTooltip,
       hoveredButton === 'downloads' && !clickedButtons.has('downloads') && styles.navTooltipVisible
      )}>Download uChat</span>
     </button>
    )}

    <button
     {...stylex.props(
      styles.navBtn,
      activeTab === 'profile' && styles.active,
     )}
     onClick={() => {
      handleButtonClick('profile');
      handleTabClick('profile');
     }}
     onMouseEnter={() => !clickedButtons.has('profile') && setHoveredButton('profile')}
     onMouseLeave={() => {
      handleButtonMouseLeave('profile');
      setHoveredButton(null);
     }}
    >
     <i className="fas fa-user-circle"></i>
     <span {...stylex.props(
      styles.navTooltip,
      hoveredButton === 'profile' && !clickedButtons.has('profile') && styles.navTooltipVisible
     )}>Profile</span>
    </button>

    <button
     {...stylex.props(
      styles.navBtn,
      styles.logoutBtn,
     )}
     onClick={() => {
      handleButtonClick('logout');
      onLogout();
     }}
     onMouseEnter={() => !clickedButtons.has('logout') && setHoveredButton('logout')}
     onMouseLeave={() => {
      handleButtonMouseLeave('logout');
      setHoveredButton(null);
     }}
    >
     <i className="fas fa-sign-out-alt"></i>
     <span {...stylex.props(
      styles.navTooltip,
      hoveredButton === 'logout' && !clickedButtons.has('logout') && styles.navTooltipVisible
     )}>Logout</span>
    </button>
   </div>

   <div {...stylex.props(styles.mobileNav)}>
    <button
     {...stylex.props(
      styles.mobileNavBtn,
      activeTab === 'chats'
     )}
     onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      // do nothing
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
     <Icon
      name="chats_mobile"
      alt=""
      {...stylex.props(
       styles.mobileNavBtnIcon,
       activeTab === 'chats' && styles.mobileNavBtnIconActive
      )}
      draggable={false}
     />
     <span {...stylex.props(styles.mobileNavBtnText)}>Chats</span>
    </button>


    <button
     {...stylex.props(
      styles.mobileNavBtn,
      activeTab === 'calls' && styles.mobileNavBtnActive
     )}
     onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
     }}
     onTouchStart={() => { }}
     onTouchEnd={(e) => {
      e.preventDefault();
      e.stopPropagation();
     }}
     style={{
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
     }}
    >
     <Icon
      name="calls"
      alt=""
      {...stylex.props(
       styles.mobileNavBtnIcon,
       activeTab === 'calls' && styles.mobileNavBtnIconActive
      )}
      draggable={false}
     />
     <span {...stylex.props(styles.mobileNavBtnText)}>Calls</span>
    </button>

    <button
     {...stylex.props(styles.mobileNavBtn)}
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
     <Icon
      name="more"
      alt="More"
      {...stylex.props(
       styles.mobileNavBtnIcon,
      )}
      draggable={false}
     />
     <span {...stylex.props(styles.mobileNavBtnText)}>More</span>
    </button>

    {showMore && (
     <div {...stylex.props(styles.mobileMoreMenu)}>
      <button
       {...stylex.props(styles.mobileMoreItem)}
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
       <i {...stylex.props(styles.mobileMoreItemIcon)} className="fas fa-question-circle"></i>
       <span>Help Center</span>
      </button>

      <button
       {...stylex.props(styles.mobileMoreItem)}
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
       <i {...stylex.props(styles.mobileMoreItemIcon)} className="fas fa-user-circle"></i>
       <span>Profile</span>
      </button>

      <button
       {...stylex.props(styles.mobileMoreItem)}
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
       <i {...stylex.props(styles.mobileMoreItemIcon)} className="fas fa-sign-out-alt"></i>
       <span>Logout</span>
      </button>
     </div>
    )}
   </div>
  </div>
 );
};

export default Sidebar;