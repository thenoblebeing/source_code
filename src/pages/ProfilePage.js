import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', or 'returns'
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [returnFormOpen, setReturnFormOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [returnFormData, setReturnFormData] = useState({
    reason: '',
    description: '',
    returnType: 'refund' // 'refund' or 'exchange'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('ProfilePage: Loading user profile data...');
        setLoading(true);
        
        if (!currentUser) {
          console.log('ProfilePage: No current user, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('ProfilePage: Current user data:', currentUser);
        
        // Get profile from currentUser or fetch it if needed
        const profile = currentUser.profile || await userService.getProfile();
        console.log('ProfilePage: Profile data:', profile);
        
        // Extract user details from combined data
        const userData = {
          name: currentUser.name || profile?.name || currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || '',
          email: currentUser.email || '',
          phone: profile?.phone || '',
          profilePicture: currentUser.user_metadata?.avatar_url || profile?.profilePicture || '/default-avatar.png',
          address: profile?.address ? 
            (typeof profile.address === 'string' ? JSON.parse(profile.address) : profile.address) : 
            {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            }
        };
        
        console.log('ProfilePage: Setting form data:', userData);
        setFormData(userData);
        
        // Fetch data when tabs change
        if (activeTab === 'orders') {
          fetchOrderHistory();
        } else if (activeTab === 'returns') {
          fetchReturnsHistory();
        }
      } catch (error) {
        console.error('ProfilePage: Error loading profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser, navigate, activeTab]);
  
  // Fetch order history when tab changes to 'orders'
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching real order history from Supabase...');
      
      // Use the enhanced getUserOrders function to get real order data
      const realOrders = await userService.getUserOrders();
      console.log('Fetched orders:', realOrders);
      
      if (realOrders && realOrders.length > 0) {
        setOrders(realOrders);
      } else {
        // If no orders are found, set an empty array
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to load order history');
      // Use empty array if there's an error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch returns history
  const fetchReturnsHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching returns history...');
      
      // Use the new getUserReturns function
      const returns = await userService.getUserReturns();
      console.log('Fetched returns:', returns);
      
      setReturns(returns || []);
    } catch (error) {
      console.error('Error fetching returns history:', error);
      setError('Failed to load returns history');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };
  
  const handleProfilePictureChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    try {
      setImageUploading(true);
      
      // In a real implementation, you would upload the file to your storage service
      // For now, we'll just use a local URL
      const imageUrl = URL.createObjectURL(file);
      
      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));
      
      // In a real implementation, you would save this to the user profile
      console.log('Profile picture updated, would save to backend');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Failed to upload profile picture');
    } finally {
      setImageUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <ProfileContainer>
      <h1>My Profile</h1>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <TabsContainer>
        <Tab 
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </Tab>
        <Tab 
          active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        >
          Order History
        </Tab>
        <Tab 
          active={activeTab === 'returns'}
          onClick={() => setActiveTab('returns')}
        >
          Returns & Exchanges
        </Tab>
      </TabsContainer>

      <ProfileCard>
        {activeTab === 'profile' && (
          <>
            <ProfileHeader>
              <ProfileImageContainer>
                <ProfileImage 
                  src={formData.profilePicture || '/default-avatar.png'} 
                  alt="Profile" 
                  onClick={handleProfilePictureClick}
                />
                {imageUploading && <UploadingOverlay>Uploading...</UploadingOverlay>}
                <UploadText>Click to change</UploadText>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </ProfileImageContainer>
              <ProfileName>
                {formData.name || currentUser?.user_metadata?.name || currentUser?.user_metadata?.full_name || 'Noble Being User'}
              </ProfileName>
            </ProfileHeader>

            {isEditing ? (
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormGroup>

            <AddressSection>
              <h3>Shipping Address</h3>
              <FormGroup>
                <Label>Street</Label>
                <Input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>City</Label>
                  <Input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>State/Province</Label>
                  <Input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </FormGroup>
              </FormRow>
            </AddressSection>

            <ButtonGroup>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" secondary onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </ButtonGroup>
          </form>
        ) : (
          <ProfileInfo>
            <InfoItem>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{currentUser.email}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Phone:</InfoLabel>
              <InfoValue>{currentUser.phone || 'Not provided'}</InfoValue>
            </InfoItem>

            {currentUser.address && (
              <AddressInfo>
                <h3>Shipping Address</h3>
                <p>{currentUser.address.street}</p>
                <p>
                  {currentUser.address.city}, {currentUser.address.state} {currentUser.address.postalCode}
                </p>
                <p>{currentUser.address.country}</p>
              </AddressInfo>
            )}

            <ButtonGroup>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              <Button onClick={handleLogout} secondary>
                Logout
              </Button>
            </ButtonGroup>
          </ProfileInfo>
        )}
          </>
        )}
        
        {activeTab === 'orders' && (
          <OrderHistorySection>
            <SectionTitle>Your Order History</SectionTitle>
            
            {loading ? (
              <LoadingIndicator>Loading your orders...</LoadingIndicator>
            ) : orders.length === 0 ? (
              <EmptyState>
                <p>You haven't placed any orders yet.</p>
                <Link to="/shop">Continue shopping</Link>
              </EmptyState>
            ) : (
              <OrdersList>
                {orders.map(order => {
                  // Format date string from timestamp
                  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  return (
                    <OrderCard key={order.id}>
                      <OrderHeader>
                        <OrderInfo>
                          <OrderDetail>
                            <span>Order Number:</span>
                            <strong>{order.id.substring(0, 8)}</strong>
                          </OrderDetail>
                          <OrderDetail>
                            <span>Date:</span>
                            <strong>{orderDate}</strong>
                          </OrderDetail>
                        </OrderInfo>
                        <OrderStatus status={order.status}>
                          {order.status}
                        </OrderStatus>
                      </OrderHeader>
                      
                      {order.tracking && (
                        <TrackingInfo>
                          <span>Tracking:</span>
                          {order.tracking.tracking_url ? (
                            <a href={order.tracking.tracking_url} target="_blank" rel="noopener noreferrer">
                              {order.tracking.carrier} - {order.tracking.tracking_number}
                            </a>
                          ) : (
                            <span>{order.tracking.carrier} - {order.tracking.tracking_number}</span>
                          )}
                        </TrackingInfo>
                      )}
                      
                      <ItemList>
                        {order.items && order.items.map(item => (
                          <OrderItem key={item.id}>
                            {item.image && (
                              <ItemImage src={item.image} alt={item.name} />
                            )}
                            <ItemContent>
                              <ItemName>{item.name}</ItemName>
                              <ItemDetails>
                                <span>Qty: {item.quantity}</span>
                                <span>${parseFloat(item.price).toFixed(2)}</span>
                              </ItemDetails>
                              <ItemActions>
                                <ActionButton 
                                  onClick={() => {
                                    setSelectedOrderItem(item);
                                    setReturnFormOpen(true);
                                  }}
                                  disabled={order.status !== 'delivered'}
                                >
                                  Request Return
                                </ActionButton>
                                <ActionButton secondary>
                                  Review Product
                                </ActionButton>
                              </ItemActions>
                            </ItemContent>
                          </OrderItem>
                        ))}
                      </ItemList>
                      
                      <OrderFooter>
                        <OrderTotal>
                          <span>Total:</span>
                          <strong>${parseFloat(order.total).toFixed(2)}</strong>
                        </OrderTotal>
                        <ViewOrderButton to={`/order-confirmation?id=${order.id}`} state={{ order }}>
                          View Order Details
                        </ViewOrderButton>
                      </OrderFooter>
                    </OrderCard>
                  );
                })}
              </OrdersList>
            )}
          </OrderHistorySection>
        )}
        
        {activeTab === 'returns' && (
          <ReturnsSection>
            <SectionTitle>Returns & Exchanges</SectionTitle>
            
            {loading ? (
              <LoadingIndicator>Loading your returns...</LoadingIndicator>
            ) : returns.length === 0 ? (
              <EmptyState>
                <p>You don't have any returns or exchanges yet.</p>
                <p>If you need to return or exchange an item, please visit your order history.</p>
              </EmptyState>
            ) : (
              <ReturnsList>
                {returns.map(returnItem => {
                  // Format date string from timestamp
                  const requestedDate = new Date(returnItem.requested_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  return (
                    <ReturnCard key={returnItem.id}>
                      <ReturnHeader>
                        <ReturnInfo>
                          <ReturnDetail>
                            <span>Return ID:</span>
                            <strong>{returnItem.id.substring(0, 8)}</strong>
                          </ReturnDetail>
                          <ReturnDetail>
                            <span>Requested:</span>
                            <strong>{requestedDate}</strong>
                          </ReturnDetail>
                        </ReturnInfo>
                        <ReturnStatus status={returnItem.status}>
                          {returnItem.status}
                        </ReturnStatus>
                      </ReturnHeader>
                      
                      <ReturnItem>
                        {returnItem.productImage && (
                          <ItemImage src={returnItem.productImage} alt={returnItem.productName} />
                        )}
                        <ReturnItemContent>
                          <ItemName>{returnItem.productName}</ItemName>
                          <ReturnReason>
                            <span>Reason:</span> {returnItem.reason}
                          </ReturnReason>
                          {returnItem.description && (
                            <ReturnDescription>
                              <span>Description:</span> {returnItem.description}
                            </ReturnDescription>
                          )}
                          <ReturnType>
                            <span>Type:</span> {returnItem.return_type === 'refund' ? 'Refund' : 'Exchange'}
                          </ReturnType>
                        </ReturnItemContent>
                      </ReturnItem>
                      
                      {returnItem.status === 'approved' && returnItem.return_type === 'refund' && (
                        <RefundAmount>
                          <span>Refund Amount:</span>
                          <strong>${parseFloat(returnItem.refund_amount || 0).toFixed(2)}</strong>
                        </RefundAmount>
                      )}
                      
                      {returnItem.status === 'pending' && (
                        <ReturnActions>
                          <ActionButton secondary onClick={() => {
                            // Cancel return request functionality would go here
                            alert('This functionality is coming soon!');
                          }}>
                            Cancel Return Request
                          </ActionButton>
                        </ReturnActions>
                      )}
                    </ReturnCard>
                  );
                })}
              </ReturnsList>
            )}
          </ReturnsSection>
        )}
        
        {/* Return Request Form Modal */}
        {returnFormOpen && selectedOrderItem && (
          <Modal>
            <ModalContent>
              <ModalHeader>
                <h3>Request a Return</h3>
                <CloseButton onClick={() => setReturnFormOpen(false)}>&times;</CloseButton>
              </ModalHeader>
              
              <ReturnForm onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setLoading(true);
                  await userService.requestReturn(
                    selectedOrderItem.id,
                    returnFormData.reason,
                    returnFormData.description,
                    returnFormData.returnType
                  );
                  
                  // Reset form and close modal
                  setReturnFormData({
                    reason: '',
                    description: '',
                    returnType: 'refund'
                  });
                  setReturnFormOpen(false);
                  setSelectedOrderItem(null);
                  
                  // Refresh returns data
                  if (activeTab === 'returns') {
                    fetchReturnsHistory();
                  }
                  
                  alert('Return request submitted successfully!');
                } catch (error) {
                  console.error('Error submitting return request:', error);
                  setError('Failed to submit return request');
                } finally {
                  setLoading(false);
                }
              }}>
                <ItemPreview>
                  {selectedOrderItem.image && (
                    <ItemImage src={selectedOrderItem.image} alt={selectedOrderItem.name} />
                  )}
                  <div>
                    <ItemName>{selectedOrderItem.name}</ItemName>
                    <ItemPrice>${parseFloat(selectedOrderItem.price).toFixed(2)}</ItemPrice>
                  </div>
                </ItemPreview>
                
                <FormGroup>
                  <Label>Reason for Return *</Label>
                  <Select 
                    name="reason"
                    value={returnFormData.reason}
                    onChange={(e) => setReturnFormData({...returnFormData, reason: e.target.value})}
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="wrong_size">Wrong Size</option>
                    <option value="defective">Defective/Damaged</option>
                    <option value="not_as_described">Not as Described</option>
                    <option value="changed_mind">Changed Mind</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Additional Details</Label>
                  <Textarea 
                    name="description"
                    value={returnFormData.description}
                    onChange={(e) => setReturnFormData({...returnFormData, description: e.target.value})}
                    placeholder="Please provide any additional details about your return request"
                    rows={4}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Return Type *</Label>
                  <RadioGroup>
                    <RadioOption>
                      <input 
                        type="radio" 
                        name="returnType" 
                        value="refund" 
                        checked={returnFormData.returnType === 'refund'}
                        onChange={() => setReturnFormData({...returnFormData, returnType: 'refund'})}
                      />
                      <span>Refund to Original Payment Method</span>
                    </RadioOption>
                    <RadioOption>
                      <input 
                        type="radio" 
                        name="returnType" 
                        value="exchange" 
                        checked={returnFormData.returnType === 'exchange'}
                        onChange={() => setReturnFormData({...returnFormData, returnType: 'exchange'})}
                      />
                      <span>Exchange for Same Item</span>
                    </RadioOption>
                  </RadioGroup>
                </FormGroup>
                
                <ReturnPolicy>
                  <strong>Return Policy:</strong> Items must be returned within 30 days of delivery. All items must be in original condition with tags attached.
                </ReturnPolicy>
                
                <ButtonGroup>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Return Request'}
                  </Button>
                  <Button type="button" secondary onClick={() => setReturnFormOpen(false)}>
                    Cancel
                  </Button>
                </ButtonGroup>
              </ReturnForm>
            </ModalContent>
          </Modal>
        )}
      </ProfileCard>
    </ProfileContainer>
  );
};

// Styled Components
const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 120px auto 4rem;
  padding: 0 2rem;
  position: relative;
  z-index: 1;

  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--soft-gold);
    margin-bottom: 2rem;
    text-align: center;
    letter-spacing: 1px;
  }
