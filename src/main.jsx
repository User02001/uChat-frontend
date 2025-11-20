import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import './global.css'
import styles from './index.module.css'
import Moderation from './pages/Moderation';

// Warning message
const imageUrl = "https://uchat.ufonic.xyz/resources/favicon.png";
const warningStyle = [
 "color: #fff",
 "background: #a80000",
 "font-weight: 900",
 "font-size: 16px",
 "padding: 6px 10px",
 "border-radius: 4px",
 "display: inline-block"
].join(";");

function showUChatWarning() {
 const msg = "⚠️ WARNING. THIS IS THE CONSOLE WHICH IS ONLY USED BY DEVELOPERS. IF ANYONE TOLD YOU TO COPY AND PASTE A CODE HERE, DON'T DO IT. IT IS LIKELY AN ATTEMPT TO GAIN ACCESS TO YOUR ACCOUNT. YOU HAVE BEEN WARNED. ONLY PASTE A CODE HERE IF YOU KNOW WHAT YOU ARE DOING.";
 const style =
  typeof warningStyle !== "undefined"
   ? warningStyle
   : [
    "color: #fff",
    "background: #a80000",
    "font-weight: 900",
    "font-size: 16px",
    "padding: 6px 10px",
    "border-radius: 4px",
    "display: inline-block",
   ].join(";");
 console.log("%c" + msg, style);
}

// show immediately and re-show every 15s
showUChatWarning();

// Lazy load pages
const App = lazy(() => import('./App.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const Verify = lazy(() => import('./pages/Verify.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Downloads = lazy(() => import('./pages/Downloads'))
const GoogleAuth = lazy(() => import('./pages/GoogleAuth.jsx'))
const Help = lazy(() => import('./pages/Help.jsx'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions.jsx'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'))
const Welp = lazy(() => import('./pages/Welp.jsx'))
const ModerationPage = lazy(() => import('./pages/Moderation.jsx'))

// Wrapper component with aggressive cleanup
const AppRoutes = () => {
 const location = useLocation()
 const navigationType = useNavigationType()

 useEffect(() => {
  // Force cleanup on browser back/forward
  if (navigationType === 'POP') {
   // Small delay to ensure DOM cleanup
   const timer = setTimeout(() => {
    window.scrollTo(0, 0)
   }, 0)
   return () => clearTimeout(timer)
  }
 }, [location.pathname, navigationType])

 return (
  <Suspense>
   <Routes key={location.pathname + location.search}>
    <Route path="/login" element={<Login key="login" />} />
    <Route path="/signup" element={<Signup key="signup" />} />
    <Route path="/verify" element={<Verify key="verify" />} />
    <Route path="/google-setup" element={<GoogleAuth key="google" />} />
    <Route path="/chat" element={<App key="chat" />} />
    <Route path="/profile" element={<Profile key="profile" />} />
    <Route path="/downloads" element={<Downloads key="downloads" />} />
    <Route path="/terms" element={<TermsAndConditions key="terms" />} />
    <Route path="/privacy" element={<PrivacyPolicy key="privacy" />} />
    <Route path="/help" element={<Help key="help" />} />
    <Route path="/welp" element={<Welp key="welp" />} />
    <Route path="/moderation" element={<Moderation key="moderation" />} />"
    <Route path="/" element={<Navigate to="/chat" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
   </Routes>
  </Suspense>
 )
}

createRoot(document.getElementById('root')).render(
 <StrictMode>
  <Router>
   <AppRoutes />
  </Router>
 </StrictMode>
)