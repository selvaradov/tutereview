import React from 'react';
import { useNotification } from '../context/NotificationContext';

const NotificationComponent: React.FC = () => {
  const { message, visible } = useNotification();

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'blue', color: 'white', padding: '10px' }}>
      {message}
    </div>
  );
};

export default NotificationComponent;