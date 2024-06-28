import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
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