import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const PageContainer = styled.main`
  width: 100%;
  overflow-x: hidden;
`;

const IntroSection = styled.section`
  position: relative;
  height: 50vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('https://images.unsplash.com/photo-1579271723124-09bb53f376a4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(51, 51, 51, 0.7), rgba(51, 51, 51, 0.6));
    z-index: 1;
  }
`;

const IntroContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 2rem;
`;

const PageTitle = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 1rem;
  color: #d4af37; /* Soft gold color */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
`;

const PageSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--sandstone-beige);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const VideoSectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  
  .video-placeholder {
    position: relative;
    height: 400px;
    background-image: url('https://images.unsplash.com/photo-1531986362435-16b427eb9c26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80');
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const PlayButton = styled.div`
  width: 80px;
  height: 80px;
  background-color: var(--terracotta);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(226, 114, 91, 0.4);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 25px rgba(226, 114, 91, 0.6);
  }
  
  svg {
    width: 32px;
    height: 32px;
    margin-left: 5px;
  }
`;

const VideoText = styled.p`
  color: white;
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const VideoDescription = styled.div`
  padding: 1rem;
`;

const SectionHeading = styled(motion.h2)`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--deep-charcoal);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--terracotta);
  }
`;

const DescriptionText = styled(motion.p)`
  color: var(--deep-charcoal);
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
`;

const ProductCard = styled(motion.div)`
  background: rgba(20, 20, 20, 0.5);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
`;

const ProductImageContainer = styled.div`
  position: relative;
  height: 220px;
  width: 100%;
  overflow: hidden;
`;

const ProductImage = styled.div`
  height: 100%;
  width: 100%;
  background-position: center;
  background-size: cover;
  transition: all 0.5s ease;
`;

const ProductControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ProductImageContainer}:hover & {
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(226, 114, 91, 0.8);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: var(--sandstone-beige);
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--soft-gold);
  margin-bottom: 1rem;
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: var(--sage-green);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const AddToCartButton = styled(motion.button)`
  width: 100%;
  background-color: var(--terracotta);
  border: none;
  padding: 0.8rem 1rem;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #d1604c;
  }
`;

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ProcessStep = styled(motion.div)`
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07);
  text-align: center;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: var(--terracotta);
  }
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--sage-green);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1rem;
`;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--deep-charcoal);
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
`;

const WorkshopButton = styled(motion.button)`
  background-color: var(--terracotta);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(226, 114, 91, 0.4);
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background-color: #d1604c;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(226, 114, 91, 0.5);
  }
`;

