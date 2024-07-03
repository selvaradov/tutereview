import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

type ApiCall<T> = () => Promise<T>;

export function useProtectedApi<T>(apiCall: ApiCall<T>, errorMessage: string) {
  const { isProfileComplete } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!isProfileComplete) {
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
      return null;
    }

    try {
      const response = await apiCall();
      return response;
    } catch (error) {
      console.error(errorMessage, error);
      showNotification(errorMessage, 'error');
      return null;
    }
  }, [isProfileComplete, showNotification, navigate, apiCall, errorMessage]);

  return fetchData;
}