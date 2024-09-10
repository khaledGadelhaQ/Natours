const AppError = require('../Utilities/appError');

const castErrorHandler = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const validationErrorHandler = (err) => new AppError(err.message, 400);

const invalidJWTHandler = () =>
  new AppError('invalid token! Login again!', 401);

const expiredJWTHandler = () =>
  new AppError('Your token has expired! Please log in', 401);

const duplicateKeyValueHandler = (err) => {
  const val = err.keyValue.name;
  const message = `Duplicate Field Value: ${val}`;
  return new AppError(message, 400);
};

// production errors:
// Error handling in production from API calls
const prodErrorAPI = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.log('ERROR !!!');
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Error handling in development from our rendered website
const prodErrorWeb = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.log('ERROR !!!');
    res.status(err.statusCode).render('error', {
      message: 'Something went wrong!',
    });
  }
};
// development errors: we want as much details as possible.
// Error handling in development from API calls
const devErrorAPI = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// Error handling in development from our rendered website
const devErrorWeb = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: 'Something went wrong!',
    });
  }
};

// for the following errors we create an instanse of the class AppError
// so that it has the proprty isOriginal so then we can send the error in detealias.
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  const fromAPI = req.originalUrl.startsWith('/api') ? true : false;
  if (process.env.NODE_ENV === 'development') {
    if (fromAPI)
      devErrorAPI(err, res); // error coming from our API
    else devErrorWeb(err, res); // error coming from the website
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (err.name === 'CastError') error = castErrorHandler(err);
    else if (err.code === 11000) error = duplicateKeyValueHandler(err);
    else if (err.name === 'ValidationError')
      error = validationErrorHandler(err);
    else if (err.name === 'JsonWebTokenError') error = invalidJWTHandler();
    else if (err.name === 'TokenExpiredError') error = expiredJWTHandler();

    if (fromAPI)
      prodErrorAPI(error, res); // error coming from our API
    else prodErrorWeb(error, res); // error coming from the website
  }
};
/**
 * we now have to types of errors:
 * Operational - non operational
 * we have to environment:
 * Development - Production
 * in Development we want to show as much information as possible
 * so we can know where is the bug and how can we fix it.
 * in Production we want to share as littile as possible
 * because of security reasons
 * Errors can came from API or Rendered Website
 * in Api errors there is now rendering
 * in the website we must render some meaningful error message
 */
