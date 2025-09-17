// Retry utility with exponential backoff
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Simulate API call with configurable failure rate
export function simulateApiCall(successRate = 0.9, delay = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < successRate) {
        resolve({ success: true, data: {} });
      } else {
        reject(new Error('API call failed'));
      }
    }, delay);
  });
}

// Error types for better error handling
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Create specific error types
export function createError(type, message, originalError = null) {
  const error = new Error(message);
  error.type = type;
  error.originalError = originalError;
  error.timestamp = new Date().toISOString();
  return error;
}

// Check if error is retryable
export function isRetryableError(error) {
  const retryableTypes = [
    ErrorTypes.NETWORK_ERROR,
    ErrorTypes.SERVER_ERROR,
    ErrorTypes.TIMEOUT_ERROR
  ];
  
  return retryableTypes.includes(error.type) || 
         error.message.includes('timeout') ||
         error.message.includes('network');
}