`;

const ProfileCard = styled.div`
  background-color: rgba(34, 34, 34, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  color: var(--text-primary);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--sage-green);
  box-shadow: 0 0 15px rgba(138, 154, 91, 0.5);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileName = styled.h2`
  font-family: 'Playfair Display', serif;
  margin-left: 1.5rem;
  color: var(--white);
  text-shadow: 0 0 10px rgba(138, 154, 91, 0.3);
`;

const ProfileInfo = styled.div`
  padding: 1rem 0;
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  width: 120px;
  color: var(--soft-gold);
`;

const InfoValue = styled.span`
  color: var(--text-primary);
  flex: 1;
`;

const AddressInfo = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: rgba(26, 26, 26, 0.6);
  border-radius: 6px;
  border: 1px solid var(--glass-border);

  h3 {
    font-family: 'Playfair Display', serif;
    margin-bottom: 0.5rem;
    color: var(--sage-green);
  }

  p {
    margin: 0.25rem 0;
    color: var(--text-secondary);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  > ${FormGroup} {
    flex: 1;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--sandstone-beige);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  font-size: 1rem;
  background-color: rgba(30, 30, 30, 0.7);
  color: var(--text-primary);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--sage-green);
    box-shadow: 0 0 0 2px rgba(138, 154, 91, 0.2);
  }
  
  &:disabled {
    background-color: rgba(30, 30, 30, 0.3);
    cursor: not-allowed;
  }
