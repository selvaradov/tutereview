import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useNotification } from '../context/NotificationContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isProfileComplete, checkAuthStatus, isAuthInitialized } = useAuth();
  const { isLoading, startLoading, stopLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isAuthInitialized) {
      startLoading();
      checkAuthStatus().finally(() => stopLoading());
    }
  }, [checkAuthStatus, isAuthInitialized, startLoading, stopLoading]);

  useEffect(() => {
    if (isAuthenticated && !isProfileComplete && location.pathname !== '/profile') {
      showNotification( // NOTE this is duplicated code from navigtionUtils.ts
        'Please complete your profile to access this feature.',
        'error',
        [
          {
            label: 'Complete profile',
            onClick: () => navigate('/profile'),
            variant: 'primary'
          }
        ]
      );
      navigate('/');
    }
  }, [isAuthenticated, isProfileComplete, location.pathname, showNotification, navigate]);

  if (!isAuthInitialized || isLoading) {
    return null; // or a loading spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isProfileComplete && location.pathname !== '/profile') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;