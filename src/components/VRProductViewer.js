import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoTryOn from './PhotoTryOn';
import RealTimeTryOn from './RealTimeTryOn';

const VRModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const VRModalContent = styled(motion.div)`
  background: var(--deep-charcoal);
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 100px rgba(217, 191, 19, 0.1);
  border: 1px solid rgba(255, 204, 51, 0.2);
  display: flex;
  flex-direction: column;
`;

const VRHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    color: var(--soft-gold);
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    margin: 0;
  }
`;

const TabNavigation = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 8px;
  margin: 0 1.5rem 1rem 1.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    margin: 0 1rem 0.5rem 1rem;
  }
`;

const Tab = styled(motion.button)`
  flex: 1;
  background: ${props => props.active ? 'var(--soft-gold)' : 'transparent'};
  color: ${props => props.active ? '#000' : 'var(--white)'};
  border: none;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  border-radius: 6px;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .tab-description {
    font-size: 0.75rem;
    opacity: 0.7;
    font-weight: normal;
  }
`;

const CloseButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: var(--white);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const VRContent = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const VRViewport = styled.div`
  flex: 3;
  position: relative;
  overflow: hidden;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const VRControls = styled.div`
  flex: 1;
  padding: 2rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  
  @media (max-width: 992px) {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const ControlSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color: var(--sage-green);
    font-size: 1.1rem;
    margin-bottom: 1rem;
    font-family: 'Space Grotesk', sans-serif;
  }
`;

const ViewToggleButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const ViewButton = styled.button`
  padding: 0.7rem 1.2rem;
  background: ${props => props.active ? 'var(--terracotta)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'white' : 'var(--sandstone-beige)'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background: ${props => props.active ? 'var(--terracotta)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ColorOption = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.active ? 'var(--soft-gold)' : 'transparent'};
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const EnvironmentOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const EnvironmentOption = styled.div`
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background-color: #2c2c2c;
  cursor: pointer;
  position: relative;
  border: 2px solid ${props => props.active ? 'var(--soft-gold)' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .environment-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: var(--white);
    font-size: 0.8rem;
    text-align: center;
  }
`;

const ControlLabel = styled.p`
  color: var(--sandstone-beige);
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
`;

const RotationControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const RotationButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ZoomSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--soft-gold);
    cursor: pointer;
    border: none;
  }
  
  &:focus {
    outline: none;
  }
`;

const InstructionsContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  
  h4 {
    color: var(--soft-gold);
    margin-bottom: 0.8rem;
    font-size: 1rem;
  }
  
  p {
    color: var(--sandstone-beige);
    font-size: 0.85rem;
    line-height: 1.6;
  }
`;

const DummyCanvas = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 70% 30%, rgba(var(--color-rgb), 0.1), transparent 40%),
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.05), transparent 40%);
    opacity: 0.7;
  }
  
  .product-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(${props => props.rotation}deg);
    width: ${props => 40 + props.zoom * 20}%;
    height: ${props => 60 + props.zoom * 20}%;
    background-color: ${props => props.color || 'var(--sage-green)'};
    opacity: 0.9;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const colorOptions = [
  { name: 'Black', value: '#000000', rgb: '0, 0, 0' },
  { name: 'Navy', value: '#0a192f', rgb: '10, 25, 47' },
  { name: 'Desert Sand', value: '#e2ca9f', rgb: '226, 202, 159' },
  { name: 'Burgundy', value: '#800020', rgb: '128, 0, 32' }
];

const environmentOptions = [
  { name: 'Studio', value: 'studio' },
  { name: 'Outdoor', value: 'outdoor' },
  { name: 'Living Room', value: 'livingroom' }
];

const viewOptions = [
  { name: 'Front', value: 'front' },
  { name: 'Back', value: 'back' },
  { name: 'Side', value: 'side' },
  { name: '3D', value: '3d' }
];

const experienceOptions = [
  { name: '3D View', value: '3d_view', description: 'Explore the product in 3D with full rotation and zoom' },
  { name: 'Photo Try-On', value: 'photo_tryon', description: 'Upload your photo to see how it looks on you' }
];

