const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      requird: [true, 'Please provide us with your name!'],
    },
    email: {
      type: String,
      requird: [true, 'Please Provide a valid email address!'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Provide a valid email address!'],
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guide', 'lead-guide'],
      default: 'user',
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    password: {
      type: String,
      required: [
        true,
        'Please Provide a valid Password of minimum 8 characters',
      ],
      select: false,
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      requird: [true, 'Please Confirm your password'],
      select: false,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords don't match",
      },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: true,
    toObject: true,
  },
);

// using hash library (bcryptjs) to hash the passwords before saving
// in the database
userSchema.pre('save', async function (next) {
  /**
   * @param this = the current document
   */
  // we hash the password and save it int the database when it acuttaly
  // changes.
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 13);
  // we set passwordConfirm to undefined because we don't need it anymore
  // we just uesed to validate the user inputs
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.verifyPassword = async function (data) {
  return await bcrypt.compare(data, this.password);
};

userSchema.methods.passwordChangedAt = function (JWTIst) {
  if (this.passwordChanged) {
    return this.passwordChanged.getTime() / 1000 > JWTIst;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const tmpToken = crypto.randomBytes(20).toString('hex');
  // we hash the token before we save it in the DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(tmpToken)
    .digest('hex');
  const OneHour = 60 * 60 * 1000;
  this.passwordResetExpires = Date.now() + OneHour;
  // we return the original token
  return tmpToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
