import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderSummary from '../components/OrderSummary';
import { supabase } from '../services/supabaseClient';
import Icon from '../components/Icon';
import ConfirmationDialog from '../components/ConfirmationDialog';
import orderService from '../services/orderService';

// Supabase client is imported at the top

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  
  // Checkout steps state
  const [step, setStep] = useState(1);
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  
  // Additional states
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [trustBadgesVisible, setTrustBadgesVisible] = useState(true);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [makeDefaultAddress, setMakeDefaultAddress] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);

  // Handler functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const confirmRemoveItem = (item) => {
    setItemToRemove(item);
    setShowConfirmation(true);
  };
  
  const cancelRemoveItem = () => {
    setShowConfirmation(false);
    setItemToRemove(null);
  };

  // Fetch addresses from database
  const fetchAddresses = useCallback(async () => {
    if (currentUser?.id) {
      setIsAddressLoading(true);
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', currentUser.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSavedAddresses(data);
          // If there's a default address, select it
          const defaultAddress = data.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            setUseNewAddress(false);
            
            // Pre-populate form with selected address
            setFormData(prev => ({
              ...prev,
              firstName: defaultAddress.first_name || '',
              lastName: defaultAddress.last_name || '',
              address: defaultAddress.street || '',
              apartment: defaultAddress.apartment || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              zipCode: defaultAddress.zip_code || '',
              country: defaultAddress.country || 'United States'
            }));
          }
        }
        setIsAddressLoading(false);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setIsAddressLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Pre-fill form with selected address data
  useEffect(() => {
    if (selectedAddress && !useNewAddress) {
      const address = savedAddresses.find(addr => addr.id === selectedAddress);
      if (address) {
        const nameParts = address.name.split(' ');
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          address: address.street,
          apartment: address.apartment || '',
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: address.phone
        }));
      }
    }
  }, [selectedAddress, useNewAddress, savedAddresses]);

  const handleAddressSelection = (addressId) => {
    if (addressId === 'new') {
      setUseNewAddress(true);
      setSelectedAddress(null);
      // Reset form data
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: ''
      }));
      setAddressName('');
    } else {
      setUseNewAddress(false);
      setSelectedAddress(addressId);
    }
  };

  // Save new address to Supabase
  const handleSaveAddress = async () => {
    if (currentUser?.id && saveNewAddress) {
      try {
        const newAddress = {
          user_id: currentUser.id,
          name: addressName || `${formData.firstName} ${formData.lastName}`,
          street: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
          first_name: formData.firstName,
          last_name: formData.lastName,
          is_default: makeDefaultAddress
        };
        
        // If this is set as default, update all other addresses to not be default
        if (makeDefaultAddress) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', currentUser.id);
        }
        
        // Insert the new address
        const { data, error } = await supabase
          .from('addresses')
          .insert([newAddress]);
          
        if (error) throw error;
        
        console.log('Address saved successfully');
        // Refresh the address list
        fetchAddresses();
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }
  };

  // Form submission handlers
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    
    // Save the address if requested
    if (useNewAddress && saveNewAddress) {
      await handleSaveAddress();
    }
    
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Save address if selected
    await handleSaveAddress();
    
    try {
      // Create order logic
      const orderData = {
        user_id: currentUser?.id,
        shipping_address: selectedAddress ? selectedAddress.id : null,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        items: cartItems,
        total: calculateTotal(),
        discount_code: discountApplied ? discountApplied.code : null,
        discount_amount: discountApplied ? 
          (discountApplied.discount_percent ? 
            (cartTotal * discountApplied.discount_percent / 100) : 
            discountApplied.discount_amount) : 
          0,
        // Remaining order data
        shipping_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country
        }
      };
      
      const orderResult = await orderService.createOrder(orderData);
      
      // Update discount code usage counter if one was applied
      if (discountApplied) {
        await supabase
          .from('discount_codes')
          .update({ current_uses: discountApplied.current_uses + 1 })
          .eq('id', discountApplied.id);
      }
      
      // Set order number from backend response or generate a temporary one
      setOrderNumber(orderResult?.order_number || 'ORD-' + Math.floor(Math.random() * 100000));
      
      // Move to confirmation
      setStep(3);
      
      // Clear cart after successful order
      clearCart();
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }
    
    try {
      // Check if the discount code exists and is valid
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error checking discount code:', error);
        setDiscountError('Invalid discount code');
        setDiscountApplied(null);
        return;
      }
      
      if (!data) {
        setDiscountError('Invalid discount code');
        setDiscountApplied(null);
        return;
      }
      
      // Check if the code has expired
      if (data.end_date && new Date(data.end_date) < new Date()) {
        setDiscountError('This discount code has expired');
        setDiscountApplied(null);
        return;
      }
      
      // Check if the code has reached max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        setDiscountError('This discount code has reached its maximum usage');
        setDiscountApplied(null);
        return;
      }
      
      // Check if cart meets minimum value requirement
      if (data.min_cart_value > cartTotal) {
        setDiscountError(`Minimum order of $${data.min_cart_value.toFixed(2)} required for this code`);
        setDiscountApplied(null);
        return;
      }
      
      // Apply the discount
      setDiscountApplied(data);
      setDiscountError('');
      
      console.log('Discount applied:', data);
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountError('Error applying discount code');
      setDiscountApplied(null);
    }
  };

  // Calculate shipping cost based on shipping method and cart total
  const calculateShippingCost = () => {
    if (shippingMethod === 'standard') {
      // Standard shipping is free for orders $150+, otherwise $7.99
      return cartTotal >= 150 ? 0 : 7.99;
    } else if (shippingMethod === 'express') {
      // Express shipping is $7.99 for orders $150+, otherwise $15.99
      return cartTotal >= 150 ? 7.99 : 15.99;
    }
    return 0; // Default case
  };

  // Calculate shipping cost and total
  const calculateTotal = () => {
    let total = cartTotal;
    
    // Add shipping cost if applicable
    total += calculateShippingCost();
    
    // Apply discount if applicable
    if (discountApplied) {
      if (discountApplied.discount_percent) {
        const discountAmount = (total * discountApplied.discount_percent) / 100;
        total -= discountAmount;
      } else if (discountApplied.discount_amount) {
        total -= discountApplied.discount_amount;
      }
      
      // Ensure total doesn't go below 0
      if (total < 0) total = 0;
    }
    
    return total.toFixed(2);
  };

  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <PageWrapper>
      <AnimatePresence>
        {showConfirmation && (
          <ConfirmationDialog
            title="Remove Item"
            message="Are you sure you want to remove this item from your cart?"
            onConfirm={confirmRemoveItem}
            onCancel={cancelRemoveItem}
          />
        )}
      </AnimatePresence>

      <CheckoutContainer>
        {/* Header with modern styling */}
        <CheckoutHeader>
          <CheckoutTitle>Checkout</CheckoutTitle>
          
          <StepperContainer>
            <Stepper>
              <StepItem active={step >= 1} completed={step > 1}>
                <StepCircle active={step >= 1} completed={step > 1}>
                  {step > 1 ? <Icon name="check" size={14} /> : 1}
                </StepCircle>
                <StepLabel active={step >= 1}>Shipping</StepLabel>
              </StepItem>
              
              <StepConnector completed={step > 1} />
              
              <StepItem active={step >= 2} completed={step > 2}>
                <StepCircle active={step >= 2} completed={step > 2}>
                  {step > 2 ? <Icon name="check" size={14} /> : 2}
                </StepCircle>
                <StepLabel active={step >= 2}>Payment</StepLabel>
              </StepItem>
              
              <StepConnector completed={step > 2} />
              
              <StepItem active={step >= 3} completed={step > 3}>
                <StepCircle active={step >= 3} completed={step > 3}>
                  {step > 3 ? <Icon name="check" size={14} /> : 3}
                </StepCircle>
                <StepLabel active={step >= 3}>Confirmation</StepLabel>
              </StepItem>
            </Stepper>
          </StepperContainer>
        </CheckoutHeader>

        <CheckoutContent>
          {/* Left side: Form section */}
          <FormSection>
            <AnimatePresence mode="wait">
              {/* STEP 1: SHIPPING INFORMATION */}
              {step === 1 && (
                <motion.div
                  key="shipping-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormCard>
                    <SectionTitle>
                      <span>Shipping Information</span>
                      <SectionLine />
                    </SectionTitle>
                    
                    {/* Saved Addresses Section (if user is logged in) */}
                    {currentUser && savedAddresses.length > 0 && (
                      <SavedAddressesSection>
                        <SectionSubtitle>Saved Addresses</SectionSubtitle>
                        
                        <AddressList>
                          {savedAddresses.map(address => (
                            <AddressCard 
                              key={address.id} 
                              selected={selectedAddress === address.id}
                              onClick={() => handleAddressSelection(address.id)}
                            >
                              <RadioContainer>
                                <RadioCircle selected={selectedAddress === address.id} />
                              </RadioContainer>
                              <AddressContent>
                                <AddressName>
                                  {address.name}
                                  {address.isDefault && <DefaultTag>Default</DefaultTag>}
                                </AddressName>
                                <AddressText>
                                  {address.street}{address.apartment ? `, ${address.apartment}` : ''}<br />
                                  {address.city}, {address.state} {address.zipCode}<br />
                                  {address.country}
                                </AddressText>
                              </AddressContent>
                            </AddressCard>
                          ))}
                          
                          <AddressCard
                            selected={useNewAddress}
                            onClick={() => handleAddressSelection('new')}
                            isAction
                          >
                            <RadioContainer>
                              <RadioCircle selected={useNewAddress} />
                            </RadioContainer>
                            <AddressContent>
                              <AddressName>Add new address</AddressName>
                              <AddressText>Enter a new shipping address</AddressText>
                            </AddressContent>
                          </AddressCard>
                        </AddressList>
                      </SavedAddressesSection>
                    )}
                    
                    {/* Address Form (for new addresses) */}
                    {(!currentUser || useNewAddress) && (
                      <AddressForm onSubmit={handleShippingSubmit}>
                        {currentUser && (
                          <FormGroup>
                            <FormLabel htmlFor="addressName">Address Name</FormLabel>
                            <FormInput
                              id="addressName"
                              name="addressName"
                              value={addressName}
                              onChange={(e) => setAddressName(e.target.value)}
                              placeholder="Home, Office, etc."
                            />
                          </FormGroup>
                        )}
                        
                        <FormRow>
                          <FormGroup>
                            <FormLabel htmlFor="firstName">First Name*</FormLabel>
                            <FormInput
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <FormLabel htmlFor="lastName">Last Name*</FormLabel>
                            <FormInput
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                        </FormRow>
                        
                        <FormRow>
                          <FormGroup>
                            <FormLabel htmlFor="email">Email*</FormLabel>
                            <FormInput
                              id="email"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <FormLabel htmlFor="phone">Phone*</FormLabel>
                            <FormInput
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                        </FormRow>
                        
                        <FormGroup>
                          <FormLabel htmlFor="address">Street Address*</FormLabel>
                          <FormInput
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </FormGroup>
                        
                        <FormGroup>
                          <FormLabel htmlFor="apartment">Apartment/Suite (optional)</FormLabel>
                          <FormInput
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleChange}
                          />
                        </FormGroup>
                        
                        <FormRow>
                          <FormGroup>
                            <FormLabel htmlFor="city">City*</FormLabel>
                            <FormInput
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <FormLabel htmlFor="state">State/Province*</FormLabel>
                            <FormInput
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                        </FormRow>
                        
                        <FormRow>
                          <FormGroup>
                            <FormLabel htmlFor="zipCode">Postal Code*</FormLabel>
                            <FormInput
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <FormLabel htmlFor="country">Country*</FormLabel>
                            <FormInput
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                        </FormRow>
                        
                        {currentUser && (
                          <CheckboxContainer>
                            <CheckboxGroup>
                              <CheckboxInput
                                id="saveAddress"
                                type="checkbox"
                                checked={saveNewAddress}
                                onChange={() => setSaveNewAddress(!saveNewAddress)}
                              />
                              <CheckboxLabel htmlFor="saveAddress">
                                Save address for future orders
                              </CheckboxLabel>
                            </CheckboxGroup>
                            
                            {saveNewAddress && (
                              <CheckboxGroup>
                                <CheckboxInput
                                  id="defaultAddress"
                                  type="checkbox"
                                  checked={makeDefaultAddress}
                                  onChange={() => setMakeDefaultAddress(!makeDefaultAddress)}
                                />
                                <CheckboxLabel htmlFor="defaultAddress">
                                  Set as default address
                                </CheckboxLabel>
                              </CheckboxGroup>
                            )}
                          </CheckboxContainer>
                        )}
                      </AddressForm>
                    )}
                    
                    {/* Shipping Method Section */}
                    <SectionTitle>
                      <span>Shipping Method</span>
                      <SectionLine />
                    </SectionTitle>
                    
                    <ShippingOptions>
                      <ShippingOption
                        selected={shippingMethod === 'standard'}
                        onClick={() => setShippingMethod('standard')}
                      >
                        <RadioContainer>
                          <RadioCircle selected={shippingMethod === 'standard'} />
                        </RadioContainer>
                        <ShippingDetails>
                          <ShippingName>Standard Shipping</ShippingName>
                          <ShippingInfo>Delivery in 5-7 business days</ShippingInfo>
                        </ShippingDetails>
                        <ShippingCost>{cartTotal >= 150 ? 'FREE' : formatPrice(7.99)}</ShippingCost>
                      </ShippingOption>
                      
                      <ShippingOption
                        selected={shippingMethod === 'express'}
                        onClick={() => setShippingMethod('express')}
                      >
                        <RadioContainer>
                          <RadioCircle selected={shippingMethod === 'express'} />
                        </RadioContainer>
                        <ShippingDetails>
                          <ShippingName>Express Shipping</ShippingName>
                          <ShippingInfo>Delivery in 1-3 business days</ShippingInfo>
                        </ShippingDetails>
                        <ShippingCost>{cartTotal >= 150 ? formatPrice(7.99) : formatPrice(15.99)}</ShippingCost>
                      </ShippingOption>
                    </ShippingOptions>
                    
                    <ButtonContainer>
                      <PrimaryButton onClick={handleShippingSubmit}>
                        Continue to Payment
                      </PrimaryButton>
                      <SecondaryButton onClick={() => navigate('/cart')}>
                        Back to Cart
                      </SecondaryButton>
                    </ButtonContainer>
                  </FormCard>
                </motion.div>
              )}
              
              {/* STEP 2: PAYMENT */}
              {step === 2 && (
                <motion.div
                  key="payment-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormCard>
                    <SectionTitle>
                      <span>Payment Method</span>
                      <SectionLine />
                    </SectionTitle>
                    
                    <PaymentMethods>
                      <PaymentOption
                        selected={paymentMethod === 'credit-card'}
                        onClick={() => setPaymentMethod('credit-card')}
                      >
                        <RadioContainer>
                          <RadioCircle selected={paymentMethod === 'credit-card'} />
                        </RadioContainer>
                        <PaymentIcon>
                          <Icon name="credit-card" size={24} />
                        </PaymentIcon>
                        <PaymentLabel>Credit Card</PaymentLabel>
                      </PaymentOption>
                      
                      <PaymentOption
                        selected={paymentMethod === 'paypal'}
                        onClick={() => setPaymentMethod('paypal')}
                      >
                        <RadioContainer>
                          <RadioCircle selected={paymentMethod === 'paypal'} />
                        </RadioContainer>
                        <PaymentIcon>
                          <Icon name="paypal" size={24} />
                        </PaymentIcon>
                        <PaymentLabel>PayPal</PaymentLabel>
                      </PaymentOption>
                      
                      <PaymentOption
                        selected={paymentMethod === 'apple-pay'}
                        onClick={() => setPaymentMethod('apple-pay')}
                      >
                        <RadioContainer>
                          <RadioCircle selected={paymentMethod === 'apple-pay'} />
                        </RadioContainer>
                        <PaymentIcon>
                          <Icon name="apple-pay" size={24} />
                        </PaymentIcon>
                        <PaymentLabel>Apple Pay</PaymentLabel>
                      </PaymentOption>
                      
                      <PaymentOption
                        selected={paymentMethod === 'klarna'}
                        onClick={() => setPaymentMethod('klarna')}
                      >
                        <RadioContainer>
                          <RadioCircle selected={paymentMethod === 'klarna'} />
                        </RadioContainer>
                        <PaymentIcon>
                          <Icon name="klarna" size={24} />
                        </PaymentIcon>
                        <PaymentLabel>Klarna</PaymentLabel>
                      </PaymentOption>
                    </PaymentMethods>
                    
                    {paymentMethod === 'credit-card' && (
                      <CreditCardForm>
                        <FormGroup>
                          <FormLabel htmlFor="cardName">Name on Card*</FormLabel>
                          <FormInput
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            required
                          />
                        </FormGroup>
                        
                        <FormGroup>
                          <FormLabel htmlFor="cardNumber">Card Number*</FormLabel>
                          <FormInput
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="XXXX XXXX XXXX XXXX"
                            required
                          />
                        </FormGroup>
                        
                        <FormRow>
                          <FormGroup>
                            <FormLabel htmlFor="expiry">Expiry Date*</FormLabel>
                            <FormInput
                              id="expiry"
                              name="expiry"
                              value={formData.expiry}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <FormLabel htmlFor="cvv">CVV*</FormLabel>
                            <FormInput
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              placeholder="123"
                              required
                            />
                          </FormGroup>
                        </FormRow>
                      </CreditCardForm>
                    )}
                    
                    {paymentMethod !== 'credit-card' && (
                      <ConnectMessage>
                        You will be redirected to {paymentMethod === 'paypal' ? 'PayPal' : 
                          paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Klarna'} to complete your payment after review.
                      </ConnectMessage>
                    )}
                    
                    <TrustBadges>
                      <TrustBadge>
                        <Icon name="lock" size={18} />
                        <TrustText>Secure Payment</TrustText>
                      </TrustBadge>
                      <TrustBadge>
                        <Icon name="shield" size={18} />
                        <TrustText>Privacy Protected</TrustText>
                      </TrustBadge>
                      <TrustBadge>
                        <Icon name="check-circle" size={18} />
                        <TrustText>Verified by Visa</TrustText>
                      </TrustBadge>
                    </TrustBadges>
                    
                    <CheckboxContainer>
                      <CheckboxGroup>
                        <CheckboxInput
                          id="acceptTerms"
                          type="checkbox"
                          checked={hasAcceptedTerms}
                          onChange={() => setHasAcceptedTerms(!hasAcceptedTerms)}
                        />
                        <CheckboxLabel htmlFor="acceptTerms">
                          I agree to the <TermsLink>Terms & Conditions</TermsLink> and <TermsLink>Privacy Policy</TermsLink>
                        </CheckboxLabel>
                      </CheckboxGroup>
                    </CheckboxContainer>
                    
                    <ButtonContainer>
                      <PrimaryButton 
                        onClick={handlePaymentSubmit} 
                        disabled={isProcessing || !hasAcceptedTerms}
                      >
                        {isProcessing ? 'Processing...' : `Pay ${formatPrice(calculateTotal())}`}
                      </PrimaryButton>
                      <SecondaryButton onClick={() => setStep(1)} disabled={isProcessing}>
                        Back to Shipping
                      </SecondaryButton>
                    </ButtonContainer>
                  </FormCard>
                </motion.div>
              )}
            </AnimatePresence>
          </FormSection>
          
          {/* Right side: Order Summary */}
          <OrderSummaryContainer>
            <OrderSummaryCard>
              <SectionTitle>
                <span>Order Summary</span>
                <SectionLine />
              </SectionTitle>
              
              <OrderItems>
                {cartItems.map(item => (
                  <OrderItem key={item.id}>
                    <ItemThumbnail>
                      <img src={item.image} alt={item.name} />
                      <ItemQuantity>{item.quantity}</ItemQuantity>
                    </ItemThumbnail>
                    <ItemDetails>
                      <ItemName>{item.name}</ItemName>
                      <ItemVariant>{item.selectedOption}</ItemVariant>
                      <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
                    </ItemDetails>
                    <RemoveButton onClick={() => handleRemoveItem(item)}>
                      <Icon name="x" size={16} />
                    </RemoveButton>
                  </OrderItem>
                ))}
              </OrderItems>
              
              <OrderSummaryDivider />
              
              <SummaryRow>
                <SummaryLabel>Subtotal</SummaryLabel>
                <SummaryValue>{formatPrice(cartTotal)}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Shipping</SummaryLabel>
                <SummaryValue>
                  {calculateShippingCost() === 0 ? 'FREE' : formatPrice(calculateShippingCost())}
                </SummaryValue>
              </SummaryRow>
              
              <OrderSummaryDivider />
              
              <SummaryRow isBold>
                <SummaryLabel>Total</SummaryLabel>
                <SummaryValue>{formatPrice(calculateTotal())}</SummaryValue>
              </SummaryRow>
              
              <DiscountSection>
                <DiscountInput 
                  type="text"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError('');
                  }}
                  disabled={discountApplied !== null}
                />
                <ApplyButton 
                  type="button" 
                  onClick={handleApplyDiscount}
                  disabled={discountApplied !== null}
                >
                  {discountApplied ? 'Applied' : 'Apply'}
                </ApplyButton>
                {discountError && (
                  <DiscountError>{discountError}</DiscountError>
                )}
                {discountApplied && (
                  <DiscountSuccess>
                    {discountApplied.discount_percent ? 
                      `${discountApplied.discount_percent}% discount applied` : 
                      `$${discountApplied.discount_amount.toFixed(2)} discount applied`}
                    <RemoveDiscountButton onClick={() => {
                      setDiscountApplied(null);
                      setDiscountCode('');
                    }}>
                      <Icon name="times" size={10} />
                    </RemoveDiscountButton>
                  </DiscountSuccess>
                )}
              </DiscountSection>
              
              <SecureCheckout>
                <Icon name="lock" size={14} />
                <span>Secure Checkout</span>
              </SecureCheckout>
            </OrderSummaryCard>
            
            <ShippingGuarantee>
              <GuaranteeBadge>
                <Icon name="truck" size={20} />
                <span>Fast Shipping</span>
              </GuaranteeBadge>
              
              <GuaranteeBadge>
                <Icon name="refresh" size={20} />
                <span>30-Day Returns</span>
              </GuaranteeBadge>
            </ShippingGuarantee>
          </OrderSummaryContainer>
        </CheckoutContent>
      </CheckoutContainer>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: #1A1C23;
  padding: 40px 20px;
  color: #E9ECEF;
  
  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

const CheckoutContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  background-color: #252836;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid #3A3F50;
  padding: 20px;
`;

const CheckoutHeader = styled.header`
  padding: 20px;
  border-bottom: 1px solid #3A3F50;
  text-align: center;
`;

const CheckoutTitle = styled.h1`
  font-size: 32px;
  margin-bottom: 30px;
  font-weight: 600;
  color: var(--terracotta);
  text-align: center;
`;

const StepperContainer = styled.div`
  margin: 30px auto;
  max-width: 600px;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  opacity: ${props => (props.active ? 1 : 0.6)};
`;

const StepCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-color: ${props => 
    props.completed 
    ? 'var(--sage-green)' 
    : props.active 
    ? 'var(--terracotta)' 
    : 'var(--bg-dark)'
  };
  border: 2px solid ${props => 
    props.completed 
    ? 'var(--sage-green)' 
    : props.active 
    ? 'var(--terracotta)' 
    : 'var(--border-dark)'
  };
  color: var(--text-light);
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 0 10px var(--terracotta-glow)' : 'none'};
`;

const StepLabel = styled.span`
  margin-top: 8px;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'var(--soft-gold)' : 'var(--text-muted)'};
`;

const StepConnector = styled.div`
  flex-grow: 1;
  height: 2px;
  background-color: ${props => props.completed ? 'var(--sage-green)' : 'var(--border-dark)'};
  margin: 0 10px;
  position: relative;
  top: -18px;
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  margin-top: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  flex: 1;
`;

