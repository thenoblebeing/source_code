import api from './api';

const searchService = {
  // Basic search products with query
  searchProducts: async (query, filters = {}) => {
    try {
      // Use Supabase's text search capabilities
      const { data } = await api.search('products', 'name_description', query);
      
      // Apply additional filters if provided
      if (Object.keys(filters).length > 0) {
        return {
          products: data.filter(product => {
            let match = true;
            
            if (filters.category && product.category !== filters.category) {
              match = false;
            }
            
            if (filters.min_price && product.price < filters.min_price) {
              match = false;
            }
            
            if (filters.max_price && product.price > filters.max_price) {
              match = false;
            }
            
            return match;
          })
        };
      }
      
      return { products: data };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Advanced semantic search with natural language processing
  semanticSearch: async (naturalLanguageQuery, options = {}) => {
    try {
      // Extract keywords from natural language query
      // This is a simple implementation - in a real app, you might use
      // a more sophisticated NLP approach or external API
      const keywords = naturalLanguageQuery
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && ![
          'the', 'and', 'for', 'with', 'that', 'have', 'this', 
          'from', 'they', 'will', 'would', 'there', 'their', 'what',
          'about', 'which', 'when', 'make', 'like', 'time', 'just', 'know'
        ].includes(word));
      
      // Perform search with extracted keywords
      let searchResults = [];
      
      // Search product names and descriptions
      for (const keyword of keywords) {
        const { data } = await api.search('products', 'name_description', keyword);
        if (data && data.length > 0) {
          searchResults = [...searchResults, ...data];
        }
      }
      
      // Remove duplicates
      const uniqueResults = Array.from(new Set(searchResults.map(item => item.id)))
        .map(id => searchResults.find(item => item.id === id));
      
      // Sort by relevance (this is a simple implementation)
      const scoredResults = uniqueResults.map(product => {
        let score = 0;
        const productText = `${product.name} ${product.description}`.toLowerCase();
        
        keywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'gi');
          const matches = (productText.match(regex) || []).length;
          score += matches;
        });
        
        return { ...product, score };
      });
      
      scoredResults.sort((a, b) => b.score - a.score);
      
      // Generate suggestions based on query
      const suggestions = generateSuggestions(naturalLanguageQuery, scoredResults);
      
      return {
        products: scoredResults.map(({ score, ...product }) => product),
        suggestions,
        query: naturalLanguageQuery
      };
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw error;
    }
  },

  // Get personalized recommendations
  getRecommendations: async (userId, productId = null) => {
    try {
      let recommendedProducts = [];
      
      if (productId) {
        // Get product details
        const { data: product } = await api.getById('products', productId);
        
        if (product) {
          // Get products in the same category
          const { data: similarProducts } = await api.get('products', {
            filters: { 
              category: product.category,
              id_not: productId // Exclude the current product
            },
            range: { from: 0, to: 5 }
          });
          
          recommendedProducts = [...recommendedProducts, ...similarProducts];
        }
      }
      
      if (userId) {
        // Get user's order history
        const user = await api.auth.getUser();
        
        if (user) {
          // Get user's orders
          const { data: orders } = await api.get('orders', {
            filters: { user_id: user.id },
            order: { column: 'created_at', ascending: false }
          });
          
          if (orders && orders.length > 0) {
            // Get all ordered products
            const orderProductIds = orders
              .flatMap(order => order.items)
              .map(item => item.product_id);
            
            // Get product categories
            const productCategories = new Set();
            
            for (const productId of orderProductIds) {
              const { data: product } = await api.getById('products', productId);
              if (product && product.category) {
                productCategories.add(product.category);
              }
            }
            
            // Get recommended products from user's preferred categories
            for (const category of Array.from(productCategories).slice(0, 3)) {
              const { data: categoryProducts } = await api.get('products', {
                filters: { category },
                range: { from: 0, to: 3 }
              });
              
              if (categoryProducts) {
                recommendedProducts = [...recommendedProducts, ...categoryProducts];
              }
            }
          }
        }
      }
      
      // If we still don't have enough recommendations, add popular products
      if (recommendedProducts.length < 8) {
        const { data: popularProducts } = await api.get('products', {
          filters: { popular: true },
          range: { from: 0, to: 8 - recommendedProducts.length }
        });
        
        if (popularProducts) {
          recommendedProducts = [...recommendedProducts, ...popularProducts];
        }
      }
      
      // Remove duplicates
      const uniqueProducts = Array.from(new Set(recommendedProducts.map(item => item.id)))
        .map(id => recommendedProducts.find(item => item.id === id));
      
      return { 
        recommendations: uniqueProducts.slice(0, 8),
        source: productId ? 'product' : (userId ? 'user' : 'popular')
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Get style suggestions based on user preferences or inputs
  getStyleSuggestions: async (preferences) => {
    try {
      // This would ideally use an AI service, but we'll mock it with Supabase data
      const filters = {};
      
      if (preferences.style) filters.style = preferences.style;
      if (preferences.season) filters.season = preferences.season;
      if (preferences.occasion) filters.occasion = preferences.occasion;
      
      // Get matching products
      const { data: styleProducts } = await api.get('products', {
        filters,
        range: { from: 0, to: 15 }
      });
      
      // Group by category to create outfits
      const outfits = [];
      const topProducts = styleProducts.filter(p => p.category === 'tops' || p.category === 'shirts');
      const bottomProducts = styleProducts.filter(p => p.category === 'bottoms' || p.category === 'pants' || p.category === 'skirts');
      const accessoryProducts = styleProducts.filter(p => p.category === 'accessories');
      
      // Create a few outfit combinations
      for (let i = 0; i < Math.min(topProducts.length, bottomProducts.length, 5); i++) {
        const outfit = {
          id: `outfit-${i}`,
          name: `${preferences.style || 'Custom'} Outfit ${i + 1}`,
          products: [topProducts[i], bottomProducts[i]],
          total: topProducts[i].price + bottomProducts[i].price
        };
        
        // Add an accessory if available
        if (accessoryProducts[i]) {
          outfit.products.push(accessoryProducts[i]);
          outfit.total += accessoryProducts[i].price;
        }
        
        outfits.push(outfit);
      }
      
      return {
        outfits,
        individual_products: styleProducts.slice(0, 10),
        preferences
      };
    } catch (error) {
      console.error('Error getting style suggestions:', error);
      throw error;
    }
  },

  // Visual search using image
  visualSearch: async (imageData) => {
    try {
      // Import the image analysis service
      const imageAnalysisService = (await import('./imageAnalysisService')).default;

      // Upload image to Supabase Storage
      const fileName = `search-${Date.now()}.jpg`;
      const { data: storageData, error: storageError } = await api.supabase()
        .storage
        .from('search-images')
        .upload(fileName, imageData);
      
      if (storageError) throw storageError;

      // Get the public URL for the uploaded image
      const { data: publicUrlData } = await api.supabase()
        .storage
        .from('search-images')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;
      console.log('Image uploaded successfully:', imageUrl);
      
      // Analyze the image using TensorFlow.js and MobileNet
      const predictions = await imageAnalysisService.classifyImage(imageData);
      console.log('Image analysis predictions:', predictions);
      
      // Map predictions to fashion categories
      const fashionAnalysis = imageAnalysisService.mapToFashionCategories(predictions);
      console.log('Fashion analysis:', fashionAnalysis);
      
      const detectedCategory = fashionAnalysis.category;
      const detectedColor = fashionAnalysis.color;
      
      // Extract feature vector for potential similarity search
      // Note: In a production app, we would compare this with pre-computed vectors
      // of all products to find truly visually similar items
      const featureVector = await imageAnalysisService.getImageFeatures(imageData);
      console.log('Feature vector extracted (length):', featureVector.length);
      
      // Store search metadata in Supabase for future trending analysis
      const { error: logError } = await api.supabase()
        .from('search_logs')
        .insert([
          { 
            search_type: 'visual',
            detected_category: detectedCategory,
            detected_color: detectedColor,
            image_url: imageUrl,
            // We don't store the full vector here as it would be too large
            // In a real app with vector search, you'd store this in a pgvector column
          }
        ]);
      
      if (logError) console.error('Error logging search:', logError);
      
      // Search for similar products by category and color
      const { data: similarByCategory } = await api.get('products', {
        filters: { category: detectedCategory },
        range: { from: 0, to: 8 }
      });
      
      const { data: similarByColor } = await api.get('products', {
        filters: { color: detectedColor },
        range: { from: 0, to: 8 }
      });
      
      // Combine results
      const allResults = [...similarByCategory, ...similarByColor];
      
      // Remove duplicates
      const uniqueResults = Array.from(new Set(allResults.map(item => item.id)))
        .map(id => allResults.find(item => item.id === id));
      
      return {
        products: uniqueResults,
        detected: {
          category: detectedCategory,
          color: detectedColor,
          confidence: fashionAnalysis.matches.length > 0 ? fashionAnalysis.matches[0].confidence : 0.5,
          allPredictions: fashionAnalysis.allPredictions
        },
        image_url: imageUrl
      };
    } catch (error) {
      console.error('Error in visual search:', error);
      throw error;
    }
  },

  // Get trending search terms 
  getTrendingSearches: async () => {
    try {
      // First, try to get real trending searches from our search_logs table
      const { data: searchLogs, error } = await api.supabase()
        .from('search_logs')
        .select('query, created_at')
        .not('query', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.warn('Error fetching search logs, falling back to default trends:', error);
        // Table might not exist yet, fallback to defaults
        return {
          trends: [
            'sustainable fashion',
            'linen dress',
            'organic cotton',
            'minimalist style',
            'handcrafted jewelry',
            'vegan leather',
            'artisanal accessories',
            'eco-friendly',
            'natural dyes',
            'traditional craft'
          ],
          source: 'default'
        };
      }
      
      // Process the search logs to find trending terms
      if (searchLogs && searchLogs.length > 0) {
        // Count occurrences of each search term
        const termCounts = {};
        
        searchLogs.forEach(log => {
          if (!log.query) return;
          
          // Split multi-word queries and count individual terms
          const terms = log.query.toLowerCase().split(/\s+/);
          terms.forEach(term => {
            // Ignore very short terms and common words
            if (term.length < 3 || ['the', 'and', 'for', 'with'].includes(term)) return;
            
            termCounts[term] = (termCounts[term] || 0) + 1;
          });
        });
        
        // Convert to array and sort by count
        const sortedTerms = Object.entries(termCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([term]) => term)
          .slice(0, 10); // Take top 10
        
        return {
          trends: sortedTerms.length > 0 ? sortedTerms : [
            'sustainable fashion',
            'linen dress',
            'organic cotton',
            'minimalist style',
            'handcrafted jewelry'
          ],
          source: sortedTerms.length > 0 ? 'search_logs' : 'mixed'
        };
      }
      
      // Fallback if no logs or empty result
      return {
        trends: [
          'sustainable fashion',
          'linen dress',
          'organic cotton',
          'minimalist style',
          'handcrafted jewelry',
          'vegan leather',
          'artisanal accessories',
          'eco-friendly',
          'natural dyes',
          'traditional craft'
        ],
        source: 'default'
      };
    } catch (error) {
      console.error('Error getting trending searches:', error);
      throw error;
    }
  }
};

// Helper function to generate search suggestions
const generateSuggestions = (query, results) => {
  const suggestions = [];
  const lowercaseQuery = query.toLowerCase();
  
  // Add category-based suggestions
  const categories = Array.from(new Set(results.map(item => item.category)));
  categories.slice(0, 3).forEach(category => {
    suggestions.push(`${category} ${lowercaseQuery}`);
  });
  
  // Add style-based suggestions
  if (results.some(item => item.style)) {
    const styles = Array.from(new Set(results.filter(item => item.style).map(item => item.style)));
    styles.slice(0, 2).forEach(style => {
      suggestions.push(`${style} ${lowercaseQuery}`);
    });
  }
  
  // Add material-based suggestions
  if (results.some(item => item.material)) {
    const materials = Array.from(new Set(results.filter(item => item.material).map(item => item.material)));
    materials.slice(0, 2).forEach(material => {
      suggestions.push(`${material} ${lowercaseQuery}`);
    });
  }
  
  // Add generic suggestions
  suggestions.push(
    `sustainable ${lowercaseQuery}`,
    `organic ${lowercaseQuery}`,
    `handcrafted ${lowercaseQuery}`
  );
  
  // Return unique suggestions
  return Array.from(new Set(suggestions)).slice(0, 8);
};

export default searchService;
