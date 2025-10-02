import React, { useState, useEffect } from 'react';
import './Downloads.css';

const Downloads = () => {
 const [releases, setReleases] = useState([]);
 const [loading, setLoading] = useState(true);
 const [theme, setTheme] = useState('light');

 useEffect(() => {
  // Set page title and favicon
  document.title = 'uChat | Downloads';
  // Update favicon
  const favicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
  favicon.type = 'image/png';
  favicon.rel = 'icon';
  favicon.href = '/resources/favicon.png';
  document.getElementsByTagName('head')[0].appendChild(favicon);

  // Detect initial theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = prefersDark ? 'dark' : 'light';
  setTheme(initialTheme);
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Listen for theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
   const newTheme = e.matches ? 'dark' : 'light';
   setTheme(newTheme);
   document.documentElement.setAttribute('data-theme', newTheme);
  };
  mediaQuery.addEventListener('change', handleThemeChange);

  fetchReleases();

  return () => mediaQuery.removeEventListener('change', handleThemeChange);
 }, []);

 const fetchReleases = async () => {
  try {
   const response = await fetch('/releases.json');
   if (!response.ok) throw new Error('Failed to fetch releases');

   const data = await response.json();
   setReleases(data.releases);
  } catch (error) {
   console.error('Failed to fetch releases:', error);
   // Fallback data if fetch fails
   setReleases([
    {
     version: "1.0.0",
     release_date: "2025-01-15",
     featured: true,
     changelog: [
      "Initial release of uChat desktop application",
      "Real-time messaging with Socket.IO integration",
      "Custom notification system with avatar support",
      "System tray functionality for background operation",
      "Compact login mode and full chat interface",
      "Dark and light theme with system preference detection",
      "Secure authentication with session management"
     ],
     downloads: {
      windows: "resources/downloads/uChat-Setup-1.0.0.exe"
     },
     file_sizes: {
      windows: "45.2 MB"
     },
     requirements: {
      windows: "Windows 10 or later"
     }
    }
   ]);
  } finally {
   setLoading(false);
  }
 };

 const handleDownload = async (url, version) => {
  console.log(`Starting download: Windows version ${version}`);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 const handleLogoClick = () => {
  window.location.href = '/chat';
 };

 if (loading) {
  return (
   <div className={`downloads-container ${theme}`} data-theme={theme}>
    <div className="aura-background"></div>
    <div className="downloads-content">
     <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading releases...</p>
     </div>
    </div>
   </div>
  );
 }

 const latestRelease = releases.find(r => r.featured) || releases[0];

 return (
  <div className={`downloads-container ${theme}`} data-theme={theme}>
   <div className="aura-background"></div>

   <div className="downloads-content">
    <div className="downloads-header">
     <div className="logo-section">
      <img
       src="/resources/main-logo.svg"
       alt="uChat"
       className="app-logo"
       onClick={handleLogoClick}
       style={{ cursor: 'pointer' }}
      />
     </div>
     <h1>Download uChat</h1>
     <p>Only for Windows, sorry :(</p>
    </div>

    {latestRelease && (
     <div className="main-download">
      <div className="version-tag">
       v{latestRelease.version} - Latest
      </div>

      <div className="download-card">
       <div className="platform-info">
        <div className="platform-icon">
         <svg width="25" height="25" viewBox="0 0 4875 4875" xmlns="http://www.w3.org/2000/svg">
          <path fill="#FFFFFF" d="M0 0h2311v2310H0zm2564 0h2311v2310H2564zM0 2564h2311v2311H0zm2564 0h2311v2311H2564" />
         </svg>
        </div>
        <div className="platform-details">
         <h3>Windows Desktop</h3>
         <p>For Windows 10 and later</p>
         <span className="file-size">{latestRelease.file_sizes.windows}</span>
        </div>
       </div>

       <button
        className="download-button"
        onClick={() => handleDownload(latestRelease.downloads.windows, latestRelease.version)}
       >
        <span>Download Now</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
         <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
       </button>
      </div>
     </div>
    )}

    <div className="changelog-section">
     <h2>What's New</h2>

     {releases.map(release => (
      <div key={release.version} className="changelog-card">
       <div className="changelog-header">
        <div className="version-info">
         <h3>Version {release.version}</h3>
         <time>{new Date(release.release_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
         })}</time>
        </div>
        {release.featured && <span className="latest-badge">Latest</span>}
       </div>

       <div className="changelog-content">
        <ul>
         {release.changelog.map((item, index) => (
          <li key={index}>{item}</li>
         ))}
        </ul>
       </div>

       {!release.featured && (
        <button
         className="download-older"
         onClick={() => handleDownload(release.downloads.windows, release.version)}
        >
         Download v{release.version} ({release.file_sizes.windows})
        </button>
       )}
      </div>
     ))}
    </div>
   </div>
  </div>
 );
};

export default Downloads;