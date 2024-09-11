const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./Utilities/appError');
const errorHandler = require('./Controllers/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const viewRouter = require('./Routes/viewRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const bookingController = require('./Controllers/bookingController');
// Middlewares
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// to render html,css on the browser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// set Security HTTP Headrs
app.use(helmet());
// Further HELMET configuration for Security Policy (CSP)

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", 'https://unpkg.com', 'https://js.stripe.com'],
        'img-src': ["'self'", 'data:', 'blob:', 'https:', 'https://unpkg.com'],
        'frame-src': ["'self'", 'https://js.stripe.com'], // Allow Stripe in frames
        // Add other directives as needed
      },
    },
  }),
);

// Rate-Limiting for the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1-Hour
  message: 'Too many requestes from this ID, please try again in an hour!',
});
app.use('/api', limiter);

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Compressing text and json respond
app.use(compression());
// Data sanitization against XSS
app.use(xss());

app.use('/', viewRouter);
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/bookings', bookingRouter);

// Body parser, so we can user req.body
// if the request route is not found in the above route handler
// it will be caught by the following function
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find this route on the server ${req.originalUrl}`, 404),
  );
});

// MIDDLEWARE ERROR HANDLER
app.use(errorHandler);

module.exports = app;
