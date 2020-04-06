require('dotenv').config({ path: './config/.env' }); // load env
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// connect to database
connectDB();

// router files
const albums = require('./routes/albums');
const auth = require('./routes/auth');

// create app
const app = express();

// body parser
app.use(express.json());

// middleware and routers
if (process.env.NODE_ENV === 'DEV') app.use(morgan('dev'));
app.use('/api/v1/albums', albums);
app.use('/api/v1/auth', auth);
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`));

// handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Err: ${err}`);
  // close server & exit process
  server.close(() => process.exit(1));
});