const MyCraftPage = () => {
  const navigate = useNavigate();
  const craftProducts = [
    { id: 1, name: 'Hand-Embroidered Linen Blouse', price: 85, description: 'Delicate floral embroidery on sustainable linen.' },
    { id: 2, name: 'Custom Painted Denim Jacket', price: 120, description: 'One-of-a-kind hand-painted design on upcycled denim.' },
    { id: 3, name: 'Macramé Wall Hanging', price: 65, description: 'Intricate knotted design made with organic cotton rope.' },
    { id: 4, name: 'Soft Gold Macramé Wall Hanging', price: 45, description: 'Intricately knotted wall hanging with soft gold accents.' },
  ];

  // For the horizontal slider
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);
  const [showRetroTransition, setShowRetroTransition] = useState(false);
  const sliderRef = useRef(null);
  const sliderHandleRef = useRef(null);
  
  // Horizontal slider functionality for RetroPage transition
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartPosition(e.clientX || (e.touches && e.touches[0].clientX) || 0);
  };

  const handleDragMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = clientX - startPosition;
    const sliderWidth = sliderRef.current.offsetWidth;
    const maxPosition = sliderWidth - sliderHandleRef.current.offsetWidth;
    
    // Calculate new position (bounded between 0 and max)
    let newPosition = Math.max(0, Math.min(sliderPosition + delta, maxPosition));
    
    // Update the slider position
    setSliderPosition(newPosition);
    setStartPosition(clientX);
    
    // Calculate how far along the slider we are (0 to 1)
    const progress = newPosition / maxPosition;
    
    // If we're past 90% of the way, show the transition effect
    if (progress > 0.9) {
      setShowRetroTransition(true);
      // If we're at the end, navigate to retro page after a delay
      if (progress >= 0.98) {
        setTimeout(() => {
          navigate('/retro');
        }, 800); // Delay to allow transition effect to be visible
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // If we're more than halfway, animate to the end
    const sliderWidth = sliderRef.current.offsetWidth;
    const maxPosition = sliderWidth - sliderHandleRef.current.offsetWidth;
    const progress = sliderPosition / maxPosition;
    
    if (progress > 0.5 && progress < 0.9) {
      // Animate to complete the slide
      const interval = setInterval(() => {
        setSliderPosition(prev => {
          const newPos = prev + 10;
          if (newPos >= maxPosition) {
            clearInterval(interval);
            setShowRetroTransition(true);
            setTimeout(() => {
              navigate('/retro');
            }, 800);
            return maxPosition;
          }
          return newPos;
        });
      }, 16); // Roughly 60fps
    } else if (progress <= 0.5 && progress > 0) {
      // Reset if not dragged far enough
      const interval = setInterval(() => {
        setSliderPosition(prev => {
          const newPos = prev - 10;
          if (newPos <= 0) {
            clearInterval(interval);
            setShowRetroTransition(false);
            return 0;
          }
          return newPos;
        });
      }, 16);
    }
  };

  // Add touch events for mobile
  useEffect(() => {
    const slider = sliderHandleRef.current;
    if (slider) {
      slider.addEventListener('touchstart', handleDragStart, { passive: false });
      slider.addEventListener('touchmove', handleDragMove, { passive: false });
      slider.addEventListener('touchend', handleDragEnd, { passive: false });
      
      return () => {
        slider.removeEventListener('touchstart', handleDragStart);
        slider.removeEventListener('touchmove', handleDragMove);
        slider.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, sliderPosition, startPosition, handleDragStart, handleDragMove, handleDragEnd]);
  
  return (
    <PageContainer>
      {/* Intro Section */}
      <IntroSection>
        <IntroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <PageTitle>Explore Our Craft</PageTitle>
          <PageSubtitle>Handcrafted pieces that tell a story of artisanal excellence</PageSubtitle>
        </IntroContent>
      </IntroSection>

      {/* Artisan Video Section */}
      <section style={{ background: 'var(--sandstone-beige)', color: 'var(--deep-charcoal)' }}>
        <SectionContainer>
          <VideoSectionGrid>
            <VideoContainer>
              <motion.div 
                className="video-placeholder"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <PlayButton>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
                  </svg>
                </PlayButton>
                <VideoText>Watch our artisans at work</VideoText>
              </motion.div>
            </VideoContainer>
            
            <VideoDescription>
              <SectionHeading
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                The Artistry Behind Our Creations
              </SectionHeading>
              <DescriptionText
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Every piece in our MY CRAFT collection is thoughtfully designed and meticulously 
                handcrafted by skilled artisans. We believe in preserving traditional craft 
                techniques while infusing them with contemporary aesthetics.
              </DescriptionText>
              <DescriptionText
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Our artisans spend hours perfecting each detail, ensuring that every item 
                is not just a product, but a piece of art that carries the maker's story.
              </DescriptionText>
            </VideoDescription>
          </VideoSectionGrid>
        </SectionContainer>
      </section>

      {/* Craft Categories Section */}
      <SectionContainer>
        <SectionTitle
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Explore Our Craft
        </SectionTitle>
        
        <CategoryGrid>
          {/* Using the Category components directly with inline styling */}
          <CategoryCard
            whileHover={{
              y: -10,
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              height: '300px',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              backgroundImage: `url("https://images.unsplash.com/photo-1590249004454-a6b03b2bbf7f?ixlib=rb-4.0.3")`
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)'
              }} />
            </div>
            <div style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                marginBottom: '1rem',
                color: 'var(--deep-charcoal)'
              }}>Embroidery</h3>
              <p style={{
                color: 'var(--deep-charcoal)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                flexGrow: 1
              }}>Discover our hand-embroidered pieces featuring intricate designs created by skilled artisans with traditional techniques.</p>
              <Link to="/craft/embroidery" style={{
                alignSelf: 'flex-start',
                backgroundColor: 'var(--sage-green)',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '4px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}>Explore Collection</Link>
            </div>
          </CategoryCard>
          
          <CategoryCard
            whileHover={{
              y: -10,
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div style={{
              height: '300px',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              backgroundImage: `url("https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3")`
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)'
              }} />
            </div>
            <div style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                marginBottom: '1rem',
                color: 'var(--deep-charcoal)'
              }}>Hand Painted</h3>
              <p style={{
                color: 'var(--deep-charcoal)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                flexGrow: 1
              }}>Each hand-painted garment is a unique canvas of art, featuring expressive brushstrokes and vibrant colors by our artists.</p>
              <Link to="/craft/hand-painted" style={{
                alignSelf: 'flex-start',
                backgroundColor: 'var(--sage-green)',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '4px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}>Explore Collection</Link>
            </div>
          </CategoryCard>
        </CategoryGrid>
      </SectionContainer>

      {/* Retro Collection Section with True Horizontal Slider */}
      <RetroSection>
        <RetroSectionContainer>
          <RetroSectionHeader>
            <RetroTitle>Retro Collection</RetroTitle>
            <RetroSubtitle>Slide the handle all the way to discover our retro-inspired designs</RetroSubtitle>
          </RetroSectionHeader>
          
          {/* The transition overlay that appears when slider is fully dragged */}
          {showRetroTransition && (
            <RetroTransitionOverlay 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <TransitionContent>
                <TransitionImage style={{ 
                  backgroundImage: 'url(https://images.unsplash.com/photo-1531928351158-2f736078e0a1?ixlib=rb-4.0.3)'
                }} />
                <TransitionText>Entering Retro Collection...</TransitionText>
              </TransitionContent>
            </RetroTransitionOverlay>
          )}
          
          {/* Horizontal Slider Container */}
          <SliderContainer ref={sliderRef}>
            <SliderBackground style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1531928351158-2f736078e0a1?ixlib=rb-4.0.3)`,
              opacity: sliderPosition / (sliderRef.current ? sliderRef.current.offsetWidth - 100 : 1)
            }} />
            
            <SliderTrack>
              <SliderHandle 
                ref={sliderHandleRef}
                style={{ left: `${sliderPosition}px` }}
                onMouseDown={handleDragStart}
                onMouseMove={isDragging ? handleDragMove : null}
                onMouseUp={handleDragEnd}
                onMouseLeave={isDragging ? handleDragEnd : null}
              >
                <RetroHandleIcon>
                  {/* Vintage camera icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H16.83L15 2H9L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H8.05L9.88 4H14.12L15.95 6H20V18ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9C13.65 9 15 10.35 15 12C15 13.65 13.65 15 12 15Z" fill="white"/>
                  </svg>
                </RetroHandleIcon>
              </SliderHandle>
            </SliderTrack>
            
            {/* Indicator text that changes with slider progress */}
            <SliderProgress>
              <SliderProgressText>
                {sliderPosition === 0 ? 'Slide to explore Retro Collection' : 
                  sliderPosition > (sliderRef.current ? sliderRef.current.offsetWidth * 0.7 : 300) ? 
                  'Release to enter Retro world!' : 'Keep sliding for Retro experience'}
              </SliderProgressText>
            </SliderProgress>
            
            {/* Retro era indicators that fade in based on slider position */}
            <RetroEraIndicators>
              <RetroEraItem opacity={Math.min(1, sliderPosition / 100)}>
                <EraYear>1950s</EraYear>
                <EraLabel>Classic Americana</EraLabel>
              </RetroEraItem>
              <RetroEraItem opacity={Math.min(1, (sliderPosition - 100) / 100)}>
                <EraYear>1960s</EraYear>
                <EraLabel>Mod Revolution</EraLabel>
              </RetroEraItem>
              <RetroEraItem opacity={Math.min(1, (sliderPosition - 200) / 100)}>
                <EraYear>1970s</EraYear>
                <EraLabel>Bohemian Freedom</EraLabel>
              </RetroEraItem>
              <RetroEraItem opacity={Math.min(1, (sliderPosition - 300) / 100)}>
                <EraYear>1980s</EraYear>
                <EraLabel>Bold Expression</EraLabel>
              </RetroEraItem>
            </RetroEraIndicators>
          </SliderContainer>
          
          <RetroCTAText>
            Experience our complete collection of vintage-inspired clothing 
            that celebrates the iconic styles of past decades
          </RetroCTAText>
        </RetroSectionContainer>
      </RetroSection>

      {/* Craft Gallery Section */}
      <section style={{ background: 'var(--deep-charcoal)', color: 'white' }}>
        <SectionContainer>
          <SectionHeading 
            style={{ color: 'var(--soft-gold)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Explore Our Craft Collection
          </SectionHeading>
          
          <ProductGrid>
            {craftProducts.map(item => (
              <ProductCard 
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
              >
                <ProductImageContainer>
                  <ProductImage style={{ backgroundColor: 'rgba(217, 194, 166, 0.1)' }} />
                  <ProductControls>
                    <ControlButton>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Zoom
                    </ControlButton>
                    <ControlButton>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 14.97 16.97 19 12 19C7.03 19 3 14.97 3 10C3 5.03 7.03 1 12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 19C22 20.66 20.66 22 19 22C17.34 22 16 20.66 16 19C16 17.34 17.34 16 19 16C20.66 16 22 17.34 22 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 5L12 9L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      360° View
                    </ControlButton>
                  </ProductControls>
                </ProductImageContainer>
                <ProductInfo>
                  <ProductName>{item.name}</ProductName>
                  <ProductPrice>${item.price}</ProductPrice>
                  <ProductDescription>{item.description}</ProductDescription>
                  <AddToCartButton
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Add to Cart
                  </AddToCartButton>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductGrid>
        </SectionContainer>
      </section>

      {/* Craft Process Section */}
      <section style={{ background: 'var(--sandstone-beige)', color: 'var(--deep-charcoal)' }}>
        <SectionContainer>
          <SectionHeading
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Craft Process
          </SectionHeading>
          
          <ProcessSteps>
            <ProcessStep
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <StepNumber>1</StepNumber>
              <StepTitle>Design</StepTitle>
              <StepDescription>Our artisans sketch and plan each piece, focusing on sustainable materials and thoughtful design.</StepDescription>
            </ProcessStep>
            
            <ProcessStep
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <StepNumber>2</StepNumber>
              <StepTitle>Material Selection</StepTitle>
              <StepDescription>We carefully source eco-friendly, high-quality materials that align with our earthy-futuristic aesthetic.</StepDescription>
            </ProcessStep>
            
            <ProcessStep
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <StepNumber>3</StepNumber>
              <StepTitle>Crafting</StepTitle>
              <StepDescription>Each piece is handcrafted with precision and care, often using techniques passed down through generations.</StepDescription>
            </ProcessStep>
            
            <ProcessStep
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StepNumber>4</StepNumber>
              <StepTitle>Quality Check</StepTitle>
              <StepDescription>Every item undergoes rigorous quality checking to ensure it meets our high standards before reaching you.</StepDescription>
            </ProcessStep>
          </ProcessSteps>
        </SectionContainer>
      </section>

      {/* Artisan Stories Section */}
      <section style={{ background: 'var(--deep-charcoal)', color: 'var(--sandstone-beige)' }}>
        <SectionContainer>
          <SectionHeading
            style={{ color: 'var(--soft-gold)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Artisan Stories
          </SectionHeading>
          
          <motion.p
            style={{ 
              fontSize: '1.2rem', 
              maxWidth: '700px',
              margin: '0 auto 2.5rem',
              textAlign: 'center'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Meet the makers behind the craft and discover their unique journeys.
          </motion.p>
          
          <div style={{ textAlign: 'center' }}>
            <WorkshopButton 
              as={Link} 
              to="/artisans"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'white' }}
            >
              Meet Our Artisans
            </WorkshopButton>
          </div>
        </SectionContainer>
      </section>
      
      {/* Join Our Workshops Section */}
      <section style={{ 
        background: 'var(--sandstone-beige)',
        backgroundImage: 'linear-gradient(rgba(217, 194, 166, 0.8), rgba(217, 194, 166, 0.8)), url("https://images.unsplash.com/photo-1452802447250-470a88ac82bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '6rem 0',
        textAlign: 'center',
        color: 'var(--deep-charcoal)'
      }}>
        <SectionContainer>
          <SectionHeading
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Join Our Workshops
          </SectionHeading>
          
          <motion.p
            style={{ 
              fontSize: '1.2rem', 
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Learn the craft directly from our artisans in interactive online or in-person workshops.
          </motion.p>
          
          <WorkshopButton 
            as={Link} 
            to="/workshops"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Explore Workshops
          </WorkshopButton>
        </SectionContainer>
      </section>
    </PageContainer>
  );
};

// New Styled Components for Craft Categories
const SectionTitle = styled(motion.h2)`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--deep-charcoal);
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

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(motion.div)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

// Styled Components for Retro Collection
const RetroSection = styled.section`
  background-color: var(--deep-charcoal);
  padding: 5rem 0;
  color: white;
  overflow: hidden;
  position: relative;
`;

const RetroSectionContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const RetroSectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const RetroTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--soft-gold);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const RetroSubtitle = styled.p`
  font-size: 1.2rem;
  color: var(--sandstone-beige);
  max-width: 700px;
  margin: 0 auto;
`;

// Components for the new horizontal slider
const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  margin: 4rem 0;
  overflow: hidden;
`;

const SliderBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const SliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 100px;
  background: linear-gradient(to right, rgba(226, 114, 91, 0.3), rgba(226, 114, 91, 0.7));
  margin-top: 100px;
  display: flex;
  align-items: center;
  border-radius: 8px;
`;

const SliderHandle = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--soft-gold), var(--terracotta));
  top: 10px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
  
  &:active {
    cursor: grabbing;
  }
