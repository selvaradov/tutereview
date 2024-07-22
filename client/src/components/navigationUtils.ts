import { NavigateFunction } from 'react-router-dom';
import { NotificationContextType } from '../context/NotificationContext';

const authRequiredRoutes = ['/review', '/search', '/profile', '/my-reviews'];
const profileRequiredRoutes = ['/review', '/search', '/my-reviews'];

export const handleNavigation = (
  to: string,
  isAuthenticated: boolean,
  isProfileComplete: boolean,
  navigate: NavigateFunction,
  showNotification: NotificationContextType['showNotification']
) => {
  if (!isAuthenticated && authRequiredRoutes.includes(to)) {
    navigate('/');
    return;
  }

  if (!isProfileComplete && profileRequiredRoutes.includes(to)) {
    showNotification(
      'Please complete your profile to access this feature.',
      'error',
      [
        {
          label: 'Complete profile',
          onClick: () => navigate('/profile'),
          variant: 'primary'
        }
      ]
    );
    return;
  }

  navigate(to);
};