const FormCard = styled.div`
  background-color: #2D303E;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  border: 1px solid #3A3F50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--soft-gold);
  display: flex;
  align-items: center;
`;

const SectionLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    var(--terracotta-glow) 0%,
    var(--border-dark) 100%
  );
  margin-left: 15px;
`;

const SectionSubtitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: var(--text-light);
`;

const SavedAddressesSection = styled.div`
  margin-bottom: 30px;
`;

const AddressList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddressCard = styled.div`
  display: flex;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.selected ? '#343A50' : '#2D303E'};
  border: 1px solid ${props => props.selected ? 'var(--terracotta)' : '#3A3F50'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected ? '0 0 15px rgba(240, 94, 64, 0.3)' : 'none'};
  
  &:hover {
    border-color: var(--terracotta);
    box-shadow: 0 0 10px rgba(240, 94, 64, 0.3);
  }
`;

const RadioContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
`;

const RadioCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--terracotta)' : '#3A3F50'};
  background-color: #252836;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--terracotta);
    opacity: ${props => props.selected ? 1 : 0};
    transition: all 0.2s ease;
  }
`;

const AddressContent = styled.div`
  flex: 1;
`;

const AddressName = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 5px;
  color: var(--text-light);
  display: flex;
  align-items: center;
`;

const DefaultTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: var(--terracotta);
  color: var(--text-dark);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`;

