import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';

// Logo path from public folder
const logoPath = '/NobleBeingLOGO.jpg';

const NavContainer = styled(motion.nav)`
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  height: 50px;
  
  img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(motion.div)`
  position: relative;
  
  a {
    color: var(--sage-green);
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    padding: 0.5rem 0;
    display: block;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--neon-magenta);
      text-decoration: none; /* Ensure no underline on hover */
    }
  }
`;

const Indicator = styled(motion.div)`
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--neon-magenta), var(--neon-cyan));
  border-radius: 2px;
`;

const SearchCartContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled(motion.input)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: var(--white);
  width: 220px;
  outline: none;
  
  &:focus {
    border-color: var(--neon-magenta);
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const IconButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: var(--soft-gold);
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--neon-magenta);
  }
`;

const CartBadge = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  background: var(--neon-magenta);
  color: var(--white);
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  background: transparent;
  border: none;
  color: var(--soft-gold);
  cursor: pointer;
  width: 40px;
  height: 40px;
  padding: 0;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80%;
  max-width: 300px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  z-index: 200;
  padding: 2rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MobileSearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.8rem 1rem;
  color: var(--white);
  width: 100%;
  outline: none;
  
  &:focus {
    border-color: var(--soft-gold);
    box-shadow: 0 0 10px rgba(212, 160, 23, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const MobileMenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 199;
`;

const MobileNavLink = styled(motion.div)`
  a {
    color: var(--white);
    font-size: 1.2rem;
    font-weight: 500;
    text-decoration: none;
    padding: 1rem 0;
    display: block;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

// SVG icons for Cart, User, and Menu
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--soft-gold)" fillOpacity="0.8"/>
    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--soft-gold)" fillOpacity="0.8"/>
    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--soft-gold)" fillOpacity="0.8"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--soft-gold)" fillOpacity="0.8"/>
    <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Navigation component
const FuturisticNavigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { cartItems, itemCount } = useCart();
  
  // Track scroll position to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Navigation links
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'MY CRAFT', path: '/my-craft' },
    { name: 'Virtual Try-On', path: '/virtual-try-on' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  return (
    <>
      <NavContainer
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.2)' : 'none',
          background: scrolled ? 'rgba(30, 30, 30, 0.9)' : 'rgba(30, 30, 30, 0.8)'
        }}
      >
        <Link to="/">
          <Logo
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={logoPath} alt="The Noble Being Logo" />
          </Logo>
        </Link>
        
        <NavLinks>
          {links.map((link) => (
            <NavLink key={link.path}>
              <Link to={link.path}>{link.name}</Link>
              {location.pathname === link.path && (
                <Indicator 
                  layoutId="nav-indicator" 
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          ))}
        </NavLinks>
        
        <SearchCartContainer>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Try 'sage green dress'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              initial={{ width: 180 }}
              whileFocus={{ width: 250 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div 
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                right: '12px',
                opacity: 0.7,
                cursor: 'pointer'
              }}
              whileHover={{ opacity: 1 }}
            >
              <SearchIcon />
            </motion.div>
          </SearchContainer>
          
          <Link to="/cart">
            <IconButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <CartIcon />
              {itemCount > 0 && (
                <CartBadge
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {itemCount}
                </CartBadge>
              )}
            </IconButton>
          </Link>
          
          <Link to="/profile">
            <IconButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <UserIcon />
            </IconButton>
          </Link>
          
          <MobileMenuButton 
            onClick={() => setMobileMenuOpen(true)}
            whileTap={{ scale: 0.9 }}
          >
            <MenuIcon />
          </MobileMenuButton>
        </SearchCartContainer>
      </NavContainer>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <MobileMenuOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <MobileMenu
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <Logo style={{ fontSize: '1.5rem' }}>TheNobleBeing</Logo>
                <IconButton onClick={() => setMobileMenuOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </div>
              
              <div>
                <MobileSearchInput
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {links.map((link, index) => (
                  <MobileNavLink 
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={link.path}>{link.name}</Link>
                  </MobileNavLink>
                ))}
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                <Link to="/cart" style={{ flex: 1 }}>
                  <motion.button
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: 'var(--soft-gold)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'var(--deep-charcoal)',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CartIcon />
                    Cart ({itemCount})
                  </motion.button>
                </Link>
                
                <Link to="/profile" style={{ flex: 1 }}>
                  <motion.button
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: 'var(--sage-green)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'var(--white)',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserIcon />
                    Account
                  </motion.button>
                </Link>
              </div>
            </MobileMenu>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FuturisticNavigation;
