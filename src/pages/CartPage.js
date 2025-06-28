import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiAlertCircle } from 'react-icons/fi';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiInfo, FiCheck, FiTruck, FiRefreshCw } from 'react-icons/fi';
import productService from '../services/productService';
import { supabaseClient } from '../services/supabaseClient';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading, setCartItems, refreshCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [itemToRemove, setItemToRemove] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  // Load featured products when cart is empty
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      if (cartItems.length === 0) {
        try {
          setLoadingFeatured(true);
          const products = await productService.getFeaturedProducts(4);
          setFeaturedProducts(products);
        } catch (error) {
          console.error('Error loading featured products:', error);
        } finally {
          setLoadingFeatured(false);
        }
      }
    };
    
    loadFeaturedProducts();
  }, [cartItems.length]);
  
  // Render confirmation dialog
  const renderConfirmationDialog = () => {
    return (
      <ConfirmationDialog
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <ConfirmationTitle>
          Remove Item
        </ConfirmationTitle>
        <ConfirmationMessage>
          Are you sure you want to remove <strong>{itemToRemove?.name}</strong> from your cart?
        </ConfirmationMessage>
        
        {deleteError && (
          <ErrorMessage>
            <FiAlertCircle size={16} /> {deleteError}
          </ErrorMessage>
        )}
        
        <ConfirmationButtons>
          <CancelButton onClick={cancelRemoveItem} disabled={deleteLoading}>
            Cancel
          </CancelButton>
          <ConfirmButton 
            onClick={confirmRemoveItem} 
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ButtonContent>
                <SmallSpinner /> Removing...
              </ButtonContent>
            ) : 'Remove'}
          </ConfirmButton>
        </ConfirmationButtons>
      </ConfirmationDialog>
    );
  };

  // Handle initiating item removal (shows confirmation)
  const handleRemoveItem = (item) => {
    setItemToRemove(item);
    setConfirmationVisible(true);
  };

  // Handle confirming item removal
  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      // First, handle deletion based on login status
      if (currentUser) {
        // LOGGED-IN USER: Delete from Supabase database
        try {
          // Get the cart ID for the current user
          const { data: cartData, error: cartError } = await supabaseClient
            .from('carts')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();
            
          if (cartError) {
            console.error('Cart lookup error:', cartError);
            throw new Error('Could not find your cart. Please try again.');
          }
          
          if (!cartData || !cartData.id) {
            throw new Error('Your cart could not be located.');
          }
          
          // Delete the cart item from database
          const { error: deleteError } = await supabaseClient
            .from('cart_items')
            .delete()
            .eq('product_id', itemToRemove.productId)
            .eq('cart_id', cartData.id);
            
          if (deleteError) {
            console.error('Database deletion error:', deleteError);
            throw new Error('Could not remove item from your cart. Please try again.');
          }
          
          // Update inventory
          const { error: inventoryError } = await supabaseClient
            .rpc('restore_product_inventory', { 
              product_id: itemToRemove.productId,
              size_value: itemToRemove.size || 'One Size',
              color_value: itemToRemove.color || 'Default',
              quantity_value: itemToRemove.quantity || 1
            });
            
          if (inventoryError) {
            console.error('Inventory restoration error:', inventoryError);
            // Continue even if inventory restoration fails
          }
        } catch (dbError) {
          console.error('Database operation failed:', dbError);
          throw new Error(dbError.message || 'Database error occurred');
        }
      } else {
        // GUEST USER: Just update local storage
        // We'll use the removeFromCart function from CartContext which handles local storage
        try {
          await removeFromCart(itemToRemove.id);
        } catch (localError) {
          console.error('Local storage error:', localError);
          throw new Error('Could not remove item from your cart');
        }
      }
      
      // After successful deletion, refresh the cart to ensure UI and database are in sync
      try {
        await refreshCart();
        console.log('Cart refreshed after item removal');
        
        // Close dialog
        setConfirmationVisible(false);
        setItemToRemove(null);
      } catch (refreshError) {
        console.error('Error refreshing cart:', refreshError);
        throw new Error('Item removed but could not refresh cart');
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      setDeleteError(error.message || 'An unknown error occurred');
      // Keep dialog open to show error
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle canceling item removal
  const cancelRemoveItem = () => {
    setConfirmationVisible(false);
    setItemToRemove(null);
  };

  if (loading || deleteLoading) {
    return (
      <PageContainer>
        <CartContainer>
          <CartTitle>Your Cart</CartTitle>
          <LoadingMessage>
            <LoadingSpinner />
            Loading your cart...
          </LoadingMessage>
        </CartContainer>
      </PageContainer>
    );
  }



  if (cartItems.length === 0) {
    return (
      <PageContainer>
        <CartContainer>
          <CartTitle>Your Cart</CartTitle>
          <EmptyCartMessage>
            <FiShoppingBag size={48} color="var(--terracotta)" />
            <EmptyCartHeading>
              Ready to discover your perfect items?
            </EmptyCartHeading>
            
            {!currentUser && (
              <LoginPrompt>
                <FiInfo size="1.2em" />
                <span>
                  <LoginLink to="/login">Sign in</LoginLink> to see saved items or continue as a guest
                </span>
              </LoginPrompt>
            )}
            
            <ShopNowButton to="/shop">
              Explore Our Collections
            </ShopNowButton>

            {loadingFeatured ? (
              <RecommendedProductsSection>
                <SectionTitle>Loading recommendations...</SectionTitle>
                <LoadingSpinner style={{ width: '30px', height: '30px' }} />
              </RecommendedProductsSection>
            ) : featuredProducts.length > 0 && (
              <RecommendedProductsSection>
                <SectionTitle>Popular Right Now</SectionTitle>
                <RecommendedProducts>
                  {featuredProducts.map(product => (
                    <RecommendedProduct key={product.id}>
                      <ProductLink to={`/product/${product.id}`}>
                        <RecommendedImage 
                          src={product.images?.[0] || `https://placehold.co/200x200/333333/FFFFFF?text=${product.name}`} 
                          alt={product.name} 
                        />
                        <RecommendedName>{product.name}</RecommendedName>
                        <RecommendedPrice>${product.price.toFixed(2)}</RecommendedPrice>
                      </ProductLink>
                      <QuickAddButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View Product
                      </QuickAddButton>
                    </RecommendedProduct>
                  ))}
                </RecommendedProducts>
              </RecommendedProductsSection>
            )}

            <CartInfoMessage>
              <FiTruck size="1em" />
              <span>Free shipping on orders over $150</span>
            </CartInfoMessage>
          </EmptyCartMessage>
        </CartContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CartContainer>
        <CartTitle>Your Cart</CartTitle>
        
        {/* Confirmation Dialog */}
        <AnimatePresence>
          {confirmationVisible && (
            <ConfirmationOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderConfirmationDialog()}
            </ConfirmationOverlay>
          )}
        </AnimatePresence>
        
        <CartContent>
            <CartItemsSection>
              <CartHeader>
                <HeaderItem style={{ flex: 3 }}>Product</HeaderItem>
                <HeaderItem style={{ flex: 1 }}>Price</HeaderItem>
                <HeaderItem style={{ flex: 1 }}>Quantity</HeaderItem>
                <HeaderItem style={{ flex: 1 }}>Total</HeaderItem>
                <HeaderItem style={{ flex: 0.5 }}></HeaderItem>
              </CartHeader>
              
              {cartItems.map(item => (
                <CartItem key={item.id}>
                  <ProductInfo>
                    <Link to={`/product/${item.productId || item.id}`}>
                      <ProductImage src={item.image || `https://placehold.co/100x100/333333/FFFFFF?text=${item.name}`} alt={item.name} />
                    </Link>
                    <ProductDetails>
                      <Link to={`/product/${item.productId || item.id}`} style={{ textDecoration: 'none' }}>
                        <ProductName>{item.name}</ProductName>
                      </Link>
                      {item.size && <ProductMeta>Size: {item.size}</ProductMeta>}
                      {item.color && <ProductMeta>Color: {item.color}</ProductMeta>}
                      <ItemActions>
                        <ActionButton onClick={() => handleRemoveItem(item)}>
                          Remove
                        </ActionButton>
                        <Link to={`/product/${item.productId || item.id}`} style={{ marginLeft: '10px', color: 'var(--sage-green)', fontSize: '0.8rem', textDecoration: 'underline', transition: 'color 0.2s ease' }}>
                          View Product
                        </Link>
                      </ItemActions>
                    </ProductDetails>
                  </ProductInfo>
                  
                  <ProductPrice>${item.price.toFixed(2)}</ProductPrice>
                  
                  <QuantityControl>
                    <QuantityInput 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                          updateQuantity(item.id, value);
                        }
                      }}
                    />
                  </QuantityControl>
                  
                  <ItemTotal>${(item.price * item.quantity).toFixed(2)}</ItemTotal>
                  
                  <RemoveButton onClick={() => handleRemoveItem(item)}>
                    <FiTrash2 size="1.2em" />
                  </RemoveButton>
                </CartItem>
              ))}
            </CartItemsSection>
            
            <OrderSummary>
              <h2>Order Summary</h2>
              
              <SummaryRow>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </SummaryRow>
              
              <SummaryRow>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </SummaryRow>
              
              {cartTotal >= 150 && (
                <FreeShippingMessage>
                  <FiCheck size="1em" />
                  Your order qualifies for FREE shipping!
                </FreeShippingMessage>
              )}
              
              <SummaryDivider />
              
              <SummaryTotal>
                <span>Estimated Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </SummaryTotal>
              
              <CheckoutButton 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </CheckoutButton>
              
              <ContinueShoppingLink to="/shop">
                Continue Shopping
              </ContinueShoppingLink>
              
              <ShippingPolicy>
                <FiTruck size="1em" />
                <span>Free shipping on orders over $150</span>
              </ShippingPolicy>
              
              <ShippingPolicy>
                <FiRefreshCw size="1em" />
                <span>30-day returns on all items</span>
              </ShippingPolicy>
            </OrderSummary>
          </CartContent>
      </CartContainer>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.main`
  min-height: 100vh;
  background: var(--deep-charcoal);
  color: var(--white);
  padding: 120px 0 60px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 70% 20%, rgba(226, 114, 91, 0.05), transparent 50%),
      radial-gradient(circle at 30% 70%, rgba(141, 163, 135, 0.05), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const CartTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--soft-gold);
  margin-bottom: 2rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--terracotta);
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--sandstone-beige);
  gap: 1rem;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(217, 194, 166, 0.3);
  border-radius: 50%;
  border-top-color: var(--soft-gold);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyCartMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--sandstone-beige);
  background: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(217, 194, 166, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  gap: 1.5rem;
  
  p {
    font-size: 1.2rem;
    margin-top: 0.5rem;
  }
`;

const ShopNowButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: var(--sage-green);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  &:hover {
    background-color: transparent;
    border-color: var(--sage-green);
    color: var(--sage-green);
    transform: translateY(-2px);
  }
`;

const CartContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const CartItemsSection = styled.div`
  flex: 3;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(217, 194, 166, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(8px);
`;

const CartHeader = styled.div`
  display: flex;
  background-color: rgba(226, 114, 91, 0.1);
  padding: 1rem;
  border-bottom: 1px solid rgba(217, 194, 166, 0.1);
`;

const HeaderItem = styled.div`
  font-weight: 600;
  color: var(--soft-gold);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.85rem;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(217, 194, 166, 0.1);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(217, 194, 166, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 3;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(217, 194, 166, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ProductName = styled.span`
  font-weight: 600;
  color: var(--sandstone-beige);
  font-size: 1.1rem;
  letter-spacing: 0.3px;
`;

const ProductMeta = styled.span`
  font-size: 0.85rem;
  color: var(--soft-gold);
  opacity: 0.8;
`;

const ProductPrice = styled.div`
  flex: 1;
  font-weight: 600;
  color: var(--soft-gold);
  letter-spacing: 0.5px;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const QuantityInput = styled.input`
  width: 70px;
  height: 40px;
  border: 1px solid var(--sage-green);
  background: rgba(51, 51, 51, 0.8);
  color: var(--soft-gold);
  border-radius: 4px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:focus {
    outline: none;
    border-color: var(--soft-gold);
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
  }
  
  /* Hide arrow buttons in number input for Chrome, Safari, Edge, Opera */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Hide arrow buttons in number input for Firefox */
  -moz-appearance: textfield;
`;

const QuantityValue = styled.span`
  margin: 0 0.75rem;
  min-width: 24px;
  text-align: center;
  color: var(--sandstone-beige);
  font-weight: 600;
`;

const ItemTotal = styled.div`
  flex: 1;
  font-weight: 600;
  color: var(--terracotta);
  letter-spacing: 0.5px;
  text-align: center;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

// Using styled utility function to support polymorphic 'as' prop
const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--sage-green);
  font-size: 0.8rem;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  text-decoration: underline;
  display: inline-block;
  
  &:hover {
    color: var(--terracotta);
  }
`;

const RemoveButton = styled.button`
  flex: 0.5;
  background: none;
  border: none;
  color: rgba(217, 194, 166, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--terracotta);
    transform: scale(1.1);
  }
`;

const OrderSummary = styled.div`
  flex: 1;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(217, 194, 166, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  backdrop-filter: blur(8px);
  
  h2 {
    font-family: 'Playfair Display', serif;
    color: var(--soft-gold);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 40px;
      height: 2px;
      background: var(--terracotta);
    }
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--sandstone-beige);
  
  span:last-child {
    font-weight: 500;
    color: var(--soft-gold);
  }
`;

const FreeShippingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(138, 154, 91, 0.2);
  color: var(--sage-green);
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin: 1rem 0;
  border: 1px solid rgba(138, 154, 91, 0.3);
`;

const SummaryDivider = styled.div`
  height: 1px;
  background-color: rgba(217, 194, 166, 0.2);
  margin: 1.5rem 0;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--terracotta);
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 0.875rem;
  background-color: var(--sage-green);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.7s ease;
  }
  
  &:hover {
    background-color: #7a8a4b;
    
    &::before {
      left: 100%;
    }
  }
`;

const ContinueShoppingLink = styled(Link)`
  display: block;
  text-align: center;
  color: var(--sandstone-beige);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--soft-gold);
    text-decoration: underline;
  }
`;

const ShippingPolicy = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--sandstone-beige);
  font-size: 0.85rem;
  margin-top: 0.75rem;
  opacity: 0.8;
