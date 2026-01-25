import { Request, Response, NextFunction } from 'express'

// Request logger middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  const method = req.method
  const path = req.path

  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m'
    const reset = '\x1b[0m'
    
    console.log(
      `${statusColor}[${method}] ${path} - ${status}${reset} (${duration}ms)`
    )
  })

  next()
}

// Error handler middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${err.message}`, err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// AsyncHandler wrapper to catch errors in async routes
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
