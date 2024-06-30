import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  message: string;
  visible: boolean;
  type: 'success' | 'error';
  showNotification: (msg: string, type: 'success' | 'error') => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [type, setType] = useState<'success' | 'error'>('success');

  const showNotification = (msg: string, notificationType: 'success' | 'error') => {
    setMessage(msg);
    setType(notificationType);
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ message, visible, type, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};