import React, { createContext, useContext, useState, ReactNode, FunctionComponent } from 'react';

interface NotificationContextType {
  message: string;
  visible: boolean;
  showNotification: (msg: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: FunctionComponent<NotificationProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => setVisible(false), 3000); // Automatically hide after 3 seconds
  };

  return (
    <NotificationContext.Provider value={{ message, visible, showNotification }}>
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