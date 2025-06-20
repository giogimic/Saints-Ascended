export class BaseError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthorizationError';
  }
}

export class ServerError extends BaseError {
  constructor(message: string) {
    super(message, 500, false);
    this.name = 'ServerError';
  }
}

export class ConfigurationError extends BaseError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'ConfigurationError';
  }
}

export class ModError extends BaseError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ModError';
  }
}

export class FileOperationError extends BaseError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'FileOperationError';
  }
} 