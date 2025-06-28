import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Card = styled(motion.div)`
  position: relative;
  background: rgba(30, 30, 30, 0.8);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
`;

const CardFront = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
`;

const Image = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--deep-charcoal);
  background-position: center;
  background-size: cover;
  transition: transform 0.5s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(212, 160, 23, 0.3) 0%,
      rgba(226, 114, 91, 0.3) 50%,
      rgba(138, 154, 91, 0.3) 100%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
  }
`;

const ContentWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProductName = styled(motion.h3)`
  color: var(--white);
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

const ProductPrice = styled(motion.p)`
  color: var(--soft-gold);
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 15px;
`;

const AddToCartButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(90deg, var(--sage-green), var(--terracotta));
  color: var(--white);
  border: none;
  padding: 12px;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  
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
`;

const ShineOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
`;

const GlowBadge = styled(motion.div)`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 0, 255, 0.2);
  color: #fff;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 0, 255, 0.3);
  z-index: 5;
`;

const ProductCard3D = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Mouse movement tracking for 3D effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Convert to rotation angles (limit to 10 degrees)
    const rotateY = mouseX * 10 / (rect.width / 2);
    const rotateX = -mouseY * 10 / (rect.height / 2);
    
    // Apply transform
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
    setIsHovered(false);
  };

  return (
    <Card
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileTap={{ scale: 0.98 }}
    >
      {product.isNew && (
        <GlowBadge
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          NEW
        </GlowBadge>
      )}
      
      <CardInner>
        <CardFront>
          <ImageWrapper>
            <Image style={{ 
              transform: isHovered ? 'scale(1.1)' : 'scale(1)', 
              '&::after': { opacity: isHovered ? 1 : 0 } 
            }} />
            <ShineOverlay style={{ opacity: isHovered ? 1 : 0 }} />
          </ImageWrapper>
          
          <ContentWrapper>
            <ProductName
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {product.name}
            </ProductName>
            
            <ProductPrice
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ${product.price}
            </ProductPrice>
            
            <AddToCartButton
              whileHover={{
                background: 'linear-gradient(90deg, #FF00FF, #00FFFF)',
                boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                '&::before': {
                  left: isHovered ? '100%' : '-100%'
                }
              }}
            >
              Add to Cart
            </AddToCartButton>
          </ContentWrapper>
        </CardFront>
      </CardInner>
    </Card>
  );
};

export default ProductCard3D;
