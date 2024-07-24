import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdditionalButton {
  label: string;
  onClick: () => void;
  variant?: string;
}

export interface NotificationContextType {
  message: string;
  visible: boolean;
  type: 'success' | 'error';
  additionalButtons?: AdditionalButton[];
  showNotification: (
    msg: string,
    type: 'success' | 'error',
    additionalButtons?: AdditionalButton[],
  ) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [type, setType] = useState<'success' | 'error'>('success');
  const [additionalButtons, setAdditionalButtons] = useState<
    AdditionalButton[] | undefined
  >(undefined);

  const showNotification = (
    msg: string,
    notificationType: 'success' | 'error',
    buttons?: AdditionalButton[],
  ) => {
    setMessage(msg);
    setType(notificationType);
    setAdditionalButtons(buttons);
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
    setAdditionalButtons(undefined);
  };

  return (
    <NotificationContext.Provider
      value={{
        message,
        visible,
        type,
        additionalButtons,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};
