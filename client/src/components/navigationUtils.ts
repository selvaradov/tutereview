import { NavigateFunction } from 'react-router-dom';
import { NotificationContextType } from '../context/NotificationContext';

export const handleNavigation = (
  to: string,
  isAuthenticated: boolean,
  isProfileComplete: boolean,
  navigate: NavigateFunction,
  showNotification: NotificationContextType['showNotification']
) => {
  if (!isAuthenticated) {
    navigate('/');
    return;
  }

  if (!isProfileComplete && to !== '/profile') {
    showNotification(
      'Please complete your profile to access this feature.',
      'error',
      [
        {
          label: 'Complete Profile',
          onClick: () => navigate('/profile'),
          variant: 'primary'
        }
      ]
    );
    return;
  }

  navigate(to);
};