const AddressText = styled.div`
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
`;

const AddressForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  margin-bottom: 6px;
  color: var(--text-muted);
`;

const FormInput = styled.input`
  background-color: #1F2233;
  border: 1px solid #3A3F50;
  border-radius: 6px;
  padding: 12px 16px;
  color: #E9ECEF;
  font-size: 15px;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--terracotta);
    box-shadow: 0 0 0 2px rgba(240, 94, 64, 0.3);
    outline: none;
  }
  
  &::placeholder {
    color: #8E929C;
  }
`;

const CheckboxContainer = styled.div`
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxInput = styled.input`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #3A3F50;
  border-radius: 4px;
  background-color: #1F2233;
  margin-right: 10px;
  position: relative;
  cursor: pointer;
  
  &:checked {
    border-color: var(--terracotta);
    background-color: var(--terracotta);
    
    &:after {
      content: '';
      position: absolute;
      top: 1px;
      left: 5px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(240, 94, 64, 0.3);
  }
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: var(--text-light);
  cursor: pointer;
`;

// Shipping styled components
const ShippingOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
`;

const ShippingOption = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.selected ? '#343A50' : '#2D303E'};
  border: 1px solid ${props => props.selected ? 'var(--terracotta)' : '#3A3F50'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected ? '0 0 15px rgba(240, 94, 64, 0.3)' : 'none'};
  
  &:hover {
    border-color: var(--terracotta);
    box-shadow: 0 0 10px rgba(240, 94, 64, 0.3);
  }
`;

