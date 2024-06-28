import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean
  login: () => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const login = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/login`;
  };

  const logout = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        withCredentials: true,
      });

      console.log(response.data.message);

      // Notify other tabs that the user has logged out
      const authChannel = new BroadcastChannel('auth_channel');
      authChannel.postMessage({ type: 'LOGOUT' });
      authChannel.close();

      setIsAuthenticated(false);
      navigate('/', { state: { logoutSuccess: true }, replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [navigate]);



  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/status`, {
        withCredentials: true,
      });
      setIsAuthenticated(response.data.isAuthenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Create a new BroadcastChannel with the same name used in the logout method.
    const authChannel = new BroadcastChannel('auth_channel');
 
    // Define a function to handle incoming messages.
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOGOUT') {
        setIsAuthenticated(false);
        navigate('/', { replace: true }); // Optionally redirect to login page.
      }
    };
 
    authChannel.addEventListener('message', handleMessage);
 
    return () => {
      authChannel.removeEventListener('message', handleMessage);
      authChannel.close();
    };
  }, [navigate]); 

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};