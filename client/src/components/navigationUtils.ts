import { NavigateFunction } from 'react-router-dom';

export const handleNavigation = (
  to: string,
  isAuthenticated: boolean,
  isProfileComplete: boolean,
  navigate: NavigateFunction,
  showNotification: any
) => {
  if (!isAuthenticated) {
    navigate('/');
    return;
  }

  if (!isProfileComplete && to !== '/profile') {
    showNotification(
      'To use this page, please complete your profile.',
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