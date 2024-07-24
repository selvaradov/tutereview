import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const startLoading = useCallback(() => {
    setLoadingCount((prevCount) => prevCount + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prevCount) => Math.max(0, prevCount - 1));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loadingCount > 0) {
      timer = setTimeout(() => setShowLoader(true), 300); // Delay of 300ms
    } else {
      setShowLoader(false);
    }
    return () => clearTimeout(timer);
  }, [loadingCount]);

  // Hide scrollbar when loading
  useEffect(() => {
    if (showLoader) {
      const originalStyle = {
        scrollbarGutter:
          document.documentElement.style.getPropertyValue('scrollbar-gutter'),
        overflow: document.documentElement.style.getPropertyValue('overflow'),
      };
      document.documentElement.style.setProperty('scrollbar-gutter', 'unset');
      document.documentElement.style.setProperty('overflow', 'hidden');
      document.body.style.setProperty('padding-right', '0px');

      return () => {
        document.documentElement.style.setProperty(
          'scrollbar-gutter',
          originalStyle.scrollbarGutter,
        );
        document.documentElement.style.setProperty(
          'overflow',
          originalStyle.overflow,
        );
        document.body.style.removeProperty('padding-right');
      };
    }
  }, [showLoader]);

  return (
    <LoadingContext.Provider
      value={{ isLoading: loadingCount > 0, startLoading, stopLoading }}
    >
      {children}
      {showLoader && (
        <div className="loading-overlay">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
