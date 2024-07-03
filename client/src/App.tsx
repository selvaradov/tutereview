import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
          <AppRoutes />
        </AuthProvider>
      </NotificationProvider>
      </LoadingProvider>
    </Router>
  );
};

export default App;