import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import cartService from '../services/cartService';
import { useCart } from '../context/CartContext';

// Utility function for fuzzy string matching to handle typos
const fuzzyMatch = (text, query) => {
  if (!text || !query) return false;
  
  text = text.toLowerCase();
  query = query.toLowerCase();
  
  // Exact match gets highest priority
  if (text.includes(query)) return true;
  
  // For short queries, require more precision
  if (query.length <= 3) {
    // For very short queries, be more strict
    return text.includes(query);
  }
  
  // For longer queries, allow some typos
  let typoThreshold = Math.floor(query.length / 4); // Allow ~25% typos
  typoThreshold = Math.max(1, Math.min(typoThreshold, 3)); // Between 1-3 typos allowed
  
  // Simple approach: check if enough characters from the query appear in sequence in the text
  let matchedChars = 0;
  let lastMatchIndex = -1;
  
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const foundIndex = text.indexOf(char, lastMatchIndex + 1);
    
    if (foundIndex > -1) {
      matchedChars++;
      lastMatchIndex = foundIndex;
    }
  }
  
  // Check if enough characters matched (allowing for typos)
  return matchedChars >= query.length - typoThreshold;
};

// Styled components for the futuristic shop page
const ShopPageContainer = styled(motion.main)`
  min-height: 100vh;
  background: var(--dark-bg);
  color: var(--text-primary);
  padding: 120px 0 60px;
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
      radial-gradient(circle at 70% 20%, rgba(240, 94, 64, 0.05), transparent 50%),
      radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.05), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const ShopLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FilterSidebar = styled(motion.aside)`
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(10px);
  border-radius: var(--standard-border-radius);
  padding: 1.5rem;
  height: fit-content;
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--glass-border);
    color: var(--white);
  }
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
    letter-spacing: 0.05em;
  }
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--standard-transition);
  
  &:hover {
    color: var(--white);
  }
  
  input {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid var(--glass-border);
    background: rgba(30, 30, 30, 0.5);
    margin-right: 10px;
    cursor: pointer;
    position: relative;
    transition: var(--standard-transition);
    
    &::after {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: var(--soft-gold);
      opacity: 0;
      transition: var(--standard-transition);
    }
    
    &:checked {
      border-color: var(--soft-gold);
      box-shadow: var(--gold-glow);
      
      &::after {
        opacity: 1;
      }
    }
  }
`;

// Adding missing styled components to fix ESLint errors
const FilterTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  letter-spacing: 0.05em;
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid var(--glass-border);
  background: rgba(30, 30, 30, 0.5);
  margin-right: 10px;
  cursor: pointer;
  position: relative;
  transition: var(--standard-transition);
  
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: var(--soft-gold);
    opacity: 0;
    transition: var(--standard-transition);
  }
  
  &:checked {
    border-color: var(--soft-gold);
    box-shadow: var(--gold-glow);
    
    &::after {
      opacity: 1;
    }
  }
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--standard-transition);
  
  &:hover {
    color: var(--white);
  }
`;

const ProductGrid = styled(motion.section)`
  position: relative;
`;

const SearchBar = styled.div`
  margin-bottom: 2rem;
  
  input {
    width: 100%;
    padding: 1rem 1.5rem;
    border-radius: var(--button-border-radius);
    border: 1px solid var(--glass-border);
    background: rgba(30, 30, 30, 0.7);
    color: var(--text-primary);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    backdrop-filter: blur(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: var(--standard-transition);
    
    &:focus {
      outline: none;
      border-color: var(--neon-cyan);
      box-shadow: var(--neon-glow);
    }
    
    &::placeholder {
      color: var(--text-secondary);
    }
  }
`;

const PriceSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  span {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  input {
    width: 100%;
    appearance: none;
    background: linear-gradient(90deg, var(--terracotta), var(--soft-gold));
    height: 4px;
    border-radius: 2px;
    opacity: 0.7;
    transition: var(--standard-transition);
    cursor: pointer;
    
    &::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--white);
      box-shadow: 0 0 10px rgba(255, 204, 51, 0.5);
    }
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ProductGallery = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  perspective: 1000px;
`;

// Pagination controls
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  gap: 0.5rem;
`;

