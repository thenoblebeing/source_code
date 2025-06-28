import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import Icon from '../components/Icon';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { order, orderNumber, customerName, email } = location.state || {};
  
  if (!order) {
    return (
      <Container>
        <ErrorMessage>
          <h1>No Order Information Found</h1>
          <p>We couldn't find your order information. Please return to the shop.</p>
          <ReturnButton to="/shop">Return to Shop</ReturnButton>
        </ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <SuccessIcon>
        <Icon name="check" size="2em" stroke="#fff" />
      </SuccessIcon>
      
      <h1>Thank You for Your Order!</h1>
      
      <OrderNumberBox>
        <p>Order Number:</p>
        <OrderNumber>{orderNumber}</OrderNumber>
      </OrderNumberBox>
      
      <InfoMessage>
        A confirmation has been sent to {email || order.customer?.email}
      </InfoMessage>
      
      <OrderSummaryCard>
        <CardHeader>Order Summary</CardHeader>
        
        <SummarySection>
          <h3>Items Ordered</h3>
          {order.items.map(item => (
            <OrderItem key={item.id}>
              <ItemImage src={item.image} alt={item.name} />
              <ItemDetails>
                <ItemName>{item.name}</ItemName>
                <ItemMeta>
                  <span>Qty: {item.quantity}</span>
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </ItemMeta>
              </ItemDetails>
              <ItemPrice>${(item.price * item.quantity).toFixed(2)}</ItemPrice>
            </OrderItem>
          ))}
        </SummarySection>
        
        <SummarySection>
          <h3>Customer Information</h3>
          <SummaryRow>
            <Label>Name:</Label>
            <Value>{customerName || `${order.customer?.firstName} ${order.customer?.lastName}`}</Value>
          </SummaryRow>
          <SummaryRow>
            <Label>Email:</Label>
            <Value>{email || order.customer?.email}</Value>
          </SummaryRow>
          <SummaryRow>
            <Label>Phone:</Label>
            <Value>{order.customer?.phone}</Value>
          </SummaryRow>
          <SummaryRow>
            <Label>Address:</Label>
            <Value>
              {order.customer?.address.street}{order.customer?.address.apartment ? `, ${order.customer?.address.apartment}` : ''}<br />
              {order.customer?.address.city}, {order.customer?.address.state} {order.customer?.address.postalCode}<br />
              {order.customer?.address.country}
            </Value>
          </SummaryRow>
        </SummarySection>
        
        <SummarySection>
          <h3>Shipping Information</h3>
          <ShippingInfo>
            <p><strong>{customerName || `${order.customer?.firstName} ${order.customer?.lastName}`}</strong></p>
            <p>{order.customer?.address.street} {order.customer?.address.apartment}</p>
            <p>{order.customer?.address.city}, {order.customer?.address.state} {order.customer?.address.postalCode}</p>
            <p>{order.customer?.address.country}</p>
            <p>{order.customer?.phone}</p>
          </ShippingInfo>
          
          <ShippingMethod>
            <ShippingIcon>
              <Icon name="package" size="1.5em" />
            </ShippingIcon>
            <div>
              <strong>
                {order.shippingMethod === 'express' ? 'Express Shipping' : 'Standard Shipping'}
              </strong>
              <p>
                {order.shippingMethod === 'express' 
                  ? 'Estimated delivery in 1-3 business days' 
                  : 'Estimated delivery in 5-7 business days'}
              </p>
            </div>
          </ShippingMethod>
        </SummarySection>
        
        <SummarySection>
          <h3>Payment Information</h3>
          <PaymentMethod>
            <PaymentIcon>
              {order.paymentMethod === 'credit' ? '💳' : '💸'}
            </PaymentIcon>
            <div>
              <strong>
                {order.paymentMethod === 'credit' ? 'Credit Card' : 'PayPal'}
              </strong>
              <p>Total Paid: ${order.total.toFixed(2)}</p>
            </div>
          </PaymentMethod>
        </SummarySection>
      </OrderSummaryCard>
      
      <ButtonsGroup>
        <ShopButton to="/shop">Continue Shopping</ShopButton>
        <AccountButton to="/profile">View My Account</AccountButton>
      </ButtonsGroup>
      
      <ContactInfo>
        <ContactIcon>
          <Icon name="mail" size="1.5em" />
        </ContactIcon>
        <p>
          If you have any questions about your order, please email us at{' '}
          <a href="mailto:support@thenoblebeing.com">support@thenoblebeing.com</a>
        </p>
      </ContactInfo>
    </Container>
  );
};

// Styled Components
const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 500;
  color: #4a4a4a;
`;

const Value = styled.span`
  text-align: right;
  color: #2a2a2a;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 4rem auto 5rem;
  padding: 0 2rem;
  text-align: center;
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: #333333;
    margin-bottom: 1.5rem;
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  background-color: #8A9A5B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    color: white;
    font-size: 2.5rem;
  }
`;

const OrderNumberBox = styled.div`
  margin-bottom: 1.5rem;
  
  p {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fff3f3;
  border: 1px solid #ffcccc;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  
  h1 {
    color: #d93025;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    color: #555;
  }
`;

const ReturnButton = styled(Link)`
  display: inline-block;
  background-color: #8A9A5B;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #6b7945;
  }
`;

const OrderNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
`;

const InfoMessage = styled.p`
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
`;

const OrderSummaryCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2.5rem;
  text-align: left;
`;

const CardHeader = styled.div`
  background-color: #f8f8f8;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 1.2rem;
  color: #333;
`;

const SummarySection = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #333;
  }
`;

const OrderItem = styled.div`
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ItemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  
  span {
    margin-right: 0.75rem;
  }
`;

const ItemPrice = styled.div`
  font-weight: 600;
  text-align: right;
  min-width: 80px;
`;

const ShippingInfo = styled.div`
  margin-bottom: 1.5rem;
  
  p {
    margin-bottom: 0.3rem;
  }
`;

const ShippingMethod = styled.div`
  display: flex;
  align-items: flex-start;
  padding-top: 1rem;
  border-top: 1px dashed #eee;
  
  div {
    flex: 1;
  }
  
  p {
    color: #666;
    margin-top: 0.25rem;
  }
`;

const ShippingIcon = styled.div`
  margin-right: 1rem;
  width: 40px;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PaymentMethod = styled.div`
  display: flex;
  align-items: flex-start;
  
  div {
    flex: 1;
  }
  
  p {
    color: #666;
    margin-top: 0.25rem;
  }
`;

const PaymentIcon = styled.div`
  margin-right: 1rem;
  width: 40px;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ButtonsGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ShopButton = styled(Link)`
  display: inline-block;
  background-color: #8A9A5B;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #6b7945;
  }
`;

const AccountButton = styled(Link)`
  display: inline-block;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9f9f9;
    border-color: #bbb;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.95rem;
  
  a {
    color: #8A9A5B;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContactIcon = styled.div`
  margin-right: 0.75rem;
`;





export default OrderConfirmationPage;
