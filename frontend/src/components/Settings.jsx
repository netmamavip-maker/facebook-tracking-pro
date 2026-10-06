import React, { useState } from 'react';
import '../styles/Settings.css';

function Settings({ onExport, profileCount, onBack }) {
  const [exportFormat, setExportFormat] = useState('json');

  const handleExport = () => {
    onExport();
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>⚙️ Settings</h1>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h2>📊 Dashboard Statistics</h2>
          <div className="setting-row">
            <span>Profiles Being Tracked</span>
            <span className="setting-value">{profileCount}</span>
          </div>
          <div className="setting-row">
            <span>Update Interval</span>
            <span className="setting-value">30 seconds</span>
          </div>
          <div className="setting-row">
            <span>Storage Type</span>
            <span className="setting-value">SQLite</span>
          </div>
        </div>

        <div className="settings-section">
          <h2>💾 Data Export</h2>
          <p className="section-description">
            Export all your tracked profiles and their history
          </p>
          <button className="btn-export" onClick={handleExport}>
            📥 Export Data as JSON
          </button>
          <p className="export-hint">
            This will download all your profiles and activity history as a JSON file
          </p>
        </div>

        <div className="settings-section">
          <h2>🔄 Backup & Restore</h2>
          <p className="section-description">
            Keep your data safe with regular backups
          </p>
          <button className="btn-secondary" disabled>
            💾 Create Backup
          </button>
          <button className="btn-secondary" disabled>
            📂 Restore Backup
          </button>
          <p className="hint-text">Feature coming soon</p>
        </div>

        <div className="settings-section">
          <h2>ℹ️ Application Info</h2>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Build</span>
              <span className="info-value">Premium Edition</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value">✅ Active</span>
            </div>
            <div className="info-row">
              <span className="info-label">Database</span>
              <span className="info-value">SQLite3</span>
            </div>
          </div>
        </div>

        <div className="settings-section danger-zone">
          <h2>⚠️ Danger Zone</h2>
          <button className="btn-danger" disabled>
            🗑️ Clear All Data
          </button>
          <p className="warning-text">This action cannot be undone</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
