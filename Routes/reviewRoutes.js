const express = require('express');

const authController = require('../Controllers/authController');
const reviewController = require('../Controllers/reviewController');
// allows to merge params from different routers so you can access those params here
// in the reviewRouter
const router = express.Router({ mergeParams: true });
// protecting all the middlewares after this one.
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.createValidator,
    reviewController.createReview,
  );
router
  .route('/:id')
  .delete(reviewController.validateOwner, reviewController.deleteReview)
  .patch(
    reviewController.updateValidator,
    reviewController.validateOwner,
    reviewController.updateReview,
  )
  .get(reviewController.getReview);

module.exports = router;
