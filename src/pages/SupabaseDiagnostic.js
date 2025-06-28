import React, { useState, useEffect } from 'react';
import { supabaseClient, getConnectionStatus } from '../services/supabaseClient';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  background-color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
`;

const Header = styled.h1`
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #444;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  margin-left: 0.5rem;
  color: white;
  background-color: ${props => props.isSuccess ? '#2ecc71' : '#e74c3c'};
`;

const TestButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.pre`
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  overflow: auto;
  max-height: 200px;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f8f8f8;
    font-weight: 500;
  }
`;

const EnvironmentInfo = styled.p`
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const InfoItem = styled.p`
  margin-bottom: 0.5rem;
`;

const SupabaseDiagnostic = () => {
  const [connectionInfo, setConnectionInfo] = useState({ isOnline: false, connectionAttempts: 0 });
  const [pingStatus, setPingStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [tablesList, setTablesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking...');
  const [actualUrl, setActualUrl] = useState('checking...');
  const [actualKey, setActualKey] = useState('checking...');

  useEffect(() => {
    const displayActualConfig = async () => {
      try {
        const client = supabaseClient.getClient();
        if (client) {
          const url = client.supabaseUrl || 'Not available';
          setActualUrl(url);
          const key = client.supabaseKey || 'Not available';
          setActualKey(key.substring(0, 8) + '...');
        }
      } catch (error) {
        console.error('Error getting actual Supabase config:', error);
        setActualUrl('Error retrieving URL');
        setActualKey('Error retrieving key');
      }
    };

    const checkSupabaseConnection = async () => {
      setConnectionInfo(getConnectionStatus());
    };

    displayActualConfig();
    checkSupabaseConnection();
  }, []);

  const pingSupabase = async () => {
    setIsLoading(true);
    setPingStatus('pending');
    
    try {
      const start = Date.now();
      const response = await supabaseClient.from('_http_test').select('*').limit(1).maybeSingle();
      const latency = Date.now() - start;
      
      setPingStatus({
        success: true,
        latency: `${latency}ms`,
        message: 'Connection successful!'
      });
    } catch (error) {
      console.error('Ping failed:', error);
      setPingStatus({
        success: false,
        error,
        message: `Connection failed: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
      setConnectionInfo(getConnectionStatus());
    }
  };
  
  const checkAuth = async () => {
    setIsLoading(true);
    setAuthStatus('pending');
    
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) throw error;
      
      setAuthStatus({
        success: true,
        hasSession: !!data?.session,
        message: data?.session ? 'User is authenticated' : 'No current session, but auth system is working'
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStatus({
        success: false,
        error,
        message: `Auth check failed: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkDatabase = async () => {
    setIsLoading(true);
    setDbStatus('pending');
    setTablesList([]);
    
    try {
      // Try to get products
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('id, name')
        .limit(5);
      
      if (productsError) throw productsError;
      
      // List tables
      const { data: tablesData, error: tablesError } = await supabaseClient
        .rpc('get_tables');
  
      if (tablesError) {
        console.warn('Could not list tables:', tablesError);
      } else {
        setTablesList(tablesData || []);
      }
      
      setDbStatus({
        success: true,
        productCount: products?.length || 0,
        message: `Found ${products?.length || 0} products in the database`
      });
    } catch (error) {
      console.error('Database check failed:', error);
      setDbStatus({
        success: false,
        error,
        message: `Database check failed: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container>
      <Header>Supabase Connection Diagnostic</Header>
      
      <Section>
        <SectionTitle>Environment</SectionTitle>
        <EnvironmentInfo>Environment Variables (.env):</EnvironmentInfo>
        <InfoItem>REACT_APP_SUPABASE_URL: {process.env.REACT_APP_SUPABASE_URL}</InfoItem>
        <InfoItem>REACT_APP_ANON_KEY: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '***' : 'Not set'}</InfoItem>
        
        <EnvironmentInfo>Actual Runtime Configuration:</EnvironmentInfo>
        <InfoItem>Actual Supabase URL: {actualUrl}</InfoItem>
        <InfoItem>Actual Anon Key: {actualKey}</InfoItem>
        <p>
          <strong>Network Status:</strong> {connectionInfo.isOnline ? 'Online' : 'Offline'}
        </p>
        <p>
          <strong>Connection Attempts:</strong> {connectionInfo.connectionAttempts}
        </p>
      </Section>
      
      <Section>
        <SectionTitle>Connection Test</SectionTitle>
        <div>
          <TestButton onClick={pingSupabase} disabled={isLoading || pingStatus === 'pending'}>
            Ping Supabase
          </TestButton>
          
          {pingStatus && pingStatus !== 'pending' && (
            <StatusBadge isSuccess={pingStatus.success}>
              {pingStatus.success ? `Success (${pingStatus.latency})` : 'Failed'}
            </StatusBadge>
          )}
        </div>
        
        {pingStatus && pingStatus !== 'pending' && (
          <ResultBox>
            {pingStatus.message}
            {pingStatus.error && `\n\nError Details: ${JSON.stringify(pingStatus.error, null, 2)}`}
          </ResultBox>
        )}
      </Section>
      
      <Section>
        <SectionTitle>Authentication Check</SectionTitle>
        <div>
          <TestButton onClick={checkAuth} disabled={isLoading || authStatus === 'pending'}>
            Check Auth
          </TestButton>
          
          {authStatus && authStatus !== 'pending' && (
            <StatusBadge isSuccess={authStatus.success}>
              {authStatus.success ? 'Success' : 'Failed'}
            </StatusBadge>
          )}
        </div>
        
        {authStatus && authStatus !== 'pending' && (
          <ResultBox>
            {authStatus.message}
            {authStatus.error && `\n\nError Details: ${JSON.stringify(authStatus.error, null, 2)}`}
          </ResultBox>
        )}
      </Section>
      
      <Section>
        <SectionTitle>Database Check</SectionTitle>
        <div>
          <TestButton onClick={checkDatabase} disabled={isLoading || dbStatus === 'pending'}>
            Check Database
          </TestButton>
          
          {dbStatus && dbStatus !== 'pending' && (
            <StatusBadge isSuccess={dbStatus.success}>
              {dbStatus.success ? 'Success' : 'Failed'}
            </StatusBadge>
          )}
        </div>
        
        {dbStatus && dbStatus !== 'pending' && (
          <ResultBox>
            {dbStatus.message}
            {dbStatus.error && `\n\nError Details: ${JSON.stringify(dbStatus.error, null, 2)}`}
          </ResultBox>
        )}
        
        {tablesList.length > 0 && (
          <>
            <SectionTitle>Database Tables</SectionTitle>
            <Table>
              <thead>
                <tr>
                  <th>Schema</th>
                  <th>Table</th>
                </tr>
              </thead>
              <tbody>
                {tablesList.map((table, index) => (
                  <tr key={index}>
                    <td>{table.schema}</td>
                    <td>{table.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Section>
    </Container>
  );
};

export default SupabaseDiagnostic;
