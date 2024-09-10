const Tour = require('../models/tourModel');
const AppError = require('../Utilities/appError');
const catchAsyncErrors = require('../Utilities/catchAsyncErrors');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsyncErrors(async (req, res, next) => {
  const tours = await Tour.find();
  if (!tours) {
    return next(new AppError('No Tours macth this URL!', 404));
  }
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review name rating user',
  });

  if (!tour) {
    return next(new AppError('No Tours macth this URL!', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.getLoginForm = catchAsyncErrors(async (rea, res, next) => {
  res.status(200).render('login', {
    title: 'log into you account',
  });
});

exports.getAccount = catchAsyncErrors(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'My account',
  });
});

exports.getMyTours = catchAsyncErrors(async (req, res, next) => {
  // Get all the tours for the current logged in user
  const bookings = await Booking.find({ user: req.user.id });
  // Get all toursIds
  const toursId = await bookings.map((el) => el.tour);
  // Get all tours object
  const tours = await Tour.find({ _id: { $in: toursId } });
  // render the results
  if (tours.length == 0) {
    // render an empty page with a message You have not booked any tours yet
    // TODO
    console.log('empty List');
    res.status(200).render('error');

  }
  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
