const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advencedResults = require('../middleware/advencedResults');

// include other resource routers to perform a (relationships between docs(tables))
const courseRouter = require('./courses');

const router = express.Router();

// re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

// get bootcamps by radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// for photo
router.route('/:id/photo').put(bootcampPhotoUpload);

// routes
router
  .route('/')
  .get(advencedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);
//routes with id
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
