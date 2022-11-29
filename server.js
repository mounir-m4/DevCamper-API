const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const error = require('./middleware/error');
const connectDB = require('./config/db');
// load env vars
dotenv.config({ path: './config/config.env' });

// connect to database
connectDB();
// load routes files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// init app
const app = express();
// body parser
app.use(express.json());
// dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// file uploading
app.use(fileUpload());
// set static upload
app.use(express.static(path.join(__dirname, 'public')));

// Mount all routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
// alwayes use middleware after routes (cause it's lenear order)
// error handler
app.use(error);
const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} on port ${PORT}`.blue.bold
  )
);
// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server & exit process
  server.close(() => process.exit(1));
});
