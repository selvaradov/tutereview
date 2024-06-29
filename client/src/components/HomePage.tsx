import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'TuteReview - Home'; // NOTE could be moved to a custom hook 
    // do a check for `window.matchMedia('(display-mode: standalone)').matches` 
    // if true, then running as installed PWA so set title to "Home" only
  }, []);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {isAuthenticated ? (
        <p>You are logged in. You can now access the Review and Search pages.</p>
      ) : (
        <p>Please log in to access protected pages.</p>
      )}
    </div>
  );
};

export default HomePage;