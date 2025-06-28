import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

// Styled Components
const TryOnContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const DisabledFeatureMessage = styled.div`
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
`;

const ProductImage = styled.img`
  width: 200px;
  height: auto;
  margin: 20px 0;
  object-fit: contain;
`;

const Title = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 10px;
  color: #333;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 8px;
  background-color: #000;
  margin-bottom: 1rem;
`;

// Removed webcam component since we're not using it
const WebcamPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

const CanvasOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const ControlGroup = styled.div`
  flex: 1;
  min-width: 200px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
`;

const ControlTitle = styled.h4`
  color: var(--soft-gold);
  margin: 0 0 0.5rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ControlButton = styled(motion.button)`
  background: ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'var(--deep-charcoal)' : 'var(--white)'};
  border: 1px solid ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.2)'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const PermissionRequest = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  text-align: center;
  
  h3 {
    color: var(--soft-gold);
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    max-width: 400px;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background: rgba(255, 50, 50, 0.2);
  border-left: 3px solid #FF3232;
  color: #FF9999;
  border-radius: 4px;
`;

const Instructions = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  
  h4 {
    color: var(--soft-gold);
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 0.85rem;
    color: var(--white);
    opacity: 0.9;
    margin: 0 0 0.5rem 0;
  }
`;

// Simplified placeholder clothing component (no Three.js)  
const ClothingItem = ({ productImage, type = 'top' }) => {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      textAlign: 'center',
      marginTop: '20px'
    }}>
      <img 
        src={productImage} 
        alt="Product" 
        style={{ 
          maxWidth: '150px', 
          maxHeight: '150px',
          objectFit: 'contain'
        }}
      />
      <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
        {type.charAt(0).toUpperCase() + type.slice(1)} clothing item
      </div>
    </div>
  );
};

// Main component - simplified version without Three.js
const RealTimeTryOn = ({ product }) => {
  // Keep only necessary state
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [clothingType, setClothingType] = useState('top');
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(true);
  
  // Camera setup
  const webcamConfig = {
    width: 640,
    height: 480,
    facingMode: "user",
    mirrored: true
  };
  
  // Simplified setup without Three.js and virtualTryOnService
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Determine clothing type from product category if available
      if (product && product.category) {
        setClothingType(determineClothingType(product.category));
      }
    }, 1000);
    
    // Cleanup
    return () => clearTimeout(timer);
  }, [product]);
  
  // Helper to determine clothing type from product category
  const determineClothingType = (category) => {
    category = (category || '').toLowerCase();
    
    if (category.includes('shirt') || category.includes('top') || category.includes('blouse') || category.includes('jacket')) {
      return 'top';
    } else if (category.includes('pant') || category.includes('trouser') || category.includes('short') || category.includes('skirt')) {
      return 'bottom';
    } else if (category.includes('dress') || category.includes('gown') || category.includes('suit')) {
      return 'full';
    } else if (category.includes('hat') || category.includes('glasses') || category.includes('necklace') || category.includes('earring')) {
      return 'accessory';
    }
    
    return 'top'; // default
  };
  
  // Handle color/variant change
  const handleVariantChange = (index) => {
    setActiveImageIndex(index);
  };
  
  // Since we're not using webcam functionality, this function is simplified
  const requestCameraPermission = () => {
    console.log('Camera permission feature disabled');
    // We're not actually requesting permissions in this simplified version
  };
  
  // Removed permission check, as we're not using the webcam in this simplified version
  
  return (
    <TryOnContainer>
      {loading ? (
        <DisabledFeatureMessage>
          <Title>Virtual Try-On (Disabled)</Title>
          <Message>3D virtual try-on is currently disabled due to technical compatibility issues.</Message>
        </DisabledFeatureMessage>
      ) : (
        <DisabledFeatureMessage>
          <Title>Virtual Try-On (Disabled)</Title>
          <Message>3D virtual try-on is currently disabled due to technical compatibility issues.</Message>
          {product.images && product.images[activeImageIndex] && (
            <ProductImage src={product.images[activeImageIndex]} alt={product.name} />
          )}
          <ClothingItem 
            productImage={product?.images?.[activeImageIndex]} 
            type={clothingType}
          />
        </DisabledFeatureMessage>
      )}
      
      <Controls>
        <ControlGroup>
          <ControlTitle>Color Options</ControlTitle>
          <ButtonGroup>
            {product.images && product.images.map((imageUrl, index) => (
              <ControlButton
                key={index}
                active={activeImageIndex === index}
                onClick={() => handleVariantChange(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {product.colors && product.colors[index] 
                  ? product.colors[index].name 
                  : `Color ${index + 1}`}
              </ControlButton>
            ))}
          </ButtonGroup>
        </ControlGroup>
      </Controls>
    </TryOnContainer>
  );
};

export default RealTimeTryOn;
