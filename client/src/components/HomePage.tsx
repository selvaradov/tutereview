import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

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