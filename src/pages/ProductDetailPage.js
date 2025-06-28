import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import VRProductViewer from '../components/VRProductViewer';
import productService from '../services/productService';
import cartService from '../services/cartService';

// Styled components for the product detail page
const PageContainer = styled.main`
  min-height: 100vh;
  background: var(--deep-charcoal);
  color: white;
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

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const BreadcrumbNav = styled.nav`
  margin-bottom: 2rem;
  
  ul {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    
    li {
      display: flex;
      align-items: center;
      color: var(--sandstone-beige);
      font-size: 0.9rem;
      
      &:after {
        content: '/';
        margin-left: 0.5rem;
        opacity: 0.5;
      }
      
      &:last-child {
        color: var(--soft-gold);
        
        &:after {
          content: none;
        }
      }
      
      a {
        color: var(--sandstone-beige);
        text-decoration: none;
        transition: color 0.3s ease;
        
        &:hover {
          color: var(--terracotta);
        }
      }
    }
  }
`;

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ProductImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.div`
  height: 400px;
  background-color: ${props => props.color || 'var(--dark-surface)'};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(217, 194, 166, 0.2);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1), transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
`;

const Thumbnail = styled.div`
  height: 80px;
  background-color: ${props => props.color || 'var(--dark-surface)'};
  border-radius: 4px;
  cursor: pointer;
  opacity: ${props => props.active ? 1 : 0.7};
  transition: all 0.3s ease;
  border: 2px solid ${props => props.active ? 'var(--soft-gold)' : 'rgba(217, 194, 166, 0.2)'};
  overflow: hidden;
  position: relative;
  box-shadow: ${props => props.active ? '0 5px 15px rgba(212, 175, 55, 0.2)' : 'none'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    opacity: 1;
    transform: translateY(-3px);
    border-color: var(--soft-gold);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.active ? 'none' : 'rgba(0, 0, 0, 0.1)'};
    pointer-events: none;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ColorSelection = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1rem;
    color: var(--white);
    margin-bottom: 1rem;
  }
  
  .color-options {
    display: flex;
    gap: 0.75rem;
  }
`;

const ColorOption = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => {
    switch(props.color.toLowerCase()) {
      case 'green': return 'var(--sage-green)';
      case 'bronze': return '#cd7f32';
      case 'terracotta': return 'var(--terracotta)';
      case 'gold': return 'var(--soft-gold)';
      case 'charcoal': return 'var(--deep-charcoal)';
      case 'beige': return 'var(--sandstone-beige)';
      case 'magenta': return '#FF00FF';
      case 'indigo': return '#4B0082';
      default: return props.color;
    }
  }};
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.active ? 'var(--white)' : 'transparent'};
  box-shadow: ${props => props.active ? '0 0 0 2px var(--soft-gold)' : 'none'};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ProductCategory = styled.p`
  color: var(--sage-green);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--soft-gold);
  margin-bottom: 1rem;
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .original-price {
    text-decoration: line-through;
    color: var(--terracotta);
    font-size: 1.2rem;
    opacity: 0.7;
  }
  
  .discount-badge {
    background: var(--terracotta);
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 700;
  }
`;

const ProductDescription = styled.div`
  margin-bottom: 2rem;
  
  p {
    color: var(--sandstone-beige);
    line-height: 1.7;
    margin-bottom: 1rem;
  }
`;

const ProductAttributes = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Attribute = styled.div`
  h3 {
    font-size: 0.9rem;
    color: var(--sage-green);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--white);
  }
`;

const ProductActions = styled.div`
  margin-top: auto;
`;

const SizeSelection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1rem;
    color: var(--white);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .size-guide {
    font-size: 0.8rem;
    color: var(--sage-green);
    text-decoration: underline;
    cursor: pointer;
    margin-left: auto;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--soft-gold);
    }
  }
  
  .size-options {
    display: flex;
    gap: 1rem;
  }
`;

