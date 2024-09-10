const multer = require('multer');
const sharp = require('sharp');
const catchAsyncErrors = require('../Utilities/catchAsyncErrors');
const Tour = require('../models/tourModel');
// const APIFeatures = require('../Utilities/apiFeatures');
const AppError = require('../Utilities/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not a valid Image!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsyncErrors(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.images) return next();

  // resize the cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // resize imgaes
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );

  next();
});

exports.alias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsQuantity+price';
  req.query.fields = 'name ratingsQuantity price';
  next();
};

// get request

exports.tourStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: null,
        numTours: { $sum: 1 },
        // secret: '$secret',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $addFields: {
        month: { $month: '$startDates' },
      },
    },
    {
      $sort: {
        numTours: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getDistances = catchAsyncErrors(async (req, res, next) => {
  const { coordinates, ui } = req.params;
  const [lat, lng] = coordinates.split(',');
  // if the request params does not have a latitude and longitude
  // or the distance unit is not kilmoMeter / Mile we return a respond
  // with a bad request
  if (!lat || !lng || (ui !== 'km' && ui !== 'mi')) {
    return next(new AppError('Invalid inputs. Try Again!', 400));
  }

  const multiplier = ui === 'mi' ? 0.00062137 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});

exports.getToursWithin = catchAsyncErrors(async (req, res, next) => {
  const { dis, coordinates, ui } = req.params;
  const [lat, lng] = coordinates.split(',');
  // if the request params does not have a latitude and longitude
  // or the distance unit is not kilmoMeter / Mile we return a respond
  // with a bad request
  if (!lat || !lng || (ui !== 'km' && ui !== 'mi')) {
    return next(new AppError('Invalid inputs. Try Again!', 400));
  }
  /**
   * To convert distance to radians, divide the distance by the radius of the sphere
   *  (for example, the Earth) in the same units as the distance measurement.
   * The equatorial radius of Earth is approximately 3,963.2 miles or 6,378.1 kilometers.
   * https://www.mongodb.com/docs/manual/core/indexes/index-types/geospatial/2d/calculate-distances/#std-label-calculate-distance-spherical-geometry
   */
  const radius = ui === 'mi' ? dis / 3963.2 : dis / 6378.1;
  /**
   * $centerSphere
   *  Defines a circle for a geospatial query that uses spherical geometry.
   *  The query returns documents that are within the bounds of the circle.
   *  You can use the $centerSphere operator on both GeoJSON objects
   *  and legacy coordinate pairs.
   *  To use $centerSphere, specify an array that contains:
   *  The grid coordinates of the circle's center point, and
   *  The circle's radius measured in radians.
   * https://www.mongodb.com/docs/manual/reference/operator/query/centerSphere/#definition
   */
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'reviews');
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
