import { BaseError } from './custom-errors';

interface ErrorResponse {
  success: false;
  message: string;
  error: {
    name: string;
    statusCode: number;
    details?: unknown;
  };
}

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(err: Error | BaseError): ErrorResponse {
    if (this.isOperationalError(err)) {
      return this.handleOperationalError(err as BaseError);
    }
    return this.handleCriticalError(err);
  }

  public isOperationalError(err: Error | BaseError): boolean {
    if (err instanceof BaseError) {
      return err.isOperational;
    }
    return false;
  }

  private handleOperationalError(err: BaseError): ErrorResponse {
    // Log operational errors for monitoring
    console.error(`Operational Error: ${err.message}`, {
      name: err.name,
      statusCode: err.statusCode,
      stack: err.stack
    });

    return {
      success: false,
      message: err.message,
      error: {
        name: err.name,
        statusCode: err.statusCode,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    };
  }

  private handleCriticalError(err: Error): ErrorResponse {
    // Log critical errors for immediate attention
    console.error('Critical Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });

    // In production, you might want to notify your error tracking service here
    // e.g., Sentry, LogRocket, etc.

    return {
      success: false,
      message: 'An unexpected error occurred',
      error: {
        name: 'InternalServerError',
        statusCode: 500,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    };
  }

  public logError(err: Error | BaseError): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err instanceof BaseError && {
        statusCode: err.statusCode,
        isOperational: err.isOperational
      })
    };

    // Log to console for now, but this could be extended to log to a file or external service
    console.error('Error Log:', errorLog);
  }
}

export const errorHandler = ErrorHandler.getInstance();

// API route error handler middleware
export const apiErrorHandler = (err: Error | BaseError, req: any, res: any): void => {
  const errorResponse = errorHandler.handleError(err);
  res.status(errorResponse.error.statusCode).json(errorResponse);
}; 