// Safe localStorage utilities

export const storage = {
  // Get item from localStorage with error handling
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') {
        return null;
      }
      return item;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  },

  // Set item to localStorage with error handling
  setItem: (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key} to localStorage:`, error);
    }
  },

  // Remove item from localStorage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  },

  // Get JSON object from localStorage
  getJSON: (key) => {
    try {
      const item = storage.getItem(key);
      if (!item) {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing JSON for ${key}:`, error);
      return null;
    }
  },

  // Set JSON object to localStorage
  setJSON: (key, value) => {
    try {
      if (value === null || value === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error stringifying JSON for ${key}:`, error);
    }
  },

  // Clear all items
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

export default storage;
