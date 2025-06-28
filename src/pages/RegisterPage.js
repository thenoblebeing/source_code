import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting registration process...');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      console.log('Password validation failed: passwords do not match');
      setError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 8) {
      console.log('Password validation failed: password too short');
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    console.log('Validation passed, attempting registration with Supabase...');
    
    try {
      const { name, email, password } = formData;
      console.log('Registering user with email:', email, 'and name:', name);
      const result = await register({ name, email, password });
      console.log('Registration API call result:', result);
      
      // Check if the registration was successful
      if (result?.user) {
        console.log('Registration successful, redirecting to login');
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        // Handle case where registration didn't throw an error but also didn't return a user
        console.warn('Registration did not return a user object:', result);
        setError('Registration failed. Please try again with a different email.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Handle Supabase-specific error messages
      if (err.message) {
        if (err.message.includes('email')) {
          setError('This email is already registered or invalid.');
        } else if (err.message.includes('password')) {
          setError('Password is too weak. Please use at least 8 characters with numbers and symbols.');
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <h1>Create Account</h1>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••••"
              minLength="8"
            />
            <PasswordHint>Must be at least 8 characters long</PasswordHint>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••••"
            />
          </FormGroup>
          
          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </form>
        
        <LoginPrompt>
          Already have an account?{' '}
          <LoginLink to="/login">Sign in</LoginLink>
        </LoginPrompt>
      </RegisterCard>
    </RegisterContainer>
  );
};

// Styled Components
const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background-color: #f9f9f9;
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  h1 {
    font-family: 'Playfair Display', serif;
    text-align: center;
    margin-bottom: 2rem;
    color: #333333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #8A9A5B;
    box-shadow: 0 0 0 2px rgba(138, 154, 91, 0.2);
  }
`;

const PasswordHint = styled.small`
  display: block;
  margin-top: 0.25rem;
  color: #777;
  font-size: 0.8rem;
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background-color: #8A9A5B;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 1.5rem;
  
  &:hover {
    background-color: #7a8a4b;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  color: #555;
`;

const LoginLink = styled(Link)`
  color: #8A9A5B;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  background-color: #ffebee;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
`;

export default RegisterPage;
