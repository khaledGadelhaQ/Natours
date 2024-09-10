const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user!'],
    },
    price: {
      type: Number,
      require: [true, 'Booking must have a price!'],
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'tour',
      select: 'name id',
    },
    {
      path: 'user',
      select: 'name email'
    },
  ]);
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
