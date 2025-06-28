import React, { useEffect, useState } from 'react';
// useRef will be used in Phase 4: Virtual Try-On & Phase 5: AI & Personalization
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
// useScroll & useTransform will be used in Phase 5: AI & Personalization for scroll-based animations
// Will be used in Phase 4: Virtual Try-On for interactive background effects
import ParticleBackground from '../components/ParticleBackground';
// Will be used in Phase 5: AI & Personalization for dynamic text animations
import GlitchText from '../components/GlitchText';
import ProductCard3D from '../components/ProductCard3D';

// GSAP for advanced animations
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// API Services
import productService from '../services/productService';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Styled components for enhanced visual design
const MainContainer = styled.div`
  width: 100%;
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const HeroSection = styled.section`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 80px 2rem 0; /* Added top padding to account for header height */
  margin-top: 0;
  background-image: url('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.5) 50%,
      rgba(0, 0, 0, 0.3) 100%
    );
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20%;
    background: linear-gradient(to top, var(--deep-charcoal), transparent);
    z-index: 2;
  }
`;

const ShopNowBadge = styled(motion.div)`
  position: absolute;
  top: 30px;
  right: 30px;
  background: var(--terracotta);
  color: white;
  padding: 12px 20px;
  border-radius: 50px;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(226, 114, 91, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const HeroContent = styled(motion.div)`
  text-align: center;
  z-index: 3;
  max-width: 900px;
  position: relative;
  background: rgba(0, 0, 0, 0.6);
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    max-width: 90%;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--sandstone-beige);
  margin: 1.5rem 0;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  strong {
    color: var(--soft-gold);
    font-weight: 600;
  }
`;

const TagLine = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  
  span {
    font-size: 1rem;
    color: var(--white);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    background-color: rgba(138, 154, 91, 0.3);
    border: 1px solid var(--sage-green);
  }
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled(motion.button)`
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
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
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.7s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const ShopButton = styled(CTAButton)`
  background: var(--terracotta);
  color: var(--white);
  box-shadow: 0 5px 15px rgba(226, 114, 91, 0.3);
  border: none;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  &:hover {
    background: #d1604c;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(226, 114, 91, 0.5);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  svg {
    margin-left: 8px;
  }
`;

const TryOnButton = styled(CTAButton)`
  background: var(--soft-gold);
  color: var(--deep-charcoal);
  box-shadow: 0 5px 15px rgba(212, 160, 23, 0.3);
  border: none;
  font-weight: 600;
  letter-spacing: 1px;
  
  &:hover {
    background: #c9970f;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(212, 160, 23, 0.5);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  svg {
    margin-left: 8px;
  }
`;

const ProductsSection = styled.section`
  padding: 6rem 2rem;
  background-color: var(--sandstone-beige);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('https://images.unsplash.com/photo-1545411708-dc09bab4b4c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.05;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    background: var(--terracotta);
    z-index: 1;
  }
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  padding: 0 20px;
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(2.2rem, 4vw, 3rem);
  color: var(--deep-charcoal);
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  display: inline-block;
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--terracotta);
    border-radius: 2px;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 4rem;
  
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: var(--deep-charcoal);
    margin-bottom: 1.5rem;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 60px;
      height: 2px;
      background: var(--sage-green);
    }
  }
  
  .category-description {
    font-family: 'Inter', sans-serif;
    color: #666;
    max-width: 600px;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const ProductGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    max-width: 350px;
    margin: 0 auto;
  }
  
  & > div {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
  }
`;

const CraftSection = styled.section`
  padding: 8rem 2rem;
  background: linear-gradient(
    to bottom,
    var(--dark-bg) 0%,
    var(--dark-surface) 100%
  );
  text-align: center;
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
      radial-gradient(circle at 20% 20%, rgba(240, 94, 64, 0.1), transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(144, 194, 144, 0.07), transparent 40%),
      url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
    opacity: 0.5;
  }
`;

const CraftContent = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const CraftTitle = styled(motion.h2)`
  font-size: 2.5rem;
  color: var(--white);
  margin-bottom: 1.5rem;
`;

const CraftDescription = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--white);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const DiscoverButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 1rem 2.5rem;
  color: var(--white);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const TryOnSection = styled.section`
  padding: 8rem 2rem;
  background: linear-gradient(
    to right,
    var(--deep-charcoal) 0%,
    var(--bronze) 100%
  );
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 20px,
      rgba(0, 255, 255, 0.05) 20px,
      rgba(0, 255, 255, 0.05) 40px
    );
  }
`;

const TryOnContent = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const TryOnTitle = styled(motion.h2)`
  font-size: 2.5rem;
  color: var(--soft-gold);
  margin-bottom: 1.5rem;
`;

const TryOnDescription = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--white);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const TryNowButton = styled(motion.button)`
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 50px;
  padding: 1rem 2.5rem;
  color: var(--white);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  
  &:hover {
    background: rgba(0, 255, 255, 0.4);
    box-shadow: 0 10px 25px rgba(0, 255, 255, 0.5);
  }