const SizeOption = styled.div`
  min-width: 60px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'var(--deep-charcoal)' : 'var(--white)'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '400'};
  border: 2px solid ${props => props.active ? 'var(--soft-gold)' : 'transparent'};
  padding: 0 12px;
  box-shadow: ${props => props.active ? '0 4px 8px rgba(212, 175, 55, 0.2)' : 'none'};
  
  &:hover {
    background: ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
    border-color: var(--soft-gold);
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  span {
    width: 60px;
    text-align: center;
    font-size: 1.2rem;
    color: var(--white);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled(motion.button)`
  flex: 2;
  padding: 1rem;
  border-radius: 6px;
  background: var(--terracotta);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: #d1604c;
  }
`;

const VRTryOnButton = styled(motion.button)`
  flex: 1;
  padding: 1rem;
  border-radius: 6px;
  background: var(--soft-gold);
  color: var(--deep-charcoal);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: #c9970f;
  }
`;

// Product data will be fetched from API

// Additional styled components for related products section
const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.position === 'left' ? 'left: 1rem;' : 'right: 1rem;'}
  background-color: rgba(30, 30, 30, 0.7);
  border: 2px solid var(--soft-gold);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soft-gold);
  cursor: pointer;
  z-index: 5;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--soft-gold);
    color: var(--deep-charcoal);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background-color: rgba(30, 30, 30, 0.7);
  color: var(--soft-gold);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 5;
  border: 1px solid var(--soft-gold);
`;

const RelatedProductsSection = styled.section`
  margin-top: 5rem;
`;

// Component to fetch and display related products
const RelatedProductsList = ({ productId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        // Fetch products in the same category
        const data = await productService.getProductsByCategory(category);
        // Filter out the current product and limit to 4 items
        const filtered = data
          .filter(product => product.id !== productId)
          .slice(0, 4);
        setRelatedProducts(filtered);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, category]);

  if (loading) {
    return <div>Loading related products...</div>;
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <RelatedProductsGrid>
      {relatedProducts.map(product => (
        <RelatedProductCard 
          key={product.id}
          whileHover={{ y: -10 }}
          onClick={() => window.location.href = `/product/${product.id}`}
        >
          <RelatedProductImage color={product.color} />
          <RelatedProductInfo>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </RelatedProductInfo>
        </RelatedProductCard>
      ))}
    </RelatedProductsGrid>
  );
};

const SectionTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--soft-gold);
  margin-bottom: 2rem;
  text-align: center;
`;

const RelatedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const RelatedProductCard = styled(motion.div)`
  background: rgba(34, 34, 34, 0.8);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);
  
  &:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), var(--gold-glow);
    border-color: rgba(255, 204, 51, 0.3);
  }
`;

const RelatedProductImage = styled.div`
  height: 200px;
  background-color: ${props => props.color || 'var(--dark-surface)'};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1), transparent 70%);
    animation: shine 3s infinite ease-in-out;
  }
`;

const RelatedProductInfo = styled.div`
  padding: 1rem;
  
  h3 {
    font-size: 1rem;
    color: var(--white);
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    color: var(--soft-gold);
    font-weight: 600;
  }
