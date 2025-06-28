import api from './api';

const LOCAL_STORAGE_CART_KEY = 'noble_being_cart';

// Helper functions for local cart management
const getLocalCart = () => {
  const cartData = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
  return cartData ? JSON.parse(cartData) : { items: [], total: 0 };
};

const setLocalCart = (cart) => {
  localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
};

const calculateCartTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const cartService = {
  // Get user cart (from Supabase if logged in, otherwise from localStorage)
  getCart: async () => {
    try {
      // First, check for a local cart
      const localCart = getLocalCart();
      
      // Try to get current user
      try {
        const user = await api.auth.getUser();
        
        if (user) {
          // Get cart from Supabase if user is logged in
          const { data } = await api.get('carts', {
            filters: { user_id: user.id }
          });
          
          // If cart doesn't exist yet for this user, return the local cart
          if (!data || data.length === 0) {
            return localCart;
          }
          
          try {
            // Get cart items from cart_items table
            const { data: cartItems } = await api.get('cart_items', {
              filters: { cart_id: data[0].id }
            });
            
            // If no cart items, return the local cart
            if (!cartItems || cartItems.length === 0) {
              return localCart;
            }
            
            // Enrich cart items with product details
            const enrichedItems = await Promise.all(cartItems.map(async (item) => {
              try {
                const { data: product } = await api.getById('products', item.product_id);
                if (!product) {
                  console.warn(`Product not found for cart item: ${item.id}`);
                  return null;
                }
                return {
                  id: item.id,
                  productId: item.product_id,
                  quantity: item.quantity,
                  price: product.price,
                  name: product.name,
                  image: product.image,
                  ...item.options
                };
              } catch (err) {
                console.error(`Error enriching cart item ${item.id}:`, err);
                return null;
              }
            }));
            
            // Filter out null items (from failed product lookups)
            const validItems = enrichedItems.filter(item => item !== null);
            
            // Return the enriched cart with total
            return {
              id: data[0].id,
              items: validItems,
              total: calculateCartTotal(validItems)
            };
          } catch (cartItemsError) {
            console.error('Error fetching cart items:', cartItemsError);
            return localCart;
          }
        } else {
          // Return cart from localStorage if user is not logged in (normal behavior for guests)
          return localCart;
        }
      } catch (userError) {
        // Only log error if it's not a missing auth session (which is normal for guests)
        if (!userError.message || !userError.message.includes('Auth session missing')) {
          console.error('Error fetching user:', userError);
        }
        return localCart;
      }
    } catch (error) {
      console.error('Error in getCart:', error);
      // On error, return empty cart from localStorage as fallback
      return getLocalCart();
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, options = {}) => {
    try {
      // Get product details
      const { data: product } = await api.getById('products', productId);
      if (!product) throw new Error('Product not found');
      
      // Get current user
      const user = await api.auth.getUser();
      
      if (user) {
        // Get or create user cart
        let cart;
        const { data: existingCarts } = await api.get('carts', {
          filters: { user_id: user.id }
        });
        
        if (!existingCarts || existingCarts.length === 0) {
          // Create a new cart
          const { data: newCart } = await api.post('carts', {
            user_id: user.id,
            created_at: new Date()
          });
          cart = newCart[0];
        } else {
          cart = existingCarts[0];
        }
        
        // Check if product already exists in cart
        const { data: existingItems } = await api.get('cart_items', {
          filters: { 
            cart_id: cart.id,
            product_id: productId
          }
        });
        
        if (existingItems && existingItems.length > 0) {
          // Update existing item quantity
          const existingItem = existingItems[0];
          await api.put('cart_items', existingItem.id, {
            quantity: existingItem.quantity + quantity,
            options: { ...existingItem.options, ...options }
          });
        } else {
          // Add new item to cart
          await api.post('cart_items', {
            cart_id: cart.id,
            product_id: productId,
            quantity,
            options,
            added_at: new Date()
          });
        }
        
        // Return updated cart
        return await cartService.getCart();
      } else {
        // Handle local cart for non-logged in users
        const cart = getLocalCart();
        const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          cart.items[existingItemIndex].quantity += quantity;
          cart.items[existingItemIndex] = { ...cart.items[existingItemIndex], ...options };
        } else {
          // Add new item
          cart.items.push({
            id: Date.now().toString(), // Generate a temporary ID
            productId,
            quantity,
            price: product.price,
            name: product.name,
            image: product.image,
            ...options
          });
        }
        
        // Update cart total
        cart.total = calculateCartTotal(cart.items);
        
        // Save to localStorage
        setLocalCart(cart);
        
        return cart;
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      // Get current user
      const user = await api.auth.getUser();
      
      if (user) {
        // Update item in database
        await api.put('cart_items', itemId, { quantity });
        
        // Return updated cart
        return await cartService.getCart();
      } else {
        // Update item in local cart
        const cart = getLocalCart();
        const itemIndex = cart.items.findIndex(item => item.id === itemId);
        
        if (itemIndex >= 0) {
          cart.items[itemIndex].quantity = quantity;
          cart.total = calculateCartTotal(cart.items);
          setLocalCart(cart);
        }
        
        return cart;
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId, isLoggedIn = true) => {
    try {
      // Check if user is logged in - either by parameter or by getting current user
      let user = null;
      
      if (isLoggedIn) {
        user = await api.auth.getUser();
      }
      
      if (user) {
        // Get item details before removing it to restore inventory
        const { data: cartItem } = await api.get('cart_items', {
          filters: { id: itemId },
          include: ['product_id', 'quantity', 'options']
        });
        
        if (cartItem && cartItem.length > 0) {
          const item = cartItem[0];
          
          // Remove item from database
          await api.delete('cart_items', itemId);
          
          // Restore inventory
          try {
            const { productService } = await import('./productService');
            await productService.restoreInventory(
              item.product_id, 
              item.options?.size || 'One Size', 
              item.options?.color || 'Default', 
              item.quantity
            );
          } catch (inventoryError) {
            console.error('Error restoring inventory:', inventoryError);
            // Continue even if inventory restoration fails
          }
        } else {
          // If item details couldn't be retrieved, just remove the item
          await api.delete('cart_items', itemId);
        }
        
        // Return updated cart
        return await cartService.getCart();
      } else {
        // Remove item from local cart
        const cart = getLocalCart();
        const removedItem = cart.items.find(item => item.id === itemId);
        cart.items = cart.items.filter(item => item.id !== itemId);
        cart.total = calculateCartTotal(cart.items);
        setLocalCart(cart);
        
        // If user is not logged in, we should still restore inventory if possible
        if (removedItem) {
          try {
            const { productService } = await import('./productService');
            await productService.restoreInventory(
              removedItem.productId, 
              removedItem.size || 'One Size', 
              removedItem.color || 'Default', 
              removedItem.quantity
            );
          } catch (inventoryError) {
            console.error('Error restoring inventory for local cart:', inventoryError);
            // Continue even if inventory restoration fails
          }
        }
        
        return cart;
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      // Get current user
      const user = await api.auth.getUser();
      
      if (user) {
        // Get user cart
        const { data: carts } = await api.get('carts', {
          filters: { user_id: user.id }
        });
        
        if (carts && carts.length > 0) {
          // Get all cart items
          const { data: cartItems } = await api.get('cart_items', {
            filters: { cart_id: carts[0].id }
          });
          
          // Delete all cart items
          await Promise.all(cartItems.map(item => 
            api.delete('cart_items', item.id)
          ));
        }
        
        return { items: [], total: 0 };
      } else {
        // Clear local cart
        const emptyCart = { items: [], total: 0 };
        setLocalCart(emptyCart);
        
        return emptyCart;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Sync local cart with database (after login)
  syncCart: async () => {
    try {
      // Get current user
      const user = await api.auth.getUser();
      
      if (!user) return;
      
      // Get local cart
      const localCart = getLocalCart();
      
      if (localCart.items.length > 0) {
        // Get or create user cart in database
        let cart;
        const { data: existingCarts } = await api.get('carts', {
          filters: { user_id: user.id }
        });
        
        if (!existingCarts || existingCarts.length === 0) {
          // Create a new cart
          const { data: newCart } = await api.post('carts', {
            user_id: user.id,
            created_at: new Date()
          });
          cart = newCart[0];
        } else {
          cart = existingCarts[0];
        }
        
        // Add local cart items to database
        await Promise.all(localCart.items.map(async (item) => {
          // Check if product already exists in cart
          const { data: existingItems } = await api.get('cart_items', {
            filters: { 
              cart_id: cart.id,
              product_id: item.productId
            }
          });
          
          if (existingItems && existingItems.length > 0) {
            // Update existing item quantity
            const existingItem = existingItems[0];
            await api.put('cart_items', existingItem.id, {
              quantity: existingItem.quantity + item.quantity,
              options: { ...existingItem.options, ...item }
            });
          } else {
            // Add new item to cart
            await api.post('cart_items', {
              cart_id: cart.id,
              product_id: item.productId,
              quantity: item.quantity,
              options: item,
              added_at: new Date()
            });
          }
        }));
        
        // Clear local cart
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
      }
      
      // Return updated cart
      return await cartService.getCart();
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  },
  
  // Initiate return for a purchased item
  initiateReturn: async (returnData) => {
    try {
      // Get current user
      const user = await api.auth.getUser();
      
      if (!user) {
        throw new Error('User must be logged in to initiate a return');
      }
      
      // Create return request in the returns table
      const { data, error } = await api.post('returns', {
        order_item_id: returnData.order_item_id,
        user_id: user.id,
        reason: returnData.reason,
        status: returnData.status || 'pending',
        created_at: new Date()
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error initiating return:', error);
      throw error;
    }
  }
};

export default cartService;