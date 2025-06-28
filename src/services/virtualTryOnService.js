/**
 * Streamlined Virtual Try-On Service
 * 
 * This service provides photo-based virtual try-on using lightweight image processing
 * instead of heavy TensorFlow models for better performance and reliability.
 */

// Virtual Try-On Service with Enhanced Image Loading and CORS Handling
class VirtualTryOnService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.faceDetectionConfidence = 0.7;
  }

  // Initialize canvas for image processing
  initCanvas(width = 800, height = 600) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    return this.canvas;
  }

  // Enhanced image loading with CORS handling and fallbacks
  async loadImageWithFallbacks(imageUrls, productData = null) {
    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    
    for (let i = 0; i < urls.length; i++) {
      try {
        const img = await this.loadSingleImage(urls[i]);
        console.log(`Successfully loaded image from URL ${i + 1}:`, urls[i]);
        return img;
      } catch (error) {
        console.warn(`Failed to load image ${i + 1}:`, urls[i], error);
        if (i === urls.length - 1) {
          // All URLs failed, create a placeholder
          return await this.createPlaceholderImage(productData);
        }
      }
    }
  }

  // Load single image with proper CORS handling and proxy fallback
  loadSingleImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log('Image loaded successfully:', url);
        resolve(img);
      };
      
      img.onerror = (error) => {
        console.error('Image load error:', url, error);
        
        // Try with CORS proxy for problematic domains
        if (url.includes('transparentpng.com') || url.includes('pngtree.com')) {
          console.log('Trying CORS proxy for:', url);
          const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
          const proxyImg = new Image();
          proxyImg.crossOrigin = 'anonymous';
          
          proxyImg.onload = () => {
            console.log('Image loaded via proxy:', proxyUrl);
            resolve(proxyImg);
          };
          
          proxyImg.onerror = () => {
            console.error('Proxy load also failed for:', url);
            reject(new Error(`Failed to load image: ${url}`));
          };
          
          proxyImg.src = proxyUrl;
        } else {
          reject(new Error(`Failed to load image: ${url}`));
        }
      };
      
      // Set CORS for cross-origin images
      if (url.includes('unsplash.com') || url.includes('images.') || 
          url.includes('transparentpng.com') || url.includes('pngtree.com')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!img.complete) {
          reject(new Error(`Image load timeout: ${url}`));
        }
      }, 10000);
    });
  }

  // Create a placeholder image when all URLs fail
  async createPlaceholderImage(productData) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    // Create a clothing shape based on type
    const category = productData?.category || 'clothing';
    
    if (category === 'shirts' || category === 'hoodies') {
      // Draw a t-shirt shape
      ctx.fillStyle = productData?.colorCode || '#4a90e2';
      this.drawTShirtShape(ctx, 50, 100, 300, 250);
    } else if (category === 'dresses') {
      // Draw a dress shape
      ctx.fillStyle = productData?.colorCode || '#e74c3c';
      this.drawDressShape(ctx, 80, 100, 240, 350);
    } else if (category === 'bottoms') {
      // Draw pants shape
      ctx.fillStyle = productData?.colorCode || '#2c3e50';
      this.drawPantsShape(ctx, 100, 200, 200, 250);
    } else {
      // Default rectangular clothing
      ctx.fillStyle = productData?.colorCode || '#95a5a6';
      ctx.fillRect(50, 100, 300, 300);
    }
    
    // Add text overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(productData?.name || 'Clothing Item', 200, 450);
    
    // Convert canvas to image
    const img = new Image();
    img.src = canvas.toDataURL();
    return new Promise(resolve => {
      img.onload = () => resolve(img);
    });
  }

  // Draw t-shirt shape
  drawTShirtShape(ctx, x, y, width, height) {
    ctx.beginPath();
    // Main body
    ctx.rect(x + width * 0.2, y + height * 0.3, width * 0.6, height * 0.7);
    // Sleeves
    ctx.rect(x, y + height * 0.3, width * 0.25, height * 0.4);
    ctx.rect(x + width * 0.75, y + height * 0.3, width * 0.25, height * 0.4);
    // Neck
    ctx.rect(x + width * 0.35, y, width * 0.3, height * 0.4);
    ctx.fill();
  }

  // Draw dress shape
  drawDressShape(ctx, x, y, width, height) {
    ctx.beginPath();
    // Top part
    ctx.rect(x + width * 0.2, y, width * 0.6, height * 0.4);
    // Flowing bottom
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + height * 0.4);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width * 0.8, y + height * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  // Draw pants shape
  drawPantsShape(ctx, x, y, width, height) {
    const legWidth = width * 0.4;
    // Left leg
    ctx.fillRect(x, y, legWidth, height);
    // Right leg  
    ctx.fillRect(x + width - legWidth, y, legWidth, height);
  }

  // Validate image quality before processing
  validateImageQuality(canvas, imageData) {
    const { data, width, height } = imageData;
    
    // Check image dimensions
    if (width < 300 || height < 400) {
      throw new Error('Image too small. Please upload an image at least 300x400 pixels.');
    }
    
    // Check if image is mostly dark or overexposed
    let totalBrightness = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      
      if (brightness < 30) darkPixels++;
      if (brightness > 240) brightPixels++;
    }
    
    const avgBrightness = totalBrightness / (data.length / 4);
    const darkRatio = darkPixels / (data.length / 4);
    const brightRatio = brightPixels / (data.length / 4);
    
    if (avgBrightness < 50) {
      throw new Error('Image too dark. Please take a photo with better lighting.');
    }
    
    if (avgBrightness > 200) {
      throw new Error('Image overexposed. Please reduce lighting or avoid direct flash.');
    }
    
    if (darkRatio > 0.7) {
      throw new Error('Image has too many dark areas. Please improve lighting.');
    }
    
    if (brightRatio > 0.3) {
      throw new Error('Image too bright. Please avoid harsh lighting or flash.');
    }
    
    return { valid: true, avgBrightness, darkRatio, brightRatio };
  }

  // Enhanced face and body detection
  async detectFace(imageData) {
    const { data, width, height } = imageData;
    
    // First validate image quality
    const validation = this.validateImageQuality(null, imageData);
    console.log('Image quality validation:', validation);
    
    const skinPixels = [];
    let totalSkinArea = 0;
    
    // Analyze pixels for skin tone detection with spatial awareness
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (this.isSkinTone(r, g, b)) {
        const x = (i / 4) % width;
        const y = Math.floor((i / 4) / width);
        skinPixels.push({ x, y, intensity: (r + g + b) / 3, r, g, b });
        totalSkinArea++;
      }
    }
    
    // Check if we have enough skin pixels for reliable detection
    const skinRatio = totalSkinArea / (width * height);
    console.log('Skin detection - pixels:', totalSkinArea, 'ratio:', skinRatio);
    
    if (totalSkinArea < 500) {
      throw new Error('Unable to detect person in image. Please ensure you are clearly visible.');
    }
    
    if (skinRatio < 0.05) {
      throw new Error('Person not clearly visible. Please move closer to camera or improve lighting.');
    }
    
    if (skinRatio > 0.4) {
      throw new Error('Too much skin detected. Please wear more clothing or check image quality.');
    }
    
    // Find face center and boundaries with improved algorithm
    const faceRegion = this.findFaceRegion(skinPixels, width, height);
    console.log('Detected face region:', faceRegion);
    
    if (!faceRegion || faceRegion.confidence < 0.3) {
      throw new Error('Face not clearly detected. Please face the camera directly with good lighting.');
    }
    
    return faceRegion;
  }

  // Enhanced skin tone detection with better accuracy
  isSkinTone(r, g, b) {
    // More comprehensive skin tone detection
    const skinRanges = [
      // Light skin tones
      { rMin: 220, rMax: 255, gMin: 170, gMax: 230, bMin: 160, bMax: 220 },
      { rMin: 180, rMax: 255, gMin: 120, gMax: 200, bMin: 100, bMax: 180 },
      // Medium skin tones  
      { rMin: 140, rMax: 220, gMin: 90, gMax: 170, bMin: 70, bMax: 140 },
      { rMin: 100, rMax: 180, gMin: 60, gMax: 130, bMin: 40, bMax: 100 },
      // Darker skin tones
      { rMin: 60, rMax: 140, gMin: 30, gMax: 90, bMin: 20, bMax: 70 },
      { rMin: 30, rMax: 100, gMin: 15, gMax: 60, bMin: 10, bMax: 50 }
    ];
    
    // Check if pixel matches any skin range
    const matchesSkinRange = skinRanges.some(range => 
      r >= range.rMin && r <= range.rMax &&
      g >= range.gMin && g <= range.gMax &&
      b >= range.bMin && b <= range.bMax
    );
    
    // Additional checks for skin-like properties
    const colorVariation = Math.max(r, g, b) - Math.min(r, g, b);
    const rgRatio = r > 0 ? g / r : 0;
    const rbRatio = r > 0 ? b / r : 0;
    
    // Skin typically has more red than blue, and good color variation
    const hasSkinProperties = colorVariation > 10 && 
                             rgRatio > 0.4 && rgRatio < 1.2 &&
                             rbRatio > 0.3 && rbRatio < 1.0 &&
                             r > b; // Red usually dominates blue in skin
    
    return matchesSkinRange && hasSkinProperties;
  }

  // Find face region from skin pixels
  findFaceRegion(skinPixels, width, height) {
    if (skinPixels.length === 0) return null;
    
    // Sort by Y coordinate to find top face area
    skinPixels.sort((a, b) => a.y - b.y);
    const topQuartile = skinPixels.slice(0, Math.floor(skinPixels.length * 0.3));
    
    // Find center of top face region
    const avgX = topQuartile.reduce((sum, p) => sum + p.x, 0) / topQuartile.length;
    const avgY = topQuartile.reduce((sum, p) => sum + p.y, 0) / topQuartile.length;
    
    // Estimate face dimensions (typical proportions)
    const faceWidth = width * 0.15; // Face is about 15% of image width
    const faceHeight = height * 0.2; // Face is about 20% of image height
    
    return {
      centerX: avgX,
      centerY: avgY,
      width: faceWidth,
      height: faceHeight,
      topY: avgY - faceHeight / 2,
      confidence: Math.min(skinPixels.length / 1000, 1)
    };
  }

  // Calculate body proportions using standard human anatomy
  calculateBodyProportions(faceRegion, imageWidth, imageHeight) {
    if (!faceRegion) {
      // Fallback measurements when face detection fails
      return {
        shoulderY: imageHeight * 0.25,
        chestY: imageHeight * 0.35,
        waistY: imageHeight * 0.55,
        bodyWidth: imageWidth * 0.6,
        bodyHeight: imageHeight * 0.8
      };
    }
    
    const headHeight = faceRegion.height;
    const bodyStartY = faceRegion.centerY + headHeight * 0.5;
    
    // Standard human proportions (8 head lengths total)
    return {
      shoulderY: bodyStartY + headHeight * 0.5,        // 1.5 heads from top
      chestY: bodyStartY + headHeight * 1.5,           // 2.5 heads from top  
      waistY: bodyStartY + headHeight * 3,             // 4.5 heads from top
      bodyWidth: faceRegion.width * 2.8,               // Shoulders ~2.8x face width
      bodyHeight: headHeight * 6.5,                    // Body is ~6.5 head lengths
      centerX: faceRegion.centerX
    };
  }

  // Position clothing on body based on garment type
  positionClothing(clothingImg, bodyProps, clothingType, metadata = {}) {
    const positioning = metadata.positioning || this.getClothingPositioning(clothingType);
    const scale = metadata.scaleMultiplier || 1;
    
    let targetX, targetY, targetWidth, targetHeight;
    
    switch (positioning) {
      case 'face':
        targetX = (bodyProps.centerX || bodyProps.bodyWidth / 2) - (bodyProps.bodyWidth * 0.2 * scale) / 2;
        targetY = bodyProps.shoulderY * 0.3; // Position at top of face area
        targetWidth = bodyProps.bodyWidth * 0.2 * scale;
        targetHeight = targetWidth * 0.6;
        break;
        
      case 'shoulders':
      case 'chest':
        targetX = (bodyProps.centerX || bodyProps.bodyWidth / 2) - (bodyProps.bodyWidth * scale) / 2;
        targetY = bodyProps.shoulderY + (metadata.shoulderOffset?.y || 0);
        targetWidth = bodyProps.bodyWidth * scale;
        targetHeight = (clothingImg.height / clothingImg.width) * targetWidth;
        break;
        
      case 'waist':
        targetX = (bodyProps.centerX || bodyProps.bodyWidth / 2) - (bodyProps.bodyWidth * 0.9 * scale) / 2;
        targetY = bodyProps.waistY + (metadata.waistOffset?.y || 0);
        targetWidth = bodyProps.bodyWidth * 0.9 * scale;
        targetHeight = (clothingImg.height / clothingImg.width) * targetWidth;
          break;
          
      case 'full_body':
        targetX = (bodyProps.centerX || bodyProps.bodyWidth / 2) - (bodyProps.bodyWidth * scale) / 2;
        targetY = bodyProps.shoulderY;
        targetWidth = bodyProps.bodyWidth * scale;
        targetHeight = bodyProps.bodyHeight * 0.9;
          break;
          
      default:
        // Default to chest positioning
        targetX = (bodyProps.centerX || bodyProps.bodyWidth / 2) - (bodyProps.bodyWidth * scale) / 2;
        targetY = bodyProps.chestY;
        targetWidth = bodyProps.bodyWidth * scale;
        targetHeight = (clothingImg.height / clothingImg.width) * targetWidth;
    }
    
    return { targetX, targetY, targetWidth, targetHeight };
  }

  // Get default positioning for clothing types
  getClothingPositioning(clothingType) {
    const positioningMap = {
      'shirts': 'shoulders',
      'tops': 'shoulders', 
      'hoodies': 'shoulders',
      'sweaters': 'shoulders',
      'jackets': 'shoulders',
      'dresses': 'full_body',
      'bottoms': 'waist',
      'jeans': 'waist',
      'pants': 'waist',
      'shorts': 'waist',
      'accessories': 'face',
      'glasses': 'face',
      'hats': 'face'
    };
    
    return positioningMap[clothingType] || 'chest';
  }

  // Main try-on function with enhanced error handling
  async performTryOn(userPhoto, productData) {
    try {
      console.log('Starting virtual try-on process...');
      console.log('Product data:', productData);
      
      // Initialize canvas
      const canvas = this.initCanvas(800, 600);
      
      // Load user photo
      console.log('Loading user photo...');
      const userImg = await this.loadImageWithFallbacks([userPhoto]);
      
      // Get clothing images with fallbacks
      const clothingUrls = [
        productData.tryOnImage,
        ...(productData.tryOnImages || []),
        productData.image
      ].filter(Boolean);
      
      console.log('Loading clothing images:', clothingUrls);
      const clothingImg = await this.loadImageWithFallbacks(clothingUrls, productData);
      console.log('Clothing image loaded:', clothingImg.width, 'x', clothingImg.height);
      
      // Resize canvas to match user image
      canvas.width = userImg.width;
      canvas.height = userImg.height;
      console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
      
      // Draw user photo as background
      this.ctx.drawImage(userImg, 0, 0);
      console.log('User photo drawn to canvas');
      
      // Get image data for face detection
      const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detect face (with fallback handling)
      let faceRegion;
      try {
        faceRegion = await this.detectFace(imageData);
        console.log('Face detection successful');
      } catch (error) {
        console.warn('Face detection failed, using fallback positioning:', error.message);
        faceRegion = null;
      }
      
      // Calculate body proportions
      const bodyProps = this.calculateBodyProportions(faceRegion, canvas.width, canvas.height);
      console.log('Body proportions calculated:', bodyProps);
      
      // Position clothing
      const clothingPosition = this.positionClothing(
        clothingImg, 
        bodyProps, 
        productData.category,
        productData.tryOnMetadata
      );
      
      console.log('Clothing positioned at:', clothingPosition);
      
      // Apply clothing with enhanced realistic blending
      this.ctx.globalCompositeOperation = 'source-over';
      
      // Create a more realistic overlay effect
      // First, apply clothing with slight transparency for natural look
      this.ctx.globalAlpha = 0.95;
      
      // Add realistic shadow and depth
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 1;
      this.ctx.shadowOffsetY = 3;
      
      console.log('Drawing clothing at position:', clothingPosition);
      this.ctx.drawImage(
        clothingImg,
        clothingPosition.targetX,
        clothingPosition.targetY,
        clothingPosition.targetWidth,
        clothingPosition.targetHeight
      );
      
      // Add subtle body contour adjustments for better fitting
      if (productData.category === 'shirts' || productData.category === 'hoodies') {
        // Add slight body curve effect for shirts/hoodies
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.globalAlpha = 0.1;
        
        const gradient = this.ctx.createRadialGradient(
          clothingPosition.targetX + clothingPosition.targetWidth / 2,
          clothingPosition.targetY + clothingPosition.targetHeight / 3,
          0,
          clothingPosition.targetX + clothingPosition.targetWidth / 2,
          clothingPosition.targetY + clothingPosition.targetHeight / 3,
          clothingPosition.targetWidth / 2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
          clothingPosition.targetX,
          clothingPosition.targetY,
          clothingPosition.targetWidth,
          clothingPosition.targetHeight
        );
      }
      
      console.log('Clothing overlay applied successfully');
      
      // Reset context
      this.ctx.globalAlpha = 1;
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      
      // Return result
      const resultDataUrl = canvas.toDataURL('image/png', 0.9);
      console.log('Virtual try-on completed successfully');
      
      return {
        success: true,
        image: resultDataUrl,
        metadata: {
          faceDetected: !!faceRegion,
          clothingPosition,
          bodyProps
        }
      };
      
    } catch (error) {
      console.error('Virtual try-on failed:', error);
      throw new Error(`Virtual try-on failed: ${error.message}`);
    }
  }

  // Generate multiple try-on results for different variants
  async generateMultipleTryOns(userPhoto, product) {
    const results = [];
    
    if (!product.variants || product.variants.length === 0) {
      // Single product without variants
      const result = await this.performTryOn(userPhoto, product);
      results.push({
        ...result,
        variantId: product.id,
        variantName: product.name,
        variantColor: 'Default'
      });
    } else {
      // Multiple variants
      for (const variant of product.variants) {
        try {
          const variantData = { ...product, ...variant };
          const result = await this.performTryOn(userPhoto, variantData);
          results.push({
            ...result,
            variantId: variant.id,
            variantName: variant.color || variant.name,
            variantColor: variant.color
          });
        } catch (error) {
          console.error(`Failed to generate try-on for variant ${variant.id}:`, error);
          // Continue with other variants
        }
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const virtualTryOnService = new VirtualTryOnService();
export default virtualTryOnService;