`;

// Return Form Components
const ReturnFormContainer = styled.div`
  background: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(217, 194, 166, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  backdrop-filter: blur(8px);
  margin-bottom: 2rem;
`;

const ReturnFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: rgba(226, 114, 91, 0.1);
  border-bottom: 1px solid rgba(217, 194, 166, 0.1);
  
  h3 {
    color: var(--soft-gold);
    font-family: 'Playfair Display', serif;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--sandstone-beige);
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--terracotta);
  }
`;

const ReturnFormContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const ReturnItemDetails = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba(217, 194, 166, 0.1);
`;

const ReturnReasonLabel = styled.label`
  display: block;
  color: var(--soft-gold);
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ReturnReasonSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid rgba(217, 194, 166, 0.2);
  background-color: rgba(51, 51, 51, 0.6);
  color: var(--sandstone-beige);
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--sage-green);
  }
  
  option {
    background-color: #333333;
  }
`;

const ReturnReasonTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid rgba(217, 194, 166, 0.2);
  background-color: rgba(51, 51, 51, 0.6);
  color: var(--sandstone-beige);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--sage-green);
  }
`;

const ReturnMessage = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: ${props => props.$type === 'success' ? 'rgba(138, 154, 91, 0.2)' : 'rgba(226, 114, 91, 0.2)'};
  color: ${props => props.$type === 'success' ? 'var(--sage-green)' : 'var(--terracotta)'};
  border: 1px solid ${props => props.$type === 'success' ? 'rgba(138, 154, 91, 0.3)' : 'rgba(226, 114, 91, 0.3)'};
