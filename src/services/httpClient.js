/**
 * @file src/services/httpClient.js
 * @description Advanced Axios instance for TMDB API.
 * Features:
 * - Authentication & Base URL
 * - In-Memory TTL Caching for GET requests
 * - Automatic Retry with Exponential Backoff (429, 5xx)
 * - Centralized Error Mapping
 */

import axios from 'axios';
import ENV from '@config/env.js';

// ─── Constants & State ────────────────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// In-memory cache map: Map<string, { data: any, timestamp: number }>
const responseCache = new Map();

/**
 * Generate a unique cache key based on URL and query params.
 */
function generateCacheKey(config) {
  // Only cache GET requests
  if (config.method?.toLowerCase() !== 'get') return null;
  // If explicitly disabled via custom config
  if (config.cache === false) return null;

  const url = config.url ?? '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${url}?${params}`;
}

// ─── Create Instance ─────────────────────────────────────────────────────────
const httpClient = axios.create({
  baseURL: ENV.TMDB_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  params: {
    api_key: ENV.TMDB_API_KEY,
    language: 'en-US',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config) => {
    // 1. Caching check
    const cacheKey = generateCacheKey(config);
    if (cacheKey && responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
      
      if (!isExpired) {
        if (ENV.IS_DEV) {
          console.debug(`[HTTP Cache Hit] ${config.url}`);
        }
        // Cancel the actual request, returning cached data via a custom CancelToken
        config.cancelToken = new axios.CancelToken((cancel) => {
          cancel({ isCache: true, cachedData: cached.data });
        });
        return config;
      } else {
        // Clear expired cache
        responseCache.delete(cacheKey);
      }
    }

    if (ENV.IS_DEV) {
      console.debug(`[HTTP Fetch] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Initialize retry counter if not present
    if (config.retryCount === undefined) {
      config.retryCount = 0;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => {
    // Cache the successful response
    const cacheKey = generateCacheKey(response.config);
    if (cacheKey) {
      responseCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response.data;
  },
  async (error) => {
    // Handle our custom cache abortion
    if (axios.isCancel(error) && error.message?.isCache) {
      return Promise.resolve(error.message.cachedData);
    }
    
    // Handle AbortController cancellations (e.g. from React hooks unmounting)
    if (axios.isCancel(error)) {
      if (ENV.IS_DEV) console.debug('[HTTP] Request aborted');
      return Promise.reject(error);
    }

    const config = error.config;
    const status = error.response?.status;

    // ─── Retry Logic ─────────────────────────────────────────────────────────
    // Retry on 429 (Rate Limit) or 5xx (Server Errors)
    const shouldRetry = status === 429 || (status >= 500 && status < 600);
    
    if (config && shouldRetry && config.retryCount < MAX_RETRIES) {
      config.retryCount += 1;
      const delay = RETRY_DELAY_MS * Math.pow(2, config.retryCount - 1); // Exponential backoff
      
      if (ENV.IS_DEV) {
        console.warn(`[HTTP Retry] Retrying ${config.url} in ${delay}ms (Attempt ${config.retryCount}/${MAX_RETRIES})`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay));
      return httpClient(config);
    }

    // ─── Error Mapping ───────────────────────────────────────────────────────
    const message = error.response?.data?.status_message ?? error.message;
    const errorMap = {
      401: 'Unauthorized – check your TMDB API key.',
      403: 'Forbidden – insufficient permissions.',
      404: 'Resource not found.',
      429: 'Rate limit exceeded – please slow down.',
      500: 'TMDB server error. Try again later.',
    };

    const friendlyMessage = errorMap[status] ?? message ?? 'An unexpected error occurred.';

    if (ENV.IS_DEV) {
      console.error(`[HTTP Error] ${status ?? 'NETWORK'}: ${friendlyMessage}`);
    }

    return Promise.reject({
      status,
      message: friendlyMessage,
      original: error,
    });
  }
);

/**
 * Expose a way to clear the entire cache programmatically
 * Useful on User logout or forced manual refreshes
 */
httpClient.clearCache = () => {
  responseCache.clear();
  if (ENV.IS_DEV) console.debug('[HTTP Cache] Cleared');
};

export default httpClient;
