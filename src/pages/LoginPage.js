import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConnectionStatus } from '../services/supabaseClient';
import styled from 'styled-components';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true, connectionIssue: false });
  
  // Check network connectivity status
  useEffect(() => {
    const checkConnection = () => {
      const status = getConnectionStatus();
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: status.isOnline,
        isUsingFallback: status.isUsingFallback,
        connectionAttempts: status.connectionAttempts
      }));
    };
    
    // Check immediately and set up listeners
    checkConnection();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      setError('');
    };
    
    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: false }));
      setError('You appear to be offline. Please check your internet connection.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('LoginPage: Starting login process...');
    setLoading(true);
    setError('');
    
    try {
      console.log('LoginPage: Attempting login with email:', email);
      const result = await login(email, password);
      console.log('LoginPage: Login successful, redirecting to:', from);
      console.log('LoginPage: Login result:', result);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('LoginPage: Login error:', err);
      console.error('LoginPage: Error details:', JSON.stringify(err, null, 2));
      
      // Handle different error types
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Failed to fetch')) {
        setNetworkStatus(prev => ({ ...prev, connectionIssue: true }));
        setError('Network error: Unable to connect to authentication server. Please check your internet connection.');
      } else if (err.code === 'CONNECTION_ERROR') {
        setNetworkStatus(prev => ({ ...prev, connectionIssue: true }));
        setError('Unable to reach the authentication server. We\'re trying alternate connection methods...');
      } else if (err.code === 'OFFLINE_ERROR') {
        setNetworkStatus(prev => ({ ...prev, isOnline: false }));
        setError('You appear to be offline. Please check your internet connection.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address before logging in.');
      } else {
        setError(err.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginPageHeader>
        <h1>Welcome Back</h1>
        <p>Sign in to your account to continue shopping</p>
      </LoginPageHeader>
      
      {networkStatus.connectionIssue && (
        <ConnectionAlert>
          <h4>Connection Issues Detected</h4>
          <p>We're having trouble connecting to our servers. This might be due to:</p>
          <ul>
            <li>Internet connectivity issues</li>
            <li>DNS resolution problems</li>
            <li>Temporary service disruption</li>
          </ul>
          <p>We're attempting alternative connection methods. Please try again in a moment.</p>
          <p>If the problem persists, please contact support.</p>
        </ConnectionAlert>
      )}
      
      <LoginCard>
        <h1>Sign In</h1>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••"
            />
          </FormGroup>
          
          <ForgotPassword to="/forgot-password">Forgot password?</ForgotPassword>
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </LoginButton>
        </form>
        
        <Divider>
          <span>or</span>
        </Divider>
        
        <RegisterPrompt>
          Don't have an account?{' '}
          <RegisterLink to="/register">Sign up</RegisterLink>
        </RegisterPrompt>
      </LoginCard>
    </LoginContainer>
  );
};

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background-color: #f9f9f9;
  background-image: linear-gradient(to bottom, #f9f9f9, #f2f2f2);
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
  
  h1 {
    font-family: 'Playfair Display', serif;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--soft-gold, #D9C2A6);
    font-size: 2rem;
    position: relative;
    padding-bottom: 0.75rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: var(--terracotta, #c8553d);
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.75rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e2e2e2;
  border-radius: 6px;
  height: 48px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #8a9a5b;
    box-shadow: 0 0 0 3px rgba(138, 154, 91, 0.15);
  }
  
  &::placeholder {
    color: #aaa;
    opacity: 0.8;
  }
`;

const ForgotPassword = styled(Link)`
  display: block;
  margin-bottom: 1.5rem;
  text-align: right;
  color: #666;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  
  &:hover {
    text-decoration: underline;
    color: #8a9a5b;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  height: 52px;
  padding: 0.75rem;
  background-color: #8a9a5b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #798a4d;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  color: #999;
  
  &:before, &:after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #eaeaea;
  }
  
  span {
    padding: 0 15px;
    font-size: 0.875rem;
    text-transform: lowercase;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  color: #555;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const RegisterLink = styled(Link)`
  color: #8A9A5B;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  background-color: #fdecea;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ConnectionAlert = styled.div`
  padding: 1.25rem;
  margin-bottom: 1.75rem;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 8px;
  color: #856404;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  
  h4 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
  
  ul {
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
    
    li {
      margin-bottom: 0.25rem;
    }
  }
  
  p:last-child {
    margin-bottom: 0;
  }
`;

// ... (rest of the code remains the same)
const LoginPageHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--soft-gold, #D9C2A6);
    margin-bottom: 0.5rem;
    font-size: 2.25rem;
  }
  
  p {
    color: #666;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    h1 {
      font-size: 1.75rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

export default LoginPage;
