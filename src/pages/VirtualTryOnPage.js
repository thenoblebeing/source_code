import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import TryOn3DPage from './VirtualTryOn/TryOn3DPage';

// Styled components for the futuristic virtual try-on page
const VirtualTryOnContainer = styled(motion.main)`
  min-height: 100vh;
  background: var(--dark-bg);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  padding-bottom: 60px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.05), transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(255, 0, 255, 0.05), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
`;

const TryOnHeader = styled.div`
  padding: 120px 0 40px;
  text-align: center;
  position: relative;
  
  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    margin-bottom: 1rem;
    position: relative;
    display: inline-block;
    
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 2px;
      top: 2px;
      width: 100%;
      height: 100%;
      opacity: 0.3;
      color: transparent;
      -webkit-text-stroke: 1px var(--neon-cyan);
    }
  }
  
  p {
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    max-width: 500px;
    margin: 0 auto;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ViewButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: rgba(30, 30, 30, 0.6);
  color: var(--white);
  border: 1px solid var(--glass-border);
  border-radius: var(--button-border-radius);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &.active {
    background: var(--accent-gradient);
    border-color: transparent;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
  
  &:hover:not(.active) {
    border-color: rgba(0, 255, 255, 0.5);
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const TryOnContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
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
  
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: var(--earth-gradient);
    filter: blur(80px);
    opacity: 0.1;
    z-index: -1;
    bottom: -80px;
    right: -80px;
  }
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const TryOnInput = styled(motion.div)`
  padding: 2rem;
  background: rgba(26, 26, 26, 0.6);
  border-radius: var(--card-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  height: fit-content;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 1rem;
    font-size: 1.75rem;
    color: var(--white);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
`;

const InputOptions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const UploadButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: var(--earth-gradient);
  color: var(--white);
  border: none;
  border-radius: var(--button-border-radius);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
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
  
  &:hover::before {
    left: 100%;
  }
`;

const WebcamButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: var(--accent-gradient);
  color: var(--white);
  border: none;
  border-radius: var(--button-border-radius);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
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
  
  &:hover::before {
    left: 100%;
  }
`;

const UploadedPreview = styled(motion.div)`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--white);
    font-family: 'Space Grotesk', sans-serif;
  }
  
  img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: var(--card-border-radius);
    border: 1px solid var(--glass-border);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
`;

const ProductSelection = styled.div`
  h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: var(--white);
    font-family: 'Space Grotesk', sans-serif;
  }
`;

const ProductOptions = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductOption = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(34, 34, 34, 0.7);
  border-radius: var(--card-border-radius);
  cursor: pointer;
  transition: var(--standard-transition);
  border: 1px solid var(--glass-border);
  
  &.active {
    border-color: var(--neon-cyan);
    box-shadow: var(--neon-glow);
    background: rgba(30, 30, 30, 0.9);
  }
  
  &:hover:not(.active) {
    background: rgba(30, 30, 30, 0.8);
    transform: translateY(-3px);
  }
`;

const ProductThumbnail = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => {
    const colors = {
      'Dress': 'var(--sage-green)',
      'Top': 'var(--bronze)',
      'Outerwear': 'var(--terracotta)',
      'Bottoms': 'var(--deep-charcoal)'
    };
    return colors[props.type] || 'var(--dark-surface)';
  }};
`;

const ProductDetails = styled.div`
  flex: 1;
  
  p {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.9rem;
    line-height: 1.2;
  }
  
  span {
    color: var(--soft-gold);
    font-size: 0.8rem;
  }
`;

const TryOnPreview = styled(motion.div)`
  padding: 2rem;
  background: rgba(26, 26, 26, 0.6);
  border-radius: var(--card-border-radius);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  min-height: 500px;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
    color: var(--white);
  }
`;

const PreviewPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 2rem;
  
  p {
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
  }
`;

const Processing = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  
  p {
    margin-top: 2rem;
    color: var(--text-secondary);
  }