`;

// The main component
const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState(['S', 'M', 'L', 'One Size']);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showVRModal, setShowVRModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  useEffect(() => {
    // Fetch product data from API
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
        
        // Set default selected size
        if (data && data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
          setAvailableSizes(data.sizes);
        } else {
          // Default sizes if not provided
          setSelectedSize('One Size');
        }
        
        // Set default selected color
        if (data && data.color) {
          setSelectedColor(data.color);
          
          // For demo purposes, generate some color options based on the main color
          // In a real app, these would come from the product data
          const colors = [data.color];
          if (data.color !== 'Charcoal') colors.push('Charcoal');
          if (data.color !== 'Terracotta') colors.push('Terracotta');
          if (data.color !== 'Beige') colors.push('Beige');
          if (data.color !== 'Green') colors.push('Green');
          setAvailableColors(colors);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    // Validate that size and color are selected
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }
    
    try {
      // Add to cart using the API service
      await cartService.addToCart(productId, quantity, selectedSize, selectedColor);
      
      // Show visual feedback instead of alert
      setAddedToCart(true);
      
      // Reset button after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Use visual error feedback instead of alert
      setAddedToCart('error');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const openVRExperience = () => {
    setShowVRModal(true);
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div className="loading-spinner">Loading...</div>
        </Container>
      </PageContainer>
    );
  }
  
  if (!product) {
    return (
      <PageContainer>
        <Container>
          <h1>Product Not Found</h1>
          <p>Sorry, the product you're looking for doesn't exist.</p>
          <Link to="/shop">Return to Shop</Link>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <BreadcrumbNav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to={`/shop?category=${product.category ? product.category.toLowerCase() : ''}`}>{product.category || 'Category'}</Link></li>
            <li>{product.name}</li>
          </ul>
        </BreadcrumbNav>
        
        <ProductLayout>
          <ProductImageSection>
            <MainImage color={product.color}>
              {product.images && product.images.length > 0 && activeImage < product.images.length ? (
                <img 
                  src={product.images[activeImage]} 
                  alt={`${product.name} - view ${activeImage + 1}`} 
                />
              ) : (
                // Fallback if no images are available
                <img 
                  src={`https://placehold.co/600x600/333333/FFFFFF?text=${product.name}`}
                  alt={product.name}
                />
              )}
              
              {product.images && product.images.length > 1 && (
                <>
                  <NavButton 
                    onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    position="left"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </NavButton>
                  
                  <NavButton 
                    onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    position="right"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </NavButton>
                </>
              )}
              
              <ImageCounter>
                {activeImage + 1}/{product.images ? product.images.length : 1}
              </ImageCounter>
            </MainImage>
            <ThumbnailGrid>
              {product.images && product.images.length > 0 ? (
                product.images.map((img, index) => (
                  <Thumbnail 
                    key={index}
                    active={activeImage === index}
                    color={product.color}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} />
                  </Thumbnail>
                ))
              ) : (
                // Create some dummy thumbnails if no images are available
                Array(5).fill(0).map((_, index) => (
                  <Thumbnail 
                    key={index}
                    active={activeImage === index}
                    color={product.color}
                    onClick={() => setActiveImage(index)}
                  />
                ))
              )}
            </ThumbnailGrid>
          </ProductImageSection>
          
          <ProductInfo>
            <ProductCategory>{product.category || 'Uncategorized'}</ProductCategory>
            <ProductName>{product.name}</ProductName>
            <ProductPrice>${product.price}</ProductPrice>
            
            <ProductDescription>
              <p>{product.description}</p>
            </ProductDescription>
            
            <ProductAttributes>
              <Attribute>
                <h3>Material</h3>
                <p>{product.material || 'Organic Cotton Blend'}</p>
              </Attribute>
              <Attribute>
                <h3>Style</h3>
                <p>{product.style || 'Casual'}</p>
              </Attribute>
              <Attribute>
                <h3>Care</h3>
                <p>{product.care || 'Hand wash cold, line dry'}</p>
              </Attribute>
              <Attribute>
                <h3>Sustainability</h3>
                <p>{product.sustainability || 'Made with eco-friendly materials'}</p>
              </Attribute>
            </ProductAttributes>
            
            <ProductActions>
              {/* Color Selection - Always show */}
              <ColorSelection>
                <h3>Color</h3>
                <div className="color-options">
                  {availableColors.map(color => (
                    <ColorOption
                      key={color}
                      color={color}
                      active={selectedColor === color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </ColorSelection>
              
              {/* Size Selection - Always show */}
              <SizeSelection>
                <h3>Size</h3>
                <div className="size-options">
                  {availableSizes.map(size => (
                    <SizeOption
                      key={size}
                      active={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </SizeOption>
                  ))}
                </div>
              </SizeSelection>
              
              <QuantitySelector>
                <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
              </QuantitySelector>
              
              <ActionButtons>
                <AddToCartButton
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={addedToCart === true || addedToCart === 'error'}
                  style={{
                    background: addedToCart === true ? 'var(--sage-green)' : 
                              addedToCart === 'error' ? 'var(--terracotta)' : ''
                  }}
                >
                  {addedToCart === true ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Added to Cart!
                    </>
                  ) : addedToCart === 'error' ? (
                    <>Failed to Add</>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" fill="white"/>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" fill="white"/>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </AddToCartButton>
                
                <VRTryOnButton
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openVRExperience}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M11.29 17.71L7.29 13.71C7.19897 13.6149 7.12759 13.5028 7.08 13.38C6.97998 13.1365 6.97998 12.8635 7.08 12.62C7.12759 12.4973 7.19897 12.3851 7.29 12.29L11.29 8.29C11.383 8.19896 11.4936 8.1276 11.6154 8.08C11.7373 8.03239 11.868 8.0095 12 8.0095C12.132 8.0095 12.2627 8.03239 12.3846 8.08C12.5064 8.1276 12.617 8.19896 12.71 8.29C12.8011 8.38296 12.8724 8.49359 12.92 8.61542C12.9676 8.73724 12.9905 8.86799 12.9905 9C12.9905 9.13201 12.9676 9.26276 12.92 9.38458C12.8724 9.50641 12.8011 9.61704 12.71 9.71L10.41 12L12.71 14.29C12.8011 14.383 12.8724 14.4936 12.92 14.6154C12.9676 14.7373 12.9905 14.868 12.9905 15C12.9905 15.132 12.9676 15.2628 12.92 15.3846C12.8724 15.5064 12.8011 15.617 12.71 15.71C12.617 15.801 12.5064 15.8724 12.3846 15.92C12.2627 15.9676 12.132 15.9905 12 15.9905C11.868 15.9905 11.7373 15.9676 11.6154 15.92C11.4936 15.8724 11.383 15.801 11.29 15.71L11.29 17.71Z" fill="currentColor"/>
                    <path d="M16.7099 17.71C16.617 17.801 16.5064 17.8724 16.3846 17.92C16.2628 17.9676 16.132 17.9905 16 17.9905C15.868 17.9905 15.7373 17.9676 15.6154 17.92C15.4936 17.8724 15.3829 17.801 15.29 17.71C15.1989 17.617 15.1276 17.5064 15.08 17.3846C15.0324 17.2628 15.0095 17.132 15.0095 17C15.0095 16.868 15.0324 16.7373 15.08 16.6154C15.1276 16.4936 15.1989 16.383 15.29 16.29L17.59 14L15.29 11.71C15.1989 11.617 15.1276 11.5064 15.08 11.3846C15.0324 11.2628 15.0095 11.132 15.0095 11C15.0095 10.868 15.0324 10.7373 15.08 10.6154C15.1276 10.4936 15.1989 10.383 15.29 10.29C15.3829 10.199 15.4936 10.1276 15.6154 10.08C15.7373 10.0324 15.868 10.0095 16 10.0095C16.132 10.0095 16.2628 10.0324 16.3846 10.08C16.5064 10.1276 16.617 10.199 16.7099 10.29L20.7099 14.29C20.8009 14.3851 20.8723 14.4973 20.92 14.62C21.02 14.8635 21.02 15.1365 20.92 15.38C20.8723 15.5028 20.8009 15.6149 20.7099 15.71L16.7099 17.71Z" fill="currentColor"/>
                  </svg>
                  Try On in VR
                </VRTryOnButton>
              </ActionButtons>
            </ProductActions>
          </ProductInfo>
        </ProductLayout>
        
        {/* Related Products section */}
        <RelatedProductsSection>
          <SectionTitle>You May Also Like</SectionTitle>
          <RelatedProductsSection>
              <RelatedProductsList productId={productId} category={product?.category || ''} />
          </RelatedProductsSection>
        </RelatedProductsSection>
      </Container>
      
      {/* VR Product Viewer */}
      <VRProductViewer 
        isOpen={showVRModal} 
        onClose={() => setShowVRModal(false)} 
        product={product} 
      />
    </PageContainer>
  );
};

export default ProductDetailPage;
