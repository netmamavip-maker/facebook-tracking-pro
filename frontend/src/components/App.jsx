import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import '../styles/App.css';
import Dashboard from './components/Dashboard';
import AddProfile from './components/AddProfile';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Header from './components/Header';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [socket, setSocket] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('profile_update', (data) => {
      setProfiles(prevProfiles =>
        prevProfiles.map(profile =>
          profile.fb_id === data.fb_id
            ? { ...profile, current_status: data.status, online_text: data.online_text, last_check: data.timestamp }
            : profile
        )
      );
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Fetch profiles on mount
  useEffect(() => {
    fetchProfiles();
    const interval = setInterval(fetchProfiles, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch all profiles
  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles`);
      const data = await response.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  }, []);

  // Add new profile
  const handleAddProfile = async (profileUrl) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/profiles/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profileUrl })
      });
      const data = await response.json();
      if (data.success) {
        await fetchProfiles();
        setCurrentPage('dashboard');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error adding profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove profile
  const handleRemoveProfile = async (fbId) => {
    if (window.confirm('Are you sure you want to remove this profile?')) {
      try {
        const response = await fetch(`${API_URL}/api/profiles/${fbId}/remove`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          await fetchProfiles();
          setSelectedProfile(null);
        }
      } catch (error) {
        alert(`Error removing profile: ${error.message}`);
      }
    }
  };

  // Manual refresh
  const handleManualRefresh = async (fbId) => {
    setRefreshing(true);
    try {
      const response = await fetch(`${API_URL}/api/refresh/${fbId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        await fetchProfiles();
      }
    } catch (error) {
      alert(`Error refreshing: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh all profiles
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      for (const profile of profiles) {
        await fetch(`${API_URL}/api/refresh/${profile.fb_id}`, {
          method: 'POST'
        });
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between requests
      }
      await fetchProfiles();
    } catch (error) {
      alert(`Error refreshing: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // Export data
  const handleExportData = () => {
    const dataStr = JSON.stringify(profiles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facebook-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        profileCount={profiles.length}
      />

      <main className="main-content">
        {currentPage === 'dashboard' && (
          <Dashboard
            profiles={profiles}
            selectedProfile={selectedProfile}
            onSelectProfile={setSelectedProfile}
            onRemoveProfile={handleRemoveProfile}
            onRefresh={handleManualRefresh}
            onRefreshAll={handleRefreshAll}
            refreshing={refreshing}
            loading={loading}
          />
        )}

        {currentPage === 'add' && (
          <AddProfile
            onAddProfile={handleAddProfile}
            loading={loading}
            onCancel={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'analytics' && selectedProfile && (
          <Analytics
            profile={selectedProfile}
            fbId={selectedProfile.fb_id}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'settings' && (
          <Settings
            onExport={handleExportData}
            profileCount={profiles.length}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Facebook Tracker Premium v1.0 | Real-time Profile Monitoring</p>
      </footer>
    </div>
  );
}

export default App;
