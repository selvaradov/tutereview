import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, login, logout, checkAuthStatus } = useAuth();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
    if (location.state && (location.state as any).logoutSuccess) {
      setShowLogoutMessage(true);
      setTimeout(() => setShowLogoutMessage(false), 3000);
    }
  }, [location, checkAuthStatus]);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      {showLogoutMessage && <p>You have been successfully logged out.</p>}
      {isAuthenticated ? (
        <>
          <p>You are logged in.</p>
          <button onClick={logout}>Log Out</button>
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