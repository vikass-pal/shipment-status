import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error('[Error Handler]', err);

  // 1. Custom App Error
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    err.errors.forEach((issue) => {
      const path = issue.path.join('.');
      formattedErrors[path || 'body'] = issue.message;
    });
    return sendError(res, 'Validation error', 400, formattedErrors);
  }

  // 3. Prisma Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. duplicate reference number)
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['referenceNumber'];
      const field = target.join(', ');
      return sendError(
        res,
        `A shipment with this ${field} already exists.`,
        409,
        { [field]: `Duplicate ${field}` }
      );
    }

    // Record not found
    if (err.code === 'P2025') {
      return sendError(res, 'Shipment record not found', 404);
    }
  }

  // 4. Fallback internal server error
  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal server error',
    500
  );
}
