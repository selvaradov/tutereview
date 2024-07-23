import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './AppLayout';
import Notification from './Notification';
import HomePage from './HomePage';
import FAQSection from './FAQSection';
import ReviewPage from './ReviewPage';
import SearchPage from './SearchPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from './NotFoundPage';
import ProfileCompletion from './ProfileCompletion';
import UserReviews from './UserReviews';
import AboutPage from './AboutPage';
import ScrollToTop from './ScrollToTop';

const protectedRoute = (Component: React.ComponentType) => (
  <ProtectedRoute>
    <Component />
  </ProtectedRoute>
);

const AppRoutes: React.FC = () => {
  return (
    <AppLayout>
      <Notification />
      <ScrollToTop>
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/faq" element={<FAQSection />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/review" element={protectedRoute(ReviewPage)} />
          <Route path="/search" element={protectedRoute(SearchPage)} />
          <Route path="/profile" element={protectedRoute(ProfileCompletion)} />
          <Route path="/my-reviews" element={protectedRoute(UserReviews)} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ScrollToTop>
    </AppLayout>
  );
};

export default AppRoutes;