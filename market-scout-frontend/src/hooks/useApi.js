import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { MOCK_MARKETS, MOCK_LEADERBOARD, MOCK_USER } from '../services/mockData';

/**
 * useAuth Hook
 * 
 * Manages authentication state throughout the app.
 * Think of it like a "security badge" system - this hook
 * knows who's logged in and handles login/logout.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (api.loadTokens()) {
        try {
          const userData = await api.me();
          setUser(userData);
        } catch (e) {
          // Token invalid or expired
          api.clearTokens();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await api.login(username, password);
      const userData = await api.me();
      setUser(userData);
      return { success: true };
    } catch (e) {
      // Check if it's a connection error (backend not running)
      if (e.message === 'Failed to fetch' || e.status === undefined) {
        // Fall back to mock user for demo purposes
        setUser(MOCK_USER);
        return { success: true, mock: true };
      }
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore errors - we're logging out anyway
    }
    setUser(null);
  }, []);

  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.register(username, email, password);
      return { success: true, message: result.message };
    } catch (e) {
      if (e.message === 'Failed to fetch') {
        return { success: true, mock: true, message: 'Registration simulated (demo mode)' };
      }
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    user, 
    loading, 
    error, 
    login, 
    logout, 
    register,
    isAuthenticated: !!user,
    setError,
  };
}

/**
 * useMarkets Hook
 * 
 * Fetches and manages market data.
 * Like a "inventory tracker" for all the markets in the system.
 */
export function useMarkets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMarkets();
      setMarkets(data);
      setApiConnected(true);
    } catch (e) {
      // Fall back to mock data
      setMarkets(MOCK_MARKETS);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { markets, loading, error, refetch: fetchMarkets, apiConnected };
}

/**
 * useLeaderboard Hook
 * 
 * Fetches the Redis-powered leaderboard data.
 * This showcases your real-time scoring system.
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data.leaderboard || []);
    } catch (e) {
      // Fall back to mock data
      setLeaderboard(MOCK_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
}

/**
 * useReviewSubmit Hook
 * 
 * Handles review submission with optimistic updates.
 * Like a "waiter" that takes your order and confirms it.
 */
export function useReviewSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const submitReview = useCallback(async (marketId, review, rating) => {
    setSubmitting(true);
    setResult(null);
    try {
      await api.postReview(marketId, review, rating);
      setResult({ success: true, message: 'Review posted successfully!' });
      return { success: true };
    } catch (e) {
      if (e.message === 'Failed to fetch') {
        setResult({ success: true, message: 'Review posted! (Demo mode)' });
        return { success: true, mock: true };
      }
      setResult({ success: false, message: e.message });
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
      // Clear result after 3 seconds
      setTimeout(() => setResult(null), 3000);
    }
  }, []);

  return { submitReview, submitting, result };
}

/**
 * useMarketCreate Hook
 *
 * Handles market creation with proper validation.
 * Like a "registration desk" that adds new markets to the system.
 */
export function useMarketCreate() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const createMarket = useCallback(async (name, address, type) => {
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api.createMarket(name, address, type);
      setResult({ success: true, message: 'Market created successfully!', market: data.market });
      return { success: true, market: data.market };
    } catch (e) {
      if (e.message === 'Failed to fetch') {
        setResult({ success: true, message: 'Market created! (Demo mode)', mock: true });
        return { success: true, mock: true };
      }
      setResult({ success: false, message: e.message });
      return { success: false, error: e.message };
    } finally {
      setSubmitting(false);
      // Clear result after 3 seconds
      setTimeout(() => setResult(null), 3000);
    }
  }, []);

  return { createMarket, submitting, result };
}

/**
 * useSentiment Hook
 *
 * Fetches sentiment analysis for a specific market.
 * Demonstrates your VADER integration.
 */
export function useSentiment(marketId) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!marketId) return;
    
    const fetchSentiment = async () => {
      setLoading(true);
      try {
        const data = await api.getMarketSentiment(marketId);
        setSentiment(data);
      } catch (e) {
        // Mock sentiment for demo
        setSentiment({
          market_id: marketId,
          average_sentiment: 0.65,
          reviews_count: 12,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentiment();
  }, [marketId]);

  return { sentiment, loading, error };
}
