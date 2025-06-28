import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import virtualTryOnService from '../services/virtualTryOnService';
import LoadingSpinner from './LoadingSpinner';

const TryOnContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const PhotoUploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px dashed rgba(255, 204, 51, 0.3);
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--soft-gold);
    background: rgba(0, 0, 0, 0.3);
  }

  ${props => props.hasImage && `
    border-style: solid;
    background: rgba(0, 0, 0, 0.1);
    padding: 1rem;
  `}
`;

const UploadIcon = styled.div`
  color: var(--soft-gold);
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const UploadInstructions = styled.p`
  color: var(--white);
  text-align: center;
  max-width: 300px;
  font-size: 0.9rem;
`;

const TryOnResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResultItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ResultImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const ResultActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: space-around;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  width: 100%;
  max-width: 400px;
`;

const LoadingText = styled.p`
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: var(--white);
  opacity: 0.8;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress || 0}%;
    background-color: var(--soft-gold);
    transition: width 0.3s ease;
  }
`;

const RetryButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--soft-gold);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  margin-left: 8px;
  padding: 0;
`;

const TryOnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
  
  h3 {
    color: var(--soft-gold);
    margin: 0;
    font-size: 1.2rem;
  }
`;

const TryAgainButton = styled(motion.button)`
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--soft-gold);
  border-radius: 4px;
  color: var(--soft-gold);
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
  
  &:hover {
    background-color: rgba(255, 204, 51, 0.1);
  }
`;

const ResultLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: var(--white);
  padding: 0.3rem;
  font-size: 0.8rem;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ResultItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: var(--white);
  padding: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UserPhoto = styled.img`
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin: 1rem 0;
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
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  margin-top: 1rem;
  background: rgba(255, 50, 50, 0.2);
  border-left: 3px solid #FF3232;
  color: #FF9999;
  border-radius: 4px;
