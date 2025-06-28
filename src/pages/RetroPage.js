import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import retroService from '../services/retroService';

const RetroPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEra, setActiveEra] = useState('all');
  const [eras, setEras] = useState(['all', '1950s', '1960s', '1970s', '1980s']);
  
  // Fetch retro products and eras
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch products for the active era
        const productsData = await retroService.getRetroProducts(activeEra);
        setProducts(productsData);
        
        // Fetch available eras if not already set
        if (eras.length <= 1) {
          const eraData = await retroService.getEras();
          setEras(['all', ...eraData]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching retro collection:', err);
        setError('Failed to load retro collection. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeEra, eras.length]);

  // Handle era filter change
  const handleEraChange = (era) => {
    setActiveEra(era);
  };
  
  // Filter products based on active era (handled by API, but kept for client-side filtering if needed)
  const filteredProducts = activeEra === 'all' 
    ? products 
    : products.filter(product => product.year === activeEra);
  
  return (
    <PageContainer>
      <RetroHero>
        <HeroOverlay />
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <RetroGlitch>Retro Collection</RetroGlitch>
          <PageDescription>
            Rediscover the charm of bygone eras with our curated collection of vintage-inspired pieces
          </PageDescription>
        </HeroContent>
      </RetroHero>
      
      {/* Era Navigation */}
      <FilterSection>
        <EraFilters>
          {eras.map(era => (
            <EraButton 
              key={era}
              active={activeEra === era}
              onClick={() => handleEraChange(era)}
            >
              {era === 'all' ? 'All Eras' : era}
            </EraButton>
          ))}
        </EraFilters>
        
        <EraDescription>
          {activeEra === 'all' && (
            "Our complete retro collection spans multiple decades of iconic fashion"
          )}
          {activeEra === '1950s' && (
            "The 1950s: Clean cuts, tailored silhouettes, and classic American style"
          )}
          {activeEra === '1960s' && (
            "The 1960s: Bold patterns, geometric shapes, and the dawn of mod fashion"
          )}
          {activeEra === '1970s' && (
            "The 1970s: Bohemian flair, bell bottoms, and earth-toned designs"
          )}
          {activeEra === '1980s' && (
            "The 1980s: Bold shoulders, vibrant colors, and statement accessories"
          )}
        </EraDescription>
      </FilterSection>
      
      {/* Products Grid */}
      <ProductsContainer>
        {loading ? (
          <LoadingMessage>Loading retro collection...</LoadingMessage>
        ) : (
          <>
            <ProductCount>
              Showing {filteredProducts.length} products
            </ProductCount>
            
            <ProductsGrid>
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <ProductImageContainer>
                    <ProductImage style={{ backgroundImage: `url(${product.image})` }} />
                    <ProductYear>{product.year}</ProductYear>
                    <QuickView>Quick View</QuickView>
                  </ProductImageContainer>
                  
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>${product.price.toFixed(2)}</ProductPrice>
                    <ProductDescription>{product.description}</ProductDescription>
                    <AddToCartButton>Add to Cart</AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductsGrid>
          </>
        )}
      </ProductsContainer>
      
      {/* Story Section */}
      <StorySection>
        <SectionContainer>
          <SectionHeading>The Story Behind Our Retro Collection</SectionHeading>
          <StoryCopy>
            Our Retro Collection is more than just clothing—it's a tribute to the iconic styles that defined generations. Each piece is carefully crafted to capture the essence of its era while incorporating modern sustainable practices.
          </StoryCopy>
          <StoryCopy>
            We work with vintage fashion experts and cultural historians to ensure every detail, from fabric choices to silhouettes, authentically represents each decade's unique aesthetic. Our artisans then bring these designs to life using traditional techniques alongside innovative eco-friendly methods.
          </StoryCopy>
          
          <RetroTimeline>
            <TimelineItem>
              <TimelineYear>1950s</TimelineYear>
              <TimelineContent>
                Post-war optimism reflected in clean lines and sophisticated silhouettes
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineYear>1960s</TimelineYear>
              <TimelineContent>
                The mod revolution brings geometric patterns and bold expressions
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineYear>1970s</TimelineYear>
              <TimelineContent>
                Freedom of expression through flowing bohemian designs and earthy tones
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineYear>1980s</TimelineYear>
              <TimelineContent>
                Bold statements, vivid colors, and distinctive silhouettes
              </TimelineContent>
            </TimelineItem>
          </RetroTimeline>
        </SectionContainer>
      </StorySection>
      
      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTAHeading>Create Your Own Retro Style</CTAHeading>
          <CTADescription>
            Interested in customizing your own retro-inspired garment? Our artisans can help bring your vision to life.
          </CTADescription>
          <CTAButton to="/craft">Explore Custom Options</CTAButton>
        </CTAContent>
      </CTASection>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.main`
  width: 100%;
  overflow-x: hidden;
`;

const RetroHero = styled.section`
  position: relative;
  height: 70vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('https://images.unsplash.com/photo-1531928351158-2f736078e0a1?ixlib=rb-4.0.3');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(51, 51, 51, 0.7), rgba(51, 51, 51, 0.6));
  z-index: 1;
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  max-width: 900px;
  padding: 0 2rem;
`;

const RetroGlitch = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(3rem, 8vw, 5rem);
  margin-bottom: 1.5rem;
  color: var(--soft-gold);
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  text-shadow: 
    3px 3px 0 var(--terracotta),
    -3px -3px 0 var(--sage-green);
`;

const PageDescription = styled.p`
  font-size: 1.3rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  color: var(--sandstone-beige);
  line-height: 1.6;
`;

const FilterSection = styled.section`
  background-color: var(--deep-charcoal);
  padding: 3rem 0;
  color: white;
  text-align: center;
`;

const EraFilters = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const EraButton = styled.button`
  background: ${props => props.active ? 'var(--terracotta)' : 'transparent'};
  color: white;
  border: 2px solid ${props => props.active ? 'var(--terracotta)' : 'var(--soft-gold)'};
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--terracotta)' : 'rgba(212, 160, 23, 0.2)'};
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const EraDescription = styled.p`
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
  color: var(--sandstone-beige);
  min-height: 3rem;
  font-style: italic;
`;

const ProductsContainer = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 5rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const ProductCount = styled.p`
  margin-bottom: 2rem;
  color: var(--deep-charcoal);
  font-size: 1.1rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  height: 350px;
  overflow: hidden;
`;

const ProductImage = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const ProductYear = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: var(--terracotta);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const QuickView = styled.button`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.8rem;
  border: none;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  cursor: pointer;
  font-weight: 500;
  
  ${ProductCard}:hover & {
    transform: translateY(0);
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--deep-charcoal);
`;

const ProductPrice = styled.p`
  font-weight: 600;
  color: var(--terracotta);
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const ProductDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const AddToCartButton = styled.button`
  background-color: var(--sage-green);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background-color: #7a8a4b;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--deep-charcoal);
  font-size: 1.2rem;
`;

const StorySection = styled.section`
  background-color: #f5f1ea;
  padding: 5rem 0;
`;

const SectionContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const SectionHeading = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--deep-charcoal);
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--terracotta);
  }
`;

const StoryCopy = styled.p`
  color: var(--deep-charcoal);
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;

const RetroTimeline = styled.div`
  margin-top: 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 3rem;
  }
`;

const TimelineItem = styled.div`
  text-align: center;
`;

const TimelineYear = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--terracotta);
  margin-bottom: 1rem;
  font-weight: 600;
`;

const TimelineContent = styled.p`
  color: var(--deep-charcoal);
  line-height: 1.6;
`;

const CTASection = styled.section`
  background: linear-gradient(to right, var(--deep-charcoal), #1a1a1a);
  padding: 6rem 2rem;
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTAHeading = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--soft-gold);
  margin-bottom: 1.5rem;
`;

const CTADescription = styled.p`
  color: var(--sandstone-beige);
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: var(--terracotta);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #c05e4b;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
`;

export default RetroPage;