`;

// Enhanced HomePage Component
const EnhancedHomePage = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0
    });
  }, [controls]);
  
  // State for product data
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState({
    newArrivals: true,
    bestsellers: true,
    featured: true
  });
  const [error, setError] = useState(null);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch new arrivals
        setLoading(prev => ({ ...prev, newArrivals: true }));
        const newArrivalsData = await productService.getNewArrivals(4);
        setNewArrivals(newArrivalsData);
        setLoading(prev => ({ ...prev, newArrivals: false }));
        
        // Fetch bestsellers
        setLoading(prev => ({ ...prev, bestsellers: true }));
        const bestsellersData = await productService.getBestSellers(4);
        setBestsellers(bestsellersData);
        setLoading(prev => ({ ...prev, bestsellers: false }));
        
        // Fetch featured products
        setLoading(prev => ({ ...prev, featured: true }));
        const featuredData = await productService.getFeaturedProducts();
        setFeaturedProducts(featuredData);
        setLoading(prev => ({ ...prev, featured: false }));
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load some products. Please refresh the page.');
        setLoading({
          newArrivals: false,
          bestsellers: false,
          featured: false
        });
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <MainContainer>
      <HeroSection>
        
        <HeroContent
          initial={{ opacity: 0, y: 50 }}
          animate={controls}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1rem' }}
          >
            Artisanal Fashion with Purpose
          </motion.h1>
          
          <HeroSubtitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Each piece in our collection is <strong>handcrafted by skilled artisans</strong>, using sustainable materials and traditional techniques that tell a story.
          </HeroSubtitle>
          
          <CTAContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link to="/shop">
              <ShopButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </ShopButton>
            </Link>
            
            <Link to="/virtual-try-on">
              <TryOnButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try On Virtually
              </TryOnButton>
            </Link>
          </CTAContainer>
        </HeroContent>
      </HeroSection>
      
      {/* Featured Products Section */}
      <ProductsSection>
        <SectionContainer>
          <SectionTitle
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8 }}
          >
            Featured Products
          </SectionTitle>
          
          <ProductGrid
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
          >
            {loading.featured ? (
              <div className="loading-container">
                <p>Loading featured products...</p>
              </div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <ProductCard3D
                  key={product.id}
                  product={product}
                  index={index}
                  animationDelay={0.2 + index * 0.1}
                />
              ))
            ) : (
              <div className="no-products-message">
                <p>No featured products available at the moment.</p>
              </div>
            )}
          </ProductGrid>
        </SectionContainer>
      </ProductsSection>
      
      {/* New Arrivals Section */}
      <ProductsSection>
        <SectionContainer>
          <SectionTitle
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8 }}
          >
            New Arrivals
          </SectionTitle>
          
          <ProductGrid
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
          >
            {loading.newArrivals ? (
              <div className="loading-container">
                <p>Loading new arrivals...</p>
              </div>
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product, index) => (
                <ProductCard3D
                  key={product.id}
                  product={product}
                  index={index}
                  animationDelay={0.2 + index * 0.1}
                />
              ))
            ) : (
              <div className="no-products-message">
                <p>No new arrivals available at the moment.</p>
              </div>
            )}
          </ProductGrid>
        </SectionContainer>
      </ProductsSection>
      
      {/* Bestsellers Section */}
      <ProductsSection>
        <SectionContainer>
          <SectionTitle
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8 }}
          >
            Bestsellers
          </SectionTitle>
          
          <ProductGrid
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
          >
            {loading.bestsellers ? (
              <div className="loading-container">
                <p>Loading bestsellers...</p>
              </div>
            ) : bestsellers.length > 0 ? (
              bestsellers.map((product, index) => (
                <ProductCard3D
                  key={product.id}
                  product={product}
                  index={index}
                  animationDelay={0.2 + index * 0.1}
                />
              ))
            ) : (
              <div className="no-products-message">
                <p>No bestsellers available at the moment.</p>
              </div>
            )}
          </ProductGrid>
        </SectionContainer>
      </ProductsSection>
      
      {/* Craft Section */}
      <CraftSection>
        <CraftContent>
          <CraftTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Handcrafted With Purpose
          </CraftTitle>
          
          <CraftDescription
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover the artistry behind each piece in our MY CRAFT collection. Our artisans blend traditional techniques with innovative designs to create pieces that tell a story.
          </CraftDescription>
          
          <Link to="/my-craft">
            <DiscoverButton
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discover MY CRAFT
            </DiscoverButton>
          </Link>
        </CraftContent>
      </CraftSection>
      
      {/* Virtual Try-On Teaser */}
      <TryOnSection>
        <TryOnContent>
          <TryOnTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Experience Before You Buy
          </TryOnTitle>
          
          <TryOnDescription
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Our virtual try-on technology lets you see how our pieces look on you before making a purchase. Upload a photo or use your webcam to experience our clothing virtually.
          </TryOnDescription>
          
          <Link to="/virtual-try-on">
            <TryNowButton
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 15px 30px rgba(0, 255, 255, 0.7)' 
              }}
              whileTap={{ scale: 0.95 }}
            >
              Try Now
            </TryNowButton>
          </Link>
        </TryOnContent>
      </TryOnSection>
    </MainContainer>
  );
};

export default EnhancedHomePage;