`;

const PhotoTryOn = ({ product, onClose }) => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [tryOnResults, setTryOnResults] = useState([]);

  const fileInputRef = useRef(null);
  
  // Progress simulation for better UX
  useEffect(() => {
    let interval;
    if (loading && loadingProgress < 90) {
      interval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, loadingProgress]);
  
  // Handle photo upload with improved processing
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG or WebP)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Please upload an image smaller than 10MB');
      return;
    }

    try {
      setLoading(true);
      setLoadingProgress(10);
      setError(null);
      setTryOnResults([]);
      
      // Display photo immediately
      const objectUrl = URL.createObjectURL(file);
      setPhotoUrl(objectUrl);
      setUserPhoto(file);
      setLoadingProgress(30);

      // Convert file to data URL for processing
      console.log('Processing photo with streamlined service...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const photoDataUrl = e.target.result;
        setLoadingProgress(60);
          
          // Generate try-on results using the correct method
          console.log('Generating try-on results...');
          const results = await virtualTryOnService.generateMultipleTryOns(photoDataUrl, product);
          
          // Format results for display
          const formattedResults = results.map((result, index) => ({
            id: result.variantId || `result-${index}`,
            name: result.variantName || result.variantColor || `Variant ${index + 1}`,
            image: result.image,
            blob: null // Will be generated if needed for download
          }));
          
          setTryOnResults(formattedResults);
          setLoadingProgress(100);
          
          if (formattedResults.length === 0) {
            setError('Unable to generate try-on results. Please try a different photo with better lighting.');
          }
          
        } catch (error) {
          console.error('Try-on generation failed:', error);
          setError(`Try-on failed: ${error.message}`);
        }
        
        // Delay to show 100% progress
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError('Failed to read photo file. Please try again.');
        setLoading(false);
      };
      
             reader.readAsDataURL(file);
      
    } catch (err) {
      console.error('Error in photo upload:', err);
      setError('Processing failed. Please try again with a clear, well-lit photo.');
      setLoading(false);
    }
  };
  
  // Download result image
  const downloadResult = (resultItem) => {
    if (resultItem.image) {
      const link = document.createElement('a');
      link.href = resultItem.image;
      link.download = `virtual-tryon-${resultItem.name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Share result
  const shareResult = async (resultItem) => {
    if (navigator.share && resultItem.image) {
      try {
        // Convert data URL to blob
        const response = await fetch(resultItem.image);
        const blob = await response.blob();
        const file = new File([blob], `virtual-tryon-${resultItem.name.replace(/\s+/g, '-')}.png`, {
          type: 'image/png'
        });
        
        await navigator.share({
          title: `Virtual Try-On: ${product.name}`,
          text: `Check out how I look in ${product.name} from The Noble Being!`,
          files: [file]
        });
      } catch (err) {
        console.log('Share failed:', err);
        // Fallback to download
        downloadResult(resultItem);
      }
    } else {
      downloadResult(resultItem);
    }
  };
  
  // Try again with new photo
  const tryAgain = () => {
    setUserPhoto(null);
    setPhotoUrl(null);
    setTryOnResults([]);
    setError(null);
    setLoadingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <TryOnContainer>
      <TryOnHeader>
        <h3>Photo Virtual Try-On</h3>
        {(userPhoto || tryOnResults.length > 0) && (
          <TryAgainButton
            onClick={tryAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6"></path>
              <path d="M21 17v-6h-6"></path>
              <path d="M7 17l4-4-4-4"></path>
              <path d="M17 7l-4 4 4 4"></path>
            </svg>
            Try Again
          </TryAgainButton>
        )}
      </TryOnHeader>

      {!userPhoto ? (
        <>
          <PhotoUploadArea onClick={triggerFileUpload}>
            <UploadIcon>📸</UploadIcon>
            <UploadInstructions>
              Click to upload your photo or drag and drop here.<br/>
              <strong>For best results:</strong> Face the camera directly with good lighting
            </UploadInstructions>
          </PhotoUploadArea>
          
          <Instructions>
            <h4>Photo Tips for Best Results:</h4>
            <p>
              • Stand against a plain background<br/>
              • Ensure good lighting on your face and body<br/>
              • Face the camera directly<br/>
              • Keep your arms slightly away from your body<br/>
              • Wear fitted clothing for more accurate results
            </p>
          </Instructions>
        </>
      ) : (
        <div>
          {photoUrl && (
            <UserPhoto src={photoUrl} alt="Your uploaded photo" />
          )}
      
      {loading && (
        <LoadingContainer>
              <LoadingSpinner />
          <ProgressBar progress={loadingProgress} />
          <LoadingText>
                {loadingProgress < 40 ? 'Analyzing your photo...' :
                 loadingProgress < 70 ? 'Calculating body measurements...' :
                 loadingProgress < 95 ? 'Generating try-on results...' :
                 'Almost done!'}
          </LoadingText>
        </LoadingContainer>
      )}
      
          {error && (
            <ErrorMessage>
              {error}
              <RetryButton onClick={tryAgain}>Try with a different photo</RetryButton>
            </ErrorMessage>
          )}
      
      {tryOnResults.length > 0 && (
        <TryOnResults>
              <h4>Your Virtual Try-On Results</h4>
          <ResultsGrid>
                {tryOnResults.map((result, index) => (
                  <ResultItem key={result.id || index}>
                    <ResultImage src={result.image} alt={`Try-on result: ${result.name}`} />
                    <ResultLabel>{result.name}</ResultLabel>
                <ResultActions>
                  <ActionButton
                        onClick={() => downloadResult(result)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Save
                      </ActionButton>
                      <ActionButton
                    onClick={() => shareResult(result)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Share"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                  </ActionButton>
                </ResultActions>
              </ResultItem>
            ))}
          </ResultsGrid>
        </TryOnResults>
      )}
        </div>
      )}
      
      <FileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
      />
    </TryOnContainer>
  );
};

export default PhotoTryOn;