`;

const Loader = styled.div`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  
  .spinner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(to right, var(--neon-magenta), var(--neon-cyan));
    animation: loader-rotate 2s linear infinite;
    
    &::after {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      background: var(--dark-surface);
      border-radius: 50%;
    }
  }
  
  @keyframes loader-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TryOnResult = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .result-image {
    position: relative;
    height: 350px;
    margin-bottom: 1.5rem;
    border-radius: var(--card-border-radius);
    overflow: hidden;
    border: 1px solid var(--glass-border);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .overlay-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(3px);
      
      p {
        margin: 0.5rem 0;
        color: var(--white);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        
        &:last-child {
          color: var(--neon-cyan);
          font-size: 1.2rem;
        }
      }
    }
  }
`;

const ResultControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
  
  button {
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(30, 30, 30, 0.7);
    color: var(--text-primary);
    border: 1px solid var(--glass-border);
    border-radius: var(--button-border-radius);
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    transition: var(--standard-transition);
    
    &:hover {
      background: rgba(40, 40, 40, 0.7);
      transform: translateY(-3px);
    }
    
    &:last-child {
      background: var(--earth-gradient);
      color: var(--white);
    }
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const StartTryOnButton = styled(motion.button)`
  margin-top: auto;
  padding: 1rem;
  background: var(--accent-gradient);
  color: var(--white);
  border: none;
  border-radius: var(--button-border-radius);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
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
  
  &:not(:disabled):hover::before {
    left: 100%;
  }
