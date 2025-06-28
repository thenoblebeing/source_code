import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import contactService from '../services/contactService';

const PageContainer = styled.main`
  width: 100%;
  overflow-x: hidden;
  background-color: var(--deep-charcoal);
  color: white;
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const SectionHeading = styled(motion.h2)`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 2.5rem;
  text-align: center;
  color: var(--soft-gold);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -0.8rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--terracotta);
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
  margin-top: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ContactInfo = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
`;

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--sage-green);
  margin-bottom: 1.5rem;
  font-family: 'Playfair Display', serif;
`;

const InfoItem = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const InfoText = styled.p`
  color: var(--sandstone-beige);
  font-size: 1.05rem;
  line-height: 1.6;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(226, 114, 91, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--terracotta);
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialLink = styled(motion.a)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--terracotta);
    transform: translateY(-3px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const StyledForm = styled(motion.form)`
  background: rgba(255, 255, 255, 0.03);
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--soft-gold);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--terracotta);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--terracotta);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SubmitButton = styled(motion.button)`
  background-color: var(--terracotta);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #d1604c;
  }
`;

const SuccessContainer = styled(motion.div)`
  background: rgba(141, 163, 135, 0.15);
  border-left: 5px solid var(--sage-green);
  padding: 2.5rem;
  border-radius: 8px;
  text-align: center;
`;

