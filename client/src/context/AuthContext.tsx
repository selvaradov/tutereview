import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from './NotificationContext';
import { useLoading } from './LoadingContext';

interface User {
  id: string;
  email: string;
  isProfileComplete: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isAuthInitialized: boolean;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const baseURL = process.env.REACT_APP_API_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { startLoading, stopLoading } = useLoading();

  const login = () => {
    window.location.href = `${baseURL}/auth/login`;
  };

  const logout = useCallback(async () => {
    startLoading();
    try {
      const response = await axios.get(`${baseURL}/auth/logout`, { withCredentials: true, });
      console.log(response.data.message);

      // Notify other tabs that the user has logged out
      const authChannel = new BroadcastChannel('auth_channel');
      authChannel.postMessage({ type: 'LOGOUT' });
      authChannel.close();

      setIsAuthenticated(false);
      setUser(null);
      navigate('/', { state: { logoutSuccess: true }, replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
      showNotification('Failed to logout. Please try again.', 'error');
    } finally {
      stopLoading();
    }
  }, [navigate, showNotification, startLoading, stopLoading]);

  const checkAuthStatus = useCallback(async () => {
    if (isAuthInitialized) return; // Prevent multiple calls if already initialized
    startLoading();
    try {
      const response = await axios.get(`${baseURL}/auth/status`, { withCredentials: true });
      setIsAuthenticated(response.data.isAuthenticated);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      stopLoading();
      setIsAuthInitialized(true);
    }
  }, [startLoading, stopLoading, isAuthInitialized]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    // Create a new BroadcastChannel with the same name used in the logout method.
    const authChannel = new BroadcastChannel('auth_channel');

    // Define a function to handle incoming messages.
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOGOUT') {
        setIsAuthenticated(false);
        setUser(null);
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
    <AuthContext.Provider value={{
      isAuthenticated,
      isProfileComplete: user ? user.isProfileComplete : false,
      isAuthInitialized,
      user,
      login,
      logout,
      checkAuthStatus
    }}>
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