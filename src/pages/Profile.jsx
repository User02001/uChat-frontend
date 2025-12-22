import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { API_BASE_URL } from '../config';
import Icon from '../components/Icon';

const Profile = ({ onBack }) => {
 const navigate = useNavigate();
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [isEditing, setIsEditing] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [deleteConfirmation, setDeleteConfirmation] = useState('');
 const [isDeleting, setIsDeleting] = useState(false);
 const [profileData, setProfileData] = useState({
  username: '',
  handle: '',
  email: '',
 });
 const [originalData, setOriginalData] = useState({});

 const handleEdit = () => {
  setIsEditing(!isEditing);
  if (!isEditing) {
   setOriginalData({ ...profileData });
  }
 };

 useEffect(() => {
  checkAuth();
 }, []);

 useEffect(() => {
  document.title = "uChat | Profile Settings";
 }, []);

 const checkAuth = async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: 'include'
   });

   if (response.ok) {
    const data = await response.json();
    const userData = {
     username: data.user.username,
     handle: data.user.handle,
     email: data.user.email,
     bio: 'Hey there! I am using uChat.',
    };
    setUser(data.user);
    setProfileData(userData);
    setOriginalData(userData);
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
  // Apply dark mode based on system preference
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // Listen for changes
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e) => {
   document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };

  darkModeMediaQuery.addEventListener('change', handleThemeChange);

  return () => {
   darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  };
 }, []);

 const handleSave = () => {
  // TODO: Implement real save logic (API call etc.)
  setIsEditing(false);
 };

 const formatDate = (isoString) => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`; // MM/DD/YYYY
 };

 const handleCancel = () => {
  setProfileData({ ...originalData });
  setIsEditing(false);
 };

 const handleInputChange = (field, value) => {
  setProfileData((prev) => ({
   ...prev,
   [field]: value,
  }));
 };

 const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type and size
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
   alert('Please select a JPG, PNG or GIF image');
   return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
   alert('File size must be less than 5MB');
   return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  try {
   const response = await fetch(`${API_BASE_URL}/api/upload-avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData
   });

   if (response.ok) {
    const data = await response.json();
    // Update user avatar URL
    setUser(prev => ({ ...prev, avatar_url: data.avatar_url }));
    alert('Profile picture updated successfully!');
   } else {
    alert('Failed to update profile picture');
   }
  } catch (error) {
   console.error('Avatar upload error:', error);
   alert('Failed to update profile picture');
  }
 };

 const handleLogout = async () => {
  try {
   const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    credentials: 'include'
   });

   if (response.ok) {
    navigate('/login', { replace: true });
   }
  } catch (error) {
   console.error('Logout failed:', error);
   navigate('/login', { replace: true });
  }
 };

 const handleDeleteAccount = async () => {
  if (deleteConfirmation !== 'DELETE THIS ACCOUNT') {
   alert('Please type DELETE THIS ACCOUNT to confirm account deletion');
   return;
  }

  setIsDeleting(true);

  try {
   const response = await fetch(`${API_BASE_URL}/api/delete-account`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
     'Content-Type': 'application/json'
    }
   });

   if (response.ok) {
    alert('Your account has been permanently deleted.');
    navigate('/login', { replace: true });
   } else {
    const error = await response.json();
    alert(error.error || 'Failed to delete account');
   }
  } catch (error) {
   console.error('Delete account error:', error);
   alert('Failed to delete account');
  } finally {
   setIsDeleting(false);
   setShowDeleteModal(false);
  }
 };

 const sidebarItems = [
  { icon: 'fas fa-home', label: 'Home', active: false },
  { icon: 'fas fa-sign-out-alt', label: 'Logout' },
  { icon: 'fas fa-trash', label: 'Delete Account', danger: true },
 ];

 if (loading) {
  return (
   <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading Profile...</p>
   </div>
  );
 }

 return (
  <div className="profile-container">
   {/* Sidebar */}
   <div className="profile-sidebar">
    {/* Sidebar Header */}
    <div className="sidebar-header">
     <div className="sidebar-brand">
      <Icon draggable="false" name="main-logo" alt="uChat Logo" className="sidebar-logo" />
      <h2>uChat</h2>
     </div>
     <p>:D Welcome to uChat!!</p>
    </div>

    {/* Navigation */}
    <nav className="sidebar-nav">
     <ul>
      {sidebarItems.map((item, index) => (
       <li key={index}>
        <div
         className={`sidebar-nav-item ${item.active ? 'active' : ''} ${item.danger ? 'danger' : ''}`}
         onClick={
          item.label === 'Home' ? () => navigate('/chat') :
           item.label === 'Logout' ? handleLogout :
            item.label === 'Delete Account' ? () => setShowDeleteModal(true) :
             undefined
         }
         style={item.label === 'Home' || item.label === 'Logout' ? { cursor: 'pointer' } : {}}
        >
         <i className={item.icon}></i>
         <span>{item.label}</span>
        </div>
       </li>
      ))}
     </ul>
    </nav>

    {/* Sidebar Footer */}
    <div className="sidebar-footer">
     <div className="sidebar-user">
      <img draggable="false" src={user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"} alt="User Avatar" />
      <div className="sidebar-user-info">
       <p className="sidebar-username">{user?.username}</p>
       <p className="sidebar-handle">@{user?.handle}</p>
      </div>
     </div>
    </div>
   </div>

   {/* Main Content */}
   <div className="profile-main">
    {/* Header */}
    <div className="profile-main-header">
     <div className="header-content">
      <div className="header-info">
       <h1>Profile Settings</h1>
       <p>Manage your personal information and preferences</p>
      </div>
      <button onClick={handleEdit} className="edit-btn">
       {isEditing ? (
        <>
         <i className="fas fa-times"></i>
         Cancel
        </>
       ) : (
        <>
         <i className="fas fa-edit"></i>
         Edit Profile
        </>
       )}
      </button>
     </div>
    </div>

    {/* Content Area */}
    <div className="profile-content-area">
     <div className="content-wrapper">
      {/* Profile Picture Section */}
      <div className="profile-picture-section">
       <div className="picture-content">
        <div className="avatar-container">
         <img
          src={user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"}
          alt="Profile Avatar"
          className="profile-avatar-main"
          draggable="false"
         />
         <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
         />
         <button
          className="avatar-edit-btn"
          onClick={() => document.getElementById('avatar-upload').click()}
         >
          <i className="fas fa-camera"></i>
         </button>
        </div>
        <div className="picture-info">
         <h3>Profile Picture</h3>
         <p>Upload a new profile picture. JPG, PNG or GIF (max 5MB)</p>
         <div className="online-status">
          <div className="status-indicator"></div>
          <span className="status-text">Online Now</span>
         </div>
        </div>
       </div>
      </div>

      {/* Personal Information */}
      <div className="personal-info-section">
       <h3>Personal Information</h3>

       <div className="info-grid">
        {/* Username */}
        <div className="info-field">
         <label>Username</label>
         {isEditing ? (
          <input
           type="text"
           className="field-input"
           value={profileData.username}
           onChange={(e) =>
            handleInputChange('username', e.target.value)
           }
          />
         ) : (
          <div className="field-display">{profileData.username}</div>
         )}
        </div>

        {/* Handle */}
        <div className="info-field">
         <label>Handle</label>
         {isEditing ? (
          <input
           type="text"
           className="field-input"
           value={profileData.handle}
           onChange={(e) =>
            handleInputChange('handle', e.target.value)
           }
          />
         ) : (
          <div className="field-display">
           @{profileData.handle}
          </div>
         )}
        </div>

        {/* Email */}
        <div className="info-field">
         <label>Email</label>
         {isEditing ? (
          <input
           type="email"
           className="field-input"
           value={profileData.email}
           onChange={(e) =>
            handleInputChange('email', e.target.value)
           }
          />
         ) : (
          <div className="field-display">{profileData.email}</div>
         )}
        </div>

        {/* Member Since */}
        <div className="info-field full-width">
         <label>Member Since (MM/DD/YYYY)</label>
         {isEditing ? (
          <div className="field-display">
           {user?.created_at ? formatDate(user.created_at) : 'N/A'}
          </div>
         ) : (
          <div className="field-display">
            {user?.created_at ? formatDate(user.created_at) : 'N/A'}
          </div>
         )}
        </div>
       </div>

       {isEditing && (
        <div className="profile-actions">
         <button onClick={handleCancel} className="action-btn cancel-btn">
          Cancel
         </button>
         <button onClick={handleSave} className="action-btn save-btn">
          <i className="fas fa-save"></i>
          Save Changes
         </button>
        </div>
       )}
      </div>

      {/* Stats Section */}
      <div className="stats-section">
       <div className="stat-card">
        <div className="stat-number">
         <i className={`fas ${user?.email ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
        </div>
        <div className="stat-label">Email Verified?</div>
       </div>
       <div className="stat-card">
        <div className="stat-number">@{user?.handle}</div>
        <div className="stat-label">Your Handle</div>
       </div>
       <div className="stat-card">
        <div className="stat-number">
         {user?.created_at ?
          Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) + 'd'
          : 'N/A'}
        </div>
        <div className="stat-label">Member for</div>
       </div>
      </div>
     </div>
    </div>
    {/* Delete Account Modal */}
    {showDeleteModal && (
     <div className="modal-overlay">
      <div className="delete-modal">
       <div className="modal-header">
        <h3>Delete Account</h3>
        <button
         className="modal-close"
         onClick={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
         }}
        >
         <i className="fas fa-times"></i>
        </button>
       </div>

       <div className="modal-content">
        <div className="warning-section">
         <i className="fas fa-exclamation-triangle warning-icon"></i>
         <h4>WARNING! YOU ARE ABOUT TO DELETE YOUR ACCOUNT. This action cannot be undone!</h4>
         <p>Deleting your account will permanently remove:</p>
         <ul>
          <li>Your profile and personal information</li>
          <li>All your messages and conversations</li>
          <li>Your contacts and connections</li>
          <li>Your uploaded files and images</li>
          <li>All account data and history</li>
         </ul>
        </div>

        <div className="confirmation-section">
         <label>Type <strong>DELETE THIS ACCOUNT</strong> to confirm:</label>
         <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="Type DELETE THIS ACCOUNT here"
          className="delete-confirmation-input"
         />
        </div>
       </div>

       <div className="modal-actions">
        <button
         onClick={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
         }}
         className="cancel-delete-btn"
         disabled={isDeleting}
        >
         Cancel
        </button>
        <button
         onClick={handleDeleteAccount}
         disabled={deleteConfirmation !== 'DELETE THIS ACCOUNT' || isDeleting}
         className="confirm-delete-btn"
        >
         {isDeleting ? (
          <>
           <i className="fas fa-spinner fa-spin"></i>
           Deleting...
          </>
         ) : (
          <>
           <i className="fas fa-trash"></i>
           Delete Account
          </>
         )}
        </button>
       </div>
      </div>
     </div>
    )}
   </div>
  </div>
 );
};

export default Profile;
