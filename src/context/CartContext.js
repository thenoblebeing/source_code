import React, { createContext, useState, useEffect, useContext } from 'react';
import cartService from '../services/cartService';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Refresh cart data from the database
  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data.items || []);
      setCartTotal(data.total || 0);
      return data;
    } catch (err) {
      console.error('Failed to refresh cart:', err);
      setError('Failed to refresh cart data');
      return { items: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Initialize cart on component mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Initialize cart from backend or local storage
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        // Always try to fetch from backend first
        await refreshCart();
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart');
        
        // Fallback to localStorage if API fails
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (e) {
            console.error('Error parsing saved cart:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
    
    // Set up real-time subscription to cart changes
    const setupRealtimeSubscription = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        
        const user = await api.auth.getUser();
        if (!user) return null;
        
        // Get the user's cart ID
        const { data: userCart } = await api.supabase()
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (!userCart) return null;
        
        // Subscribe to changes on the cart_items table for this cart
        const subscription = api.supabase()
          .channel('cart-changes')
          .on('postgres_changes', {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'cart_items',
            filter: `cart_id=eq.${userCart.id}` // Only listen for changes to this user's cart
          }, async (payload) => {
            console.log('Cart changed:', payload);
            // Refresh cart data when changes occur
            await refreshCart();
          })
          .subscribe();
        
        // Return cleanup function
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up real-time subscription for cart:', error);
        return null;
      }
    };
    
    // Setup the subscription and store the cleanup function
    const cleanupFunc = setupRealtimeSubscription();
    
    // Clean up subscription when component unmounts
    return () => {
      // Only call the cleanup if it's a function
      if (cleanupFunc && typeof cleanupFunc === 'function') {
        cleanupFunc();
      }
    };
  }, []);

  // Update localStorage when cart changes and calculate totals
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate total price
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Calculate total item count
    const count = cartItems.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
    
    setCartTotal(total);
    setItemCount(count);
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if item is already in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
      
      let updatedCart;
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        updatedCart = [...cartItems, { ...product, quantity }];
      }
      
      // Update API if logged in
      const token = localStorage.getItem('authToken');
      if (token) {
        await cartService.updateCart(updatedCart);
      }
      
      setCartItems(updatedCart);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedCart = cartItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      
      // Update API if logged in
      const token = localStorage.getItem('authToken');
      if (token) {
        await cartService.updateCart(updatedCart);
      }
      
      setCartItems(updatedCart);
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  // Get cart subtotal (without tax or shipping)
  const getCartSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  // Calculate tax amount based on subtotal
  const calculateTax = (subtotal) => {
    // Using 8% tax rate - adjust as needed
    return subtotal * 0.08;
  };

  // Calculate shipping cost based on subtotal
  const calculateShipping = (subtotal) => {
    // Free shipping for orders over $150, otherwise $7.99 standard shipping
    return subtotal >= 150 ? 0 : 7.99;
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the item details before removing
      const itemToRemove = cartItems.find(item => item.id === productId);
      if (!itemToRemove) {
        console.error('Item not found in cart:', productId);
        setError('Item not found in cart');
        return;
      }
      
      // First update the API to ensure database consistency
      const token = localStorage.getItem('authToken');
      
      // Create updated cart state but don't update state yet
      const updatedCart = cartItems.filter(item => item.id !== productId);
      
      if (token) {
        try {
          // Make sure we wait for the API update to complete
          await cartService.removeFromCart(productId);
          console.log('Item successfully removed from database:', productId);
          
          // Add a small delay to ensure backend processing completes
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (dbError) {
          console.error('Database error removing item:', dbError);
          // Throw the error to be caught by the outer try-catch
          throw new Error('Failed to remove item from database');
        }
      } else {
        // For non-logged in users, update local storage
        try {
          // Call the service to update local storage
          await cartService.removeFromCart(productId, false); // false indicates no user is logged in
          console.log('Item removed from local storage cart');
        } catch (localError) {
          console.error('Error removing from local storage:', localError);
          throw new Error('Failed to remove item from local storage');
        }
      }
      
      // Then update local state
      setCartItems(updatedCart);
      
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
      // Refresh cart to ensure UI consistency with backend
      refreshCart();
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update API if logged in
      const token = localStorage.getItem('authToken');
      if (token) {
        await cartService.clearCart();
      }
      
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

const contextValue = {
  cartItems,
  cartTotal,
  itemCount,
  loading,
  error,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  refreshCart,
  setCartItems,
  getCartSubtotal,
  calculateTax,
  calculateShipping
};

return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};

export default CartContext;
