import { toast } from 'react-hot-toast';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  FILE_SYSTEM = 'FILE_SYSTEM',
  STEAM_CMD = 'STEAM_CMD',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error context for better debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  serverId?: string;
  userId?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

// Enhanced error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error | unknown;
  context?: ErrorContext;
  retryable?: boolean;
  userMessage?: string;
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private readonly MAX_LOG_SIZE = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Create a standardized error object
   */
  static createError(
    type: ErrorType,
    message: string,
    originalError?: Error | unknown,
    context?: Partial<ErrorContext>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = true
  ): AppError {
    return {
      type,
      severity,
      message,
      originalError,
      context: {
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...context
      },
      retryable,
      userMessage: this.getUserFriendlyMessage(type, message)
    };
  }

  /**
   * Handle and log an error
   */
  static handleError(
    error: Error | unknown,
    context?: Partial<ErrorContext>,
    showToast: boolean = true
  ): AppError {
    const appError = this.createError(
      this.categorizeError(error),
      error instanceof Error ? error.message : 'Unknown error occurred',
      error,
      context
    );

    // Log the error
    this.getInstance().logError(appError);

    // Show toast notification if requested
    if (showToast) {
      this.showErrorToast(appError);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', appError);
    }

    return appError;
  }

  /**
   * Handle async operations with error handling
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>,
    showToast: boolean = true
  ): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const appError = this.handleError(error, context, showToast);
      return { success: false, error: appError };
    }
  }

  /**
   * Handle fetch operations with error handling
   */
  static async handleFetch<T>(
    url: string,
    options?: RequestInit,
    context?: Partial<ErrorContext>
  ): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const appError = this.handleError(error, {
        ...context,
        action: 'fetch',
        url
      });
      return { success: false, error: appError };
    }
  }

  /**
   * Categorize errors based on their type
   */
  private static categorizeError(error: Error | unknown): ErrorType {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
        return ErrorType.NETWORK;
      }
      
      if (message.includes('validation') || message.includes('invalid')) {
        return ErrorType.VALIDATION;
      }
      
      if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
        return ErrorType.PERMISSION;
      }
      
      if (message.includes('not found') || message.includes('404')) {
        return ErrorType.NOT_FOUND;
      }
      
      if (message.includes('steam') || message.includes('steamcmd')) {
        return ErrorType.STEAM_CMD;
      }
      
      if (message.includes('file') || message.includes('directory') || message.includes('path')) {
        return ErrorType.FILE_SYSTEM;
      }
      
      if (message.includes('config') || message.includes('ini')) {
        return ErrorType.CONFIGURATION;
      }
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * Get user-friendly error messages
   */
  private static getUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection error. Please check your internet connection and try again.';
      case ErrorType.VALIDATION:
        return 'Invalid data provided. Please check your input and try again.';
      case ErrorType.PERMISSION:
        return 'You don\'t have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource was not found.';
      case ErrorType.SERVER:
        return 'Server error occurred. Please try again later.';
      case ErrorType.FILE_SYSTEM:
        return 'File system error. Please check file permissions and try again.';
      case ErrorType.STEAM_CMD:
        return 'SteamCMD error. Please check your SteamCMD installation.';
      case ErrorType.CONFIGURATION:
        return 'Configuration error. Please check your settings.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Show error toast notification
   */
  private static showErrorToast(error: AppError): void {
    const message = error.userMessage || error.message;
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(message, { duration: 8000 });
        break;
      case ErrorSeverity.HIGH:
        toast.error(message, { duration: 6000 });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(message, { duration: 4000 });
        break;
      case ErrorSeverity.LOW:
        toast(message, { duration: 3000 });
        break;
    }
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-this.MAX_LOG_SIZE);
    }
  }

  /**
   * Get error log
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }
}

// Convenience functions for common error scenarios
export const handleNetworkError = (error: Error | unknown, context?: Partial<ErrorContext>) => {
  return ErrorHandler.handleError(error, context, true);
};

export const handleValidationError = (error: Error | unknown, context?: Partial<ErrorContext>) => {
  return ErrorHandler.handleError(error, context, true);
};

export const handleServerError = (error: Error | unknown, context?: Partial<ErrorContext>) => {
  return ErrorHandler.handleError(error, context, true);
};

export const handleFileSystemError = (error: Error | unknown, context?: Partial<ErrorContext>) => {
  return ErrorHandler.handleError(error, context, true);
};

// React hook for error handling
export const useErrorHandler = () => {
  return {
    handleError: ErrorHandler.handleError,
    handleAsync: ErrorHandler.handleAsync,
    handleFetch: ErrorHandler.handleFetch,
    createError: ErrorHandler.createError
  };
}; 