const ShippingDetails = styled.div`
  flex: 1;
  margin-left: 10px;
`;

const ShippingName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: var(--text-light);
`;

const ShippingInfo = styled.div`
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 3px;
`;

const ShippingCost = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: var(--soft-gold);
`;

// Payment styled components
const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PaymentOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border-radius: 8px;
  background-color: ${props => props.selected ? 'var(--card-bg-selected)' : 'var(--card-bg-dark)'};
  border: 1px solid ${props => props.selected ? 'var(--terracotta)' : 'var(--border-dark)'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected ? '0 0 15px var(--terracotta-glow)' : 'none'};
  position: relative;
  
  &:hover {
    border-color: var(--terracotta);
    box-shadow: 0 0 10px var(--terracotta-glow);
  }
`;

const PaymentIcon = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: var(--text-light);
`;

const PaymentLabel = styled.span`
  font-size: 14px;
  color: var(--text-light);
  text-align: center;
`;

const CreditCardForm = styled.div`
  margin-top: 20px;
`;

const ConnectMessage = styled.div`
  background-color: var(--bg-darker);
  border: 1px solid var(--border-dark);
  border-radius: 8px;
  padding: 15px;
  font-size: 14px;
  color: var(--text-light);
  margin: 20px 0;
  text-align: center;
`;

