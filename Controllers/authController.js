const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../Utilities/catchAsyncErrors');
const AppError = require('../Utilities/appError');
const Email = require('../Utilities/email');

const getToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (statusCode, user, res) => {
  const token = getToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  // setting the password to undefined so that it won't appear when creating new user
  // don't worry we are not saving it in the DB 😂😂
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

////-------------> AUTHENTICATION <-------------- ////

exports.checkUserExist = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next();
  // users exist
  res.status(200).json({
    status: 'fail',
    message: 'there is an existing account with this email. Log in instead.',
    redirect: '/welcomeBack'
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  // sending a welcome email to the user
  let url = `${req.protocol}://127.0.0.1:5000/me`;
  if (process.env.NODE_ENV === 'production') {
    url = `${req.protocol}://${req.get('host')}/me`;
  }
  await new Email(user, url).sendWelcome();
  createSendToken(201, user, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if there is a email and password in the body
  if (!email || !password) {
    return next(new AppError('Please Enter your email and password', 400));
  }
  // 2) check if User exits in the DB
  const user = await User.findOne({ email }).select('+password');
  // 3) check if password matches the user password
  if (!user || !(await user.verifyPassword(password))) {
    return next(new AppError('Wrong email address or password', 401));
  }
  createSendToken(200, user, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log(`Protect middleware hit on ${req.originalUrl}`);
  // 1) Get the token from the req headers and check if it a valid one or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Your are not logged in! Please log in to get access', 401),
    );
  }
  // 2) Verification token
  const encoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) check user still exits and has not been deleted
  const curUser = await User.findById(encoded.id);
  if (!curUser) {
    return next(new AppError('The user does not exists anymore!'));
  }
  // 4) check if the user changed the password or not
  if (curUser.passwordChangedAt(encoded.iat)) {
    return next(new AppError('The password has changed! Log in again', 401));
  }
  req.user = curUser;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Get the token from the req headers and check if it a valid one or not
  if (!req.cookies.jwt) return next();
  // 2) Verification token
  const encoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET,
  );
  // 3) check user still exits and has not been deleted
  const curUser = await User.findById(encoded.id);
  if (!curUser) {
    return next();
  }
  // 4) check if the user changed the password or not
  if (curUser.passwordChangedAt(encoded.iat)) {
    return next();
  }
  res.locals.user = curUser; // to use in pug templates
  req.user = curUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get the email from the request body & user from DB
  const { email } = req.body;
  const user = await User.findOne({ email });
  // If no user with this email
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  // Generate a random token
  const token = await user.createResetPasswordToken();
  await user.save();
  // we send the token with email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${token}`;
  // const message = `You are receiving this because you (or someone else)
  //  have requested to reset your password. Please click on the following
  //  link, or paste it into your browser to complete the process: ${resetUrl}`;

  try {
    await new Email(user, resetUrl).sendResetPassword();
    res.status(200).json({
      status: 'success',
      message: 'Token sent in the email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new AppError('Failed to send email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the token form the req parama & check if its equal to the hased one in the DB
  const recivedToken = req.params.token;
  const hasedToken = crypto
    .createHash('sha256')
    .update(recivedToken)
    .digest('hex');
  // we now check if the user with this token exits or not &
  // current Time is less that passwordResetExpires
  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwrodConfirm = req.body.passwrodConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  createSendToken(200, user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get Current password from req.body and see if it matches the acutual password
  const { currentPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.verifyPassword(currentPassword))) {
    return next(new AppError('Incorrect password!', 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(200, user, res);
});

////-------------> AUTHORIZATION <-------------- ////

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have the permission to do that!', 403),
      );
    }
    next();
  };
};
