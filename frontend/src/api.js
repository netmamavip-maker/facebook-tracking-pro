// API Utility Module
// Centralized API calls for frontend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class APIClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
    this.timeout = 15000;
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // ==================== PROFILE ENDPOINTS ====================

  /**
   * Get all profiles
   */
  getProfiles() {
    return this.get('/api/profiles');
  }

  /**
   * Add new profile
   */
  addProfile(profileUrl) {
    return this.post('/api/profiles/add', {
      profile_url: profileUrl,
    });
  }

  /**
   * Get profile status
   */
  getProfileStatus(fbId) {
    return this.get(`/api/profiles/${fbId}/status`);
  }

  /**
   * Get profile history
   */
  getProfileHistory(fbId, days = 30) {
    return this.get(`/api/profiles/${fbId}/history?days=${days}`);
  }

  /**
   * Get profile analytics
   */
  getProfileAnalytics(fbId) {
    return this.get(`/api/profiles/${fbId}/analytics`);
  }

  /**
   * Remove profile
   */
  removeProfile(fbId) {
    return this.delete(`/api/profiles/${fbId}/remove`);
  }

  /**
   * Manual refresh profile
   */
  refreshProfile(fbId) {
    return this.post(`/api/refresh/${fbId}`, {});
  }

  // ==================== SETTINGS ENDPOINTS ====================

  /**
   * Get settings
   */
  getSettings() {
    return this.get('/api/settings');
  }

  /**
   * Update settings
   */
  updateSettings(settings) {
    return this.post('/api/settings', settings);
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check API health
   */
  health() {
    return this.get('/');
  }
}

// Export singleton instance
export default new APIClient();
