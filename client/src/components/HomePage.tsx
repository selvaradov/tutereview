import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import AboutSection from './AboutSection';
import FAQSection from './FAQSection';
import PageLayout from './PageLayout';
import { useLoading } from '../context/LoadingContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, isAuthInitialized, user, login } = useAuth();
  const { isLoading } = useLoading();

  useEffect(() => {
    document.title = 'TuteReview - Home'; // NOTE could be done as a hook, and with PWA check
  }, []);

  if (!isAuthInitialized || isLoading) {
    return null;
  }

  return (
    <PageLayout title="Welcome to TuteReview">
      {isAuthenticated ? (
        user?.isProfileComplete ? (
          <div>
            <p>You're all set! You can now access:</p>
            <ul>
              <li><Link to="/review">Review Page</Link></li>
              <li><Link to="/search">Search Page</Link></li>
            </ul>
          </div>
        ) : (
          <div className="mb-3">
            <p>You're logged in, but your profile is incomplete.</p>
            <Link to="/profile">
              <Button variant="primary">Complete your profile</Button>
            </Link>
          </div>
        )
      ) : (
        <div className="mb-3">
          <p>Please verify that you are a member of the university with your SSO.</p>
          <Button onClick={login} variant="primary">Continue with Microsoft</Button>
        </div>
      )}
      <AboutSection />
      <FAQSection />
    </PageLayout>
  );
};

export default HomePage;