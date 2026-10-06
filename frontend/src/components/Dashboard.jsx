import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import '../styles/Dashboard.css';

function Dashboard({ profiles, selectedProfile, onSelectProfile, onRemoveProfile, onRefresh, onRefreshAll, refreshing, loading }) {
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');

  const sortedProfiles = [...profiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return (a.current_status === 'online' ? 0 : 1) - (b.current_status === 'online' ? 0 : 1);
      case 'recent':
        return new Date(b.last_check || 0) - new Date(a.last_check || 0);
      default:
        return 0;
    }
  });

  const filteredProfiles = filterStatus === 'all'
    ? sortedProfiles
    : sortedProfiles.filter(p => p.current_status === filterStatus);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔍 Facebook Profile Tracker</h1>
        <p className="subtitle">Real-time monitoring dashboard</p>
      </div>

      <div className="dashboard-controls">
        <div className="control-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="recent">Recently Checked</option>
          </select>
        </div>

        <div className="control-group">
          <label>Filter:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Profiles</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="control-group">
          <button 
            className="btn-refresh-all" 
            onClick={onRefreshAll}
            disabled={refreshing || loading}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh All'}
          </button>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No profiles tracked yet</h2>
          <p>Add your first Facebook profile to get started</p>
          <button className="btn-primary" onClick={() => window.location.href = '/add'}>
            ➕ Add Profile
          </button>
        </div>
      ) : (
        <div className="profiles-container">
          <div className="profiles-stats">
            <div className="stat">
              <span className="stat-label">Total Profiles</span>
              <span className="stat-value">{profiles.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Online Now</span>
              <span className="stat-value online">
                {profiles.filter(p => p.current_status === 'online').length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Offline</span>
              <span className="stat-value offline">
                {profiles.filter(p => p.current_status === 'offline').length}
              </span>
            </div>
          </div>

          <div className="profiles-grid">
            {filteredProfiles.map(profile => (
              <ProfileCard
                key={profile.fb_id}
                profile={profile}
                isSelected={selectedProfile?.fb_id === profile.fb_id}
                onSelect={() => onSelectProfile(profile)}
                onRemove={() => onRemoveProfile(profile.fb_id)}
                onRefresh={() => onRefresh(profile.fb_id)}
                refreshing={refreshing}
              />
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="no-results">
              <p>No profiles match your filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
