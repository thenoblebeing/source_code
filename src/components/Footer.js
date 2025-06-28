import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterContainer = styled.footer`
  background: var(--deep-charcoal);
  padding: 5rem 2rem 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    background: linear-gradient(90deg, var(--terracotta), var(--sage-green), var(--soft-gold));
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  color: var(--soft-gold);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 2px;
    background: var(--terracotta);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  a {
    color: var(--sandstone-beige);
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 1rem;
    
    &:hover {
      color: var(--terracotta);
      transform: translateX(5px);
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--sandstone-beige);
  text-decoration: none;
  transition: all 0.3s ease;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    color: var(--terracotta);
    transform: translateX(5px);
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NewsletterInput = styled.input`
  padding: 0.8rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--sage-green);
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: var(--terracotta);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const NewsletterButton = styled(motion.button)`
  padding: 0.8rem 1rem;
  border-radius: 4px;
  border: none;
  background: var(--terracotta);
  color: var(--white);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #d1604c;
  }
`;

const TagLine = styled.div`
  margin-top: auto;
  
  h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: var(--terracotta);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--sandstone-beige);
    font-size: 0.9rem;
    opacity: 0.8;
    line-height: 1.6;
  }
`;

const Copyright = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding-top: 2rem;
  margin-top: 3rem;
  border-top: 1px solid rgba(217, 194, 166, 0.2);
  color: var(--sage-green);
  font-size: 0.9rem;
  opacity: 0.7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PaymentIcons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  
  svg {
    width: 32px;
    height: 20px;
    opacity: 0.5;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 1;
    }
  }
`;

// SVG Icons
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" fill="currentColor"/>
  </svg>
);

const VisaIcon = () => (
  <svg viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <path d="M15.309 15.46h-2.12l1.323-8.08h2.12l-1.323 8.08zm-3.688-8.08l-2.02 5.55-.24-1.2-.72-3.66s-.087-.69-.996-.69H4.182l-.04.14s.808.17 1.752.75l1.453 6.19h2.191l2.673-7.08h-0.59zm17.837 5.53c0.002-1.416-1.237-2.496-3.193-2.496-1.316-0.033-2.126.267-2.126.267l0.267-1.5s0.81-0.3 2.185-0.3c1.375 0 2.45.487 2.45 1.86l-0.021 0.36s-1.087-.454-2.009-.454c-1.673 0-3.282.71-3.282 2.684 0 1.59 1.495 2.193 2.347 2.193 1.726 0 2.457-1.1 2.457-1.1l-0.076 0.916h1.856l0.827-5h0.317zm-2.417 1.527s0.34 0.84-0.718 0.84c-0.58 0-0.834-.447-0.834-.447s-0.193-0.953 1.183-0.953c0.613 0 1.045.154 1.045.154l-0.675 0.407zm-4.31-5.057l-1.58 7.08h-1.974l1.574-7.08h1.98z" fill="currentColor"/>
    <path d="M17.535 10.75l-0.54 3.31s-0.665-0.87-1.707-0.87c-1.626 0-2.394 1.24-2.394 2.66 0 1.047 0.52 2.073 1.58 2.073 0.908 0 1.409-0.637 1.409-0.637l-0.083 0.54h1.833l1.454-7.083-1.552 0.007zm-0.663 3.743s0.182 0.816-0.545 0.816c-0.5 0-0.75-0.513-0.75-0.513s-0.204-1.022 0.662-1.022c0.476 0 0.633 0.719 0.633 0.719z" fill="currentColor"/>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <path d="M14.5 15.5a7 7 0 100-14 7 7 0 000 14z" fill="currentColor" fillOpacity="0.3"/>
    <path d="M23.5 15.5a7 7 0 100-14 7 7 0 000 14z" fill="currentColor" fillOpacity="0.7"/>
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="24" rx="4" fill="currentColor" fillOpacity="0.1"/>
    <path d="M16.22 8.98c0 1.38-1.12 2.5-2.5 2.5h-3.44c-0.14 0-0.25-0.11-0.27-0.24l-1.5-9.5c-0.01-0.09 0.01-0.19 0.07-0.26 0.06-0.07 0.14-0.11 0.2-0.11h3.44c1.38 0 2.5 1.12 2.5 2.5v5.11zM27.22 8.98c0 1.38-1.12 2.5-2.5 2.5h-3.44c-0.14 0-0.25-0.11-0.27-0.24l-1.5-9.5c-0.01-0.09 0.01-0.19 0.07-0.26 0.06-0.07 0.14-0.11 0.2-0.11h3.44c1.38 0 2.5 1.12 2.5 2.5v5.11z" fill="currentColor" fillOpacity="0.4"/>
    <path d="M16.22 8.98c0 1.38-1.12 2.5-2.5 2.5h-3.44c-0.14 0-0.25-0.11-0.27-0.24l-1.5-9.5c-0.01-0.09 0.01-0.19 0.07-0.26 0.06-0.07 0.14-0.11 0.2-0.11h3.44c1.38 0 2.5 1.12 2.5 2.5v5.11z" fill="currentColor" fillOpacity="0.2"/>
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Newsletter signup logic would go here
    console.log('Newsletter signup:', email);
    setEmail('');
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Shop</FooterTitle>
          <FooterLinks>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?category=shirts">Shirts</Link>
            <Link to="/shop?category=pants">Pants</Link>
            <Link to="/shop?category=my-craft">My Craft</Link>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Company</FooterTitle>
          <FooterLinks>
            <Link to="/about">About Us</Link>
            <Link to="/my-craft">Our Artisans</Link>
            <Link to="/sustainability">Sustainability</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/careers">Careers</Link>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Follow Us</FooterTitle>
          <SocialLinks>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <InstagramIcon /> Instagram
            </SocialLink>
            <SocialLink href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              <TikTokIcon /> TikTok
            </SocialLink>
            <SocialLink href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
              <PinterestIcon /> Pinterest
            </SocialLink>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Join Our Community</FooterTitle>
          <NewsletterForm onSubmit={handleSubmit}>
            <NewsletterInput
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <NewsletterButton 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </NewsletterButton>
          </NewsletterForm>
          
          <TagLine>
            <h2>Wear Your Worth</h2>
            <p>Artisanal fashion crafted with purpose and sustainability in mind.</p>
          </TagLine>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        <p>&copy; {new Date().getFullYear()} TheNobleBeing. All rights reserved.</p>
        <PaymentIcons>
          <VisaIcon />
          <MastercardIcon />
          <PayPalIcon />
        </PaymentIcons>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
