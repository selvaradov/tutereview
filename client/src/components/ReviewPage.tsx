import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ReviewPage: React.FC = () => {
  const { logout } = useAuth();


  return (
    <div>
      <h1>Review Page</h1>
      <p>This is a protected page. Only logged-in users can see this content.</p>
      <button onClick={logout}>Log Out</button>
      <nav>
        <ul>
          <li><Link to="/">Go to Home Page</Link></li>
          <li><Link to="/search">Go to Search Page</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default ReviewPage;