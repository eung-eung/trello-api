import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment.js'
export const errorHandlingMiddleware = (err, req, res, next) => {
  if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR

  const errorResponse = {
    statusCode: err.statusCode,
    message: err.message || StatusCodes[err.statusCode],
    stack: err.stack
  }

  //chỉ show stack trace ở dev mode
  if (env.BUILD_MODE !== 'dev') delete errorResponse.stack
  res.status(err.statusCode).json(errorResponse)
}