const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is a required field'],
      trim: true,
      unique: true,
      // select: false
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Not a valid difficulty value',
      },
    },
    startDates: [Date],
    images: [String],
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.8,
      validate: {
        validator: function (value) {
          // 'value' is the ratingsAverage value being validated
          return value <= 5 && value >= 0;
        },
        message: 'Rating must be between 0 and 5',
      },
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
      day: Number,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);
// we can use virtual to insert elemnets to
// a document before we store it in the database
// we don't use arrow functions here because it does not
// have this keyword. this here points to the acutual document
// tourSchema.virtual('durationWeek').get(function () {
//   return Math.round(this.duration / 7);
// });
// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// indexing
tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -createdAt -updatedAt',
  });
  next();
});
// MIDDLEWARE:
// SOME THING THAT HAPPENS BETWEEN TWO THINGS
// DOCUMENT MIDDLEWARE:
// we can create doucument middlewares to have a control on
// the document on the server
// tourSchema.pre('save', function (next) {
//   // .save() will be called when we create a new document (POST requests)
//   this.name = this.name.toUpperCase();
//   next();
// });

// QUERY MIDDLEWARE:
// tourSchema.pre('find', function (next) {
//   this.find({ difficulty: { $ne: 'easy' } });
//   next();
// });

// AGGREGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
  // this._pipeline.unshift({ $match: { ratingsAverage: { $gte: 4.5 },} });
  console.log(this._pipeline);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
