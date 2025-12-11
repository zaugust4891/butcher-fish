/**
 * API Service Layer
 * 
 * Think of this as a "translator" that speaks to your Flask backend.
 * All HTTP requests go through here, which gives us:
 * 1. Single place to manage auth tokens
 * 2. Consistent error handling
 * 3. Easy to swap between real API and mock data
 * 
 * The '/api' prefix gets rewritten by Vite's proxy to hit localhost:5000
 */

// In development, Vite proxies /api/* to Flask
// In production, you'd set this to your actual API URL
const API_BASE = '/api';

class ApiService {
  constructor() {
    this._accessToken = null;
    this._refreshToken = null;
  }

  // ─────────────────────────────────────────────────────────────────
  // Token Management
  // ─────────────────────────────────────────────────────────────────
  
  setTokens(access, refresh) {
    this._accessToken = access;
    this._refreshToken = refresh;
    // Persist to sessionStorage so tokens survive page refresh
    // (Use localStorage if you want them to persist across browser sessions)
    if (access) {
      sessionStorage.setItem('access_token', access);
      sessionStorage.setItem('refresh_token', refresh);
    }
  }

  loadTokens() {
    this._accessToken = sessionStorage.getItem('access_token');
    this._refreshToken = sessionStorage.getItem('refresh_token');
    return !!this._accessToken;
  }

  clearTokens() {
    this._accessToken = null;
    this._refreshToken = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }

  get isAuthenticated() {
    return !!this._accessToken;
  }

  // ─────────────────────────────────────────────────────────────────
  // HTTP Helpers
  // ─────────────────────────────────────────────────────────────────
  
  _getHeaders(includeAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth && this._accessToken) {
      headers['Authorization'] = `Bearer ${this._accessToken}`;
    }
    return headers;
  }

  async _request(method, endpoint, body = null, requiresAuth = false) {
    const options = {
      method,
      headers: this._getHeaders(requiresAuth),
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Handle 401 - try to refresh token
    if (response.status === 401 && this._refreshToken) {
      const refreshed = await this._refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        options.headers = this._getHeaders(true);
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, options);
        return this._handleResponse(retryResponse);
      }
    }
    
    return this._handleResponse(response);
  }

  async _handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const error = new Error(data.error || data.msg || 'Request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  }

  async _refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE}/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._refreshToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, data.refresh);
        return true;
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
    
    // Refresh failed - clear tokens and force re-login
    this.clearTokens();
    return false;
  }

  // ─────────────────────────────────────────────────────────────────
  // Auth Endpoints - maps to app/routes/auth.py
  // ─────────────────────────────────────────────────────────────────
  
  async register(username, email, password) {
    return this._request('POST', '/register', { username, email, password });
  }

  async login(username, password) {
    const data = await this._request('POST', '/login', { username, password });
    if (data.access_token) {
      this.setTokens(data.access_token, data.refresh_token);
    }
    return data;
  }

  async logout() {
    try {
      await this._request('POST', '/logout', null, true);
    } finally {
      this.clearTokens();
    }
  }

  async logoutAll() {
    try {
      await this._request('POST', '/logout-all', null, true);
    } finally {
      this.clearTokens();
    }
  }

  async me() {
    return this._request('GET', '/me', null, true);
  }

  async forgotPassword(email) {
    return this._request('POST', '/forgot_password', { email });
  }

  async resetPassword(token, password) {
    return this._request('POST', '/reset-password', { token, password });
  }

  // ─────────────────────────────────────────────────────────────────
  // Market Endpoints - maps to app/routes/markets.py
  // ─────────────────────────────────────────────────────────────────
  
  async getMarkets() {
    return this._request('GET', '/');
  }

  async getLeaderboard() {
    return this._request('GET', '/leaderboard');
  }

  async getMarketSentiment(marketId) {
    return this._request('GET', `/${marketId}/sentiment`);
  }

  async createMarket(name, address, type) {
    return this._request('POST', '/', { name, address, type }, true);
  }

  // ─────────────────────────────────────────────────────────────────
  // Review Endpoints - maps to app/routes/reviews.py
  // ─────────────────────────────────────────────────────────────────
  
  async postReview(marketId, review, rating) {
    return this._request('POST', `/${marketId}/review`, { review, rating }, true);
  }

  // ─────────────────────────────────────────────────────────────────
  // Profile Endpoints - will map to app/routes/profiles.py (coming soon)
  // ─────────────────────────────────────────────────────────────────
  
  async getProfile(userId) {
    return this._request('GET', `/profiles/${userId}`, null, true);
  }

  async updateMyProfile(profileData) {
    return this._request('PUT', '/profiles/me', profileData, true);
  }

  async followUser(userId) {
    return this._request('POST', `/users/${userId}/follow`, null, true);
  }

  async unfollowUser(userId) {
    return this._request('DELETE', `/users/${userId}/follow`, null, true);
  }

  async getFollowers(userId) {
    return this._request('GET', `/users/${userId}/followers`);
  }

  async getFollowing(userId) {
    return this._request('GET', `/users/${userId}/following`);
  }

  async followMarket(marketId) {
    return this._request('POST', `/markets/${marketId}/follow`, null, true);
  }

  async unfollowMarket(marketId) {
    return this._request('DELETE', `/markets/${marketId}/follow`, null, true);
  }
}

// Export a singleton instance
export const api = new ApiService();

// Also export the class for testing
export default ApiService;
