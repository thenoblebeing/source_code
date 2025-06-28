import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUser } from 'react-icons/fi';
import '../styles/Navigation.css';

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav>
      <Link to="/" className="logo">
        <h1>TheNobleBeing</h1>
      </Link>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/my-craft">MY CRAFT</Link>
        <Link to="/virtual-try-on">Virtual Try-On</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      
      <div className="search-cart">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Try 'sage green dress'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn">Search</button>
        </div>
        
        <div className="icons">
          <Link to="/cart" style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#D4AF37',
            margin: '0 8px',
            transition: 'all 0.3s ease'
          }}>
            <FiShoppingBag size={24} />
          </Link>
          <Link to="/account" style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#D4AF37',
            margin: '0 8px',
            transition: 'all 0.3s ease'
          }}>
            <FiUser size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
