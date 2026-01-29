// Simple cache utility for API responses
// Reduces API calls and improves perceived performance

class ApiCache {
  constructor(defaultTTL = 5 * 60 * 1000) {
    // Default 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  // Generate cache key from request params
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return `${endpoint}?${sortedParams}`;
  }

  // Get cached data if valid
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Store data in cache
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now(),
    });
  }

  // Check if cache has valid data
  has(key) {
    return this.get(key) !== null;
  }

  // Clear specific cache entry
  invalidate(key) {
    this.cache.delete(key);
  }

  // Clear all cache entries matching a pattern
  invalidatePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
const apiCache = new ApiCache();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000, // 1 minute - for rapidly changing data
  MEDIUM: 5 * 60 * 1000, // 5 minutes - for product lists
  LONG: 15 * 60 * 1000, // 15 minutes - for categories, static data
  VERY_LONG: 60 * 60 * 1000, // 1 hour - for rarely changing data
};

export default apiCache;
