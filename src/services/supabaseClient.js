import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback values
const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL || 'https://ivqlwwzqaevvloloofjf.supabase.co',
  key: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cWx3d3pxYWV2dmxvbG9vZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTU2NjIsImV4cCI6MjA2MzgzMTY2Mn0.jO7Gj14immdvAtVx4f3whb-2AWddpyQj-AayO-YIrEE'
};

// Validate configuration
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
  console.error('Missing Supabase configuration: URL or API key is not defined in environment variables');
  // Don't throw here, as we have fallback values
}

// Network status tracking
let connectionAttempts = 0;
let networkStatus = 'unknown';  // 'online', 'offline', or 'unknown'

// Probe function to check network connectivity
const checkNetworkConnectivity = async () => {
  try {
    const probe = await fetch('https://www.google.com/generate_204', { 
      mode: 'no-cors',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    networkStatus = 'online';
    return true;
  } catch (error) {
    networkStatus = 'offline';
    console.warn('Network connectivity issues detected');
    return false;
  }
};

// Silence specific error patterns that flood the console
const originalConsoleError = console.error;
console.error = function(msg, ...args) {
  // Skip logging for these common non-error conditions
  const shouldSilence = (
    // Normal auth state for non-logged in users
    (typeof msg === 'string' && msg.includes('Supabase auth.getUser error') && 
     args?.[0]?.message?.includes('Auth session missing')) ||
    
    // Common network issues that are handled elsewhere
    (typeof msg === 'string' && msg.includes('Failed to load resource') && 
     (msg.includes('ERR_NAME_NOT_RESOLVED') || msg.includes('ERR_INTERNET_DISCONNECTED')))
  );
  
  if (shouldSilence) {
    return;
  }
  
  // Log all other errors normally
  originalConsoleError.apply(console, [msg, ...args]);
};

// Enhanced fetch with better error handling
const enhancedFetch = async (url, options) => {
  // First check if we have connectivity
  if (networkStatus === 'offline') {
    throw {
      message: 'You appear to be offline. Please check your internet connection.',
      code: 'OFFLINE_ERROR'
    };
  }
  
  try {
    // Standard fetch with no fallback
    return await fetch(url, options);
  } catch (error) {
    connectionAttempts++;
    
    // Provide more helpful error message
    if (error.message?.includes('Failed to fetch')) {
      console.error('Connection to Supabase failed:', error.message);
      throw {
        message: 'Unable to connect to the service. Please check your internet connection and try again.',
        originalError: error,
        code: 'CONNECTION_ERROR'
      };
    }
    
    // Handle other errors
    throw {
      message: `Network error: ${error.message}`,
      originalError: error,
      code: 'NETWORK_ERROR'
    };
  }
};

// Call once at startup
checkNetworkConnectivity();

// Create Supabase client with enhanced configuration
let supabase;
try {
  supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    fetch: enhancedFetch
  },
  db: { 
    schema: 'public' 
  },
  realtime: {
    params: {
      eventsPerSecond: 1 // Reduce frequency to improve stability
    }
  }
});
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock client to prevent app from crashing
  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signIn: () => Promise.reject('Supabase not initialized'),
      signOut: () => Promise.reject('Supabase not initialized'),
      session: () => ({ data: { session: null } }),
    },
    from: () => ({
      select: () => ({ data: null, error: 'Supabase not initialized' }),
      insert: () => ({ data: null, error: 'Supabase not initialized' }),
      update: () => ({ data: null, error: 'Supabase not initialized' }),
      delete: () => ({ data: null, error: 'Supabase not initialized' }),
    }),
  };
}

// Export the client for use throughout the app
export { supabase };
// Export for backward compatibility with existing code
export const supabaseClient = supabase;

// Helper functions for common Supabase operations

/**
 * Get user addresses
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - The user's addresses
 */
export const getUserAddresses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting addresses:', error);
    return [];
  }
};

/**
 * Save a new address
 * @param {Object} addressData - The address data to save
 * @returns {Promise<Object>} - The saved address
 */
export const saveAddress = async (addressData) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert([addressData])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error saving address:', error);
    throw error;
  }
};

/**
 * Validate a discount code
 * @param {string} code - The discount code to validate
 * @returns {Promise<Object|null>} - The discount code data or null if invalid
 */
export const validateDiscountCode = async (code) => {
  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single();
      
    if (error) return null;
    
    // Check if the code has expired
    if (data.end_date && new Date(data.end_date) < new Date()) {
      return null;
    }
    
    // Check if the code has reached max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error validating discount code:', error);
    return null;
  }
};

/**
 * Update discount code usage counter
 * @param {string} id - The discount code ID
 * @param {number} currentUses - The current number of uses
 * @returns {Promise<boolean>} - Success status
 */
export const incrementDiscountCodeUsage = async (id, currentUses) => {
  try {
    const { error } = await supabase
      .from('discount_codes')
      .update({ current_uses: currentUses + 1 })
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating discount code usage:', error);
    return false;
  }
};

// Register network status listeners
window.addEventListener('online', () => {
  networkStatus = 'online';
  console.log('Network connection restored');
});

window.addEventListener('offline', () => {
  networkStatus = 'offline';
  console.log('Network connection lost');
});

// Helper functions with offline detection and error handling
export const getUser = async () => {
  // First check if we're offline
  if (networkStatus === 'offline') {
    console.log('Offline: Returning empty user state');
    return { user: null };
  }
  
  try {
    // Try to get user with automatic retry
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      // Common expected error when not signed in
      if (error.message?.includes('Auth session missing')) {
        return { user: null };
      }
      
      // DNS or network errors with helpful messaging
      if (error.code === 'CONNECTION_ERROR' || 
          error.code === 'NETWORK_ERROR' || 
          error.message?.includes('Failed to fetch')) {
        console.warn('Connection issues detected during auth check');
        return { user: null, connectionIssue: true };
      }
      
      throw error;
    }
    
    return data;
  } catch (error) {
    // Only log unexpected errors
    if (!error.message?.includes('Auth session missing')) {
      console.warn('Error in getUser (handled):', error.message);
    }
    return { user: null };
  }
};

// Export connection status for UI feedback
export const getConnectionStatus = () => {
  return {
    isOnline: networkStatus === 'online',
    connectionAttempts
  };
};

export const getUserCart = async (userId) => {
  if (!userId) return null;
  
  try {
    // Get the cart
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (cartError) throw cartError;
    if (!cartData) return { items: [], total: 0 };
    
    // Get cart items
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('cart_id', cartData.id);
      
    if (itemsError) throw itemsError;
    
    // Format items for frontend use
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
      name: item.products.name,
      image: item.products.image,
      size: item.options?.size || 'One Size',
      color: item.options?.color || 'Default'
    }));
    
    // Calculate total
    const total = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return { 
      items: formattedItems, 
      total,
      cartId: cartData.id
    };
  } catch (error) {
    console.error('Error getting user cart:', error);
    return { items: [], total: 0 };
  }
};

// Export default for backwards compatibility
export default supabaseClient;