`;

const AddressSection = styled.div`
  margin: 2rem 0;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  
  h3 {
    font-family: 'Playfair Display', serif;
    margin-bottom: 1rem;
    color: #333333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.secondary ? 'transparent' : 'var(--sage-green)'};
  color: ${props => props.secondary ? 'var(--soft-gold)' : 'var(--white)'};
  border: ${props => props.secondary ? '1px solid var(--soft-gold)' : 'none'};
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.5s ease;
  }
  
  &:hover {
    background-color: ${props => props.secondary ? 'rgba(212, 160, 23, 0.1)' : 'var(--terracotta)'};
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: var(--white);
  background-color: var(--terracotta);
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 15px rgba(226, 114, 91, 0.3);
`;

// New styled components for order history and tabs
const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: ${props => props.active ? 'var(--soft-gold)' : 'var(--text-secondary)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--soft-gold)' : 'transparent'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--soft-gold);
  }
`;

const ProfileImageContainer = styled.div`
  position: relative;
  cursor: pointer;
  
  &:hover img {
    opacity: 0.8;
  }
  
  &:hover span {
    opacity: 1;
  }
`;

const UploadText = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 4px 0;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.3s;
  border-bottom-left-radius: 50%;
  border-bottom-right-radius: 50%;
`;

const UploadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
`;

const OrderHistorySection = styled.div`
  padding: 1rem 0;
`;

const SectionTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  color: var(--soft-gold);
  margin-bottom: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  
  p {
    margin-bottom: 1rem;
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled(motion.div)`
  background-color: rgba(26, 26, 26, 0.6);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    border-color: var(--sage-green);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--glass-border);
  background-color: rgba(34, 34, 34, 0.8);
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrderId = styled.span`
  font-weight: bold;
  color: var(--white);
  margin-bottom: 0.25rem;
`;

const OrderDate = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const OrderStatus = styled.div`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  background-color: ${props => {
    switch(props.status) {
      case 'Delivered': return 'rgba(138, 154, 91, 0.2)';
      case 'Processing': return 'rgba(212, 160, 23, 0.2)';
      case 'Canceled': return 'rgba(226, 114, 91, 0.2)';
      default: return 'rgba(138, 154, 91, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'Delivered': return 'var(--sage-green)';
      case 'Processing': return 'var(--soft-gold)';
      case 'Canceled': return 'var(--terracotta)';
      default: return 'var(--sage-green)';
    }
  }};
`;

const OrderItems = styled.div`
  padding: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  color: var(--text-primary);
`;

const ItemDetails = styled.div`
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: rgba(34, 34, 34, 0.6);
  border-top: 1px solid var(--glass-border);
`;

const OrderTotal = styled.div`
  font-weight: bold;
  color: var(--soft-gold);
`;

// Styled components for the Orders UI
const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-style: italic;
  color: #666;
`;

const ItemList = styled.div`
  margin: 1rem 0;
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
`;

const ItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TrackingInfo = styled.div`
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  
  a {
    color: var(--sage-green);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  background-color: ${props => props.secondary ? 'transparent' : 'var(--sage-green)'};
  color: ${props => props.secondary ? 'var(--sage-green)' : 'white'};
  border: ${props => props.secondary ? '1px solid var(--sage-green)' : 'none'};
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ViewOrderButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: var(--sage-green);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  
  &:hover {
    background-color: #576b46;
  }
`;

const OrderDetail = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1.5rem;
  
  span {
    font-size: 0.8rem;
    color: #666;
  }
`;

// Styled components for the Returns UI
const ReturnsSection = styled.div`
  padding: 1rem 0;
`;

const ReturnsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReturnCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  overflow: hidden;
`;

const ReturnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
`;

const ReturnInfo = styled.div`
  display: flex;
`;

const ReturnDetail = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1.5rem;
  
  span {
    font-size: 0.8rem;
    color: #666;
  }
`;

const ReturnStatus = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch(props.status) {
      case 'pending': return '#fff8e1';
      case 'approved': return '#e8f5e9';
      case 'processing': return '#e3f2fd';
      case 'completed': return '#e0f2f1';
      case 'rejected': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch(props.status) {
      case 'pending': return '#f57c00';
      case 'approved': return '#388e3c';
      case 'processing': return '#1976d2';
      case 'completed': return '#00897b';
      case 'rejected': return '#d32f2f';
      default: return '#616161';
    }
  }};
`;

const ReturnItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
`;

const ReturnItemContent = styled.div`
  flex: 1;
`;

const ReturnReason = styled.div`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  
  span {
    font-weight: 500;
    color: #666;
  }
`;

const ReturnDescription = styled.div`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  
  span {
    font-weight: 500;
    color: #666;
  }
`;

const ReturnType = styled.div`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  
  span {
    font-weight: 500;
    color: #666;
  }
`;

const ReturnActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const RefundAmount = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  text-align: right;
  
  span {
    color: #666;
    margin-right: 0.5rem;
  }
  
  strong {
    color: var(--sage-green);
  }
`;

// Styled components for the Return Form Modal
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-family: 'Playfair Display', serif;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const ReturnForm = styled.form`
  padding: 1rem;
`;

const ItemPreview = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const ItemPrice = styled.div`
  margin-top: 0.25rem;
  font-weight: 500;
  color: var(--sage-green);
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
`;

const ReturnPolicy = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ViewDetailsButton = styled.button`
  background-color: transparent;
  color: var(--sage-green);
  border: 1px solid var(--sage-green);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--sage-green);
    color: var(--white);
  }
`;

export default ProfilePage;
