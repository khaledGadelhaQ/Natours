class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // fail = operational error, error = programming error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // if there is an error we don't not show it in the stack trace to the users
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
