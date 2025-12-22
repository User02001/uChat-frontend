import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as stylex from "@stylexjs/stylex";
import { GoogleAuthStyles as styles } from "../styles/google_auth";
import { API_BASE_URL } from "../config";
import Icon from '../components/Icon';
import useStars from "../hooks/useStars";

const GoogleAuth = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const canvasRef = useStars();
 const [formData, setFormData] = useState({
  username: "",
  handle: "",
 });
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const [userInfo, setUserInfo] = useState(null);

 useEffect(() => {
  const fontAwesomeLink = document.createElement("link");
  fontAwesomeLink.rel = "stylesheet";
  fontAwesomeLink.href =
   "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
  document.head.appendChild(fontAwesomeLink);

  return () => {
   if (document.head.contains(fontAwesomeLink)) {
    document.head.removeChild(fontAwesomeLink);
   }
  };
 }, []);

 useEffect(() => {
  document.title = "uChat - Complete Setup";

  const favicon =
   document.querySelector("link[rel*='icon']") || document.createElement("link");
  favicon.type = "image/png";
  favicon.rel = "icon";
  favicon.href = "/resources/favicon_add_user.png";
  document.getElementsByTagName("head")[0].appendChild(favicon);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handleThemeChange);
  return () => mediaQuery.removeEventListener("change", handleThemeChange);
 }, []);

 useEffect(() => {
  const urlParams = new URLSearchParams(location.search);
  const email = urlParams.get("email");
  const name = urlParams.get("name");
  const needsSetup = urlParams.get("setup") === "true";

  if (email && name && needsSetup) {
   setUserInfo({ email, name });
   setFormData((prev) => ({
    ...prev,
    username: name,
   }));
  } else {
   navigate("/chat");
  }
 }, [location, navigate]);

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
   ...prev,
   [name]: value,
  }));
  if (error) setError("");
 };

 const handleSetupComplete = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  if (!formData.username.trim()) {
   setError("Display name is required");
   setLoading(false);
   return;
  }

  if (!formData.handle.trim()) {
   setError("Handle is required");
   setLoading(false);
   return;
  }

  const handle = formData.handle.startsWith("@")
   ? formData.handle.slice(1)
   : formData.handle;
  if (
   handle.length < 3 ||
   handle.length > 32 ||
   !/^[a-zA-Z0-9_-]+$/.test(handle)
  ) {
   setError("Handle must be 3-32 characters and use only letters, numbers, underscore, or dash");
   setLoading(false);
   return;
  }

  try {
   const response = await fetch(`${API_BASE_URL}/api/complete-google-setup`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
     username: formData.username.trim(),
     handle: handle,
    }),
   });

   const data = await response.json();

   if (response.ok) {
    navigate("/chat");
   } else {
    setError(data.error || "Setup failed");
   }
  } catch (error) {
   console.error("Setup error:", error);
   setError("Network error. Please try again.");
  } finally {
   setLoading(false);
  }
 };

 if (!userInfo) {
  return (
   <div {...stylex.props(styles.loginContainer)}>
    <canvas ref={canvasRef} {...stylex.props(styles.starCanvas)} aria-hidden="true" />
    <div {...stylex.props(styles.loginCard)}>
     <div {...stylex.props(styles.loginHeader)}>
      <div {...stylex.props(styles.logoContainer)}>
       <Icon
        name="main-logo"
        alt="uChat Logo"
        {...stylex.props(styles.mainLogo)}
        draggable="false"
       />
      </div>
      <h1 {...stylex.props(styles.headerTitle)}>
       <i
        className="fas fa-spinner fa-spin"
        style={{ marginRight: "12px", color: "var(--border-focus)" }}
       ></i>
       Loading...
      </h1>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div {...stylex.props(styles.loginContainer)}>
   <canvas ref={canvasRef} {...stylex.props(styles.starCanvas)} aria-hidden="true" />
   <div {...stylex.props(styles.loginCard)}>
    <div {...stylex.props(styles.loginHeader)}>
     <div {...stylex.props(styles.logoContainer)}>
      <Icon
       name="main-logo"
       alt="uChat Logo"
       {...stylex.props(styles.mainLogo)}
       draggable="false"
      />
     </div>
     <h1 {...stylex.props(styles.headerTitle)}>
      <i className="fas fa-cogs" style={{ marginRight: "12px", color: "var(--border-focus)" }}></i>
      Complete Your Setup
     </h1>
     <p {...stylex.props(styles.headerParagraph)}>
      <i className="fas fa-google" style={{ marginRight: "8px", opacity: 0.7 }}></i>
      Hello {userInfo.name}! Just need a few more details to set up your uChat account.
     </p>
     <div {...stylex.props(styles.infoBox)}>
      <i className="fas fa-check-circle"></i>
      Connected with Google: {userInfo.email}
     </div>
    </div>

    <div {...stylex.props(styles.loginForm)}>
     {error && (
      <div {...stylex.props(styles.errorBox)}>
       <i className="fas fa-exclamation-circle"></i>
       {error}
      </div>
     )}

     <form onSubmit={handleSetupComplete}>
      <div {...stylex.props(styles.inputGroup)}>
       <label htmlFor="username" {...stylex.props(styles.inputLabel)}>
        <i className="fas fa-user"></i>
        Display Name
       </label>
       <div {...stylex.props(styles.inputWrapper)}>
        <input
         type="text"
         id="username"
         name="username"
         value={formData.username}
         onChange={handleInputChange}
         placeholder="How should we display your name?"
         required
         className="inputGroup"
         {...stylex.props(styles.inputGroupInput)}
        />
        <i className="fas fa-id-card" {...stylex.props(styles.inputIcon)}></i>
       </div>
      </div>

      <div {...stylex.props(styles.inputGroup)}>
       <label htmlFor="handle" {...stylex.props(styles.inputLabel)}>
        <i className="fas fa-hashtag"></i>
        Handle
       </label>
       <div {...stylex.props(styles.inputWrapper)}>
        <input
         type="text"
         id="handle"
         name="handle"
         value={formData.handle}
         onChange={handleInputChange}
         placeholder="Your unique handle (e.g., @johndoe)"
         required
         className="inputGroup"
         {...stylex.props(styles.inputGroupInput)}
        />
        <i className="fas fa-tag" {...stylex.props(styles.inputIcon)}></i>
       </div>
       <small {...stylex.props(styles.helperText)}>
        <i className="fas fa-info-circle"></i>
        3-32 characters, letters, numbers, underscore, or dash only
       </small>
      </div>

      <button
       type="submit"
       disabled={loading}
       {...stylex.props(styles.loginBtn, styles.primary)}
      >
       <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-check"}></i>
       {loading ? "Setting up..." : "Complete Setup"}
      </button>
     </form>
    </div>

    <div {...stylex.props(styles.loginFooter)}>
     <p {...stylex.props(styles.footerP)}>
      <i className="fas fa-shield-alt" style={{ opacity: 0.7 }}></i>
      Your Google account is securely connected
     </p>
    </div>
   </div>
  </div>
 );
};

export default GoogleAuth;