import logger from '@/lib/logging/logger';

/**
 * Type representing possible error values in an operation result.
 */
export type ResultErrorType = Error | string | null | undefined | unknown;

/**
 * Represents the result of an operation, including data, error, message, and success status.
 * This is a generic type that can be used for various operations in the application.
 *
 * @template T - The type of data returned by the operation.
 */
export type OperationResult<T> = {
  data?: T;
  error?: ResultErrorType;
  message?: string;
  success: boolean;
};

/**
 * Helper functions to create S3Result objects
 */
export const OperationResult = {
  /**
   * Creates a success result with optional data and message
   */
  Success<T>(data?: T, message?: string): OperationResult<T> {
    return {
      data,
      message,
      success: true,
    };
  },

  /**
   * Creates a failure result with error message and optional error details
   */
  Failure<T>(message: string, error?: ResultErrorType): OperationResult<T> {
    return {
      message,
      error,
      success: false,
    };
  },

  /**
   * Converts a failure result from one type to another for error bubbling
   * Preserves the original error details and message
   */
  ConvertFailure<T, U>(failureResult: OperationResult<T>): OperationResult<U> {
    if (failureResult.success) {
      logger.error(
        failureResult.message ||
          'Cannot convert a success result with ConvertFailure'
      );
    }

    return {
      message: failureResult.message,
      error: failureResult.error,
      success: false,
    };
  },
};
