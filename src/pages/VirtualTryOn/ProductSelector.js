import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProductSelectorContainer = styled.div`
  padding: 1.5rem;
  background: rgba(26, 26, 26, 0.6);
  border-radius: var(--card-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    color: var(--white);
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ProductCard = styled(motion.div)`
  background: rgba(30, 30, 30, 0.8);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    border-color: var(--neon-cyan);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  }
  
  .product-image {
    height: 120px;
    width: 100%;
    background: var(--earth-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
    }
  }
  
  .product-info {
    padding: 0.75rem;
    
    h4 {
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      color: var(--white);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    p {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  }
`;

const ColorSelector = styled.div`
  margin-top: 1rem;
  
  h4 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--white);
  }
  
  .color-options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .color-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    
    &.active {
      transform: scale(1.1);
      border-color: var(--white);
    }
    
    &.color-sage { background-color: var(--sage-green); }
    &.color-terracotta { background-color: var(--terracotta); }
    &.color-gold { background-color: var(--soft-gold); }
    &.color-charcoal { background-color: var(--deep-charcoal); }
    &.color-sandstone { background-color: var(--sandstone-beige); }
  }
`;

const products = [
  { id: 1, name: 'Sage Green Embroidered Dress', modelPath: '/models/dress_model.glb', colors: ['sage', 'terracotta'] },
  { id: 2, name: 'Bronze Metallic Blouse', modelPath: '/models/blouse_model.glb', colors: ['gold', 'charcoal'] }
];

const ProductSelector = ({ onProductSelect, onColorSelect }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]); // Default to first color
    
    if (onProductSelect) {
      onProductSelect(product);
    }
    
    if (onColorSelect) {
      onColorSelect(product.colors[0]);
    }
  };
  
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    
    if (onColorSelect) {
      onColorSelect(color);
    }
  };
  
  return (
    <ProductSelectorContainer>
      <h3>Select a Product to Try On</h3>
      
      <ProductGrid>
        {products.map(product => (
          <ProductCard 
            key={product.id}
            className={selectedProduct?.id === product.id ? 'active' : ''}
            onClick={() => handleProductSelect(product)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="product-image">
              {/* Use a placeholder for now until we have actual thumbnails */}
              <div style={{ 
                width: '80%', 
                height: '80%', 
                backgroundColor: product.colors[0] === 'sage' ? '#8A9A5B' : 
                                 product.colors[0] === 'terracotta' ? '#E2725B' :
                                 product.colors[0] === 'gold' ? '#D4A017' :
                                 product.colors[0] === 'charcoal' ? '#333333' : '#D9C2A6'
              }}></div>
            </div>
            <div className="product-info">
              <h4>{product.name}</h4>
              <p>{product.category}</p>
            </div>
          </ProductCard>
        ))}
      </ProductGrid>
      
      {selectedProduct && (
        <ColorSelector>
          <h4>Choose Color:</h4>
          <div className="color-options">
            {selectedProduct.colors.map(color => (
              <div 
                key={color}
                className={`color-btn color-${color} ${selectedColor === color ? 'active' : ''}`}
                onClick={() => handleColorSelect(color)}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>
        </ColorSelector>
      )}
    </ProductSelectorContainer>
  );
};

export default ProductSelector;
