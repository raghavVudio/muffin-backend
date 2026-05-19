import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      error = new ApiError(409, `${field} already exists`);
    }
    // Mongoose validation
    else if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
      error = new ApiError(422, 'Validation failed', errors);
    }
    // Mongoose bad ObjectId
    else if (err.name === 'CastError') {
      error = new ApiError(400, `Invalid ${err.path}`);
    }
    else {
      error = new ApiError(err.statusCode || 500, err.message || 'Internal server error');
    }
  }

  const body = {
    success: false,
    message: error.message,
    ...(error.errors?.length && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode || 500).json(body);
};

export const notFound = (req, _res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
