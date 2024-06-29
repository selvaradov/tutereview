import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import HeaderNavbar from './components/HeaderNavbar';
import AppRoutes from './components/AppRoutes';

const App: React.FC = () => {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <HeaderNavbar />
          <AppRoutes />
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;