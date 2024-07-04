import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <LoadingContext.Provider value={{ isLoading: loadingCount > 0, startLoading, stopLoading }}>
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