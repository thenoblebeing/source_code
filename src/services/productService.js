import api from './api';

const productService = {
  // Get all products
  getAllProducts: async (filters = {}) => {
    try {
      const options = {
        filters: {}
      };
      
      // Process filters
      if (filters.category) options.filters.category = filters.category;
      if (filters.min_price) options.filters.price_gte = filters.min_price;
      if (filters.max_price) options.filters.price_lte = filters.max_price;
      if (filters.in_stock !== undefined) options.filters.in_stock = filters.in_stock;
      
      // Add sorting
      if (filters.sort_by) {
        options.order = {
          column: filters.sort_by,
          ascending: filters.sort_order !== 'desc'
        };
      } else {
        options.order = { column: 'created_at', ascending: false };
      }
      
      // Add pagination
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        options.range = { from, to };
      }
      
      const { data } = await api.get('products', options);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const { data } = await api.getById('products', productId);
      return data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      // In Supabase, we would usually have a separate categories table
      const { data } = await api.get('categories');
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get subcategories for a category
  getSubcategories: async (categoryId) => {
    try {
      const { data } = await api.get('subcategories', {
        filters: { category_id: categoryId }
      });
      return data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },
  
  // Get all subcategories
  getAllSubcategories: async () => {
    try {
      const { data } = await api.get('subcategories');
      return data;
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
      throw error;
    }
  },

  // Get related products
  getRelatedProducts: async (productId, limit = 4) => {
    try {
      if (!productId) {
        console.warn('No product ID provided to getRelatedProducts');
        return [];
      }

      // First get the product to get its category
      const product = await productService.getProductById(productId);
      
      if (!product) {
        console.warn('Product not found for ID:', productId);
        return [];
      }
      
      // Get the category ID from either category or category_id
      const categoryId = product.category_id || (product.category && product.category.id) || product.category;
      
      if (!categoryId) {
        console.warn('Product has no category information:', product);
        return [];
      }
      
      console.log(`Fetching related products for category ${categoryId}, excluding product ${productId}`);
      
      // First try with category_id
      const { data: dataById } = await api.get('products', {
        filters: { 
          category_id: categoryId,
          id_not: productId // Exclude the current product
        },
        range: { from: 0, to: limit - 1 }
      });
      
      // If we got results, return them
      if (dataById && dataById.length > 0) {
        console.log(`Found ${dataById.length} related products by category_id`);
        return dataById;
      }
      
      // If no results, try with category (for backward compatibility)
      console.log('No results with category_id, trying with category field...');
      const { data: dataByCategory } = await api.get('products', {
        filters: { 
          category: categoryId,
          id_not: productId
        },
        range: { from: 0, to: limit - 1 }
      });
      
      if (dataByCategory && dataByCategory.length > 0) {
        console.log(`Found ${dataByCategory.length} related products by category field`);
        return dataByCategory;
      }
      
      // If still no results, try to get any products (except current one) as fallback
      console.log('No related products found, falling back to any available products');
      const { data: fallbackData } = await api.get('products', {
        filters: { 
          id_not: productId
        },
        range: { from: 0, to: limit - 1 },
        order: { column: 'created_at', ascending: false } // Get newest first
      });
      
      return fallbackData || [];
    } catch (error) {
      console.error(`Error fetching related products for ${productId}:`, error);
      return []; // Return empty array instead of throwing to prevent UI crashes
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const { data } = await api.get('products', {
        filters: { featured: true },
        range: { from: 0, to: limit - 1 }
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get new arrivals
  getNewArrivals: async (limit = 8) => {
    try {
      const { data } = await api.get('products', {
        order: { column: 'created_at', ascending: false },
        range: { from: 0, to: limit - 1 }
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  // Get best sellers
  getBestSellers: async (limit = 8) => {
    try {
      const { data } = await api.get('products', {
        filters: { popular: true },
        order: { column: 'created_at', ascending: false },
        range: { from: 0, to: limit - 1 }
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    try {
      // Use Supabase's full-text search
      const { data } = await api.search('products', 'name_description', query);
      
      // Apply additional filters if needed
      if (Object.keys(filters).length > 0) {
        return data.filter(product => {
          let match = true;
          
          if (filters.category && product.category !== filters.category) {
            match = false;
          }
          
          if (filters.min_price && product.price < filters.min_price) {
            match = false;
          }
          
          if (filters.max_price && product.price > filters.max_price) {
            match = false;
          }
          
          if (filters.in_stock !== undefined && product.in_stock !== filters.in_stock) {
            match = false;
          }
          
          return match;
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

export default productService;