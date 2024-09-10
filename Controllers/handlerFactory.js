const catchAsyncErrors = require('../Utilities/catchAsyncErrors');
const AppError = require('../Utilities/appError');
const APIFeatures = require('../Utilities/apiFeatures');

const getName = (Model) => `${Model.modelName.toLowerCase()}`;

exports.deleteOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id).exec();
    if (!doc) {
      return next(
        new AppError(`Invalid ${Model.modelName.toLowerCase()} ID`, 404),
      );
    }
    res.status(200).json({
      status: 'success',
    });
  });

exports.updateOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the document after the modification
      runValidators: true, // validates the updates with the document schema
    }).exec();

    const name = getName(Model);
    if (!doc) {
      return next(new AppError(`Invalid ${name} ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      message: `${name} updated`,
      data: {
        name: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.create(req.body);

    const name = getName(Model);
    if (!doc) {
      return next(new AppError(`Invalid ${name} ID`, 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        name: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsyncErrors(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    const name = getName(Model);
    if (!doc) {
      return next(new AppError(`Invalid ${name} ID`, 404));
    }

    res.status(200).json({
      statue: 'success',
      data: {
        name: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsyncErrors(async (req, res, next) => {
    // To allow get reviews on tour routes
    const filter = req.params.tourId ? { tour: req.params.tourId } : {};
    const API = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .paginate()
      .limitFields();
    const docs = await API.query;
    // const docs = await API.query.explain();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });
