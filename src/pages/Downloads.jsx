import React, { useState, useEffect } from 'react';
import './Downloads.css';

const Downloads = () => {
 const [releases, setReleases] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedPlatform, setSelectedPlatform] = useState('windows');
 const [fileSizes, setFileSizes] = useState({});

 useEffect(() => {
  fetchReleases();
  setSelectedPlatform(detectPlatform());
 }, []);

 const fetchReleases = async () => {
  try {
   const response = await fetch('/releases.json');
   if (!response.ok) throw new Error('Failed to fetch releases');

   const data = await response.json();
   setReleases(data.releases);

   // Fetch file sizes for all releases
   await fetchFileSizes(data.releases);

  } catch (error) {
   console.error('Failed to fetch releases:', error);
  } finally {
   setLoading(false);
  }
 };

 const fetchFileSizes = async (releases) => {
  const sizePromises = [];
  const sizeMap = {};

  for (const release of releases) {
   for (const [platform, downloadUrl] of Object.entries(release.downloads)) {
    sizePromises.push(
     getFileSize(downloadUrl).then(size => {
      if (!sizeMap[release.version]) sizeMap[release.version] = {};
      sizeMap[release.version][platform] = size;
     }).catch(() => {
      // Fallback for file size if request fails
      if (!sizeMap[release.version]) sizeMap[release.version] = {};
      sizeMap[release.version][platform] = 'Unknown size';
     })
    );
   }
  }

  await Promise.allSettled(sizePromises);
  setFileSizes(sizeMap);
 };

 const getFileSize = async (url) => {
  try {
   const response = await fetch(url, { method: 'HEAD' });
   const contentLength = response.headers.get('content-length');

   if (contentLength) {
    const bytes = parseInt(contentLength);
    return formatFileSize(bytes);
   }
   return 'Unknown size';
  } catch (error) {
   return 'Unknown size';
  }
 };

 const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
 };

 const detectPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  return 'windows';
 };

 const getPlatformIcon = (platform) => {
  const icons = {
   windows: '🖥️',
   mac: '🍎',
   linux: '🐧'
  };
  return icons[platform] || '💻';
 };

 const getPlatformName = (platform) => {
  const names = {
   windows: 'Windows',
   mac: 'macOS',
   linux: 'Linux'
  };
  return names[platform] || 'Unknown';
 };

 const handleDownload = async (url, platform, version) => {
  // Track download
  console.log(`Starting download: ${platform} version ${version}`);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 if (loading) {
  return (
   <div className="downloads-container">
    <div className="aura-background"></div>
    <div className="downloads-card">
     <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading releases...</p>
     </div>
    </div>
   </div>
  );
 }

 const latestRelease = releases.find(r => r.featured) || releases[0];

 return (
  <div className="downloads-container">
   <div className="aura-background"></div>

   <div className="downloads-content">
    <div className="downloads-header">
     <div className="logo-container">
      <img src="/resources/main-logo.svg" alt="uChat" className="main-logo" />
     </div>
     <h1>Download uChat</h1>
     <p>Secure, fast, and reliable desktop messaging</p>
    </div>

    {latestRelease && (
     <div className="featured-download">
      <div className="version-badge">
       Latest: v{latestRelease.version}
      </div>

      <div className="platform-selector">
       {Object.keys(latestRelease.downloads).map(platform => (
        <button
         key={platform}
         className={`platform-btn ${selectedPlatform === platform ? 'active' : ''}`}
         onClick={() => setSelectedPlatform(platform)}
        >
         <span className="platform-icon">{getPlatformIcon(platform)}</span>
         <span>{getPlatformName(platform)}</span>
        </button>
       ))}
      </div>

      <div className="download-section">
       <button
        className="download-btn primary"
        onClick={() => handleDownload(
         latestRelease.downloads[selectedPlatform],
         selectedPlatform,
         latestRelease.version
        )}
       >
        <span className="download-icon">⬇️</span>
        Download for {getPlatformName(selectedPlatform)}
        <span className="file-info">
         {fileSizes[latestRelease.version]?.[selectedPlatform] || 'Loading...'}
        </span>
       </button>

       <div className="system-requirements">
        <small>
         Requirements: {latestRelease.requirements[selectedPlatform]}
        </small>
       </div>
      </div>
     </div>
    )}

    <div className="releases-section">
     <h2>Release History</h2>

     {releases.map(release => (
      <div key={release.version} className="release-card">
       <div className="release-header">
        <div className="version-info">
         <h3>Version {release.version}</h3>
         <span className="release-date">
          {new Date(release.release_date).toLocaleDateString()}
         </span>
        </div>
        {release.featured && <span className="featured-badge">Latest</span>}
       </div>

       <div className="changelog">
        <h4>What's New:</h4>
        <ul>
         {release.changelog.map((item, index) => (
          <li key={index}>{item}</li>
         ))}
        </ul>
       </div>

       <div className="download-options">
        {Object.entries(release.downloads).map(([platform, url]) => (
         <button
          key={platform}
          className="download-option"
          onClick={() => handleDownload(url, platform, release.version)}
         >
          <span className="platform-icon">{getPlatformIcon(platform)}</span>
          <div className="download-info">
           <span className="platform-name">{getPlatformName(platform)}</span>
           <span className="file-size">
            {fileSizes[release.version]?.[platform] || 'Loading...'}
           </span>
          </div>
         </button>
        ))}
       </div>
      </div>
     ))}
    </div>

    <div className="downloads-footer">
     <p>
      Need help? Check out our{' '}
      <a href="/docs" className="link">documentation</a> or{' '}
      <a href="/support" className="link">contact support</a>.
     </p>
    </div>
   </div>
  </div>
 );
};

export default Downloads;