const SuccessTitle = styled.h2`
  color: var(--soft-gold);
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const SuccessText = styled.p`
  color: var(--sandstone-beige);
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const ResetButton = styled(motion.button)`
  background: transparent;
  border: 2px solid var(--terracotta);
  color: var(--terracotta);
  padding: 0.8rem 2rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(226, 114, 91, 0.1);
  }
`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // State for FAQ data
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState(null);
  
  // Initialize EmailJS when component mounts
  useEffect(() => {
    // Check if emailjs is available from CDN
    if (window.emailjs) {
      // Initialize with public key
      window.emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } else {
      console.error('EmailJS not loaded. Check if the CDN script is properly loaded.');
    }
  }, []);
  
  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoadingFaqs(true);
        const faqData = await contactService.getFaqs();
        setFaqs(faqData);
        setLoadingFaqs(false);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqError('Failed to load FAQs. Please try again later.');
        setLoadingFaqs(false);
      }
    };
    
    fetchFaqs();
  }, []);
  
  // Fallback FAQs in case API is not available
  const fallbackFaqs = [
    {
      id: 1,
      question: 'How do I care for my handcrafted items?',
      answer: 'Each product comes with specific care instructions tailored to the materials and techniques used. Generally, we recommend gentle hand washing and air drying for most textile items.'
    },
    {
      id: 2,
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. International shipping times vary depending on destination, typically 7-14 business days.'
    },
    {
      id: 3,
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days of purchase for items in original condition. Custom orders are non-returnable.'
    },
    {
      id: 4,
      question: 'How are your artisans compensated?',
      answer: 'We practice fair trade principles and ensure all artisans receive above-market wages for their skilled work. We also invest in their communities and traditional craft preservation.'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormError('Please fill in all required fields');
      setFormSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      setFormSubmitting(false);
      return;
    }
    
    try {
      // Use timeout to prevent network timing issues
      setTimeout(async () => {
        try {
          // Send form data via EmailJS
          const result = await contactService.submitContactForm(formData);
          
          if (result && result.success) {
            // Show success message
            setFormSubmitted(true);
            
            // Reset form after submission
            setFormData({
              name: '',
              email: '',
              subject: '',
              message: ''
            });
          } else {
            throw new Error('Failed to send message');
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          setFormError(error.message || 'Failed to submit the form. Please try again later.');
        } finally {
          setFormSubmitting(false);
        }
      }, 500); // Small delay to ensure EmailJS is fully loaded
    } catch (error) {
      console.error('Error in form submission:', error);
      setFormError('An unexpected error occurred. Please try again.');
      setFormSubmitting(false);
    }
  };

  return (
    <PageContainer>
      {/* Contact Form Section */}
      <section>
        <SectionContainer>
          <SectionHeading
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Get in Touch
          </SectionHeading>
          
          <motion.p
            style={{ 
              fontSize: '1.2rem', 
              maxWidth: '700px',
              margin: '0 auto 2.5rem',
              textAlign: 'center',
              color: 'var(--sandstone-beige)'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We'd love to hear from you! Whether you have a question about our products, 
            craftsmanship, or anything else, our team is ready to assist you.
          </motion.p>
          
          <ContactGrid>
            <ContactInfo
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <InfoTitle>Contact Information</InfoTitle>
              
              <InfoItem>
                <IconWrapper>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 10a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconWrapper>
                <InfoText>
                  123 Artisan Street, Creative District<br />San Francisco, CA 94110
                </InfoText>
              </InfoItem>
              
              <InfoItem>
                <IconWrapper>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconWrapper>
                <InfoText>
                  (555) 123-4567<br />Mon-Fri, 9am-6pm PT
                </InfoText>
              </InfoItem>
              
              <InfoItem>
                <IconWrapper>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </IconWrapper>
                <InfoText>
                  hello@thenoblebeing.com<br />support@thenoblebeing.com
                </InfoText>
              </InfoItem>
              
              <SocialLinks>
                <SocialLink 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SocialLink>
                
                <SocialLink 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SocialLink>
                
                <SocialLink 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SocialLink>
              </SocialLinks>
            </ContactInfo>
            
            {formSubmitted ? (
              <SuccessContainer
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <SuccessTitle>Thank You!</SuccessTitle>
                <SuccessText>Your message has been sent successfully. We'll get back to you shortly.</SuccessText>
                <ResetButton 
                  onClick={() => setFormSubmitted(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Another Message
                </ResetButton>
              </SuccessContainer>
            ) : (
              <StyledForm 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <FormGroup>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                  ></Textarea>
                </FormGroup>
                
                {formError && (
                  <div style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
                    {formError}
                  </div>
                )}
                
                <SubmitButton 
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Sending...' : 'Send Message'}
                </SubmitButton>
              </StyledForm>
            )}
          </ContactGrid>
        </SectionContainer>
      </section>
      
      {/* FAQ Section */}
      <section style={{ background: 'var(--sandstone-beige)', color: 'var(--deep-charcoal)' }}>
        <SectionContainer>
          <SectionHeading 
            style={{ color: 'var(--deep-charcoal)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </SectionHeading>
          
          <motion.div
            style={{ maxWidth: '800px', margin: '0 auto' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {loadingFaqs ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '8px' }}>
                <p>Loading frequently asked questions...</p>
              </div>
            ) : faqError ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'white', 
                borderRadius: '8px',
                color: '#ff6b6b'
              }}>
                <p>{faqError}</p>
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <motion.div 
                  key={faq.id}
                  style={{ 
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    marginBottom: index < faqs.length - 1 ? '1.5rem' : '0',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 style={{ 
                    fontFamily: "'Playfair Display', serif", 
                    color: 'var(--terracotta)', 
                    marginBottom: '1rem',
                    fontSize: '1.3rem'
                  }}>
                    {faq.question}
                  </h3>
                  <p style={{ lineHeight: '1.7', color: '#444' }}>
                    {faq.answer}
                  </p>
                </motion.div>
              ))
            ) : (
              fallbackFaqs.map((faq, index) => (
                <motion.div 
                  key={faq.id}
                  style={{ 
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    marginBottom: index < fallbackFaqs.length - 1 ? '1.5rem' : '0',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                >
                  <h3 style={{ 
                    fontFamily: "'Playfair Display', serif", 
                    color: 'var(--terracotta)', 
                    marginBottom: '1rem',
                    fontSize: '1.3rem'
                  }}>
                    {faq.question}
                  </h3>
                  <p style={{ lineHeight: '1.7', color: '#444' }}>
                    {faq.answer}
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        </SectionContainer>
      </section>
    </PageContainer>
  );
};

export default ContactPage;
