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
 const [expandedCategories, setExpandedCategories] = useState(['getting-started']);
 const [activeArticle, setActiveArticle] = useState(null); // null = show all articles
 const [searchQuery, setSearchQuery] = useState('');
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

 const toggleCategory = (categoryId) => {
  setExpandedCategories(prev =>
   prev.includes(categoryId)
    ? prev.filter(id => id !== categoryId)
    : [...prev, categoryId]
  );
 };

 const selectCategory = (categoryId) => {
  setActiveCategory(categoryId);
  setActiveArticle(null); // Show all articles when selecting category
  setMobileMenuOpen(false);

  // Auto-expand the category if not already expanded
  if (!expandedCategories.includes(categoryId)) {
   setExpandedCategories(prev => [...prev, categoryId]);
  }
 };

 const selectArticle = (categoryId, subcategoryId, articleId) => {
  setActiveCategory(categoryId);
  setActiveArticle(articleId);
  setMobileMenuOpen(false);
 };

 const toggleMobileMenu = () => {
  setMobileMenuOpen(!mobileMenuOpen);
 };

 // Search logic
 const getFilteredData = () => {
  if (!searchQuery) return helpData.categories;

  const query = searchQuery.toLowerCase();
  return helpData.categories.map(category => ({
   ...category,
   subcategories: category.subcategories.map(subcategory => ({
    ...subcategory,
    articles: subcategory.articles.filter(article =>
     article.title.toLowerCase().includes(query) ||
     article.content.toLowerCase().includes(query)
    )
   })).filter(subcategory => subcategory.articles.length > 0)
  })).filter(category => category.subcategories.length > 0);
 };

 const filteredData = getFilteredData();
 const currentCategory = filteredData.find(c => c.id === activeCategory) || filteredData[0];

 // Get current article if one is selected
 const currentArticleData = currentCategory && activeArticle
  ? currentCategory.subcategories
   .flatMap(sub => sub.articles)
   .find(article => article.id === activeArticle)
  : null;

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
       {filteredData.map((category) => (
        <div key={category.id} className="category-group">
         <button
          className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => {
           toggleCategory(category.id);
          }}
         >
          <i className={`${category.icon} category-icon`}></i>
          <span className="category-name">{category.name}</span>
          <i className={`fas fa-chevron-down chevron-icon ${expandedCategories.includes(category.id) ? 'expanded' : ''}`}></i>
         </button>

         {expandedCategories.includes(category.id) && (
          <div className="subcategories-list">
           {category.subcategories.map((subcategory) => (
            <button
             key={subcategory.id}
             className="subcategory-btn"
             onClick={() => {
              setActiveCategory(category.id);
              setActiveArticle(subcategory.articles[0]?.id || null);
              setMobileMenuOpen(false);
             }}
            >
             {subcategory.name}
            </button>
           ))}
          </div>
         )}
        </div>
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

        {/* Show single article if selected */}
        {currentArticleData ? (
         <div className="single-article-view">
          <button
           className="back-button"
           onClick={() => setActiveArticle(null)}
          >
           <i className="fas fa-arrow-left"></i> Back to all articles
          </button>

          <article className="article-content">
           <h1>{currentArticleData.title}</h1>
           <div className="article-body">
            {currentArticleData.content.split('\n\n').map((paragraph, idx) => (
             <p key={idx}>{paragraph}</p>
            ))}
           </div>
          </article>
         </div>
        ) : (
         /* Show all articles grouped by subcategory */
         <div className="articles-list">
          {currentCategory.subcategories && currentCategory.subcategories.length > 0 ? (
           currentCategory.subcategories.map((subcategory) => (
            <div key={subcategory.id} className="subcategory-section">
             <h3 className="subcategory-heading">{subcategory.name}</h3>
             <div className="articles-grid">
              {subcategory.articles.map((article) => (
               <button
                key={article.id}
                className="article-card"
                onClick={() => selectArticle(currentCategory.id, subcategory.id, article.id)}
               >
                <h4>{article.title}</h4>
                <p>{article.content.substring(0, 120)}...</p>
                <span className="read-more">
                 Read more <i className="fas fa-arrow-right"></i>
                </span>
               </button>
              ))}
             </div>
            </div>
           ))
          ) : (
           <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No results found</h3>
            <p>Try adjusting your search query</p>
           </div>
          )}
         </div>
        )}

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