const VRProductViewer = ({ isOpen, onClose, product }) => {
  const [activeColor, setActiveColor] = useState(colorOptions[0]);
  const [activeEnvironment, setActiveEnvironment] = useState(environmentOptions[0]);
  const [activeView, setActiveView] = useState(viewOptions[0]);
  const [activeExperience, setActiveExperience] = useState(experienceOptions[0]);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const canvasRef = useRef(null);
  
  // For a real implementation, you would initialize a 3D rendering library like Three.js here
  // This is just a placeholder for the demo
  useEffect(() => {
    if (isOpen) {
      // Mock initialization of 3D viewer
      console.log('VR Product Viewer initialized');
    }
  }, [isOpen]);
  
  // Switch between different virtual try-on experiences
  const handleExperienceChange = (experience) => {
    setActiveExperience(experience);
  };

  // Rotation controls
  const rotateLeft = () => {
    setRotation(prev => (prev - 30) % 360);
  };
  
  const rotateRight = () => {
    setRotation(prev => (prev + 30) % 360);
  };
  
  // Handle zoom change
  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value));
  };
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };
  
  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        delay: 0.1
      } 
    }
  };

  // Product shape based on view type
  // Will be used in Phase 4: Virtual Try-On implementation
  const getProductShape = () => {
    switch (activeView.value) {
      case 'front':
      case 'back':
        return 'rect';
      case 'side':
        return 'rect narrow';
      case '3d':
      default:
        return 'rect';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <VRModalOverlay
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={onClose}
        >
          <VRModalContent 
            variants={modalVariants}
            onClick={e => e.stopPropagation()}
          >
            <VRHeader>
              <h2>Virtual Try-On Experience</h2>
              <CloseButton 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </CloseButton>
            </VRHeader>
            
            {/* Tab navigation for different try-on experiences */}
            <TabNavigation>
              {experienceOptions.map(experience => (
                <Tab
                  key={experience.value}
                  active={activeExperience.value === experience.value}
                  onClick={() => handleExperienceChange(experience)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {experience.name}
                  <span className="tab-description">{experience.description}</span>
                </Tab>
              ))}
            </TabNavigation>
            
            <VRContent>
              {/* Conditional rendering based on selected experience */}
              {activeExperience.value === '3d_view' && (
                <>
                  <VRViewport>
                    {/* In a real implementation, this would be a canvas with Three.js */}
                    <DummyCanvas 
                      ref={canvasRef} 
                      color={activeColor.value}
                      rotation={rotation}
                      zoom={zoom}
                      style={{ '--color-rgb': activeColor.rgb }}
                    >
                      <div className="product-placeholder" />
                    </DummyCanvas>
                  </VRViewport>
                  
                  <VRControls>
                    <ControlSection>
                      <h3>View</h3>
                      <ViewToggleButtons>
                        {viewOptions.map(option => (
                          <ViewButton
                            key={option.value}
                            active={activeView.value === option.value}
                            onClick={() => setActiveView(option)}
                          >
                            {option.name}
                          </ViewButton>
                        ))}
                      </ViewToggleButtons>
                    </ControlSection>
                    
                    <ControlSection>
                      <h3>Color</h3>
                      <ColorOptions>
                        {colorOptions.map(color => (
                          <ColorOption
                            key={color.name}
                            color={color.value}
                            active={activeColor.value === color.value}
                            onClick={() => setActiveColor(color)}
                            title={color.name}
                          />
                        ))}
                      </ColorOptions>
                    </ControlSection>
                    
                    <ControlSection>
                      <h3>Environment</h3>
                      <EnvironmentOptions>
                        {environmentOptions.map(env => (
                          <EnvironmentOption
                            key={env.value}
                            active={activeEnvironment.value === env.value}
                            onClick={() => setActiveEnvironment(env)}
                          >
                            <div className="environment-name">{env.name}</div>
                          </EnvironmentOption>
                        ))}
                      </EnvironmentOptions>
                    </ControlSection>
                    
                    <ControlSection>
                      <h3>Controls</h3>
                      <ControlLabel>Rotate</ControlLabel>
                      <RotationControls>
                        <RotationButton onClick={rotateLeft}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6"/>
                          </svg>
                        </RotationButton>
                        <RotationButton onClick={rotateRight}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </RotationButton>
                      </RotationControls>
                      
                      <ControlLabel>Zoom</ControlLabel>
                      <ZoomControls>
                        <ZoomSlider
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zoom}
                          onChange={handleZoomChange}
                        />
                      </ZoomControls>
                    </ControlSection>
                  </VRControls>
                </>
              )}
              
              {/* Photo-based try-on experience */}
              {activeExperience.value === 'photo_tryon' && (
                <div style={{ width: '100%', padding: '2rem' }}>
                  <PhotoTryOn product={product} onClose={onClose} />
                </div>
              )}
            </VRContent>
            
            {/* Instructions */}
            <InstructionsContainer>
              <h4>How to use</h4>
              <p>
                {activeExperience.value === '3d_view' 
                  ? 'Drag to rotate the product in 3D view. Use the controls to change color, environment, and zoom level.'
                  : 'Upload a clear, well-lit photo of yourself to see how the product looks on you. For best results, face the camera directly with good lighting.'
                }
              </p>
            </InstructionsContainer>
          </VRModalContent>
        </VRModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default VRProductViewer;
