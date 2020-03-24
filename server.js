require('dotenv').config({ path: './config/.env' }); // load env
const express = require('express');
const connectDB = require('./config/db');

// connect to database
connectDB();

// start server
const app = express();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`));

// handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Err: ${err}`);
  // close server & exit process
  server.close(() => process.exit(1));
});
