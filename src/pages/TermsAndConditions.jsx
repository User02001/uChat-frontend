import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';
import { API_BASE_URL } from '../config';
import termsData from './termsData.json';

const TermsAndConditions = () => {
 const navigate = useNavigate();
 const [activeSection, setActiveSection] = useState('introduction');
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 useEffect(() => {
  document.title = "uChat | Terms & Conditions";

  let link = document.querySelector("link[rel='icon']");
  if (!link) {
   link = document.createElement("link");
   link.rel = "icon";
   document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = "/resources/favicons/main.png";
 }, []);

 useEffect(() => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };

  darkModeMediaQuery.addEventListener('change', handleThemeChange);

  return () => {
   darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  };
 }, []);

 const toggleMobileMenu = () => {
  setMobileMenuOpen(!mobileMenuOpen);
 };

 const selectSection = (sectionId) => {
  setActiveSection(sectionId);
  setMobileMenuOpen(false);

  const contentArea = document.querySelector('.terms-content-area');
  if (contentArea) {
   contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  }
 };

 const currentSectionIndex = termsData.sections.findIndex(s => s.id === activeSection);
 const currentSection = termsData.sections[currentSectionIndex];

 return (
  <div className="terms-container">
   <header className="terms-header">
    <div className="header-container">
     <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
      <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
     </button>

     <div className="logo-section">
      <div className="logo">
       <img draggable="false" src="/resources/main-logo.svg" alt="uChat" />
      </div>
      <div className="header-title">
       <h1>Terms & Conditions</h1>
      </div>
     </div>

     <div className="header-right">
      <button className="header-btn" onClick={() => navigate('/chat')} title="Home">
       <i className="fas fa-home"></i>
      </button>
      <button className="header-btn" onClick={() => navigate('/profile')} title="Profile">
       <i className="fas fa-user"></i>
      </button>
      <button className="header-btn" onClick={() => navigate('/privacy')} title="Privacy Policy">
       <i className="fas fa-user-shield"></i>
      </button>
     </div>
    </div>
   </header>

   <div className="terms-main">
    <div className="terms-content">
     <aside className={`sections-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header-info">
       <h3 className="sections-title">Table of Contents</h3>
       <p className="last-updated">Last updated: {termsData.lastUpdated}</p>
      </div>

      <div className="sections-list">
       {termsData.sections.map((section) => (
        <button
         key={section.id}
         className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
         onClick={() => selectSection(section.id)}
        >
         <i className={`${section.icon} section-icon`}></i>
         <span className="section-name">{section.title}</span>
        </button>
       ))}
      </div>
     </aside>

     {mobileMenuOpen && (
      <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
     )}

     <main className="terms-content-area">
      {currentSection && (
       <>
        <div className="section-header">
         <i className={`${currentSection.icon} section-header-icon`}></i>
         <div className="section-info">
          <h2>{currentSection.title}</h2>
         </div>
        </div>

        <div className="section-content">
         <div className="content-intro">
          <p>{currentSection.content.intro}</p>
         </div>

         <div className="content-paragraphs">
          {currentSection.content.paragraphs.map((paragraph, index) => (
           <p key={index}>{paragraph}</p>
          ))}
         </div>

         {currentSection.content.list && (
          <div className="content-list">
           <h4>{currentSection.content.list.title}</h4>
           <ul>
            {currentSection.content.list.items.map((item, index) => (
             <li key={index}>{item}</li>
            ))}
           </ul>
          </div>
         )}
        </div>

        <div className="section-navigation">
         {currentSectionIndex > 0 && (
          <button
           className="nav-btn prev-btn"
           onClick={() => selectSection(termsData.sections[currentSectionIndex - 1].id)}
          >
           <i className="fas fa-arrow-left"></i>
           Previous
          </button>
         )}
         {currentSectionIndex < termsData.sections.length - 1 && (
          <button
           className="nav-btn next-btn"
           onClick={() => selectSection(termsData.sections[currentSectionIndex + 1].id)}
          >
           Next
           <i className="fas fa-arrow-right"></i>
          </button>
         )}
        </div>

        <div className="contact-card">
         <i className="fas fa-question-circle contact-icon"></i>
         <div className="contact-info">
          <h3>Have questions about our terms?</h3>
          <p>Contact us for clarification or assistance</p>
         </div>
         <button
          className="contact-btn"
          onClick={() => window.location.href = "mailto:ufonic.official@gmail.com"}
         >
          <i className="fas fa-envelope"></i>
          Contact Us
         </button>
        </div>
       </>
      )}
     </main>
    </div>
   </div>
  </div>
 );
};

export default TermsAndConditions;