const PageButton = styled(motion.button)`
  background: rgba(34, 34, 34, 0.8);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
  
  &.active {
    background: var(--soft-gold);
    color: var(--dark-bg);
    box-shadow: 0 0 12px rgba(255, 204, 51, 0.6);
    border-color: var(--soft-gold);
  }
  
  &:hover:not(.active):not(:disabled) {
    border-color: var(--soft-gold);
    color: var(--soft-gold);
    box-shadow: 0 0 8px rgba(255, 204, 51, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageEllipsis = styled.span`
  color: var(--text-secondary);
  font-size: 1.2rem;
  padding: 0 0.5rem;
`;

const ProductCard = styled(motion.div)`
  background: rgba(34, 34, 34, 0.8);
  border-radius: var(--card-border-radius);
  overflow: hidden;
  backdrop-filter: blur(5px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
  transition: var(--standard-transition);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px) rotateX(5deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), var(--gold-glow);
    border-color: rgba(255, 204, 51, 0.3);
  }
`;

const ProductImage = styled.div`
  height: 280px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(34, 34, 34, 1) 0%, rgba(34, 34, 34, 0) 50%);
  }
`;

const ProductImageContainer = styled.div`
  height: 100%;
  background-color: ${props => props.color || 'var(--dark-surface)'};
  border-radius: var(--standard-border-radius);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%);
    transform: translateX(-150%);
    animation: shine 2s infinite ease-in-out;
    pointer-events: none;
    z-index: 1;
  }
  
  @keyframes shine {
    0% { transform: translateX(-150%); }
    100% { transform: translateX(150%); }
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
  
  h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--white);
  }
  
  .price {
    color: var(--soft-gold);
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .button-container {
    display: flex;
    gap: 0.5rem;
  }
`;

const AddToCartButton = styled(motion.button)`
  flex: 1;
  padding: 0.75rem;
  background: var(--earth-gradient);
  color: var(--white);
  border-radius: var(--button-border-radius);
  border: none;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--standard-transition);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.7s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--gold-glow);
    
    &::before {
      left: 100%;
    }
  }
`;

const ViewDetailsButton = styled(motion.button)`
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  color: var(--white);
  border-radius: var(--button-border-radius);
  border: 1px solid var(--soft-gold);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(217, 191, 19, 0.1);
  }
