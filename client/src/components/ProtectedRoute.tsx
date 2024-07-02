import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, isProfileComplete } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated && !isProfileComplete && location.pathname !== '/profile') {
      showNotification(
        'To use this page, please complete your profile.',
        'error',
        [
          {
            label: 'Complete Profile',
            onClick: () => navigate('/profile'),
            variant: 'primary'
          }
        ]
      );
      navigate('/');
    }
  }, [isAuthenticated, isProfileComplete, location.pathname, showNotification, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;