const express = require('express');
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.get('/logout', authController.logout);
router.post('/signup',authController.checkUserExist, authController.signUp);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// protect all middlewares after this one
router.use(authController.protect);

router.patch(
  '/photoValidation',
  userController.uploadPhoto,
  userController.resizeUserPhoto,
  userController.photoValidation,
);
router.patch(
  '/updateMyData',
  userController.uploadPhoto,
  userController.resizeUserPhoto,
  userController.updateMyData,
);
router.get('/me', userController.getMe);
router.delete('/deactivateMyAcc', userController.deactivateMyAcc);
// router.delete('/activateMyAcc', authController.activateMyAcc);
router.patch('/updatePassword', authController.updatePassword);
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.restrictTo('admin', 'lead-guide'),
    userController.updateUser,
  )
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