`;

const RetroHandleIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3));
`;

const SliderProgress = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  text-align: center;
`;

const SliderProgressText = styled.div`
  color: white;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Playfair Display', serif;
`;

const RetroEraIndicators = styled.div`
  position: absolute;
  top: 30px;
  left: 100px;
  display: flex;
  gap: 70px;
`;

const RetroEraItem = styled.div`
  opacity: ${props => props.opacity || 0};
  transition: opacity 0.3s ease;
`;

const EraYear = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--soft-gold);
  margin-bottom: 0.5rem;
`;

const EraLabel = styled.div`
  font-size: 0.9rem;
  color: var(--sandstone-beige);
`;

const RetroCTAText = styled.p`
  text-align: center;
  max-width: 700px;
  margin: 2rem auto 0;
  line-height: 1.6;
  color: var(--sandstone-beige);
  font-size: 1.1rem;
`;

// Full screen transition overlay
const RetroTransitionOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(51, 51, 51, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const TransitionContent = styled.div`
  text-align: center;
`;

const TransitionImage = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin: 0 auto 2rem;
  border: 5px solid var(--soft-gold);
  box-shadow: 0 0 30px var(--terracotta);
`;

const TransitionText = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--soft-gold);
  text-shadow: 3px 3px 0 var(--terracotta), -3px -3px 0 var(--sage-green);
`;



const RetroSliderNav = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const RetroSliderDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.3)'};
  margin: 0 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--soft-gold)' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const RetroDiscoverButton = styled(Link)`
  display: block;
  width: fit-content;
  margin: 0 auto;
  background-color: var(--soft-gold);
  color: var(--deep-charcoal);
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #C4901A; /* Darker gold */
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(212, 160, 23, 0.4);
  }
`;

export default MyCraftPage;
