import React, { useState, useRef } from 'react';
import { getTryOnProducts } from '../data/mockProducts';
import PhotoTryOn from '../components/PhotoTryOn';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Space Grotesk', sans-serif;
  min-height: 100vh;
  background: var(--deep-charcoal);
  color: var(--white);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin-bottom: 1rem;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
    font-size: 1.1rem;
  }
`;

const TestSection = styled.div`
  margin-bottom: 3rem;
  
  h2 {
    color: var(--soft-gold);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const ProductCard = styled.div`
  background: rgba(26, 26, 26, 0.6);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    border-color: var(--soft-gold);
  }
  
  &.selected {
    border-color: var(--soft-gold);
    box-shadow: 0 0 20px rgba(255, 204, 51, 0.3);
    background: rgba(30, 30, 30, 0.8);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.1);
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--white);
  font-size: 1.1rem;
`;

const ProductPrice = styled.p`
  color: var(--soft-gold);
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const ProductType = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 204, 51, 0.2);
  color: var(--soft-gold);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TryOnContainer = styled.div`
  background: rgba(18, 18, 18, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: var(--accent-gradient);
    filter: blur(80px);
    opacity: 0.1;
    z-index: -1;
    top: -80px;
    left: -80px;
  }
`;

const VariantSelector = styled.div`
  display: flex;
  gap: 0.75rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
`;

const VariantButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--glass-border);
  background: rgba(26, 26, 26, 0.6);
  color: var(--white);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  position: relative;
  
  &:hover {
    background: rgba(40, 40, 40, 0.8);
    border-color: var(--soft-gold);
  }
  
  &.selected {
    background: var(--soft-gold);
    color: var(--deep-charcoal);
    border-color: var(--soft-gold);
    box-shadow: 0 0 15px rgba(255, 204, 51, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.colorCode || 'transparent'};
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  padding-left: 2rem;
`;

const StartButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: var(--accent-gradient);
  color: var(--white);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  margin-top: 1.5rem;
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.7s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const Instructions = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 3px solid var(--soft-gold);
  
  h3 {
    color: var(--soft-gold);
    margin: 0 0 1rem 0;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }
  }
`;

const TestModeButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  margin: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const VirtualTryOnTest = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showPhotoTryOn, setShowPhotoTryOn] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const tryOnRef = useRef(null);

  // Get products that support virtual try-on
  const tryOnProducts = getTryOnProducts();

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setShowPhotoTryOn(false);
    
    // Scroll to try-on section
    setTimeout(() => {
      tryOnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleStartTryOn = () => {
    setShowPhotoTryOn(true);
  };

  const getProductForTryOn = () => {
    if (!selectedProduct) return null;
    
    return {
      ...selectedProduct,
      // Use the selected variant's try-on image if available
      primaryTryOnImage: selectedVariant?.tryOnImage || selectedProduct.tryOnImages?.[0],
      selectedVariant
    };
  };

  const startTestMode = () => {
    // Create a test product with generated clothing
    const testProduct = {
      id: 'test-clothing',
      name: 'Test T-Shirt',
      category: 'shirts',
      price: 0,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE5MGUyIi8+PC9zdmc+',
      tryOnImages: [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE5MGUyIi8+PC9zdmc+'
      ],
      variants: [
        {
          id: 'test-blue',
          color: 'Blue',
          colorCode: '#4a90e2',
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE5MGUyIi8+PC9zdmc+',
          tryOnImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGE5MGUyIi8+PC9zdmc+'
        },
        {
          id: 'test-red',
          color: 'Red',
          colorCode: '#e74c3c',
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTc0YzNjIi8+PC9zdmc+',
          tryOnImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTc0YzNjIi8+PC9zdmc+'
        }
      ],
      description: 'Test clothing item with guaranteed image loading',
      tryOnMetadata: {
        shoulderOffset: { x: 0, y: -20 },
        scaleMultiplier: 0.6,
        positioning: 'shoulders'
      }
    };
    
    setSelectedProduct(testProduct);
    setSelectedVariant(testProduct.variants[0]);
    setShowPhotoTryOn(true);
    setTestMode(true);
  };

  return (
    <Container>
      <Header>
        <h1>Virtual Try-On Demo</h1>
        <p>Experience The Noble Being's advanced photo virtual try-on technology. Select a product and upload your photo to see how it looks on you!</p>
        
        <TestModeButton
          onClick={startTestMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10,8 16,12 10,16 10,8"></polygon>
          </svg>
          Try Demo Mode (Guaranteed Working)
        </TestModeButton>
      </Header>
      
      <Instructions>
        <h3>How It Works</h3>
        <ul>
          <li>Select any product from our virtual try-on collection below</li>
          <li>Choose your preferred color variant</li>
          <li>Upload a clear, well-lit photo of yourself</li>
          <li>See instant try-on results and share or save your favorites</li>
        </ul>
      </Instructions>
      
      <TestSection>
        <h2>Select a Product to Try On</h2>
        <ProductGrid>
          {tryOnProducts.map((product) => (
            <ProductCard 
              key={product.id}
              className={selectedProduct?.id === product.id ? 'selected' : ''}
              onClick={() => handleProductSelect(product)}
            >
              <ProductImage 
                src={product.image} 
                alt={product.name} 
              />
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                <ProductType>{product.category || product.type}</ProductType>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      </TestSection>

      {selectedProduct && (
        <TryOnContainer ref={tryOnRef}>
          <h2>Try On: {selectedProduct.name}</h2>
          <p>Category: {selectedProduct.category || selectedProduct.type} | Price: ${selectedProduct.price.toFixed(2)}</p>
          
          {selectedProduct.variants?.length > 1 && (
            <div>
              <h3>Select Color:</h3>
              <VariantSelector>
                {selectedProduct.variants.map((variant) => (
                  <VariantButton
                    key={variant.id}
                    className={selectedVariant?.id === variant.id ? 'selected' : ''}
                    colorCode={variant.colorCode}
                    onClick={() => handleVariantSelect(variant)}
                    title={variant.color}
                  >
                    {variant.color}
                  </VariantButton>
                ))}
              </VariantSelector>
            </div>
          )}
          
          {!showPhotoTryOn ? (
            <div>
              <StartButton onClick={handleStartTryOn}>
                🚀 Start Virtual Try-On
              </StartButton>
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              <PhotoTryOn product={getProductForTryOn()} />
            </div>
          )}
        </TryOnContainer>
              )}
      </Container>
    );
};

export default VirtualTryOnTest;
