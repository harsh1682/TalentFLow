import { useState, useCallback } from 'react';
import { useError } from '../contexts/ErrorContext.jsx';
import { retryWithBackoff, simulateApiCall, createError, ErrorTypes, isRetryableError } from '../utils/retryUtils.js';

export function useOptimisticUpdate(updateFn, rollbackFn, options = {}) {
  const { showError, showSuccess, showWarning } = useError();
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const executeUpdate = useCallback(async (data, apiCall = null) => {
    setIsUpdating(true);
    setHasError(false);
    
    // Store original state for rollback
    const originalState = rollbackFn();
    
    try {
      // Apply optimistic update
      updateFn(data);
      
      // Show success message immediately for better UX
      if (options.showImmediateSuccess) {
        showSuccess(options.successMessage || 'Changes saved successfully');
      }
      
      // Simulate API call if provided
      if (apiCall) {
        try {
          await retryWithBackoff(apiCall, options.maxRetries || 3);
        } catch (error) {
          // Rollback on API failure
          rollbackFn(originalState);
          setHasError(true);
          
          if (isRetryableError(error)) {
            showWarning('Changes saved locally but failed to sync with server. Will retry automatically.');
          } else {
            showError('Failed to save changes. Please try again.');
          }
          
          throw error;
        }
      } else {
        // Simulate API call with configurable failure rate
        try {
          await simulateApiCall(options.successRate || 0.9, options.delay || 1000);
        } catch (error) {
          // Rollback on simulated failure
          rollbackFn(originalState);
          setHasError(true);
          showError('Failed to save changes. Please try again.');
          throw error;
        }
      }
      
      // Show success message after API call
      if (!options.showImmediateSuccess) {
        showSuccess(options.successMessage || 'Changes saved successfully');
      }
      
    } catch (error) {
      console.error('Optimistic update failed:', error);
      
      // Additional error handling
      if (error.type === ErrorTypes.VALIDATION_ERROR) {
        showError('Invalid data. Please check your input.');
      } else if (error.type === ErrorTypes.PERMISSION_ERROR) {
        showError('You do not have permission to perform this action.');
      } else if (error.type === ErrorTypes.NOT_FOUND_ERROR) {
        showError('The requested item was not found.');
      } else {
        showError(error.message || 'An unexpected error occurred.');
      }
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFn, rollbackFn, showError, showSuccess, showWarning, options]);

  return {
    executeUpdate,
    isUpdating,
    hasError,
    setHasError
  };
}

