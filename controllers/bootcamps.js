const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utilities/geocoder');
const ErrorResponse = require('../utilities/errorResponse');

// @desc    get all bootcamps
// @route   GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advencedResults);
});

// @desc    get single bootcamp
// @route   GET /api/v1/bootcamps/:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
  // if => checks if the id exists in the database
  if (!bootcamp) {
    return new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`,
      404
    );
  }
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update  bootcamp
// @route   PUT /api/v1/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return res.status(400).json({ success: false, data: 'not found' });
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete  bootcamp
// @route   DELETE /api/v1/bootcamps/:id
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return new ErrorResponse(
      `Resource not found with id of ${req.params.id}`,
      404
    );
  }
  // trigger the middleware
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    GET  bootcamp within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // get lat/lng
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // calc Radius using radians
  // divide distance by radius of earth
  // Earth radius = 3,393 mi / 6,378 km
  const radius = distance / 6378;
  const bootcamps = await Bootcamp.find({
    //for more: https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Upload photo for  bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
//@access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return new ErrorResponse(
      `Resource not found with id of ${req.params.id}`,
      404
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
      ),
      400
    );
  }
  // Create custom filename and extension using path module
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  //console.log(file.name);
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(
        new ErrorResponse(`Problem with file upload...please try again`),
        500
      );
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
