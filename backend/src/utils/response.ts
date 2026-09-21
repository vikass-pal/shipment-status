import { Response } from 'express';

export interface StandardApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const payload: StandardApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string>
): Response {
  const payload: StandardApiResponse<null> = {
    success: false,
    message,
    ...(errors && Object.keys(errors).length > 0 && { errors }),
  };
  return res.status(statusCode).json(payload);
}
