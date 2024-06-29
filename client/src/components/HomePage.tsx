import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from 'react-bootstrap';
import AboutSection from './AboutSection';
import FAQSection from './FAQSection';

const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    document.title = 'TuteReview - Home'; // NOTE could be moved to a custom hook
    // do a check for `window.matchMedia('(display-mode: standalone)').matches`
    // if true, then running as installed PWA so set title to "Home" only
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Welcome to TuteReview</h1>
      {isAuthenticated ? (
        <p>You are logged in. You can now access the Review and Search pages.</p>
      ) : (
        <div className="mb-3">
          <p>Please verify that you are a member of the university with your SSO.</p>
          <Button onClick={login} variant="primary">Continue with Microsoft</Button>
        </div>
      )}
      <AboutSection />
      <FAQSection />
    </>
  );
};

export default HomePage;