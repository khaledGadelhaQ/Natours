const express = require('express');
const viewController = require('../Controllers/viewController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.use(viewController.alerts);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);
router.get('/welcomeBack', viewController.getWelcomeBack);
router.get('/me', viewController.getAccount);
router.get('/my-tours', viewController.getMyTours);

module.exports = router;