`;

const ShopPage = () => {
  // State for filter selections
  const [filters, setFilters] = useState({
    category: [],
    subcategory: [],
    size: [],
    color: [],
    priceRange: { min: 0, max: 500 }
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  
  // Debug state to log what's happening
  const [debug, setDebug] = useState({});
  
  // State for categories and subcategories
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // State for products from API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  
  // Get cart context
  const { refreshCart } = useCart();
  
  // State for cart interaction feedback
  const [addedToCart, setAddedToCart] = useState({});

  const handleFilterChange = (filterType, value) => {
    console.log(`Filter change: ${filterType} = ${value}`);
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (filterType === 'category' || filterType === 'subcategory' || filterType === 'size' || filterType === 'color') {
        // Toggle the value in the array
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
        
        // Log the updated filters for debugging
        console.log(`Updated ${filterType} filters:`, newFilters[filterType]);
      } else if (filterType === 'priceRange') {
        newFilters.priceRange = value;
      }
      
      // Set debug state to track filter changes
      setDebug(prev => ({
        ...prev,
        lastFilterChange: { type: filterType, value, timestamp: new Date().toISOString() }
      }));
      
      return newFilters;
    });
  };

  // Reset to first page when filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = searchParams.get('category');
        let data;
        
        // First, fetch all products
        const allProducts = await productService.getAllProducts();
        
        // Check if we're filtering by category from URL parameters
        if (categoryParam) {
          // Find the category ID that matches the category name from URL
          const category = categories.find(cat => 
            cat.name.toLowerCase() === categoryParam.toLowerCase() || 
            cat.id === categoryParam
          );
          
          if (category) {
            // Filter products by category ID
            data = allProducts.filter(product => product.category_id === category.id);
            // Set this category in the filters
            setFilters(prev => ({
              ...prev,
              category: [category.id]
            }));
          } else {
            // If category not found, show no products
            data = [];
          }
        } else {
          // If no category filter, show all products
          data = allProducts;
        }
        
        // For debugging - log products to see their structure
        console.log('Fetched products:', data);
        
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
    
    // Fetch categories and subcategories
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        console.log('Fetched categories:', categoriesData);
        setCategories(categoriesData);
        
        // Initialize expanded state for categories
        const expanded = {};
        categoriesData.forEach(cat => {
          if (cat.name === 'Shirts' || cat.name === 'Pants' || cat.name === 'My Craft') {
            expanded[cat.id] = true; // These categories start expanded
          }
        });
        setExpandedCategories(expanded);
        
        const subcategoriesData = await productService.getAllSubcategories();
        console.log('Fetched subcategories:', subcategoriesData);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, [searchParams, categories]);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Filter by category - only if category filters are applied
    if (filters.category.length > 0) {
      // Check if the product's category_id matches any of the selected category ids
      const categoryMatch = filters.category.some(catId => product.category_id === catId);
      
      if (!categoryMatch) {
        return false;
      }
    }
    
    // Filter by subcategory - products now have subcategory_id field
    if (filters.subcategory.length > 0) {
      // Check if the product's subcategory_id matches any selected subcategory
      const subcategoryMatch = filters.subcategory.some(subId => product.subcategory_id === subId);
      
      if (!subcategoryMatch) {
        return false;
      }
    }
    
    // Filter by size - check if sizes property exists first
    if (filters.size.length > 0) {
      // For debugging
      // console.log(`Checking size filter for product ${product.name}, sizes:`, product.sizes, 'looking for:', filters.size);
      
      // Handle case where product doesn't have sizes property
      // Default all products to have standard sizes if not specified
      let productSizes = ['S', 'M', 'L'];
      
      // Use actual product sizes if available
      if (product.sizes && Array.isArray(product.sizes)) {
        productSizes = product.sizes;
      } else if (product.size && typeof product.size === 'string') {
        // Handle case where size is a single string
        productSizes = [product.size];
      } else if (!product.sizes) {
        // If no size info, assume the product is available in all standard sizes
        // (better user experience than filtering out products without explicit size data)
        productSizes = ['S', 'M', 'L', 'One Size'];
      }
      
      // Check if any of the product's sizes match the selected size filters
      const sizeMatch = filters.size.some(size => productSizes.includes(size));
      if (!sizeMatch) {
        // console.log(`Product ${product.name} filtered out due to size mismatch`);
        return false;
      }
    }
    
    // Filter by color
    if (filters.color.length > 0 && !filters.color.includes(product.color)) {
      return false;
    }
    
    // Filter by price range
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }
    
    // Enhanced search functionality with fuzzy matching for typo tolerance
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.trim();
      
      // Search across multiple product fields with fuzzy matching
      const nameMatch = product.name && fuzzyMatch(product.name, query);
      const descMatch = product.description && fuzzyMatch(product.description, query);
      const categoryMatch = product.category && fuzzyMatch(product.category, query);
      const materialMatch = product.material && fuzzyMatch(product.material, query);
      const styleMatch = product.style && fuzzyMatch(product.style, query);
      const colorMatch = product.color && fuzzyMatch(product.color, query);
      
      // Get subcategory name if available
      let subcategoryMatch = false;
      if (product.subcategory_id) {
        const subcategory = subcategories.find(sub => sub.id === product.subcategory_id);
        if (subcategory && subcategory.name) {
          subcategoryMatch = fuzzyMatch(subcategory.name, query);
        }
      }
      
      // Check for fuzzy match in product ID or SKU for staff searches
      const idMatch = product.id && fuzzyMatch(product.id, query);
      const skuMatch = product.sku && fuzzyMatch(product.sku, query);
      
      // If the query doesn't match any of the product's fields, filter it out
      if (!(nameMatch || descMatch || categoryMatch || materialMatch || styleMatch || colorMatch || subcategoryMatch || idMatch || skuMatch)) {
        // Log for debugging
        // console.log(`Product ${product.name} didn't match search: ${query}`);
        return false;
      } else {
        // Debug which field matched
        // console.log(`Product ${product.name} matched search "${query}" on: ${nameMatch ? 'name' : ''} ${descMatch ? 'desc' : ''} ${categoryMatch ? 'category' : ''} ${materialMatch ? 'material' : ''}`);
      }
    }
    
    return true;
  });
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Get category name by id
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Get subcategory name by id with category context
  const getSubcategoryName = (subcategoryId) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return 'Unknown';
    
    // Find the parent category for context
    const parentCategory = categories.find(cat => cat.id === subcategory.category_id);
    const categoryName = parentCategory ? parentCategory.name : '';
    
    // Return the subcategory name with category context
    return `${subcategory.name} (${categoryName})`;
  };

  // Helper function to improve product filtering and search
  const getFilterSummary = () => {
    const summary = [];
    
    // Add category filters
    if (filters.category.length > 0) {
      const categoryNames = filters.category.map(id => getCategoryName(id)).join(', ');
      summary.push(`Categories: ${categoryNames}`);
    }
    
    // Add subcategory filters
    if (filters.subcategory.length > 0) {
      const subcategoryNames = filters.subcategory.map(id => getSubcategoryName(id)).join(', ');
      summary.push(`Types: ${subcategoryNames}`);
    }
    
    // Add size filters
    if (filters.size.length > 0) {
      summary.push(`Sizes: ${filters.size.join(', ')}`);
    }
    
    // Add color filters
    if (filters.color.length > 0) {
      summary.push(`Colors: ${filters.color.join(', ')}`);
    }
    
    // Add price range
    summary.push(`Price: $${filters.priceRange.min} - $${filters.priceRange.max}`);
    
    // Add search query if present
    if (searchQuery) {
      summary.push(`Search: "${searchQuery}"`);
    }
    
    return summary;
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
    // Create shine effect on product cards
    gsap.to('.product-card-shine', {
      x: '150%',
      duration: 1.5,
      ease: 'power2.inOut',
      repeat: -1,
      repeatDelay: 1,
      stagger: 0.2
    });
  }, []);

  return (
    <ShopPageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <ShopLayout>
          {/* Filter Sidebar */}
          <FilterSidebar
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 18 }}
          >
            <h2>Filters</h2>
            
            {/* Categories with subcategories */}
            <FilterSection>
              <h3>Categories</h3>
              <FilterOptions>
                {categories.map(category => (
                  <div key={category.id}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <FilterOption onClick={(e) => e.stopPropagation()} style={{ flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category.id)}
                          onChange={() => handleFilterChange('category', category.id)}
                        />
                        {category.name}
                      </FilterOption>
                      
                      {/* Separate the dropdown arrow from the checkbox click area */}
                      {['Shirts', 'Pants', 'My Craft'].includes(category.name) && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryExpansion(category.id);
                          }}
                          style={{ 
                            marginLeft: '8px', 
                            cursor: 'pointer',
                            padding: '5px', // Add padding to make it easier to click
                          }}
                        >
                          {expandedCategories[category.id] ? '▼' : '►'}
                        </span>
                      )}
                    </div>
                    
                    {/* Show subcategories if category is expanded */}
                    {expandedCategories[category.id] && (
                      <div style={{ marginLeft: '20px', marginTop: '8px' }}>
                        {subcategories
                          .filter(sub => sub.category_id === category.id)
                          .map(subcategory => (
                            <FilterOption 
                              key={subcategory.id} 
                              style={{ marginBottom: '5px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={filters.subcategory.includes(subcategory.id)}
                                onChange={() => handleFilterChange('subcategory', subcategory.id)}
                              />
                              {subcategory.name}
                            </FilterOption>
                          ))
                        }
                      </div>
                    )}
                  </div>
                ))}
              </FilterOptions>
            </FilterSection>
            
            <FilterSection>
              <h3>Size</h3>
              <FilterOptions>
                {['S', 'M', 'L', 'One Size'].map(size => (
                  <FilterOption key={size}>
                    <input
                      type="checkbox"
                      checked={filters.size.includes(size)}
                      onChange={() => handleFilterChange('size', size)}
                    />
                    {size}
                  </FilterOption>
                ))}
              </FilterOptions>
            </FilterSection>
            
            <FilterSection>
              <h3>Color</h3>
              <FilterOptions>
                {['Green', 'Bronze', 'Terracotta', 'Gold', 'Charcoal', 'Beige', 'Magenta'].map(color => (
                  <FilterOption key={color}>
                    <input
                      type="checkbox"
                      checked={filters.color.includes(color)}
                      onChange={() => handleFilterChange('color', color)}
                    />
                    {color}
                  </FilterOption>
                ))}
              </FilterOptions>
            </FilterSection>
            
            <FilterSection>
              <h3>Price Range</h3>
              <PriceSlider>
                <span>Min: ${filters.priceRange.min}</span>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: parseInt(e.target.value) })}
                />
                <span>Max: ${filters.priceRange.max}</span>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: parseInt(e.target.value) })}
                />
                <span><strong>Range: ${filters.priceRange.min} - ${filters.priceRange.max}</strong></span>
              </PriceSlider>
            </FilterSection>
          </FilterSidebar>
          
          {/* Product Grid */}
          <ProductGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SearchBar>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
            
            {/* Active Filters Summary */}
            {(filters.category.length > 0 || filters.subcategory.length > 0 || 
              filters.size.length > 0 || filters.color.length > 0 || 
              searchQuery || 
              filters.priceRange.min > 0 || filters.priceRange.max < 500) && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '12px 15px', 
                background: 'rgba(34, 34, 34, 0.7)',
                borderRadius: 'var(--standard-border-radius)',
                border: '1px solid var(--glass-border)'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  marginBottom: '8px',
                  color: 'var(--white)'
                }}>
                  Active Filters
                </h3>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px' 
                }}>
                  {getFilterSummary().map((item, index) => (
                    <div key={index} style={{ 
                      padding: '4px 10px', 
                      background: 'rgba(217, 191, 19, 0.15)', 
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: 'var(--soft-gold)'
                    }}>
                      {item}
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      setFilters({
                        category: [],
                        subcategory: [],
                        size: [],
                        color: [],
                        priceRange: { min: 0, max: 500 }
                      });
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'rgba(240, 94, 64, 0.2)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '0.85rem',
                      color: 'var(--terracotta)',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
            
            <ProductGallery
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.length === 0 && !loading && (
                <motion.div 
                  variants={itemVariants}
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    borderRadius: 'var(--standard-border-radius)',
                    background: 'rgba(34, 34, 34, 0.7)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    No products found
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Try adjusting your filters or search query
                  </p>
                </motion.div>
              )}
              
              <AnimatePresence>
                {/* Apply pagination to display only current page products */}
                {filteredProducts
                  .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
                  .map(product => (
                  <ProductCard 
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => window.location.href = `/product/${product.id}`}
                  >
                    <ProductImage>
                      {/* Placeholder for product image */}
                      <ProductImageContainer color={product.color}>
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <img src={`https://placehold.co/400x500/333333/FFFFFF?text=${product.name}`} alt={product.name} />
                        )}
                      </ProductImageContainer>
                    </ProductImage>
                    <ProductInfo>
                      <h3>{product.name}</h3>
                      <p className="price">${product.price}</p>
                      <div className="button-container">
                        <AddToCartButton
                          whileHover={{ scale: addedToCart[product.id] ? 1.0 : 1.05 }}
                          whileTap={{ scale: addedToCart[product.id] ? 1.0 : 0.95 }}
                          style={{
                            background: addedToCart[product.id] === 'success' ? 'var(--sage-green)' : 
                                      addedToCart[product.id] === 'error' ? 'var(--terracotta)' : ''
                          }}
                          disabled={!!addedToCart[product.id]}
                          onClick={async (e) => {
                            e.stopPropagation(); // Prevent navigating to product detail
                            try {
                              // Use the first available size if product has sizes
                              const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size';
                              await cartService.addToCart(product.id, 1, { size, color: product.color });
                              
                              // Refresh cart state from backend to update header
                              await refreshCart();
                              
                              // Visual feedback instead of alert
                              setAddedToCart(prev => ({ ...prev, [product.id]: 'success' }));
                              
                              // Reset after 2 seconds
                              setTimeout(() => {
                                setAddedToCart(prev => {
                                  const newState = { ...prev };
                                  delete newState[product.id];
                                  return newState;
                                });
                              }, 2000);
                            } catch (error) {
                              console.error('Error adding to cart:', error);
                              
                              // Visual error feedback
                              setAddedToCart(prev => ({ ...prev, [product.id]: 'error' }));
                              
                              // Reset after 2 seconds
                              setTimeout(() => {
                                setAddedToCart(prev => {
                                  const newState = { ...prev };
                                  delete newState[product.id];
                                  return newState;
                                });
                              }, 2000);
                            }
                          }}
                        >
                          {addedToCart[product.id] === 'success' ? (
                            <>✓ Added!</>
                          ) : addedToCart[product.id] === 'error' ? (
                            <>Failed</>
                          ) : (
                            <>Add to Cart</>
                          )}
                        </AddToCartButton>
                        <ViewDetailsButton
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </ViewDetailsButton>
                      </div>
                    </ProductInfo>
                  </ProductCard>
                ))}
              </AnimatePresence>
            </ProductGallery>
            
            {/* Pagination Controls */}
            {filteredProducts.length > productsPerPage && (
              <PaginationContainer>
                <PageButton
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                >
                  &lt;
                </PageButton>
                
                {/* First page */}
                {currentPage > 3 && (
                  <PageButton
                    onClick={() => setCurrentPage(1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    1
                  </PageButton>
                )}
                
                {/* Ellipsis for many pages */}
                {currentPage > 3 && <PageEllipsis>...</PageEllipsis>}
                
                {/* Page before current */}
                {currentPage > 1 && (
                  <PageButton
                    onClick={() => setCurrentPage(currentPage - 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentPage - 1}
                  </PageButton>
                )}
                
                {/* Current page */}
                <PageButton className="active">
                  {currentPage}
                </PageButton>
                
                {/* Page after current */}
                {currentPage < Math.ceil(filteredProducts.length / productsPerPage) && (
                  <PageButton
                    onClick={() => setCurrentPage(currentPage + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentPage + 1}
                  </PageButton>
                )}
                
                {/* Ellipsis for many pages */}
                {currentPage < Math.ceil(filteredProducts.length / productsPerPage) - 2 && <PageEllipsis>...</PageEllipsis>}
                
                {/* Last page */}
                {currentPage < Math.ceil(filteredProducts.length / productsPerPage) - 1 && (
                  <PageButton
                    onClick={() => setCurrentPage(Math.ceil(filteredProducts.length / productsPerPage))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {Math.ceil(filteredProducts.length / productsPerPage)}
                  </PageButton>
                )}
                
                <PageButton
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / productsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                  whileHover={{ scale: currentPage === Math.ceil(filteredProducts.length / productsPerPage) ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === Math.ceil(filteredProducts.length / productsPerPage) ? 1 : 0.95 }}
                >
                  &gt;
                </PageButton>
              </PaginationContainer>
            )}
          </ProductGrid>
        </ShopLayout>
      </Container>
    </ShopPageContainer>
  );
};

export default ShopPage;
