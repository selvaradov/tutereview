import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Auth0Provider } from '@auth0/auth0-react';
import { NotificationProvider } from './context/NotificationContext';
import { LoadingProvider } from './context/LoadingContext';
import AppRoutes from './components/AppRoutes';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <LoadingProvider>
        <NotificationProvider>
          <AuthProvider>
            <Auth0Provider
              domain="tutereview.uk.auth0.com"
              clientId="1XhHS23waKaxbGeZUrygDrFIJvTOWrv6"
              authorizationParams={{
                redirect_uri: window.location.origin,
                audience: 'https://tutereview.uk.auth0.com/api/v2/',
                scope: 'read:current_user',
              }}
            >
              <AppRoutes />
            </Auth0Provider>
          </AuthProvider>
        </NotificationProvider>
      </LoadingProvider>
    </Router>
  );
};

export default App;
