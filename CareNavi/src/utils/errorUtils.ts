import { ServiceError } from '../types';

/**
 * Standard error codes (matches ServiceError.code type)
 */
export type ErrorCode = ServiceError['code'];

/**
 * Create a standardized service error
 */
export function createServiceError(
  code: ErrorCode,
  message: string,
  details?: Partial<Omit<ServiceError, 'code' | 'message'>>
): ServiceError {
  return {
    code,
    message,
    ...details,
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout')
    );
  }
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (isNetworkError(error)) {
      return '네트워크 연결을 확인해주세요';
    }

    // Auth errors
    if (error.message.includes('auth') || error.message.includes('Auth')) {
      return '로그인이 필요합니다';
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return '입력값을 확인해주세요';
    }

    return error.message;
  }

  // ServiceError type
  if (typeof error === 'object' && 'code' in error && 'message' in error) {
    const serviceError = error as ServiceError;
    return serviceError.message;
  }

  return '오류가 발생했습니다. 다시 시도해주세요';
}

/**
 * Log error for debugging (development only)
 */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
}

/**
 * Handle async operation with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (context) {
      logError(context, error);
    }
    return fallback;
  }
}
