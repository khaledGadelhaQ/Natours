// const catchAsyncErrors = require('../Utilities/catchAsyncErrors');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsyncErrors = require('../Utilities/catchAsyncErrors');
const AppError = require('../Utilities/appError');

// cb => callback -> first paramter is the error paramter
// if it null - there is no error  OTHERWISE the app will throw an error
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     // the format is (user-userID-TimeInMillieSeconds)
//     // so that there is no two images with the same file format
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// saving images in the buffer
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

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// as we already singned in we can just get the data
// from the req
exports.getMe = (req, res, next) => {
  res.status(200).json({
    user: req.user,
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMyData = catchAsyncErrors(async (req, res, next) => {
  // Check if the modified data include password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is not the correct route for updating the password. Please use /updatePassword instead.',
        400,
      ),
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivateMyAcc = catchAsyncErrors(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    message: 'Your Account is no longer active and will be deleted in 14 days!',
  });
});

exports.photoValidation = catchAsyncErrors((req, res, next) => {
  res.status(200).json({
    status: 'success',
    name: req.file.filename,
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
