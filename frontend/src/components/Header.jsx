import React from 'react';
import '../styles/Header.css';

function Header({ currentPage, onPageChange, darkMode, onToggleDarkMode, profileCount }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🔍</span>
          <h1>Facebook Tracker</h1>
          <span className="version">Premium</span>
        </div>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onPageChange('dashboard')}
        >
          <span className="nav-icon">📊</span>
          Dashboard
          {profileCount > 0 && <span className="badge">{profileCount}</span>}
        </button>

        <button
          className={`nav-item ${currentPage === 'add' ? 'active' : ''}`}
          onClick={() => onPageChange('add')}
        >
          <span className="nav-icon">➕</span>
          Add Profile
        </button>

        <button
          className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onPageChange('settings')}
        >
          <span className="nav-icon">⚙️</span>
          Settings
        </button>
      </nav>

      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;
