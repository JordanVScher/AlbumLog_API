const express = require('express');
const dotenv = require('dotenv');

// load env
dotenv.config({ path: './config/.env' });
const PORT = process.env.PORT || 5000;

const app = express();

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`));

// handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Err: ${err}`);
  // close server & exit process
  server.close(() => process.exit(1));
});
