const express = require('express');
const tourController = require('../Controllers/tourController');
const authController = require('../Controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
// let the reviewRouter Handle the following route
router.use('/:tourId/review', reviewRouter);
router.get(
  '/tours-within/:dis/center/:coordinates/unit/:ui',
  tourController.getToursWithin,
);
router.get('/distances/:coordinates/unit/:ui', tourController.getDistances);
router
  .route('/top-5-tours')
  .get(tourController.alias, tourController.getAllTours);
router.get('/stats', tourController.tourStats);
router.get('/', tourController.getAllTours);
// protecting all the middlewares after this one.
router.use(authController.protect);

router.get('/:id', tourController.getTour);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').post(tourController.createTour);
router
  .route('/:id')
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(tourController.deleteTour);

module.exports = router;
