import React from 'react';
import '../styles/ProfileCard.css';

function ProfileCard({ profile, isSelected, onSelect, onRemove, onRefresh, refreshing }) {
  const isOnline = profile.current_status === 'online';
  const lastCheck = profile.last_check ? new Date(profile.last_check) : null;
  const timeAgo = lastCheck ? getTimeAgo(lastCheck) : 'Unknown';

  return (
    <div className={`profile-card ${isSelected ? 'selected' : ''} ${isOnline ? 'online' : 'offline'}`}>
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
        </div>
        
        <div className="profile-info">
          <h3 className="profile-name">{profile.name}</h3>
          <p className="profile-id">@{profile.fb_id}</p>
        </div>
      </div>

      <div className="profile-status">
        <div className={`status-badge ${isOnline ? 'status-online' : 'status-offline'}`}>
          {isOnline ? '🟢 Online' : '⚪ Offline'}
        </div>
        <span className="status-text">{profile.online_text || 'unknown'}</span>
      </div>

      <div className="profile-details">
        <div className="detail-row">
          <span className="detail-label">Last Check:</span>
          <span className="detail-value">{timeAgo}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Added:</span>
          <span className="detail-value">{formatDate(profile.added_at)}</span>
        </div>
      </div>

      <div className="profile-actions">
        <button 
          className="btn-small btn-refresh"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          disabled={refreshing}
          title="Manually refresh this profile"
        >
          {refreshing ? '🔄' : '🔄'} Refresh
        </button>
        
        <button 
          className="btn-small btn-info"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          title="View detailed analytics"
        >
          📊 Analytics
        </button>
        
        <button 
          className="btn-small btn-danger"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove this profile"
        >
          🗑️ Remove
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default ProfileCard;