const TrustBadges = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-muted);
`;

const TrustText = styled.span`
  font-size: 13px;
  margin-left: 8px;
`;

const TermsLink = styled.span`
  color: var(--terracotta);
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    color: var(--sage-green);
  }
`;

// Order Summary styled components
const OrderSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const OrderSummaryCard = styled.div`
  background-color: #1a1a1f; /* Slightly lighter than default dark background */
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #3a3a45; /* Lighter border for better visibility */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #121215;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #4d4d57;
    border-radius: 10px;
    
    &:hover {
      background-color: var(--terracotta);
    }
  }
`;

const OrderItems = styled.div`
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #3a3a45; /* Lighter border for better visibility */
  position: relative;
`;

const ItemThumbnail = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  position: relative;
  background-color: var(--bg-darker);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemQuantity = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--terracotta);
  color: var(--text-dark);
  font-size: 12px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 3px;
`;

// Discount code styling
const DiscountError = styled.div`
  color: #ff4d4d;
  font-size: 12px;
  margin-top: 5px;
`;

const DiscountSuccess = styled.div`
  color: #4dff4d;
  font-size: 12px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RemoveDiscountButton = styled.button`
  background: none;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
  padding: 2px 5px;
  margin-left: 5px;
  
  &:hover {
    color: #ff6666;
  }
