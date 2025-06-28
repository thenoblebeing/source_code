import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModelViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ThreeDPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 70% 30%, rgba(255, 204, 51, 0.1), transparent 40%),
      radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.05), transparent 40%);
    opacity: 0.7;
  }
`;

const Product3DPreview = styled.div`
  width: 200px;
  height: 300px;
  background: ${props => props.color || 'var(--soft-gold)'};
  border-radius: 12px;
  position: relative;
  margin: 2rem 0;
  transform: 
    perspective(800px) 
    rotateY(${props => props.rotation}deg) 
    rotateX(15deg) 
    scale(${props => 0.8 + props.zoom * 0.4});
  transition: transform 0.3s ease;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
    border-radius: 8px;
  }
  
  &::after {
    content: '3D';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.8);
    font-size: 2rem;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
`;

const PlaceholderContent = styled.div`
  position: relative;
  z-index: 1;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--soft-gold);
  }
  
  h3 {
    color: var(--white);
    margin-bottom: 1rem;
    font-family: 'Space Grotesk', sans-serif;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    max-width: 300px;
  }
  
  .tech-info {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(255, 204, 51, 0.2);
    margin-top: 1rem;
    
    strong {
      color: var(--soft-gold);
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 204, 51, 0.3);
  border-top: 3px solid var(--soft-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ModelControls = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  z-index: 10;
`;

const ControlButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: var(--white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 204, 51, 0.8);
    color: var(--deep-charcoal);
  }
`;

// Pure CSS 3D Model Viewer without dependencies
const ThreeModelViewer = ({ 
  modelSrc = '/models/fallback_model.glb',
  backgroundColor = '#1a1a1a',
  selectedColor = '#FFD700',
  enableRotation = true,
  enableZoom = true,
  position = [0, 0, 0],
  autoRotate = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(0.5);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [modelSrc]);
  
  // Auto rotation effect
  useEffect(() => {
    let interval;
    if (isAutoRotating) {
      interval = setInterval(() => {
        setRotation(prev => (prev + 2) % 360);
      }, 50);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRotating]);
  
  // Manual rotation controls
  const rotateLeft = () => {
    setRotation(prev => (prev - 30) % 360);
    setIsAutoRotating(false);
  };
  
  const rotateRight = () => {
    setRotation(prev => (prev + 30) % 360);
    setIsAutoRotating(false);
  };
  
  const resetCamera = () => {
    setRotation(0);
    setZoom(0.5);
    setIsAutoRotating(false);
  };
  
  const toggleAutoRotate = () => {
    setIsAutoRotating(prev => !prev);
  };
  
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0, Math.min(1, prev + delta)));
  };
  
  return (
    <ModelViewerContainer style={{ backgroundColor }}>
      {isLoading ? (
        <ThreeDPlaceholder>
          <LoadingSpinner />
          <PlaceholderContent>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              Loading 3D model...
            </p>
          </PlaceholderContent>
        </ThreeDPlaceholder>
      ) : (
        <ThreeDPlaceholder>
          <PlaceholderContent>
            <div className="icon">🎯</div>
            <h3>3D Product Preview</h3>
            
            <Product3DPreview 
              color={selectedColor}
              rotation={rotation}
              zoom={zoom}
            />
            
            <div className="tech-info">
              <p><strong>Model:</strong> {modelSrc.split('/').pop()}</p>
              {selectedColor && (
                <p>
                  <strong>Color:</strong>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '15px', 
                    height: '15px', 
                    backgroundColor: selectedColor, 
                    marginLeft: '8px', 
                    borderRadius: '3px',
                    verticalAlign: 'middle',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}></span>
                </p>
              )}
              <p><strong>Interactive:</strong> ✓ Rotation, Zoom, Auto-rotate</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Use the controls below to interact with the 3D preview
              </p>
            </div>
          </PlaceholderContent>
        </ThreeDPlaceholder>
      )}
      
      <ModelControls>
        <ControlButton onClick={rotateLeft} title="Rotate Left">
          ↺
        </ControlButton>
        <ControlButton onClick={rotateRight} title="Rotate Right">
          ↻
        </ControlButton>
        <ControlButton onClick={() => handleZoom(-0.1)} title="Zoom Out">
          −
        </ControlButton>
        <ControlButton onClick={() => handleZoom(0.1)} title="Zoom In">
          +
        </ControlButton>
        <ControlButton onClick={toggleAutoRotate} title="Toggle Auto-Rotate">
          {isAutoRotating ? '⏸️' : '▶️'}
        </ControlButton>
        <ControlButton onClick={resetCamera} title="Reset View">
          🎯
        </ControlButton>
      </ModelControls>
    </ModelViewerContainer>
  );
};

export default ThreeModelViewer;
