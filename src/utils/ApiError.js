class ApiError extends Error {
  constructor(statusCode, message) {
    super(message),
    this.statusCode = statusCode,
    this.name = 'ApiError',

    //ghi lại stack trace
    Error.captureStackTrace(this, this.constructor)
  }


}

export default ApiError