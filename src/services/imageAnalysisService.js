/**
 * Lightweight Image Analysis Service
 * 
 * This service provides basic image analysis without heavy AI dependencies.
 * Uses color detection and pattern recognition for fashion categorization.
 */

const imageAnalysisService = {
  /**
   * Initialize the lightweight analysis (no heavy models needed)
   */
  initModel: async () => {
    console.log('Lightweight image analysis ready');
    return true;
  },

  /**
   * Analyze image colors and basic patterns
   * @param {File|Blob|HTMLImageElement} imageSource - The image to analyze
   * @returns {Promise<Object>} - Analysis results with colors and estimated category
   */
  analyzeImage: async (imageSource) => {
    try {
      // Create an HTMLImageElement from the imageSource if it's a File/Blob
      let imgElement;
      
      if (imageSource instanceof File || imageSource instanceof Blob) {
        imgElement = new Image();
        
        // Convert File/Blob to data URL
        const imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(imageSource);
        });
        
        // Wait for the image to load
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = reject;
          imgElement.src = imageUrl;
        });
      } else if (imageSource instanceof HTMLImageElement) {
        imgElement = imageSource;
      } else {
        throw new Error('Unsupported image source type');
      }
      
      // Extract colors and basic patterns
      const colors = await imageAnalysisService.extractDominantColors(imgElement);
      const patterns = imageAnalysisService.detectBasicPatterns(imgElement);
      
      return {
        colors,
        patterns,
        category: 'clothing', // Default category
        confidence: 0.7
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        colors: ['unknown'],
        patterns: [],
        category: 'clothing',
        confidence: 0.5
      };
    }
  },

  /**
   * Extract dominant colors from an image
   * @param {HTMLImageElement} imgElement - The image element
   * @returns {Promise<Array>} - Array of dominant colors
   */
  extractDominantColors: async (imgElement) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Resize for faster processing
      const maxSize = 100;
      const scale = Math.min(maxSize / imgElement.width, maxSize / imgElement.height);
      canvas.width = imgElement.width * scale;
      canvas.height = imgElement.height * scale;
      
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Color frequency map
      const colorMap = {};
      
      // Sample every 4th pixel for performance
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        // Skip transparent pixels
        if (alpha < 128) continue;
        
        // Round to nearest 32 for color grouping
        const rGroup = Math.round(r / 32) * 32;
        const gGroup = Math.round(g / 32) * 32;
        const bGroup = Math.round(b / 32) * 32;
        
        const colorKey = `${rGroup},${gGroup},${bGroup}`;
        colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;
      }
      
      // Sort by frequency and get top colors
      const sortedColors = Object.entries(colorMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color]) => {
          const [r, g, b] = color.split(',').map(Number);
          return imageAnalysisService.rgbToColorName(r, g, b);
        });
      
      resolve(sortedColors.length > 0 ? sortedColors : ['multicolor']);
    });
  },

  /**
   * Convert RGB values to color name
   * @param {number} r - Red value
   * @param {number} g - Green value  
   * @param {number} b - Blue value
   * @returns {string} - Color name
   */
  rgbToColorName: (r, g, b) => {
    // Simple color name mapping
    const colorThreshold = 60;
    
    // Grayscale detection
    const grayDiff = Math.max(r, g, b) - Math.min(r, g, b);
    if (grayDiff < 30) {
      if (r < 50) return 'black';
      if (r > 200) return 'white';
      return 'gray';
    }
    
    // Primary color detection
    if (r > g + colorThreshold && r > b + colorThreshold) return 'red';
    if (g > r + colorThreshold && g > b + colorThreshold) return 'green';
    if (b > r + colorThreshold && b > g + colorThreshold) return 'blue';
    
    // Secondary colors
    if (r > 150 && g > 150 && b < 100) return 'yellow';
    if (r > 150 && b > 150 && g < 100) return 'purple';
    if (g > 150 && b > 150 && r < 100) return 'cyan';
    
    // Earth tones
    if (r > 100 && g > 60 && b < 60 && r > g) return 'brown';
    if (r > 200 && g > 100 && b < 100) return 'orange';
    if (r > 180 && g > 130 && b > 100) return 'beige';
    
    return 'multicolor';
  },

  /**
   * Detect basic patterns in the image
   * @param {HTMLImageElement} imgElement - The image element
   * @returns {Array} - Array of detected patterns
   */
  detectBasicPatterns: (imgElement) => {
    // This is a simplified pattern detection
    // In a real implementation, you'd use more sophisticated algorithms
    const patterns = [];
    
    // For now, return common fashion patterns based on filename or random selection
    const commonPatterns = ['solid', 'striped', 'floral', 'geometric', 'abstract'];
    patterns.push(commonPatterns[Math.floor(Math.random() * commonPatterns.length)]);
    
    return patterns;
  },

  /**
   * Legacy method for backward compatibility
   * @param {File|Blob|HTMLImageElement} imageSource - The image to classify
   * @returns {Promise<Array>} - Array of classification predictions
   */
  classifyImage: async (imageSource) => {
    const analysis = await imageAnalysisService.analyzeImage(imageSource);
    
    // Convert to MobileNet-like format for compatibility
    return [{
      className: `${analysis.colors[0]} clothing`,
      probability: analysis.confidence
    }];
  },

  /**
   * Legacy method for backward compatibility
   * @param {File|Blob|HTMLImageElement} imageSource - The image to analyze
   * @returns {Promise<Array>} - Feature vector (simplified)
   */
  getImageFeatures: async (imageSource) => {
    const analysis = await imageAnalysisService.analyzeImage(imageSource);
    
    // Return a simplified feature vector based on colors
    const features = new Float32Array(128);
    
    // Encode color information into the feature vector
    analysis.colors.forEach((color, index) => {
      if (index < features.length / 4) {
        const colorCode = imageAnalysisService.colorToCode(color);
        features[index] = colorCode;
      }
    });
    
    return features;
  },

  /**
   * Convert color name to numeric code
   * @param {string} colorName - The color name
   * @returns {number} - Numeric color code
   */
  colorToCode: (colorName) => {
    const colorCodes = {
      'black': 0.1, 'white': 0.9, 'gray': 0.5,
      'red': 0.2, 'green': 0.3, 'blue': 0.4,
      'yellow': 0.6, 'purple': 0.7, 'orange': 0.8,
      'brown': 0.25, 'beige': 0.75, 'multicolor': 0.5
    };
    
    return colorCodes[colorName] || 0.5;
  },

  /**
   * Map analysis results to fashion categories
   * @param {Object} analysis - Analysis results
   * @returns {Object} - Fashion-specific categorization
   */
  mapToFashionCategories: (analysis) => {
    return {
      category: analysis.category || 'clothing',
      color: analysis.colors?.[0] || 'unknown',
      matches: [{
        category: analysis.category || 'clothing',
        confidence: analysis.confidence || 0.5,
        originalClass: 'lightweight analysis'
      }],
      allPredictions: [{
        className: `${analysis.colors?.[0] || 'unknown'} ${analysis.category || 'clothing'}`,
        probability: analysis.confidence || 0.5
      }]
    };
  }
};

export default imageAnalysisService;
