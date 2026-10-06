import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Analytics({ fbId, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
    fetchHistory();
  }, [fbId, days]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/${fbId}/analytics`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/${fbId}/history?days=${days}`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>📊 Profile Analytics</h1>
        <p className="subtitle">Detailed tracking statistics</p>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          <div className="analytics-stats">
            {analytics && (
              <>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <div className="stat-label">Today's Sessions</div>
                    <div className="stat-value">{analytics.today_sessions}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-label">Total Checks</div>
                    <div className="stat-value">{analytics.total_checks}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <div className="stat-label">This Week</div>
                    <div className="stat-value">{analytics.week_sessions} sessions</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📉</div>
                  <div className="stat-content">
                    <div className="stat-label">Daily Average</div>
                    <div className="stat-value">{analytics.avg_daily_sessions.toFixed(1)}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="history-section">
            <div className="history-header">
              <h2>📜 Activity History</h2>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={7}>Last 7 Days</option>
                <option value={15}>Last 15 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>

            {history.length === 0 ? (
              <div className="no-history">No activity history yet</div>
            ) : (
              <div className="history-list">
                {history.slice(0, 50).map((entry, index) => (
                  <div key={index} className={`history-entry ${entry.status}`}>
                    <div className="entry-status">
                      {entry.status === 'online' ? '🟢' : '⚪'} {entry.online_status}
                    </div>
                    <div className="entry-time">
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    <div className="entry-last-seen">{entry.last_seen}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
