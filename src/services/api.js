// Import supabaseClient from our centralized client file
import supabase from './supabaseClient';

// Log connection information (without exposing sensitive data)
console.log('Using Supabase client from supabaseClient.js');

// Helper function to handle API errors
const handleError = (error, operation, tableName) => {
  console.error(`Supabase ${operation} Error (${tableName}):`, error);
  throw error;
};

const api = {
  /**
   * Get Supabase client instance
   * @returns {Object} - Supabase client
   */
  supabase: () => {
    return supabase;
  },

  /**
   * Get data from a table with optional filters
   * @param {string} table - The table name
   * @param {Object} options - Query options
   * @returns {Promise} - Query result
   */
  get: async (table, options = {}) => {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Apply filters if provided
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply order if provided
      if (options.order) {
        const { column, ascending } = options.order;
        query = query.order(column, { ascending });
      }
      
      // Apply pagination if provided
      if (options.range) {
        const { from, to } = options.range;
        query = query.range(from, to);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return { data };
    } catch (error) {
      return handleError(error, 'GET', table);
    }
  },

  /**
   * Get a single record by ID
   * @param {string} table - The table name
   * @param {string|number} id - The record ID
   * @param {Object} options - Query options
   * @returns {Promise} - Query result
   */
  getById: async (table, id, options = {}) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(options.select || '*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data };
    } catch (error) {
      return handleError(error, 'GET_BY_ID', table);
    }
  },

  /**
   * Insert a new record
   * @param {string} table - The table name
   * @param {Object|Array} data - The data to insert
   * @returns {Promise} - Query result
   */
  post: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { data: result };
    } catch (error) {
      return handleError(error, 'POST', table);
    }
  },

  /**
   * Update a record
   * @param {string} table - The table name
   * @param {string|number} id - The record ID
   * @param {Object} data - The data to update
   * @returns {Promise} - Query result
   */
  put: async (table, id, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { data: result };
    } catch (error) {
      return handleError(error, 'PUT', table);
    }
  },

  /**
   * Delete a record
   * @param {string} table - The table name
   * @param {string|number} id - The record ID
   * @returns {Promise} - Query result
   */
  delete: async (table, id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return handleError(error, 'DELETE', table);
    }
  },

  /**
   * Execute a custom query with full Supabase capabilities
   * @returns {Object} - The Supabase client
   */
  supabase() {
    // Log to help with debugging
    console.log('Accessing Supabase client');
    return supabase;
  },

  /**
   * Search with full-text search capabilities
   * @param {string} table - The table name
   * @param {string} column - The column to search
   * @param {string} query - The search query
   * @returns {Promise} - Query result
   */
  search: async (table, column, query) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .textSearch(column, query);
      
      if (error) throw error;
      return { data };
    } catch (error) {
      return handleError(error, 'SEARCH', table);
    }
  },

  /**
   * Authentication methods
   */
  auth: {
    /**
     * Sign up a new user
     */
    async signUp(email, password, userData = {}) {
      console.log('Signing up user with email:', email, 'and userData:', userData);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: userData }
        });
        
        if (error) {
          console.error('Supabase auth.signUp error:', error);
          throw error;
        }
        
        console.log('Signup successful, data:', data);
        return data;
      } catch (err) {
        console.error('Error in signUp method:', err);
        throw err;
      }
    },

    /**
     * Sign in a user
     */
    async signIn(email, password) {
      console.log('Signing in user with email:', email);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Supabase auth.signInWithPassword error:', error);
          throw error;
        }
        
        console.log('Login successful, data:', data);
        return data;
      } catch (err) {
        console.error('Error in signIn method:', err);
        throw err;
      }
    },

    /**
     * Sign out
     */
    async signOut() {
      console.log('Signing out user');
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('Supabase auth.signOut error:', error);
          throw error;
        }

        console.log('Signout successful');
        return true;
      } catch (err) {
        console.error('Error in signOut method:', err);
        throw err;
      }
    },

    /**
     * Get current session
     */
    async getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase auth.getSession error:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Error in getSession method:', err);
        throw err;
      }
    },

    /**
     * Get current user
     */
    async getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Supabase auth.getUser error:', error);
          throw error;
        }

        return data.user;
      } catch (err) {
        console.error('Error in getUser method:', err);
        throw err;
      }
    },

    /**
     * Set up auth state change listener
     */
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback);
    }
  }
};

export default api;
