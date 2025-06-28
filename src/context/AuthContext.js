import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthContext: Initializing authentication...');
        // Check if user is already logged in via Supabase session
        const userData = await userService.getCurrentUser();
        console.log('AuthContext: Current user data:', userData);
        
        if (userData?.data?.user) {
          console.log('AuthContext: Setting current user with data:', userData.data.user);
          setCurrentUser(userData.data.user);
        } else {
          console.log('AuthContext: No authenticated user found');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    // Listen for auth state changes
    const { data: authListener } = userService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        initAuth();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });
    
    // Cleanup subscription
    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('AuthContext: Attempting login with email:', email);
      const data = await userService.login(email, password);
      
      if (data?.user) {
        console.log('AuthContext: Login successful, user:', data.user);
        
        // Get the full user profile after login
        try {
          const userData = await userService.getCurrentUser();
          
          if (userData?.data?.user) {
            console.log('AuthContext: Setting enriched user data after login');
            setCurrentUser(userData.data.user);
          } else {
            // Fallback to just the auth user data
            console.log('AuthContext: Using basic user data (no profile)');
            setCurrentUser(data.user);
          }
        } catch (profileError) {
          // Don't fail the login if just the profile fetch fails
          console.warn('AuthContext: Could not fetch full profile, using basic data:', profileError);
          setCurrentUser(data.user);
        }
        
        return data;
      } else {
        console.error('AuthContext: Login returned unexpected data:', data);
        setError('Login failed. Please check your credentials.');
        throw new Error('Login failed. Invalid response format.');
      }
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      
      // Provide user-friendly error messages based on error type
      if (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT_ERROR' ||
          err.message?.includes('Failed to fetch') ||
          err.message?.includes('network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('AuthContext: Attempting registration with data:', { ...userData, password: '[REDACTED]' });
      const data = await userService.register(userData);
      
      console.log('AuthContext: Registration response:', data);
      return data;
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await userService.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
