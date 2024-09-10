const AppError = require('../Utilities/appError');
const catchAsyncErrors = require('../Utilities/catchAsyncErrors');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.createValidator = catchAsyncErrors(async (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
});

exports.updateValidator = catchAsyncErrors(async (req, res, next) => {
  if (req.body.user) delete req.body[req.body.user];
  if (req.body.tour) delete req.body[req.body.tour];
  next();
});
// only admins and the user who created this document are allowed to update or delete it.
exports.validateOwner = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === 'admin') return next();
  const { id: userId } = req.user;
  const review = await Review.findOne({
    _id: req.params.id,
    user: userId,
  }).exec();
  if (!review) {
    return next(
      new AppError('You do not have the permission to do this action!', 403),
    );
  }
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