`;

const TryOnHelp = styled.div`
  padding: 4rem 0;
  text-align: center;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    margin-bottom: 3rem;
    font-size: 2rem;
    color: var(--white);
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: var(--accent-gradient);
      border-radius: 3px;
    }
  }
  
  .disclaimer {
    margin-top: 3rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const Steps = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto;
`;

const Step = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 200px;
  
  p {
    margin-top: 1rem;
    color: var(--text-secondary);
  }
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: var(--accent-gradient);
    opacity: 0.5;
    z-index: -1;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.5; }
  }
`;

const VirtualTryOnPage = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeView, setActiveView] = useState('2d'); // '2d' or '3d'
  
  // Sample product data for try-on
  const tryOnProducts = [
    { id: 1, name: 'Sage Green Embroidered Dress', type: 'Dress' },
    { id: 2, name: 'Bronze Metallic Blouse', type: 'Top' },
    { id: 3, name: 'Terracotta Silk Cardigan', type: 'Outerwear' },
    { id: 4, name: 'Deep Charcoal Pants', type: 'Bottoms' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartTryOn = () => {
    if (uploadedImage && activeProduct) {
      setIsProcessing(true);
      // Simulate processing delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    } else {
      alert('Please upload an image and select a product to try on');
    }
  };

  const handleUseWebcam = () => {
    alert('Webcam functionality will be implemented in a future update');
    // In a real implementation, we would access the user's webcam here
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15
      }
    }
  };
  
  // Set up animation effects
  useEffect(() => {
    // Animate the StepNumbers with GSAP
    gsap.to('.step-pulse', {
      scale: 1.2,
      opacity: 0.5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: 0.3
    });
    
    // Create shine effect on buttons
    gsap.to('.button-shine', {
      x: '150%',
      duration: 1.5,
      ease: 'power2.inOut',
      repeat: -1,
      repeatDelay: 1,
      stagger: 0.2
    });
  }, []);

  return (
    <VirtualTryOnContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TryOnHeader>
        <Container>
          <h1 data-text="Virtual Try-On Experience">Virtual Try-On Experience</h1>
          <p>See how our pieces look on you before making a purchase</p>
          <ViewToggle>
            <ViewButton 
              className={activeView === '2d' ? 'active' : ''}
              onClick={() => setActiveView('2d')}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              2D Try-On
            </ViewButton>
            <ViewButton 
              className={activeView === '3d' ? 'active' : ''}
              onClick={() => setActiveView('3d')}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              3D View & AR
            </ViewButton>
          </ViewToggle>
        </Container>
      </TryOnHeader>

      <Container>
        {activeView === '2d' ? (
        <TryOnContentContainer>
          {/* Left Side - Input */}
          <TryOnInput
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 18 }}
          >
            <h2>Try On Virtually</h2>
            <p>Upload a photo or use your webcam</p>
            
            <InputOptions>
              <UploadButton 
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('file-upload').click()}
              >
                Upload Photo
              </UploadButton>
              <input 
                id="file-upload" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              
              <WebcamButton 
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUseWebcam}
              >
                Use Webcam
              </WebcamButton>
            </InputOptions>
            
            <AnimatePresence>
              {uploadedImage && (
                <UploadedPreview
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <h3>Your Photo</h3>
                  <img src={uploadedImage} alt="Uploaded" />
                </UploadedPreview>
              )}
            </AnimatePresence>
            
            <ProductSelection>
              <h3>Select an Item to Try On</h3>
              <ProductOptions>
                {tryOnProducts.map(product => (
                  <ProductOption 
                    key={product.id} 
                    className={activeProduct === product.id ? 'active' : ''}
                    onClick={() => setActiveProduct(product.id)}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                  >
                    <ProductThumbnail>
                      {/* Placeholder for product thumbnail */}
                      <PlaceholderImage type={product.type} />
                    </ProductThumbnail>
                    <ProductDetails>
                      <p>{product.name}</p>
                      <span>{product.type}</span>
                    </ProductDetails>
                  </ProductOption>
                ))}
              </ProductOptions>
            </ProductSelection>
          </TryOnInput>
          
          {/* Right Side - Preview */}
          <TryOnPreview
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, delay: 0.2 }}
          >
            {!uploadedImage && !isProcessing ? (
              <PreviewPlaceholder>
                <h2>Your Virtual Try-On</h2>
                <p>Upload a photo and select a product to see the virtual try-on preview</p>
              </PreviewPlaceholder>
            ) : isProcessing ? (
              <Processing
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader>
                  <div className="spinner"></div>
                </Loader>
                <p>Processing your image...</p>
              </Processing>
            ) : (
              <TryOnResult>
                <h2>Your Virtual Try-On</h2>
                {activeProduct ? (
                  <>
                    <motion.div 
                      className="result-image"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      {/* In a real implementation, this would show the user's image with the virtual try-on overlay */}
                      <img src={uploadedImage} alt="Try-on result" />
                      <div className="overlay-placeholder">
                        <p>Product overlay simulation</p>
                        <p>{tryOnProducts.find(p => p.id === activeProduct)?.name}</p>
                      </div>
                    </motion.div>
                    <ResultControls>
                      <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>Save Image</motion.button>
                      <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>Share</motion.button>
                      <motion.button whileHover={{ y: -3, boxShadow: 'var(--gold-glow)' }} whileTap={{ scale: 0.95 }}>Add to Cart</motion.button>
                    </ResultControls>
                  </>
                ) : (
                  <p>Please select a product to try on</p>
                )}
              </TryOnResult>
            )}
            
            {uploadedImage && !isProcessing && (
              <StartTryOnButton 
                onClick={handleStartTryOn}
                disabled={!activeProduct}
                whileHover={!activeProduct ? {} : { scale: 1.05, y: -5 }}
                whileTap={!activeProduct ? {} : { scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15, delay: 0.3 }}
              >
                Start Try-On
              </StartTryOnButton>
            )}
          </TryOnPreview>
        </TryOnContentContainer>
        ) : (
          <TryOn3DPage />
        )}
      </Container>

      <TryOnHelp>
        <Container>
          <h2>How It Works</h2>
          <Steps>
            <Step 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <StepNumber className="step-pulse">1</StepNumber>
              <p>Upload a photo or use your webcam</p>
            </Step>
            <Step 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <StepNumber className="step-pulse">2</StepNumber>
              <p>Select an item from our collection</p>
            </Step>
            <Step 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <StepNumber className="step-pulse">3</StepNumber>
              <p>See how it looks on you</p>
            </Step>
            <Step 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <StepNumber className="step-pulse">4</StepNumber>
              <p>Add to cart if you love it!</p>
            </Step>
          </Steps>
          <p className="disclaimer">
            Note: This is a prototype of our Virtual Try-On feature. The results are simulated 
            and may not perfectly represent how the actual product will look on you.
          </p>
        </Container>
      </TryOnHelp>
    </VirtualTryOnContainer>
  );
};

export default VirtualTryOnPage;
