import { StrictMode, lazy, Suspense, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import './global.css'
import styles from './index.module.css'
import Moderation from './pages/Moderation';
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { useTwemoji } from './hooks/useTwemoji';
import 'virtual:stylex.css'

if (process.env.NODE_ENV === "production") {
 disableReactDevTools();
}

let authPromise = null;
const checkAuth = () => {
 if (!authPromise) {
  authPromise = fetch('/api/me', { credentials: 'include' })
   .then(res => res.ok)
   .catch(() => false);
 }
 return authPromise;
};

const warningStyle = [
 "color: #ffffff",
 "background: linear-gradient(135deg, #a80000, #ff3b3b)",
 "font-weight: 900",
 "font-size: 16px",
 "padding: 10px 14px",
 "border-radius: 6px",
 "line-height: 1.4",
 "display: inline-block",
].join(";");

const headerStyle = [
 "color: #ff3b3b",
 "font-size: 28px",
 "font-weight: 900",
 "text-shadow: 0 2px 6px rgba(0,0,0,.4)",
].join(";");

const hiringStyle = [
 "color: #00ffcc",
 "font-size: 14px",
 "font-weight: 700",
].join(";");

function showUChatWarning() {
 const warningMsg =
  "⚠️ THIS IS THE CONSOLE WHICH IS ONLY USED BY DEVELOPERS. IF ANYONE TOLD YOU TO COPY AND PASTE A CODE HERE, DON'T DO IT. IT IS LIKELY AN ATTEMPT TO GAIN ACCESS TO YOUR ACCOUNT. YOU HAVE BEEN WARNED. ONLY PASTE A CODE HERE IF YOU KNOW WHAT YOU ARE DOING.";
 const hiringMsg =
  "However, if you know what you are EXACTLY DOING, then you can be our partner! Not legal hiring but kinda neat, just contact me through my email, it is ufonic.official@gmail.com.";
 console.log("\n");
 console.log("%cSTOP!!", headerStyle);
 console.log("%c" + warningMsg, warningStyle);
 console.log("%c" + hiringMsg, hiringStyle);
 console.log("\n");
}

showUChatWarning();

fetch('/api/me', { credentials: 'include' }).then(res => {
 if (res.ok && ['/login', '/signup', '/verify'].includes(window.location.pathname)) {
  window.location.replace('/chat');
 }
});

const App = lazy(() => import('./App.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const Verify = lazy(() => import('./pages/Verify.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const DownloadsForSoftwareOrApp = lazy(() => import('./pages/DownloadsForSoftwareOrApp'))
const GoogleAuth = lazy(() => import('./pages/GoogleAuth.jsx'))
const Help = lazy(() => import('./pages/Help.jsx'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions.jsx'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'))
const ModerationPage = lazy(() => import('./pages/Moderation.jsx'))

const AppRoutes = () => {
 const location = useLocation()
 const navigationType = useNavigationType()
 useTwemoji();
 useEffect(() => {
  if (navigationType === 'POP') {
   const timer = setTimeout(() => { window.scrollTo(0, 0) }, 0)
   return () => clearTimeout(timer)
  }
 }, [location.pathname, navigationType])

 return (
  <Suspense>
   <Routes key={location.pathname + location.search}>
    <Route path="/login" element={<Login key="login" />} />
    <Route path="/signup" element={<Signup key="signup" />} />
    <Route path="/verify" element={<Verify key="verify" />} />
    <Route path="/chat" element={<App key="chat" />} />
    <Route path="/google_setup" element={<GoogleAuth key="google" />} />
    <Route path="/profile" element={<Profile key="profile" />} />
    <Route path="/downloads" element={<DownloadsForSoftwareOrApp key="downloads" />} />
    <Route path="/terms" element={<TermsAndConditions key="terms" />} />
    <Route path="/privacy" element={<PrivacyPolicy key="privacy" />} />
    <Route path="/help" element={<Help key="help" />} />
    <Route path="/moderation" element={<Moderation key="moderation" />} />
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
   </Routes>
  </Suspense>
 )
}

const mountId = `_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
const mountPoint = document.createElement('div');
mountPoint.id = mountId;
document.body.appendChild(mountPoint);

createRoot(mountPoint).render(
 <Router>
  <AppRoutes />
 </Router>
)