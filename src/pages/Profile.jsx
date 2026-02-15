import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { API_BASE_URL } from '../config';
import Icon from '../components/Icon';
import { styles } from '../styles/profile';
import '../utils/secureApiFetch';

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

 const handleSave = () => {
  // TODO: Implement real save logic (API call etc.)
  setIsEditing(false);
 };

 const formatDate = (isoString) => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
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

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
   alert('Please select a JPG, PNG or GIF image');
   return;
  }

  if (file.size > 5 * 1024 * 1024) {
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
   <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)',
   }}>
    <div style={{
     width: '40px',
     height: '40px',
     border: '4px solid var(--border)',
     borderTop: '4px solid var(--button-primary)',
     borderRadius: '50%',
     animation: 'spin 1s linear infinite',
    }}></div>
    <p style={{ marginLeft: '16px', color: 'var(--text-secondary)' }}>Loading Profile...</p>
   </div>
  );
 }

 return (
  <div {...stylex.props(styles.container)}>
   {/* Sidebar */}
   <div {...stylex.props(styles.sidebar)}>
    {/* Sidebar Header */}
    <div {...stylex.props(styles.sidebarHeader)}>
     <div {...stylex.props(styles.sidebarBrand)}>
      <Icon draggable="false" name="main-logo" alt="uChat Logo" {...stylex.props(styles.sidebarLogo)} />
      <h2 {...stylex.props(styles.sidebarTitle)}>uChat</h2>
     </div>
     <p {...stylex.props(styles.sidebarSubtitle)}>:D Welcome to uChat!!</p>
    </div>

    {/* Navigation */}
    <nav {...stylex.props(styles.nav)}>
     <ul {...stylex.props(styles.navList)}>
      {sidebarItems.map((item, index) => (
       <li key={index} {...stylex.props(styles.navItem)}>
        <button
         {...stylex.props(
          styles.navButton,
          item.active && styles.navButtonActive,
          item.danger && styles.navButtonDanger
         )}
         onClick={
          item.label === 'Home' ? () => navigate('/chat') :
           item.label === 'Logout' ? handleLogout :
            item.label === 'Delete Account' ? () => setShowDeleteModal(true) :
             undefined
         }
        >
         <i className={item.icon} style={{ marginRight: '12px', fontSize: '14px' }}></i>
         <span {...stylex.props(styles.navLabel)}>{item.label}</span>
        </button>
       </li>
      ))}
     </ul>
    </nav>

    {/* Sidebar Footer */}
    <div {...stylex.props(styles.sidebarFooter)}>
     <div {...stylex.props(styles.sidebarUser)}>
      <img
       draggable="false"
       src={user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"}
       alt="User Avatar"
       {...stylex.props(styles.sidebarAvatar)}
      />
      <div {...stylex.props(styles.sidebarUserInfo)}>
       <p {...stylex.props(styles.sidebarUsername)}>{user?.username}</p>
       <p {...stylex.props(styles.sidebarHandle)}>@{user?.handle}</p>
      </div>
     </div>
    </div>
   </div>

   {/* Main Content */}
   <div {...stylex.props(styles.main)}>
    {/* Header */}
    <div {...stylex.props(styles.mainHeader)}>
     <div {...stylex.props(styles.headerContent)}>
      <div {...stylex.props(styles.headerInfo)}>
       <h1 {...stylex.props(styles.headerTitle)}>Profile Settings</h1>
       <p {...stylex.props(styles.headerSubtitle)}>Manage your personal information and preferences</p>
      </div>
      <button onClick={handleEdit} {...stylex.props(styles.editButton)}>
       {isEditing ? (
        <>
         <i className="fas fa-times" style={{ marginRight: '8px', fontSize: '14px' }}></i>
         Cancel
        </>
       ) : (
        <>
         <i className="fas fa-edit" style={{ marginRight: '8px', fontSize: '14px' }}></i>
         Edit Profile
        </>
       )}
      </button>
     </div>
    </div>

    {/* Content Area */}
    <div {...stylex.props(styles.contentArea)}>
     <div {...stylex.props(styles.contentWrapper)}>
      {/* Profile Picture Section */}
      <div {...stylex.props(styles.sectionCard)}>
       <div {...stylex.props(styles.pictureContent)}>
        <div {...stylex.props(styles.avatarContainer)}>
         <img
          src={user?.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : "/resources/default_avatar.png"}
          alt="Profile Avatar"
          draggable="false"
          {...stylex.props(styles.avatar)}
         />
         <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
         />
         <button
          {...stylex.props(styles.avatarEditButton)}
          onClick={() => document.getElementById('avatar-upload').click()}
         >
          <i className="fas fa-camera"></i>
         </button>
        </div>
        <div {...stylex.props(styles.pictureInfo)}>
         <h3 {...stylex.props(styles.pictureTitle)}>Profile Picture</h3>
         <p {...stylex.props(styles.pictureSubtitle)}>Upload a new profile picture. JPG, PNG or GIF (max 5MB)</p>
         <div {...stylex.props(styles.onlineStatus)}>
          <div {...stylex.props(styles.statusIndicator)}></div>
          <span {...stylex.props(styles.statusText)}>Online Now</span>
         </div>
        </div>
       </div>
      </div>

      {/* Personal Information */}
      <div {...stylex.props(styles.sectionCard)}>
       <h3 {...stylex.props(styles.sectionTitle)}>Personal Information</h3>

       <div {...stylex.props(styles.infoGrid)}>
        {/* Username */}
        <div>
         <label {...stylex.props(styles.fieldLabel)}>Username</label>
         {isEditing ? (
          <input
           type="text"
           value={profileData.username}
           onChange={(e) => handleInputChange('username', e.target.value)}
           {...stylex.props(styles.fieldInput)}
          />
         ) : (
          <div {...stylex.props(styles.fieldDisplay)}>{profileData.username}</div>
         )}
        </div>

        {/* Handle */}
        <div>
         <label {...stylex.props(styles.fieldLabel)}>Handle</label>
         {isEditing ? (
          <input
           type="text"
           value={profileData.handle}
           onChange={(e) => handleInputChange('handle', e.target.value)}
           {...stylex.props(styles.fieldInput)}
          />
         ) : (
          <div {...stylex.props(styles.fieldDisplay)}>@{profileData.handle}</div>
         )}
        </div>

        {/* Email */}
        <div>
         <label {...stylex.props(styles.fieldLabel)}>Email</label>
         {isEditing ? (
          <input
           type="email"
           value={profileData.email}
           onChange={(e) => handleInputChange('email', e.target.value)}
           {...stylex.props(styles.fieldInput)}
          />
         ) : (
          <div {...stylex.props(styles.fieldDisplay)}>{profileData.email}</div>
         )}
        </div>

        {/* Member Since */}
        <div {...stylex.props(styles.fullWidth)}>
         <label {...stylex.props(styles.fieldLabel)}>Member Since (MM/DD/YYYY)</label>
         <div {...stylex.props(styles.fieldDisplay)}>
          {user?.created_at ? formatDate(user.created_at) : 'N/A'}
         </div>
        </div>
       </div>

       {isEditing && (
        <div {...stylex.props(styles.actionButtons)}>
         <button onClick={handleCancel} {...stylex.props(styles.actionButton, styles.cancelButton)}>
          Cancel
         </button>
         <button onClick={handleSave} {...stylex.props(styles.actionButton, styles.saveButton)}>
          <i className="fas fa-save" style={{ marginRight: '8px', fontSize: '14px' }}></i>
          Save Changes
         </button>
        </div>
       )}
      </div>

      {/* Stats Section */}
      <div {...stylex.props(styles.statsGrid)}>
       <div {...stylex.props(styles.statCard)}>
        <div {...stylex.props(styles.statNumber)}>
         <i className={`fas ${user?.email ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
        </div>
        <div {...stylex.props(styles.statLabel)}>Email Verified?</div>
       </div>
       <div {...stylex.props(styles.statCard)}>
        <div {...stylex.props(styles.statNumber)}>@{user?.handle}</div>
        <div {...stylex.props(styles.statLabel)}>Your Handle</div>
       </div>
       <div {...stylex.props(styles.statCard)}>
        <div {...stylex.props(styles.statNumber)}>
         {user?.created_at
          ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) + 'd'
          : 'N/A'}
        </div>
        <div {...stylex.props(styles.statLabel)}>Member for</div>
       </div>
      </div>
     </div>
    </div>

    {/* Delete Account Modal */}
    {showDeleteModal && (
     <div {...stylex.props(styles.modalOverlay)}>
      <div {...stylex.props(styles.modal)}>
       <div {...stylex.props(styles.modalHeader)}>
        <h3 {...stylex.props(styles.modalTitle)}>Delete Account</h3>
        <button
         {...stylex.props(styles.modalClose)}
         onClick={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
         }}
        >
         <i className="fas fa-times"></i>
        </button>
       </div>

       <div {...stylex.props(styles.modalContent)}>
        <div {...stylex.props(styles.warningSection)}>
         <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#ff4757', marginBottom: '15px' }}></i>
         <h4 {...stylex.props(styles.warningTitle)}>
          ⚠️ WARNING! YOU ARE ABOUT TO DELETE YOUR ACCOUNT. This action cannot be undone!
         </h4>
         <p {...stylex.props(styles.warningText)}>Deleting your account will permanently remove:</p>
         <ul {...stylex.props(styles.warningList)}>
          <li {...stylex.props(styles.warningListItem)}>Your profile and personal information</li>
          <li {...stylex.props(styles.warningListItem)}>All your messages and conversations</li>
          <li {...stylex.props(styles.warningListItem)}>Your contacts and connections</li>
          <li {...stylex.props(styles.warningListItem)}>Your uploaded files and images</li>
          <li {...stylex.props(styles.warningListItem)}>All account data and history</li>
         </ul>
        </div>

        <div {...stylex.props(styles.confirmationSection)}>
         <label {...stylex.props(styles.confirmationLabel)}>
          Type <strong>DELETE THIS ACCOUNT</strong> to confirm:
         </label>
         <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="Type DELETE THIS ACCOUNT here"
          {...stylex.props(styles.confirmationInput)}
         />
        </div>
       </div>

       <div {...stylex.props(styles.modalActions)}>
        <button
         onClick={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation('');
         }}
         disabled={isDeleting}
         {...stylex.props(styles.modalButton, styles.modalCancelButton)}
        >
         Cancel
        </button>
        <button
         onClick={handleDeleteAccount}
         disabled={deleteConfirmation !== 'DELETE THIS ACCOUNT' || isDeleting}
         {...stylex.props(styles.modalButton, styles.modalConfirmButton)}
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