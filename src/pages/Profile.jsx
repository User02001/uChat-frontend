import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ user, onBack }) => {
 const [isEditing, setIsEditing] = useState(false);
 const [originalData] = useState({
  username: user?.username || 'John Doe',
  handle: user?.handle || 'johndoe',
  email: user?.email || 'john@example.com',
  bio: 'Hey there! I am using uChat.',
  phone: '+1 (555) 123-4567',
  location: 'New York, USA',
 });
 const [profileData, setProfileData] = useState(originalData);

 const handleEdit = () => {
  setIsEditing(!isEditing);
 };

 useEffect(() => {
  document.title = "uChat | Profile Settings";
 }, []); // <-- dependency array, runs once on mount

 const handleSave = () => {
  // TODO: Implement real save logic (API call etc.)
  setIsEditing(false);
 };

 const handleCancel = () => {
  setProfileData(originalData); // reset to original data
  setIsEditing(false);
 };

 const handleInputChange = (field, value) => {
  setProfileData((prev) => ({
   ...prev,
   [field]: value,
  }));
 };

 const sidebarItems = [
  { icon: 'fas fa-user', label: 'Profile', active: true },
  { icon: 'fas fa-comment', label: 'Messages' },
  { icon: 'fas fa-users', label: 'Contacts' },
  { icon: 'fas fa-bell', label: 'Notifications' },
  { icon: 'fas fa-cog', label: 'Settings' },
  { icon: 'fas fa-sign-out-alt', label: 'Logout' },
 ];

 return (
  <div className="profile-container">
   {/* Sidebar */}
   <div className="profile-sidebar">
    {/* Sidebar Header */}
    <div className="sidebar-header">
     <h2>uChat</h2>
     <p>Stay connected</p>
    </div>

    {/* Navigation */}
    <nav className="sidebar-nav">
     <ul>
      {sidebarItems.map((item, index) => (
       <li key={index}>
        <div
         className={`sidebar-nav-item ${item.active ? 'active' : ''
          }`}
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
      <img src="/resources/default_avatar.png" alt="User Avatar" />
      <div className="sidebar-user-info">
       <p className="sidebar-username">{profileData.username}</p>
       <p className="sidebar-handle">@{profileData.handle}</p>
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
          src="/resources/default_avatar.png"
          alt="Profile Avatar"
          className="profile-avatar-main"
         />
         <button className="avatar-edit-btn">
          <i className="fas fa-camera"></i>
         </button>
        </div>
        <div className="picture-info">
         <h3>Profile Picture</h3>
         <p>Upload a new profile picture. JPG, PNG or GIF (max 5MB)</p>
         <div className="online-status">
          <div className="status-indicator"></div>
          <span className="status-text">Online</span>
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

        {/* Phone */}
        <div className="info-field">
         <label>Phone</label>
         {isEditing ? (
          <input
           type="tel"
           className="field-input"
           value={profileData.phone}
           onChange={(e) =>
            handleInputChange('phone', e.target.value)
           }
          />
         ) : (
          <div className="field-display">{profileData.phone}</div>
         )}
        </div>

        {/* Location */}
        <div className="info-field full-width">
         <label>Location</label>
         {isEditing ? (
          <input
           type="text"
           className="field-input"
           value={profileData.location}
           onChange={(e) =>
            handleInputChange('location', e.target.value)
           }
          />
         ) : (
          <div className="field-display">
           {profileData.location}
          </div>
         )}
        </div>

        {/* Bio */}
        <div className="info-field full-width">
         <label>Bio</label>
         {isEditing ? (
          <textarea
           rows="4"
           className="field-textarea"
           value={profileData.bio}
           onChange={(e) =>
            handleInputChange('bio', e.target.value)
           }
          />
         ) : (
          <div className="field-display bio">
           {profileData.bio}
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
        <div className="stat-number">42</div>
        <div className="stat-label">Contacts</div>
       </div>
       <div className="stat-card">
        <div className="stat-number">1.2k</div>
        <div className="stat-label">Messages</div>
       </div>
       <div className="stat-card">
        <div className="stat-number">15d</div>
        <div className="stat-label">Member for</div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
};

export default Profile;
