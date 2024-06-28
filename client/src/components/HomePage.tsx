import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';

const HomePage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {isAuthenticated ? (
        <>
          <p>You are logged in.</p>
          <LogoutButton />
          <nav>
            <ul>
              <li><Link to="/review">Go to Review Page</Link></li>
              <li><Link to="/search">Go to Search Page</Link></li>
            </ul>
          </nav>
        </>
      ) : (
        <>
          <p>Please log in to access protected pages.</p>
          <button onClick={login}>Log In</button>
        </>
      )}
    </div>
  );
};

export default HomePage;