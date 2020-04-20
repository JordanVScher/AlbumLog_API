require('dotenv').config({ path: './config/.env' }); // load env
const express = require('express');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// connect to database
connectDB();

// router files
const albums = require('./routes/albums');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// create app
const app = express();

// body parser
app.use(express.json());

// sanitizes user-supplied data
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// Prevent XXS attacks
app.use(xss());

// Enable CORS
app.use(cors());

// Rate limiting (100 requests in 10 minutes)
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// logging middleware
if (process.env.NODE_ENV === 'DEV') app.use(morgan('dev'));

// File uploading
app.use(fileupload());

// routers
app.use('/api/v1/albums', albums);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

// error middleware
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Err: ${err}`);
  // close server & exit process
  server.close(() => process.exit(1));
});
