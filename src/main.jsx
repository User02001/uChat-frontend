import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './pages/calls.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Verify from './pages/Verify.jsx'
import Profile from './pages/Profile.jsx'
import Downloads from './pages/Downloads';

createRoot(document.getElementById('root')).render(
 <Router>
  <Routes>
   <Route path="/login" element={<Login />} />
   <Route path="/signup" element={<Signup />} />
   <Route path="/verify" element={<Verify />} />
   <Route path="/chat" element={<App />} />
   <Route path="/profile" element={<Profile />} />
   <Route path="/" element={<Navigate to="/login" replace />} />
   <Route path="*" element={<Navigate to="/login" replace />} />
   <Route path="/downloads" element={<Downloads />} />
  </Routes>
 </Router>
)