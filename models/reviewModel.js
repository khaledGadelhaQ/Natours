const mongoose = require('mongoose');

const { Schema } = mongoose;
const Tour = require('./tourModel');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      requird: [true, 'Review Can not be empty!'],
    },
    rating: {
      type: Number,
      required: true,
      validate: {
        validator: function (el) {
          return el >= 0 && el <= 5;
        },
        message: 'Tour Rating must be between (0-5)',
      },
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      requird: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      requird: [true, 'Review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'tour',
      select: 'name id',
    },
    {
      path: 'user',
      select: 'name photo',
    },
  ]);
  next();
});

reviewSchema.statics.calcRating = async function (tourId) {
  let [stats] = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: null,
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  if (!stats) {
    stats = {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    };
  }
  await Tour.findByIdAndUpdate(tourId, stats, {
    runValidators: true,
    new: true,
  });
};

reviewSchema.post('save', function () {
  this.constructor.calcRating(this.tour);
});
// The post middleware get access so the document
// docs: https://mongoosejs.com/docs/middleware.html#post
reviewSchema.post(/^findOneAnd/, async (doc) => {
  await doc.constructor.calcRating(doc.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
