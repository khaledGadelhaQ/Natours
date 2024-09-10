const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);

// connecting to our database.
mongoose.connect(DB);

const data = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8'),
);
const importTours = async () => {
  try {
    await Tour.create(data);
    console.log('Tours saved to the DB Successfully 🏆');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('DB is now empty 🙊');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

const reviewData = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8'),
);
const importReviews = async () => {
  try {
    await Review.create(reviewData);
    console.log('Reviews saved to the DB Successfully 🏆');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'),
);
const importUsers = async () => {
  try {
    await User.create(usersData);
    console.log('Users saved to the DB Successfully 🏆');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === 'import-tours') importTours();
if (process.argv[2] === 'import-reviews') importReviews();
if (process.argv[2] === 'import-users') importUsers();
if (process.argv[2] === 'delete') deleteData();
