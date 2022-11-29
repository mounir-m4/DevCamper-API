const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

const Course = require('../models/Course');
const advencedResults = require('../middleware/advencedResults');

const router = express.Router({ mergeParams: true });
// get & add courses
router
  .route('/')
  .get(
    advencedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(addCourse);
// get Single course && Update && Delete courses
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
