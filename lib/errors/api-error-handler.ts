import { NextApiRequest, NextApiResponse } from 'next';
import { BaseError } from './custom-errors';
import { errorHandler } from './error-handler';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorResponse = errorHandler.handleError(err);
      
      // If headers are already sent, we can't send an error response
      if (!res.headersSent) {
        res.status(errorResponse.error.statusCode).json(errorResponse);
      }
    }
  };
}

// Helper function to ensure API routes only accept specific HTTP methods
export function withAllowedMethods(handler: ApiHandler, allowedMethods: string[]): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!allowedMethods.includes(req.method?.toUpperCase() || '')) {
      res.setHeader('Allow', allowedMethods);
      res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`,
        error: {
          name: 'MethodNotAllowedError',
          statusCode: 405
        }
      });
      return;
    }

    await handler(req, res);
  };
}

// Helper function to validate request body against a schema
export function withValidation<T>(handler: ApiHandler, validateFn: (data: any) => T): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (req.body) {
        validateFn(req.body);
      }
      await handler(req, res);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorResponse = errorHandler.handleError(err);
      res.status(errorResponse.error.statusCode).json(errorResponse);
    }
  };
} 