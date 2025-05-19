const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRoutes');

const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const bookingRouter = require('./routers/bookingRoutes');
const viewRouter = require('./routers/viewRoutes');

const app = express();
app.use(cors());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // for Mapbox GL JS
        'blob:', // ✅ allow blob: for Web Workers
        'https://cdn.jsdelivr.net',
        'https://api.mapbox.com',
      ],
      workerSrc: [
        "'self'",
        'blob:', // ✅ allow blob workers
        'https://api.mapbox.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://api.mapbox.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.mapbox.com'],
      imgSrc: ["'self'", 'data:', 'https://api.mapbox.com'],
    },
  })
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour,
  message: 'Too many requests from this IP, please try again in 1 hour.',
});

app.use('/api', limiter);

// midlewares
// Body parser , for reading data from body into req.body
app.use(
  express.json({
    limit: '100kb',
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);
app.use(cookieParser());

// mongo sanitize to prevent NoSQL query injection
app.use(mongoSanitize());

// xss to prevent cross-site scripting
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);

app.use((req, res, next) => {
  console.log('Middleware: Request received');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`), 404);
});

app.use(globalErrorHandler);

module.exports = app;
