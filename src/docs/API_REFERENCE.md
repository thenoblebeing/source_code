# The Noble Being - API Reference

This document outlines the API structure and implementation details for The Noble Being website. It serves as a reference for both frontend and backend developers.

## Table of Contents

1. [Overview](#overview)
2. [API Base URL](#api-base-url)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Products](#products)
   - [Cart](#cart)
   - [User/Auth](#userauth)
   - [Craft](#craft)
   - [Retro Collection](#retro-collection)
   - [Contact](#contact)
5. [Backend Implementation Guide](#backend-implementation-guide)
6. [Error Handling](#error-handling)

## Overview

The Noble Being website uses a RESTful API architecture to communicate between the frontend React application and the backend server. All API requests are handled through axios, with centralized configuration and error handling.

## API Base URL

The API base URL is configured in the environment variables:

- Development: `http://localhost:5000/api`
- Production: Set via environment variable `REACT_APP_API_BASE_URL`

## Authentication

The API uses JWT (JSON Web Token) authentication:

- Tokens are stored in localStorage as `authToken`
- Tokens are attached to all authenticated requests in the Authorization header
- Token format: `Bearer [token]`

## API Endpoints

### Products

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|----------------|
| `/products` | GET | Get all products with optional filtering | No |
| `/products/:id` | GET | Get a specific product by ID | No |
| `/products/featured` | GET | Get featured products | No |
| `/products/new-arrivals` | GET | Get new arrivals | No |
| `/products/best-sellers` | GET | Get best-selling products | No |
| `/products/category/:category` | GET | Get products by category | No |
| `/products/search` | GET | Search products by query term | No |
| `/products/related/:id` | GET | Get products related to a specific product | No |

**Query Parameters:**
- `category`: Filter by category
- `color`: Filter by color
- `size`: Filter by available size
- `price_min`: Filter by minimum price
- `price_max`: Filter by maximum price
- `limit`: Limit number of results
- `page`: Pagination page number
- `query`: Search term (for /search endpoint)

**Product Object Structure:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "original_price": "number",
  "discount_percentage": "number",
  "category": "string",
  "subcategory": "string",
  "sizes": ["string"],
  "colors": ["string"],
  "images": ["string"],
  "thumbnail": "string",
  "featured": "boolean",
  "new_arrival": "boolean",
  "bestseller": "boolean",
  "available": "boolean",
  "crafting_technique": "string",
  "materials": ["string"],
  "artisan": "string",
  "region": "string",
  "sustainable_features": ["string"],
  "care_instructions": "string",
  "reviews": [
    {
      "id": "string",
      "user_id": "string",
      "user_name": "string",
      "rating": "number",
      "comment": "string",
      "date": "string"
    }
  ],
  "average_rating": "number",
  "related_products": ["string"]
}
```

### Cart

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|----------------|
| `/cart` | GET | Get cart for current user | Yes |
| `/cart/add` | POST | Add item to cart | Yes |
| `/cart/items/:id` | PUT | Update cart item quantity | Yes |
| `/cart/items/:id` | DELETE | Remove item from cart | Yes |
| `/cart` | DELETE | Clear cart | Yes |
| `/cart/promo` | POST | Apply promo code | Yes |
| `/cart/checkout` | POST | Process checkout | Yes |

**Request Body for Add to Cart:**
```json
{
  "product_id": "string",
  "quantity": "number",
  "size": "string",
  "color": "string"
}
```

**Cart Object Structure:**
```json
{
  "id": "string",
  "user_id": "string",
  "items": [
    {
      "id": "string",
      "product_id": "string",
      "product_name": "string",
      "quantity": "number",
      "price": "number",
      "size": "string",
      "color": "string",
      "thumbnail": "string"
    }
  ],
  "subtotal": "number",
  "discount": "number",
  "shipping": "number",
  "total": "number",
  "promo_code": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### User/Auth

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|----------------|
| `/auth/register` | POST | Register a new user | No |
| `/auth/login` | POST | User login | No |
| `/auth/logout` | POST | User logout | Yes |
| `/auth/refresh` | POST | Refresh authentication token | No |
| `/auth/password/forgot` | POST | Request password reset | No |
| `/auth/password/reset` | POST | Reset password with token | No |
| `/user/profile` | GET | Get user profile | Yes |
| `/user/profile` | PUT | Update user profile | Yes |
| `/user/orders` | GET | Get user order history | Yes |
| `/user/orders/:id` | GET | Get specific order details | Yes |
| `/user/wishlist` | GET | Get user wishlist | Yes |
| `/user/wishlist` | POST | Add product to wishlist | Yes |
| `/user/wishlist/:id` | DELETE | Remove product from wishlist | Yes |

**Login Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Login Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

**User Object Structure:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postal_code": "string",
    "country": "string"
  },
  "role": "string",
  "preferences": {
    "newsletter": "boolean",
    "marketing": "boolean"
  },
  "created_at": "string",
  "last_login": "string"
}
```

### Craft

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|----------------|
| `/craft/artisans` | GET | Get all artisans | No |
| `/craft/artisans/:id` | GET | Get artisan by ID | No |
| `/craft/artisans/featured` | GET | Get featured artisans | No |
| `/craft/techniques` | GET | Get all craft techniques | No |
| `/craft/techniques/:id` | GET | Get technique by ID | No |
| `/craft/workshops` | GET | Get upcoming workshops | No |
| `/craft/workshops/:id/register` | POST | Register for a workshop | Yes |
| `/craft/stories` | GET | Get craft stories | No |

### Retro Collection

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|----------------|
| `/retro/products` | GET | Get retro products with optional era filter | No |
| `/retro/products/:id` | GET | Get retro product by ID | No |
| `/retro/products/featured` | GET | Get featured retro products | No |
| `/retro/eras` | GET | Get all available eras | No |
| `/retro/stats` | GET | Get retro collection statistics | No |

**Query Parameters for `/retro/products`:**
- `era`: Filter by era (e.g., "1950s", "1960s")
- `limit`: Limit number of results (default: 20)
- `offset`: Offset for pagination (default: 0)
- `sort`: Sort order (e.g., "price_asc", "price_desc", "newest")

**Retro Product Object Structure:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "original_price": "number",
  "discount_percentage": "number",
  "year": "string",
  "era": "string",
  "images": ["string"],
  "thumbnail": "string",
  "available": "boolean",
  "sizes": ["string"],
  "colors": ["string"],
  "materials": ["string"],
  "care_instructions": "string",
  "featured": "boolean",
  "new_arrival": "boolean",
  "bestseller": "boolean"
}
```

### Contact

| Endpoint | Method | Description | Auth Required |
### Company

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|----------------|
| `/company/info` | GET | Get company information | No |
| `/company/story` | GET | Get company story | No |
| `/company/mission-values` | GET | Get mission and values | No |
| `/company/team` | GET | Get team members | No |
| `/company/sustainability` | GET | Get sustainability practices | No |
| `/company/careers` | GET | Get career opportunities | No |
| `/company/press` | GET | Get press releases and media | No |

**Company Story Object:**
```json
{
  "title": "string",
  "content": "string",
  "images": ["string"],
  "timeline": [
    {
      "year": "number",
      "title": "string",
      "description": "string"
    }
  ]
}
```

**Team Member Object:**
```json
{
  "id": "string",
  "name": "string",
  "role": "string",
  "bio": "string",
  "image": "string",
  "social_media": {
    "linkedin": "string",
    "twitter": "string",
    "instagram": "string"
  }
}
```

## Backend Implementation Guide

### Technology Stack Recommendations

- **Node.js + Express**: For the API server
- **MongoDB**: For the database (with Mongoose ODM)
- **JWT**: For authentication
- **Multer**: For file uploads (product images)
- **Cloudinary**: For image storage and optimization

### Project Structure

```
/server
├── config/              # Configuration files
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
├── models/              # Database models
├── routes/              # API route definitions
├── utils/               # Utility functions
├── uploads/             # Temporary upload directory
├── .env                 # Environment variables
├── server.js            # Main entry point
└── package.json         # Dependencies and scripts
```

### Getting Started

1. Create a new Node.js project:
   ```bash
   mkdir noble-being-api
   cd noble-being-api
   npm init -y
   ```

2. Install required dependencies:
   ```bash
   npm install express mongoose jsonwebtoken bcrypt dotenv cors multer cloudinary
   npm install --save-dev nodemon
   ```

3. Create `.env` file with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/noble-being
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. Set up `server.js`:
   ```javascript
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const dotenv = require('dotenv');

   // Load environment variables
   dotenv.config();

   // Initialize Express app
   const app = express();

   // Middleware
   app.use(cors());
   app.use(express.json());

   // Connect to MongoDB
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('Connected to MongoDB'))
     .catch(err => console.error('MongoDB connection error:', err));

   // API Routes
   app.use('/api/products', require('./routes/productRoutes'));
   app.use('/api/cart', require('./routes/cartRoutes'));
   app.use('/api/auth', require('./routes/authRoutes'));
   app.use('/api/users', require('./routes/userRoutes'));
   app.use('/api/artisans', require('./routes/artisanRoutes'));
   app.use('/api/craft', require('./routes/craftRoutes'));
   app.use('/api/contact', require('./routes/contactRoutes'));
   app.use('/api/newsletter', require('./routes/newsletterRoutes'));
   app.use('/api/faqs', require('./routes/faqRoutes'));
   app.use('/api/locations', require('./routes/locationRoutes'));

   // Start server
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

5. Create necessary models, routes, and controllers for each resource.

## Error Handling

The API returns standardized error responses:

```json
{
  "error": {
    "status": 400,
    "message": "Description of the error",
    "details": "Additional error details when available"
  }
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Resource created successfully
- `400`: Bad request (client error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `500`: Server error

## Frontend Integration

The frontend React app integrates with the API using the service modules in the `src/services` directory:

- `api.js`: Base API configuration
- `productService.js`: Product-related API calls
- `cartService.js`: Shopping cart operations
- `userService.js`: User authentication and profile
- `craftService.js`: Artisan and craft-related features
- `contactService.js`: Contact forms and FAQs

Example usage in a React component:

```jsx
import { useEffect, useState } from 'react';
import productService from '../services/productService';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Our Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            {/* Additional product details */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

This API reference document should be updated as the backend implementation evolves.
