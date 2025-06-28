import api from './api';

const craftService = {
  // Get all artisans
  getArtisans: async () => {
    try {
      const response = await api.get('/artisans');
      return response.data;
    } catch (error) {
      console.error('Error fetching artisans:', error);
      throw error;
    }
  },

  // Get artisan by ID
  getArtisanById: async (artisanId) => {
    try {
      const response = await api.get(`/artisans/${artisanId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching artisan ${artisanId}:`, error);
      throw error;
    }
  },

  // Get featured artisans
  getFeaturedArtisans: async (limit = 3) => {
    try {
      const response = await api.get('/artisans/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured artisans:', error);
      throw error;
    }
  },

  // Get craft techniques
  getCraftTechniques: async () => {
    try {
      const response = await api.get('/craft/techniques');
      return response.data;
    } catch (error) {
      console.error('Error fetching craft techniques:', error);
      throw error;
    }
  },

  // Get technique by ID
  getTechniqueById: async (techniqueId) => {
    try {
      const response = await api.get(`/craft/techniques/${techniqueId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching technique ${techniqueId}:`, error);
      throw error;
    }
  },

  // Get craft workshops
  getWorkshops: async () => {
    try {
      const response = await api.get('/craft/workshops');
      return response.data;
    } catch (error) {
      console.error('Error fetching workshops:', error);
      throw error;
    }
  },

  // Register for workshop
  registerForWorkshop: async (workshopId, userData) => {
    try {
      const response = await api.post(`/craft/workshops/${workshopId}/register`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error registering for workshop ${workshopId}:`, error);
      throw error;
    }
  },

  // Get craft stories
  getCraftStories: async () => {
    try {
      const response = await api.get('/craft/stories');
      return response.data;
    } catch (error) {
      console.error('Error fetching craft stories:', error);
      throw error;
    }
  }
};

export default craftService;