`;

const ItemVariant = styled.div`
  font-size: 12px;
  color: var(--text-muted);
`;

const ItemPrice = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--soft-gold);
  margin-top: 3px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--terracotta);
  }
`;

const OrderSummaryDivider = styled.div`
  height: 1px;
  background-color: var(--border-dark);
  margin: 15px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  font-size: ${props => props.isBold ? '16px' : '14px'};
  font-weight: ${props => props.isBold ? '600' : '400'};
  color: ${props => props.isBold ? 'var(--soft-gold)' : 'var(--text-light)'};
`;

const SummaryLabel = styled.div``;
const SummaryValue = styled.div``;

const DiscountSection = styled.div`
  display: flex;
  margin-top: 20px;
`;

const DiscountInput = styled.input`
  flex: 1;
  background-color: var(--bg-input-dark);
  border: 1px solid var(--border-dark);
  border-radius: 6px 0 0 6px;
  padding: 12px 16px;
  color: var(--text-light);
  font-size: 14px;
  
  &:focus {
    border-color: var(--terracotta);
    outline: none;
  }
`;

const ApplyButton = styled.button`
  background-color: var(--terracotta);
  color: var(--text-dark);
  font-weight: 600;
  border: none;
  padding: 0 15px;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--sage-green);
  }
`;

const SecureCheckout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  color: var(--text-muted);
  font-size: 13px;
  
  span {
    margin-left: 6px;
  }
`;

const ShippingGuarantee = styled.div`
  display: flex;
  justify-content: space-around;
  background-color: #2D303E;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid #3A3F50;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const GuaranteeBadge = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-light);
  
  span {
    margin-left: 8px;
    font-size: 14px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 30px;
  
  @media (min-width: 500px) {
    flex-direction: row;
  }
`;

const PrimaryButton = styled.button`
  background-color: var(--terracotta);
  color: var(--text-dark);
  border: none;
  border-radius: 8px;
  padding: 15px 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover:not(:disabled) {
    background-color: var(--sage-green);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background-color: transparent;
  color: var(--text-light);
  border: 1px solid var(--border-dark);
  border-radius: 8px;
  padding: 15px 25px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: var(--terracotta);
    color: var(--terracotta);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default CheckoutPage;