`;

const ReturnActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const CancelReturnButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: 1px solid rgba(217, 194, 166, 0.3);
  color: var(--sandstone-beige);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(217, 194, 166, 0.1);
  }
`;

const SubmitReturnButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--sage-green);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:disabled {
    background-color: rgba(138, 154, 91, 0.5);
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #7a8a4b;
  }
`;

// Confirmation Dialog Styled Components
const ConfirmationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ConfirmationDialog = styled(motion.div)`
  background: var(--deep-charcoal);
  border: 1px solid rgba(217, 194, 166, 0.2);
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--terracotta), var(--sage-green));
  }
`;

const ConfirmationTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  color: var(--soft-gold);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ConfirmationMessage = styled.p`
  color: var(--sandstone-beige);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  
  strong {
    color: var(--terracotta);
  }
`;

const ConfirmationButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid rgba(217, 194, 166, 0.3);
  color: var(--sandstone-beige);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(217, 194, 166, 0.1);
  }
`;

const ConfirmButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: var(--terracotta);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: #c85a44;
  }
`;

// Additional styled components for error and loading states
const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  padding: 8px 12px;
  background-color: rgba(220, 53, 69, 0.1);
  border-left: 3px solid var(--accent-red);
  color: var(--accent-red);
  font-size: 0.9rem;
  border-radius: 4px;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const SmallSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// New styled components for enhanced empty cart
const EmptyCartHeading = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--soft-gold);
  margin: 0.5rem 0;
  text-align: center;
`;

const LoginPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(141, 163, 135, 0.1);
  border: 1px solid var(--sage-green);
  border-radius: 6px;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--sage-green);
  max-width: 90%;
  text-align: center;
`;

const LoginLink = styled(Link)`
  color: var(--terracotta);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--soft-gold);
    text-decoration: underline;
  }
`;

const RecommendedProductsSection = styled.div`
  width: 100%;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(217, 194, 166, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  color: var(--soft-gold);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: var(--terracotta);
  }
`;

const RecommendedProducts = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
`;

const RecommendedProduct = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--glass-border);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const ProductLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
`;

const RecommendedImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const RecommendedName = styled.h4`
  font-size: 0.9rem;
  margin: 0.75rem 0 0.25rem;
  padding: 0 0.75rem;
  color: var(--white);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em;
`;

const RecommendedPrice = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: var(--soft-gold);
  padding: 0 0.75rem 0.75rem;
`;

const QuickAddButton = styled(motion.button)`
  margin: 0.5rem 0.75rem 0.75rem;
  padding: 0.5rem;
  background-color: var(--terracotta);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--soft-gold);
  }
`;

const CartInfoMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: var(--sandstone-beige);
  font-size: 0.9rem;
  opacity: 0.8;
`;

export default CartPage;
