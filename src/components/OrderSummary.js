import React from 'react';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';

const OrderSummaryContainer = styled.div`
  background-color: ${props => props.theme.colors.background.light};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const OrderSummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: ${props => props.theme.colors.text.primary};
`;

const OrderSummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const OrderSummaryTotal = styled(OrderSummaryItem)`
  font-weight: 600;
  font-size: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
  color: ${props => props.theme.colors.text.primary};
`;

const ProductList = styled.div`
  margin-bottom: 20px;
  max-height: 180px; /* Fixed height to ensure scrollbar appears */
  height: auto;
  overflow-y: auto;
  padding-right: 8px;
  border-radius: 4px;
  padding: 8px 8px 8px 0;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px; /* Thinner scrollbar for elegant look */
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #D4AF37; /* Gold color for brand consistency */
    border-radius: 4px;
    background-clip: padding-box;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: #FFD700;
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #D4AF37 rgba(0, 0, 0, 0.1);
`;

const ProductItem = styled.div`
  display: flex;
  margin-bottom: 12px;
  padding-bottom: 12px;
  padding-right: 8px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ProductImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: ${props => props.theme.colors.text.primary};
`;

const ProductVariant = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const ProductPrice = styled.div`
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.text.primary};
`;

const ProductQuantity = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: 8px;
`;

const OrderSummary = () => {
  const { cartItems, cartTotal, getCartSubtotal, calculateTax, calculateShipping } = useCart();
  
  const subtotal = getCartSubtotal();
  const shipping = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  
  return (
    <OrderSummaryContainer>
      <OrderSummaryTitle>Order Summary</OrderSummaryTitle>
      
      <ProductList>
        {cartItems.map(item => (
          <ProductItem key={item.id}>
            <ProductImage>
              <img src={item.image} alt={item.name} />
            </ProductImage>
            <ProductInfo>
              <ProductName>{item.name}</ProductName>
              <ProductVariant>One Size</ProductVariant>
              <ProductPrice>
                ${item.price.toFixed(2)}
                <ProductQuantity>× {item.quantity}</ProductQuantity>
              </ProductPrice>
            </ProductInfo>
          </ProductItem>
        ))}
      </ProductList>
      
      <OrderSummaryItem>
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </OrderSummaryItem>
      
      <OrderSummaryItem>
        <span>Shipping</span>
        <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'FREE'}</span>
      </OrderSummaryItem>
      
      <OrderSummaryItem>
        <span>Tax</span>
        <span>${tax.toFixed(2)}</span>
      </OrderSummaryItem>
      
      <OrderSummaryTotal>
        <span>Total</span>
        <span>${cartTotal.toFixed(2)}</span>
      </OrderSummaryTotal>
    </OrderSummaryContainer>
  );
};

export default OrderSummary;
