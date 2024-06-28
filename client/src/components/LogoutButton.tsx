import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const { showNotification } = useNotification();

  const handleLogout = async () => {
    await logout();
    showNotification("You have been successfully logged out.");
  };

  return <button onClick={handleLogout}>Log Out</button>;
};

export default LogoutButton;