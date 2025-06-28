import api from './api';

const retroService = {
  // Get all retro products with optional era filter
  getRetroProducts: async (era = 'all') => {
    try {
      const response = await api.get('/retro/products', {
        params: { era: era === 'all' ? undefined : era }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching retro products:', error);
      throw error;
    }
  },

  // Get retro product by ID
  getRetroProductById: async (productId) => {
    try {
      const response = await api.get(`/retro/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching retro product ${productId}:`, error);
      throw error;
    }
  },

  // Get featured retro products
  getFeaturedRetroProducts: async (limit = 4) => {
    try {
      const response = await api.get('/retro/products/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured retro products:', error);
      throw error;
    }
  },

  // Get all available eras
  getEras: async () => {
    try {
      const response = await api.get('/retro/eras');
      return response.data;
    } catch (error) {
      console.error('Error fetching eras:', error);
      throw error;
    }
  },

  // Get retro collection stats
  getCollectionStats: async () => {
    try {
      const response = await api.get('/retro/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching retro collection stats:', error);
      throw error;
    }
  }
};

export default retroService;
