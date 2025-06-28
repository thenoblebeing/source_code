import api from './api';

const userService = {
  // Register new user
  register: async (userData) => {
    try {
      const { email, password, name } = userData;
      
      // Use Supabase auth.signUp method with current API
      const { data, error } = await api.supabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            avatar_url: userData.avatar_url || null
          }
        }
      });
      
      if (error) throw error;
      
      // Note: The profile will be created automatically via the database trigger
      // we set up in the SQL file that runs when a new user is created
      
      return data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      // Trim to remove accidental whitespace and normalize email case
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();
      
      console.log('userService.login: Attempting login with Supabase');
      
      // Use Supabase auth.signInWithPassword method
      const { data, error } = await api.supabase().auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });
      
      if (error) {
        console.error('userService.login: Supabase auth error:', error);
        throw error;
      }
      
      console.log('userService.login: Login successful, session:', data.session?.access_token ? 'present' : 'missing');
      
      // Get user profile from profiles table
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await api.supabase()
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            console.warn('userService.login: Could not fetch profile:', profileError);
          } else if (profileData) {
            console.log('userService.login: Profile retrieved:', profileData);
            // Merge profile data with user data
            data.user = { ...data.user, profile: profileData };
          }
        } catch (profileErr) {
          console.warn('userService.login: Error fetching profile:', profileErr);
          // Continue anyway, profile is optional
        }
      }
      
      return data;
    } catch (err) {
      console.error('userService.login: Error during login:', err);
      
      // Handle specific error types
      if (err.message?.includes('Failed to fetch')) {
        throw {
          ...err,
          message: 'Network error: Unable to connect to authentication server',
          hint: 'Please check your internet connection and try again.',
          code: 'NETWORK_ERROR'
        };
      }
      
      throw err;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Use Supabase auth.signOut method
      const { error } = await api.supabase().auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  // Get current user profile with combined auth and profile data
  getCurrentUser: async () => {
    try {
      // Get the current user session from Supabase
      const { data: sessionData, error: sessionError } = await api.supabase().auth.getSession();
      
      // If there's no session or an error, user is not logged in
      if (sessionError || !sessionData || !sessionData.session) {
        // Return a standardized response for no user
        return { data: { user: null } };
      }
      
      // Get user data - this should always succeed if we have a valid session
      const { data: userData, error: userError } = await api.supabase().auth.getUser();
      
      // If we somehow get a user error with a valid session, return no user
      if (userError) {
        return { data: { user: null } };
      }
      
      // If we have no user data despite having a session
      if (!userData || !userData.user) {
        return { data: { user: null } };
      }
      
      // Get the user profile data
      try {
        const { data: profileData, error: profileError } = await api.supabase()
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') { // Not found is ok
          console.warn('Error getting profile data:', profileError);
        }
        
        // Merge user auth data with profile data
        const enrichedUser = {
          ...userData.user,
          profile: profileData || {},
          // Add key profile fields to top level for easier access
          name: profileData?.name || userData.user?.user_metadata?.name || userData.user?.user_metadata?.full_name,
          full_name: profileData?.full_name || userData.user?.user_metadata?.full_name,
          avatar_url: profileData?.avatar_url || userData.user?.user_metadata?.avatar_url
        };
        
        console.log('Enriched user data:', enrichedUser);
        
        return { 
          data: { user: enrichedUser }, 
          session: sessionData.session 
        };
      } catch (profileError) {
        console.error('Error in profile retrieval:', profileError);
        // Return just the auth user if profile retrieval fails
        return { 
          data: { user: userData.user }, 
          session: sessionData.session 
        };
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      return { data: null, error };
    }
  },
  
  // Get user profile from profiles table
  getProfile: async () => {
    try {
      console.log('Getting user profile...');
      const { data: sessionData } = await api.supabase().auth.getSession();
      
      if (!sessionData?.session?.user) {
        console.log('No active session found');
        return null;
      }
      
      const userId = sessionData.session.user.id;
      console.log('Found user ID:', userId);
      
      const { data, error } = await api.supabase()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile data:', error);
        throw error;
      }
      
      console.log('Profile data retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },
  
  // Listen for auth state changes
  onAuthStateChange: (callback) => {
    return api.supabase().auth.onAuthStateChange(callback);
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const { data: session } = await api.supabase().auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');
      
      // Update the profiles table
      const { data, error } = await api.supabase()
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          updated_at: new Date()
        })
        .eq('id', session.user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user orders with full details including items and tracking
  getUserOrders: async () => {
    try {
      // Get current user
      const user = await api.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Get orders from orders table
      const { data: orders } = await api.get('orders', {
        filters: { user_id: user.id },
        order: { column: 'created_at', ascending: false }
      });
      
      if (!orders || orders.length === 0) return [];
      
      // Enhance orders with items and tracking information
      const enhancedOrders = await Promise.all(orders.map(async (order) => {
        // Get order items
        const { data: items } = await api.get('order_items', {
          filters: { order_id: order.id }
        });
        
        // Get product details for each item
        const itemsWithProducts = await Promise.all(items.map(async (item) => {
          const { data: product } = await api.getById('products', item.product_id);
          return {
            ...item,
            product: product || {},
            name: product?.name || 'Product not available',
            image: product?.images?.[0] || '/placeholder-product.jpg'
          };
        }));
        
        // Get tracking information
        const { data: tracking } = await api.get('order_tracking', {
          filters: { order_id: order.id }
        });
        
        // Get status history
        const { data: statusHistory } = await api.get('order_status_history', {
          filters: { order_id: order.id },
          order: { column: 'created_at', ascending: false }
        });
        
        return {
          ...order,
          items: itemsWithProducts,
          tracking: tracking?.[0] || null,
          statusHistory: statusHistory || []
        };
      }));
      
      return enhancedOrders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },
  
  // Request a return for an order item
  requestReturn: async (orderItemId, reason, description, returnType = 'refund') => {
    try {
      const user = await api.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data } = await api.post('returns', {
        order_item_id: orderItemId,
        user_id: user.id,
        reason,
        description,
        return_type: returnType
      });
      
      return data;
    } catch (error) {
      console.error('Error requesting return:', error);
      throw error;
    }
  },
  
  // Get returns for the current user
  getUserReturns: async () => {
    try {
      const user = await api.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Get returns with related order items
      const { data: returns } = await api.supabase()
        .from('returns')
        .select(`
          id,
          status,
          reason,
          description,
          return_type,
          requested_at,
          processed_at,
          refund_amount,
          order_items (
            id,
            quantity,
            price,
            product_id,
            options,
            order_id,
            orders (
              id,
              status,
              created_at
            )
          )
        `)
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });
      
      // Enhance returns with product information
      const enhancedReturns = await Promise.all((returns || []).map(async (returnItem) => {
        const orderItem = returnItem.order_items;
        if (orderItem && orderItem.product_id) {
          const { data: product } = await api.getById('products', orderItem.product_id);
          return {
            ...returnItem,
            product: product || {},
            productName: product?.name || 'Product not available',
            productImage: product?.images?.[0] || '/placeholder-product.jpg'
          };
        }
        return returnItem;
      }));
      
      return enhancedReturns;
    } catch (error) {
      console.error('Error fetching user returns:', error);
      throw error;
    }
  },
  
  // Get order tracking information
  getOrderTracking: async (orderId) => {
    try {
      const { data } = await api.get('order_tracking', {
        filters: { order_id: orderId }
      });
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const { error } = await api.supabase().auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (newPassword) => {
    try {
      // Supabase handles the token through the URL
      const { error } = await api.supabase().auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

export default userService;
