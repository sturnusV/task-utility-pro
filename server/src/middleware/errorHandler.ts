import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = {
    message: `Not Found - ${req.originalUrl}`,
    status: 404,
    stack: new Error().stack
  } as HttpError;
  next(error);
};