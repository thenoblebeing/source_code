// Mock product data with proper transparent PNG clothing assets for virtual try-on
export const mockProducts = [
  // T-Shirt with proper transparent PNGs
  {
    id: 'tshirt-001',
    name: 'Classic Fitted T-Shirt',
    type: 'top',
    category: 'shirts',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    // Using properly designed transparent PNG t-shirts for virtual try-on
    tryOnImages: [
      'https://www.transparentpng.com/thumb/t-shirt/black-t-shirt-png-image-7.png',
      'https://www.transparentpng.com/thumb/t-shirt/white-t-shirt-png-image-6.png',
      'https://png.pngtree.com/png-clipart/20230404/original/pngtree-white-t-shirt-mockup-png-image_9024065.png'
    ],
    variants: [
      { 
        id: 'tshirt-001-white', 
        color: 'White', 
        colorCode: '#FFFFFF', 
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://png.pngtree.com/png-clipart/20230404/original/pngtree-white-t-shirt-mockup-png-image_9024065.png'
      },
      { 
        id: 'tshirt-001-black', 
        color: 'Black', 
        colorCode: '#000000', 
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/t-shirt/black-t-shirt-png-image-7.png'
      },
      { 
        id: 'tshirt-001-grey', 
        color: 'Grey', 
        colorCode: '#808080', 
        image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/t-shirt/white-t-shirt-png-image-6.png'
      }
    ],
    description: 'A comfortable classic fit t-shirt made from 100% organic cotton.',
    tryOnMetadata: {
      shoulderOffset: { x: 0, y: -30 },
      scaleMultiplier: 0.65,
      positioning: 'shoulders'
    }
  },
  
  // Hoodie with transparent PNG
  {
    id: 'hoodie-001',
    name: 'Urban Comfort Hoodie',
    type: 'top',
    category: 'hoodies',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tryOnImages: [
      'https://www.transparentpng.com/thumb/hoodie/black-hoodie-png-8.png',
      'https://www.transparentpng.com/thumb/hoodie/grey-hoodie-png-5.png',
      'https://png.pngtree.com/png-clipart/20210412/original/pngtree-yellow-hoodie-mockup-png-image_6216405.png'
    ],
    variants: [
      { 
        id: 'hoodie-001-black', 
        color: 'Black', 
        colorCode: '#000000', 
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/hoodie/black-hoodie-png-8.png'
      },
      { 
        id: 'hoodie-001-grey', 
        color: 'Grey', 
        colorCode: '#808080', 
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/hoodie/grey-hoodie-png-5.png'
      },
      { 
        id: 'hoodie-001-yellow', 
        color: 'Yellow', 
        colorCode: '#FFD700', 
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://png.pngtree.com/png-clipart/20210412/original/pngtree-yellow-hoodie-mockup-png-image_6216405.png'
      }
    ],
    description: 'Comfortable urban hoodie perfect for casual wear.',
    tryOnMetadata: {
      shoulderOffset: { x: 0, y: -25 },
      scaleMultiplier: 0.75,
      positioning: 'shoulders'
    }
  },

  // Dress with proper transparent PNG
  {
    id: 'dress-001',
    name: 'Summer Floral Dress',
    type: 'full',
    category: 'dresses',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tryOnImages: [
      'https://png.pngtree.com/png-clipart/20210710/original/pngtree-summer-dress-mockup-png-image_6527968.png',
      'https://www.transparentpng.com/thumb/dress/blue-dress-png-image-3.png'
    ],
    variants: [
      { 
        id: 'dress-001-floral', 
        color: 'Floral', 
        colorCode: '#FF69B4', 
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://png.pngtree.com/png-clipart/20210710/original/pngtree-summer-dress-mockup-png-image_6527968.png'
      },
      { 
        id: 'dress-001-blue', 
        color: 'Navy Blue', 
        colorCode: '#000080', 
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/dress/blue-dress-png-image-3.png'
      }
    ],
    description: 'Lightweight summer dress with a beautiful floral pattern.',
    tryOnMetadata: {
      shoulderOffset: { x: 0, y: -15 },
      scaleMultiplier: 0.8,
      positioning: 'full_body'
    }
  },
  
  // Jeans with transparent PNG
  {
    id: 'jeans-001',
    name: 'Slim Fit Jeans',
    type: 'bottom',
    category: 'bottoms',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tryOnImages: [
      'https://www.transparentpng.com/thumb/jeans/blue-jeans-png-image-4.png',
      'https://png.pngtree.com/png-clipart/20210414/original/pngtree-black-jeans-mockup-png-image_6223124.png'
    ],
    variants: [
      { 
        id: 'jeans-001-blue', 
        color: 'Blue', 
        colorCode: '#191970', 
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/jeans/blue-jeans-png-image-4.png'
      },
      { 
        id: 'jeans-001-black', 
        color: 'Black', 
        colorCode: '#000000', 
        image: 'https://images.unsplash.com/photo-1473966968600-fa20b3dbd6b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://png.pngtree.com/png-clipart/20210414/original/pngtree-black-jeans-mockup-png-image_6223124.png'
      }
    ],
    description: 'Comfortable slim fit jeans with a modern look.',
    tryOnMetadata: {
      waistOffset: { x: 0, y: 20 },
      scaleMultiplier: 0.7,
      positioning: 'waist'
    }
  },
  
  // Sunglasses with transparent PNG
  {
    id: 'glasses-001',
    name: 'Aviator Sunglasses',
    type: 'accessory',
    category: 'accessories',
    accessorySubtype: 'glasses',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tryOnImages: [
      'https://www.transparentpng.com/thumb/sunglasses/sunglasses-png-image-25.png',
      'https://png.pngtree.com/png-clipart/20190614/original/pngtree-sunglasses-png-image_3584868.png'
    ],
    variants: [
      { 
        id: 'glasses-001-gold', 
        color: 'Gold', 
        colorCode: '#FFD700', 
        image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://www.transparentpng.com/thumb/sunglasses/sunglasses-png-image-25.png'
      },
      { 
        id: 'glasses-001-silver', 
        color: 'Silver', 
        colorCode: '#C0C0C0', 
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        tryOnImage: 'https://png.pngtree.com/png-clipart/20190614/original/pngtree-sunglasses-png-image_3584868.png'
      }
    ],
    description: 'Classic aviator sunglasses with UV protection.',
    tryOnMetadata: {
      faceOffset: { x: 0, y: -10 },
      scaleMultiplier: 0.25,
      positioning: 'face'
    }
  }
];

// Function to get a product by ID
export const getMockProductById = (id) => {
  for (const product of mockProducts) {
    if (product.id === id) return product;
    const variant = product.variants?.find(v => v.id === id);
    if (variant) return { ...product, ...variant };
  }
  return null;
};

// Function to get all products
export const getAllMockProducts = () => {
  return mockProducts;
};

// Function to get products suitable for virtual try-on
export const getTryOnProducts = () => {
  return mockProducts.filter(product => 
    product.tryOnImages && product.tryOnImages.length > 0
  );
};
