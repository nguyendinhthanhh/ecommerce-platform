/**
 * Smart image fallback utility to provide high-quality backup images from the internet
 * when database image URLs are broken or missing.
 */

const FALLBACK_MAP = {
  // Apple
  'iphone': 'https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=800&auto=format&fit=crop',
  'macbook': 'https://images.unsplash.com/photo-1724859234679-964acf07b126?q=80&w=800&auto=format&fit=crop',
  
  // Samsung
  'galaxy s24': 'https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=800&auto=format&fit=crop',
  'galaxy z': 'https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=800&auto=format&fit=crop',
  'galaxy a': 'https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=800&auto=format&fit=crop',
  'samsung': 'https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=800&auto=format&fit=crop',
  
  // Xiaomi
  'xiaomi': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
  'redmi': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
};

const CATEGORY_FALLBACKS = {
  'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop',
  'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop',
  'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000&auto=format&fit=crop',
  'headphone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
  'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
};

/**
 * Returns a high-quality internet image URL based on product name or category
 * @param {Object} product - The product object from backend
 * @returns {string} - Fallback image URL
 */
export const getSmartFallbackImage = (product) => {
  if (!product?.name) return CATEGORY_FALLBACKS['smartphone'];

  const name = product.name.toLowerCase();
  
  // 1. Try exact or partial model match
  for (const [key, url] of Object.entries(FALLBACK_MAP)) {
    if (name.includes(key)) return url;
  }

  // 2. Try brand keyword match for specific generic placeholders if needed
  if (name.includes('iphone')) return FALLBACK_MAP['iphone 15'];
  if (name.includes('samsung') || name.includes('galaxy')) return FALLBACK_MAP['galaxy s24 ultra'];
  if (name.includes('xiaomi') || name.includes('redmi')) return FALLBACK_MAP['xiaomi 14 ultra'];

  // 3. Try category-based match
  const categoryName = (product?.categoryName || '').toLowerCase();
  if (name.includes('laptop') || categoryName.includes('laptop')) return CATEGORY_FALLBACKS['laptop'];
  if (name.includes('tablet') || name.includes('ipad') || categoryName.includes('tablet')) return CATEGORY_FALLBACKS['tablet'];
  if (name.includes('phone') || categoryName.includes('phone') || categoryName.includes('mobile')) return CATEGORY_FALLBACKS['smartphone'];
  if (name.includes('watch') || categoryName.includes('watch')) return CATEGORY_FALLBACKS['watch'];

  // 4. Default global fallback
  return CATEGORY_FALLBACKS['smartphone'];
};
