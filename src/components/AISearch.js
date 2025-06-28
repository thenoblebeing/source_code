import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import searchService from '../services/searchService';
import { useAuth } from '../context/AuthContext';

const AISearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSearchType, setActiveSearchType] = useState('text'); // 'text' or 'image'
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Load trending searches on component mount
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const data = await searchService.getTrendingSearches();
        setTrendingSearches(data.trends || []);
      } catch (err) {
        console.error('Error fetching trending searches:', err);
      }
    };
    
    fetchTrendingSearches();
  }, []);
  
  // Handle outside click to close search panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Focus input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  // Process image when selected
  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      
      reader.readAsDataURL(selectedImage);
    }
  }, [selectedImage]);
  
  // Handle search query change with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedImage) return;
    
    setIsLoading(true);
    
    try {
      let results;
      
      if (activeSearchType === 'text') {
        // Use semantic search for natural language understanding
        results = await searchService.semanticSearch(searchQuery);
      } else if (activeSearchType === 'image' && selectedImage) {
        // Visual search with image
        results = await searchService.visualSearch(selectedImage);
      }
      
      setSearchResults(results?.products || []);
      setSuggestions(results?.suggestions || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() && !selectedImage) return;
    
    // Navigate to search results page with query parameters
    let searchParams = new URLSearchParams();
    
    if (searchQuery) {
      searchParams.append('q', searchQuery);
    }
    
    if (selectedImage) {
      // In a real app, you would upload the image and get an ID
      // Here we'll just indicate that image search was used
      searchParams.append('type', 'image');
    }
    
    navigate(`/shop?${searchParams.toString()}`);
    setIsSearchOpen(false);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setSelectedImage(file);
      setActiveSearchType('image');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedImage(null);
    setPreviewImage(null);
    setSearchResults([]);
    setSuggestions([]);
    setActiveSearchType('text');
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const selectTrendingSearch = (trend) => {
    setSearchQuery(trend);
    setActiveSearchType('text');
  };
  
  const navigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
    setIsSearchOpen(false);
  };
  
  return (
    <SearchContainer ref={searchContainerRef}>
      <SearchToggle onClick={() => setIsSearchOpen(true)}>
        <FiSearch />
      </SearchToggle>
      
      <AnimatePresence>
        {isSearchOpen && (
          <SearchPanel
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <SearchHeader>
              <SearchForm onSubmit={handleSubmitSearch}>
                <SearchTypeToggle>
                  <SearchTypeButton 
                    active={activeSearchType === 'text'}
                    onClick={() => setActiveSearchType('text')}
                    type="button"
                  >
                    <Icon name="search" size="1.2em" />
                  </SearchTypeButton>
                  <SearchTypeButton 
                    active={activeSearchType === 'image'}
                    onClick={() => triggerFileInput()}
                    type="button"
                  >
                    <Icon name="camera" size="1.2em" />
                  </SearchTypeButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/jpeg, image/png"
                    onChange={handleImageUpload}
                  />
                </SearchTypeToggle>
                
                <SearchInputWrapper>
                  <SearchInput
                    ref={searchInputRef}
                    type="text"
                    placeholder={
                      activeSearchType === 'text'
                        ? "Try 'sustainable linen dress' or 'office outfit ideas'"
                        : "Search with image..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {(searchQuery || selectedImage) && (
                    <ClearButton type="button" onClick={clearSearch}>
                      <Icon name="x" size="1.2em" />
                    </ClearButton>
                  )}
                </SearchInputWrapper>
                
                <SearchButton type="submit">
                  <Icon name="search" size="1.2em" />
                </SearchButton>
              </SearchForm>
            </SearchHeader>
            
            {previewImage && (
              <ImagePreview>
                <PreviewImg src={previewImage} alt="Search with this image" />
                <RemoveImageButton onClick={() => {
                  setSelectedImage(null);
                  setPreviewImage(null);
                  setActiveSearchType('text');
                }}>
                  <Icon name="x" size="1.2em" />
                </RemoveImageButton>
              </ImagePreview>
            )}
            
            <SearchContent>
              {isLoading ? (
                <LoadingIndicator>
                  <Spinner />
                  <span>Searching for intelligent matches...</span>
                </LoadingIndicator>
              ) : (
                <>
                  {searchResults.length > 0 ? (
                    <ResultsContainer>
                      <ResultsTitle>Products</ResultsTitle>
                      <ResultsList>
                        {searchResults.map(product => (
                          <ResultItem 
                            key={product.id}
                            onClick={() => navigateToProduct(product.id)}
                          >
                            <ResultImage src={product.image} alt={product.name} />
                            <ResultDetails>
                              <ResultName>{product.name}</ResultName>
                              <ResultPrice>${product.price.toFixed(2)}</ResultPrice>
                            </ResultDetails>
                          </ResultItem>
                        ))}
                      </ResultsList>
                      
                      {suggestions.length > 0 && (
                        <SuggestionsContainer>
                          <SuggestionsTitle>You might also like</SuggestionsTitle>
                          <SuggestionsList>
                            {suggestions.map((suggestion, index) => (
                              <SuggestionItem 
                                key={index}
                                onClick={() => setSearchQuery(suggestion)}
                              >
                                {suggestion}
                              </SuggestionItem>
                            ))}
                          </SuggestionsList>
                        </SuggestionsContainer>
                      )}
                    </ResultsContainer>
                  ) : (
                    <TrendingContainer>
                      {searchQuery ? (
                        <NoResultsMessage>
                          No results found. Try a different search term.
                        </NoResultsMessage>
                      ) : (
                        <>
                          <TrendingTitle>
                            <Icon name="trendingUp" size="1.2em" style={{marginRight: '8px'}} />
                            <span>Trending Searches</span>
                          </TrendingTitle>
                          <TrendingList>
                            {trendingSearches.map((trend, index) => (
                              <TrendingItem 
                                key={index}
                                onClick={() => selectTrendingSearch(trend)}
                              >
                                {trend}
                              </TrendingItem>
                            ))}
                          </TrendingList>
                          
                          {currentUser && (
                            <PersonalizedSection>
                              <PersonalizedTitle>
                                <Icon name="shoppingBag" size="1.2em" style={{marginRight: '8px'}} />
                                <span>Based on your style</span>
                              </PersonalizedTitle>
                              <PersonalizedList>
                                <PersonalizedItem onClick={() => setSearchQuery('sustainable linen')}>
                                  Sustainable linen pieces
                                </PersonalizedItem>
                                <PersonalizedItem onClick={() => setSearchQuery('bohemian style')}>
                                  Bohemian style outfits
                                </PersonalizedItem>
                                <PersonalizedItem onClick={() => setSearchQuery('neutral color palette')}>
                                  Neutral color palette
                                </PersonalizedItem>
                              </PersonalizedList>
                            </PersonalizedSection>
                          )}
                        </>
                      )}
                    </TrendingContainer>
                  )}
                </>
              )}
            </SearchContent>
          </SearchPanel>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

// Styled Components
const SearchContainer = styled.div`
  position: relative;
`;

const SearchToggle = styled.button`
  background: none;
  border: none;
  color: #333;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: #8A9A5B;
  }
`;

const SearchPanel = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 100vw;
  max-width: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100vw;
    max-width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    border-radius: 0;
  }
`;

const SearchHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchTypeToggle = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 30px;
  padding: 3px;
`;

const SearchTypeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#8A9A5B' : '#777'};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    color: ${props => props.active ? '#8A9A5B' : '#555'};
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #8A9A5B;
    box-shadow: 0 0 0 2px rgba(138, 154, 91, 0.2);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background-color: #8A9A5B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #7a8a4b;
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const SearchContent = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    max-height: calc(100vh - 80px);
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
  
  span {
    margin-top: 1rem;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(138, 154, 91, 0.2);
  border-top: 3px solid #8A9A5B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ResultsContainer = styled.div`
  padding: 1.5rem;
`;

const ResultsTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const ResultImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
`;

const ResultDetails = styled.div`
  flex: 1;
`;

const ResultName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ResultPrice = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const SuggestionsContainer = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const SuggestionsTitle = styled.h4`
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.75rem;
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SuggestionItem = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #8A9A5B;
    color: white;
  }
`;

const TrendingContainer = styled.div`
  padding: 1.5rem;
`;

const TrendingTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
  
  svg {
    color: #8A9A5B;
  }
`;

const TrendingList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const TrendingItem = styled.button`
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #8A9A5B;
    color: white;
  }
`;

const PersonalizedSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const PersonalizedTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
  
  svg {
    color: #8A9A5B;
  }
`;

const PersonalizedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PersonalizedItem = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  text-align: left;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ImagePreview = styled.div`
  position: relative;
  padding: 1rem;
  border-bottom: 1px solid #eee;
`;

const PreviewImg = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: white;
  }
`;

export default AISearch;
