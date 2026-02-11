import vi from './translations';

// Simple hook to use translations
export const useTranslation = () => {
  return { t: vi };
};

// Helper function to get nested translation
export const t = (path) => {
  const keys = path.split('.');
  let value = vi;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return the path if translation not found
    }
  }
  
  return value;
};

export default useTranslation;
