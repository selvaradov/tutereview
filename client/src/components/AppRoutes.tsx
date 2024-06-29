import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import HomePage from './HomePage';
import ReviewPage from './ReviewPage';
import SearchPage from './SearchPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from './NotFoundPage';
import NotificationComponent from './NotificationComponent';

const protectedRoute = (Component: React.ComponentType) => (
  <ProtectedRoute>
    <Component />
  </ProtectedRoute>
);

const AppRoutes: React.FC = () => {
  return (
    <Container>
      <NotificationComponent />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/review" element={protectedRoute(ReviewPage)} />
        <Route path="/search" element={protectedRoute(SearchPage)} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Container>
  );
};

export default AppRoutes;