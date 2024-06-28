import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const ReviewPage: React.FC = () => {


  return (
    <div>
      <h1>Review Page</h1>
      <p>This is a protected page. Only logged-in users can see this content.</p>
      <LogoutButton />
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