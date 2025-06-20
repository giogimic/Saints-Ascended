import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { BaseError } from '@/lib/errors/custom-errors';

interface ErrorState {
  error: Error | null;
  isError: boolean;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
  });

  const handleError = useCallback((error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    
    setErrorState({
      error: err,
      isError: true,
    });

    // Show error toast with appropriate message
    if (error instanceof BaseError) {
      toast.error(err.message);
    } else {
      toast.error('An unexpected error occurred. Please try again.');
    }

    // Log the error
    console.error('Error caught by useErrorHandler:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(error instanceof BaseError && {
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      }),
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
    });
  }, []);

  const wrapAsync = useCallback(
    <T extends any[]>(fn: (...args: T) => Promise<any>) =>
      async (...args: T) => {
        try {
          return await fn(...args);
        } catch (error) {
          handleError(error);
          throw error;
        }
      },
    [handleError]
  );

  return {
    ...errorState,
    handleError,
    clearError,
    wrapAsync,
  };
} 