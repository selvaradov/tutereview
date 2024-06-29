import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileCompletion from './ProfileCompletion';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!user?.isProfileComplete) {
    console.log('Profile not complete', user)
    return <ProfileCompletion />;
  }
  console.log('Profile complete', user)
  return <>{children}</> ;
};

export default ProtectedRoute;