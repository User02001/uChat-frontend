// src/components/DownloadsForSoftwareOrApp.jsx
import React, { useState, useEffect } from "react";
import * as stylex from "@stylexjs/stylex";
import Icon from '../components/Icon';
import { DownloadsForSoftwareOrAppStyles as styles } from "../styles/downloads_for_software_or_app";

const DownloadsForSoftwareOrApp = () => {
 const [releases, setReleases] = useState([]);
 const [loading, setLoading] = useState(true);
 const [theme, setTheme] = useState("light");

 useEffect(() => {
  document.title = "uChat | Downloads";
  const favicon =
   document.querySelector("link[rel*='icon']") || document.createElement("link");
  favicon.type = "image/png";
  favicon.rel = "icon";
  favicon.href = "/resources/favicon.png";
  document.getElementsByTagName("head")[0].appendChild(favicon);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = prefersDark ? "dark" : "light";
  setTheme(initialTheme);
  document.documentElement.setAttribute("data-theme", initialTheme);

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = (e) => {
   const newTheme = e.matches ? "dark" : "light";
   setTheme(newTheme);
   document.documentElement.setAttribute("data-theme", newTheme);
  };
  mediaQuery.addEventListener("change", handleThemeChange);

  fetchReleases();

  return () => mediaQuery.removeEventListener("change", handleThemeChange);
 }, []);

 const fetchReleases = async () => {
  try {
   const response = await fetch("/releases.json");
   if (!response.ok) throw new Error("Failed to fetch releases");

   const data = await response.json();
   setReleases(data.releases);
  } catch (error) {
   console.error("Failed to fetch releases:", error);
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
      "Secure authentication with session management",
     ],
     downloads: {
      windows: "resources/downloads/uChat-Setup-1.0.0.exe",
     },
     file_sizes: {
      windows: "45.2 MB",
     },
     requirements: {
      windows: "Windows 10 or later",
     },
    },
   ]);
  } finally {
   setLoading(false);
  }
 };

 const handleDownload = async (url, version) => {
  console.log(`Starting download: Windows version ${version}`);

  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 const handleLogoClick = () => {
  window.location.href = "/chat";
 };

 if (loading) {
  return (
   <div {...stylex.props(styles.downloadsContainer)} data-theme={theme}>
    <div {...stylex.props(styles.auraBackground)} />
    <div {...stylex.props(styles.downloadsContent)}>
     <div {...stylex.props(styles.loadingState)}>
      <div {...stylex.props(styles.loadingSpinner)} />
      <p {...stylex.props(styles.loadingText)}>Loading releases...</p>
     </div>
    </div>
   </div>
  );
 }

 const latestRelease = releases.find((r) => r.featured) || releases[0];

 return (
  <div {...stylex.props(styles.downloadsContainer)} data-theme={theme}>
   <div {...stylex.props(styles.auraBackground)} />

   <div {...stylex.props(styles.downloadsContent)}>
    <div {...stylex.props(styles.downloadsHeader)}>
     <div {...stylex.props(styles.logoSection)}>
      <Icon
       name="main_logo"
       alt="uChat"
       className={stylex.props(styles.appLogo).className}
       onClick={handleLogoClick}
       style={{ cursor: "pointer" }}
      />
     </div>
     <h1 {...stylex.props(styles.headerTitle)}>Download uChat</h1>
     <p {...stylex.props(styles.headerSubtitle)}>Only for Windows, sorry :(</p>
    </div>

    {latestRelease && (
     <div {...stylex.props(styles.mainDownload)}>
      <div {...stylex.props(styles.versionTag)}>v{latestRelease.version} - Latest</div>

      <div {...stylex.props(styles.downloadCard)}>
       <div {...stylex.props(styles.platformInfo)}>
        <div {...stylex.props(styles.platformIcon)}>
         <svg
          width="25"
          height="25"
          viewBox="0 0 4875 4875"
          xmlns="http://www.w3.org/2000/svg"
         >
          <path
           fill="#FFFFFF"
           d="M0 0h2311v2310H0zm2564 0h2311v2310H2564zM0 2564h2311v2311H0zm2564 0h2311v2311H2564"
          />
         </svg>
        </div>
        <div {...stylex.props(styles.platformDetails)}>
         <h3 {...stylex.props(styles.platformTitle)}>Windows Desktop</h3>
         <p {...stylex.props(styles.platformText)}>For Windows 10 and later</p>
         <span {...stylex.props(styles.fileSize)}>{latestRelease.file_sizes.windows}</span>
        </div>
       </div>

       <button
        {...stylex.props(styles.downloadButton)}
        onClick={() =>
         handleDownload(latestRelease.downloads.windows, latestRelease.version)
        }
        type="button"
       >
        <span>Download Now</span>
        <svg
         width="20"
         height="20"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
        >
         <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
       </button>
      </div>
     </div>
    )}

    <div {...stylex.props(styles.changelogSection)}>
     <h2 {...stylex.props(styles.changelogTitle)}>What's New</h2>

     {releases.map((release) => (
      <div key={release.version} {...stylex.props(styles.changelogCard)}>
       <div {...stylex.props(styles.changelogHeader)}>
        <div {...stylex.props(styles.versionInfo)}>
         <h3 {...stylex.props(styles.versionInfoTitle)}>Version {release.version}</h3>
         <time {...stylex.props(styles.versionInfoTime)}>
          {new Date(release.release_date).toLocaleDateString("en-US", {
           year: "numeric",
           month: "long",
           day: "numeric",
          })}
         </time>
        </div>
        {release.featured && (
         <span {...stylex.props(styles.latestBadge)}>Latest</span>
        )}
       </div>

       <div {...stylex.props(styles.changelogContent)}>
        <ul {...stylex.props(styles.changelogList)}>
         {release.changelog.map((item, index) => (
          <li key={index} {...stylex.props(styles.changelogItem)}>
           {item}
          </li>
         ))}
        </ul>
       </div>

       {!release.featured && (
        <button
         {...stylex.props(styles.downloadOlder)}
         onClick={() => handleDownload(release.downloads.windows, release.version)}
         type="button"
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

export default DownloadsForSoftwareOrApp;