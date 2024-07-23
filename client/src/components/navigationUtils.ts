import { NotificationContextType } from '../context/NotificationContext';

const authRequiredRoutes = ['/review', '/search', '/profile', '/my-reviews'];
const profileRequiredRoutes = ['/review', '/search', '/my-reviews'];

export const checkNavigation = (
  to: string,
  isAuthenticated: boolean,
  isProfileComplete: boolean,
  showNotification: NotificationContextType['showNotification']
): boolean => {
  if (!isAuthenticated && authRequiredRoutes.includes(to)) {
    return false;
  }

  if (!isProfileComplete && profileRequiredRoutes.includes(to)) {
    showNotification(
      'Please complete your profile to access this feature.',
      'error',
      [
        {
          label: 'Complete profile',
          onClick: () => window.location.href = '/profile',
          variant: 'primary'
        }
      ]
    );
    return false;
  }

  return true;
};