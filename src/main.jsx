import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import './index.css'

// Create a styled loading fallback using CSS classes
const LoadingFallback = () => (
 <div className="app-loading">
  <div className="loading-spinner"></div>
  <p>Loading...</p>
 </div>
)

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
  <Suspense fallback={<LoadingFallback />}>
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