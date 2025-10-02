import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Help.css';
import { API_BASE_URL } from '../config';
import helpData from './helpData.json';

const Help = () => {
 const navigate = useNavigate();
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [activeCategory, setActiveCategory] = useState('getting-started');
 const [searchQuery, setSearchQuery] = useState('');
 const [expandedQuestions, setExpandedQuestions] = useState([]);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 useEffect(() => {
  checkAuth();
 }, []);

 useEffect(() => {
  document.title = "uChat | Help Center";
 }, []);

 const checkAuth = async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    setUser(data.user);
   } else {
    navigate('/login', { replace: true });
    return;
   }
  } catch (error) {
   console.error('Auth check failed:', error);
   navigate('/login', { replace: true });
   return;
  } finally {
   setLoading(false);
  }
 };

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

 const toggleQuestion = (questionId) => {
  setExpandedQuestions(prev =>
   prev.includes(questionId)
    ? prev.filter(id => id !== questionId)
    : [...prev, questionId]
  );
 };

 const toggleMobileMenu = () => {
  setMobileMenuOpen(!mobileMenuOpen);
 };

 const selectCategory = (categoryId) => {
  setActiveCategory(categoryId);
  setMobileMenuOpen(false);
  setExpandedQuestions([]);
 };

 const filteredData = helpData.categories
  .map(category => ({
   ...category,
   questions: category.questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchQuery.toLowerCase())
   )
  }))
  .filter(category => category.questions.length > 0);

 const currentCategory = searchQuery
  ? filteredData.find(c => c.id === activeCategory) || filteredData[0]
  : helpData.categories.find(c => c.id === activeCategory);

 if (loading) {
  return (
   <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading Help Center...</p>
   </div>
  );
 }

 return (
  <div className="help-container">
   <header className="help-header">
    <div className="header-container">
     <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
      <i className={`fas fa-${mobileMenuOpen ? 'times' : 'bars'}`}></i>
     </button>

     <div className="logo-section">
      <div className="logo">
       <img draggable="false" src="/resources/main-logo.svg" alt="uChat" />
      </div>
      <div className="header-title">
       <h1>Help Center</h1>
      </div>
     </div>

     <div className="header-right">
      <button className="header-btn" onClick={() => navigate('/chat')}>
       <i className="fas fa-home"></i>
      </button>
      <button className="header-btn" onClick={() => navigate('/profile')}>
       <i className="fas fa-user"></i>
      </button>
     </div>
    </div>
   </header>

   <div className="help-main">
    <div className="help-content">
     <aside className={`categories-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="search-container">
       <i className="fas fa-search search-icon"></i>
       <input
        type="text"
        placeholder="Search for help..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
       />
      </div>

      <h3 className="categories-title">Categories</h3>
      <div className="categories-list">
       {(searchQuery ? filteredData : helpData.categories).map((category) => (
        <button
         key={category.id}
         className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
         onClick={() => selectCategory(category.id)}
        >
         <i className={`${category.icon} category-icon`}></i>
         <span className="category-name">{category.name}</span>
        </button>
       ))}
      </div>
     </aside>

     {mobileMenuOpen && (
      <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
     )}

     <main className="questions-area">
      {currentCategory ? (
       <>
        <div className="category-header">
         <i className={`${currentCategory.icon} category-header-icon`}></i>
         <div className="category-info">
          <h2>{currentCategory.name}</h2>
          <p>{currentCategory.description}</p>
         </div>
        </div>

        <div className="questions-list">
         {currentCategory.questions.map((item) => (
          <div key={item.id} className="question-card">
           <button
            className={`question-btn ${expandedQuestions.includes(item.id) ? 'expanded' : ''}`}
            onClick={() => toggleQuestion(item.id)}
           >
            <span className="question-text">{item.question}</span>
            <i className="fas fa-chevron-down chevron-icon"></i>
           </button>
           {expandedQuestions.includes(item.id) && (
            <div className="answer-content">
             <p>{item.answer}</p>
             {item.steps && (
              <ol className="answer-steps">
               {item.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
               ))}
              </ol>
             )}
            </div>
           )}
          </div>
         ))}
        </div>

        <div className="support-card">
         <i className="fas fa-headset support-icon"></i>
         <div className="support-info">
          <h3>Still need help?</h3>
          <p>Our support team is here to assist you</p>
         </div>
         <button
          className="support-btn"
          onClick={() => window.location.href = "mailto:ufonic.official@gmail.com"}
         >
          <i className="fas fa-envelope"></i>
          Contact Support
         </button>
        </div>
       </>
      ) : (
       <div className="no-results">
        <i className="fas fa-search"></i>
        <h3>No results found</h3>
        <p>Try adjusting your search query</p>
       </div>
      )}
     </main>
    </div>
   </div>
  </div>
 );
};

export default Help;