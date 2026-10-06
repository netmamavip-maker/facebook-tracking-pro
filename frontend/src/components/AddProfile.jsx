import React, { useState } from 'react';
import '../styles/AddProfile.css';

function AddProfile({ onAddProfile, loading, onCancel }) {
  const [profileUrl, setProfileUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateUrl = (url) => {
    const fbUrlPattern = /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+\/?$/;
    return fbUrlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileUrl.trim()) {
      setError('Please enter a Facebook profile URL');
      return;
    }

    if (!validateUrl(profileUrl)) {
      setError('Invalid Facebook URL format. Example: https://facebook.com/username');
      return;
    }

    await onAddProfile(profileUrl);
    setProfileUrl('');
    setSuccess('Profile added successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="add-profile-container">
      <div className="add-profile-card">
        <h1>➕ Add New Profile</h1>
        <p className="subtitle">Enter a Facebook profile URL to start tracking</p>

        <form onSubmit={handleSubmit} className="add-profile-form">
          <div className="form-group">
            <label htmlFor="profileUrl">Facebook Profile URL</label>
            <input
              id="profileUrl"
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://facebook.com/username"
              disabled={loading}
              className={error ? 'error' : ''}
            />
            <div className="input-hint">
              Example: https://facebook.com/hafizur.rahman.497778
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary btn-large"
              disabled={loading}
            >
              {loading ? '⏳ Adding...' : '✅ Add Profile'}
            </button>
            <button 
              type="button" 
              className="btn-secondary btn-large"
              onClick={onCancel}
              disabled={loading}
            >
              ❌ Cancel
            </button>
          </div>
        </form>

        <div className="info-section">
          <h3>📋 How to find a Facebook profile URL:</h3>
          <ol>
            <li>Go to Facebook and visit any profile</li>
            <li>Copy the URL from your browser's address bar</li>
            <li>Paste it above and click "Add Profile"</li>
          </ol>
        </div>

        <div className="note-section">
          <h4>⚠️ Important Notes:</h4>
          <ul>
            <li>Works with both public and private profiles</li>
            <li>For private profiles, you need to be friends with the account</li>
            <li>Updates every 30 seconds automatically</li>
            <li>Tracking persists until you remove the profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddProfile;
