import api from './api';

const companyService = {
  // Get company information
  getCompanyInfo: async () => {
    try {
      const response = await api.get('/company/info');
      return response.data;
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw error;
    }
  },

  // Get company story
  getCompanyStory: async () => {
    try {
      const response = await api.get('/company/story');
      return response.data;
    } catch (error) {
      console.error('Error fetching company story:', error);
      throw error;
    }
  },

  // Get company mission and values
  getMissionValues: async () => {
    try {
      const response = await api.get('/company/mission-values');
      return response.data;
    } catch (error) {
      console.error('Error fetching mission and values:', error);
      throw error;
    }
  },

  // Get team members
  getTeamMembers: async () => {
    try {
      const response = await api.get('/company/team');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  // Get sustainability practices
  getSustainabilityPractices: async () => {
    try {
      const response = await api.get('/company/sustainability');
      return response.data;
    } catch (error) {
      console.error('Error fetching sustainability practices:', error);
      throw error;
    }
  },

  // Get career opportunities
  getCareerOpportunities: async () => {
    try {
      const response = await api.get('/company/careers');
      return response.data;
    } catch (error) {
      console.error('Error fetching career opportunities:', error);
      throw error;
    }
  },

  // Get press releases and media
  getPressMedia: async () => {
    try {
      const response = await api.get('/company/press');
      return response.data;
    } catch (error) {
      console.error('Error fetching press and media:', error);
      throw error;
    }
  }
};

export default companyService;
