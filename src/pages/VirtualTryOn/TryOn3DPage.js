import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ProductSelector from './ProductSelector';
import ThreeModelViewer from './ThreeModelViewer';

const TryOn3DContainer = styled(motion.div)`
  padding: 2rem;
  background: rgba(18, 18, 18, 0.4);
  backdrop-filter: blur(10px);
  border-radius: var(--standard-border-radius);
  border: 1px solid var(--glass-border);
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

const TryOnHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem;
    margin-bottom: 0.5rem;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }
`;

const TryOnContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ModelViewer = styled.div`
  background: rgba(15, 15, 15, 0.5);
  border-radius: var(--card-border-radius);
  padding: 1rem;
  height: 550px;
  display: flex;
  flex-direction: column;
`;

const ModelControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  
  button {
    padding: 0.75rem 1.5rem;
    background: var(--accent-gradient);
    color: var(--white);
    border: none;
    border-radius: var(--button-border-radius);
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
`;

const FallbackMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: var(--white);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    color: var(--neon-cyan);
  }
`;

// Fallback 3D model for testing purposes
const DEFAULT_MODEL = '/models/fallback_model.glb';

const TryOn3DPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [modelSrc, setModelSrc] = useState(DEFAULT_MODEL);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  
  // Update the model source when product or color changes
  useEffect(() => {
    if (selectedProduct) {
      // In a real implementation, you would have different model files for different colors
      // or you would modify the materials of a single model
      const newModelSrc = selectedProduct.modelPath;
      
      // Reset error state when trying a new model
      setModelError(false);
      setModelLoaded(false);
      
      // Check if the model file exists (this is a simplified check)
      const img = new Image();
      img.onload = () => {
        setModelSrc(newModelSrc);
      };
      img.onerror = () => {
        // If model doesn't exist, use fallback
        console.log('Model not found, using fallback');
        setModelSrc(DEFAULT_MODEL);
        setModelError(true);
      };
      
      // In reality, we'd check the actual 3D model file, but for simplicity
      // we're just checking if the path exists
      img.src = newModelSrc.replace('.glb', '.jpg');
    }
  }, [selectedProduct, selectedColor]);
  
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };
  
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };
  
  const handleAddToCart = () => {
    if (selectedProduct) {
      alert(`Added ${selectedProduct.name} in ${selectedColor} to cart!`);
      // In a real implementation, this would add the item to the cart
    }
  };
  
  return (
    <TryOn3DContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <TryOnHeader>
        <h2>3D Virtual Try-On</h2>
        <p>Experience our products in 3D. Rotate, zoom, and even try them in your space with AR!</p>
      </TryOnHeader>
      
      <TryOnContent>
        <ProductSelector 
          onProductSelect={handleProductSelect} 
          onColorSelect={handleColorSelect}
        />
        
        <ModelViewer>
          {selectedProduct ? (
            <>
              <ThreeModelViewer 
                modelSrc={modelSrc}
                selectedColor={selectedColor}
                enableRotation={true}
                enableZoom={true}
                position={[0, -0.5, 0]}
              />
              
              {modelError && (
                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem'}}>
                  Using placeholder model. Actual product model coming soon!
                </div>
              )}
              
              <ModelControls>
                <button onClick={() => window.history.back()}>
                  Back to Products
                </button>
                <button onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </ModelControls>
            </>
          ) : (
            <FallbackMessage>
              <div className="icon">🔍</div>
              <h3>Select a Product</h3>
              <p>Choose a product from the selection panel to view it in 3D and AR.</p>
            </FallbackMessage>
          )}
        </ModelViewer>
      </TryOnContent>
    </TryOn3DContainer>
  );
};

export default TryOn3DPage;
