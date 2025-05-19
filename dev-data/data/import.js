const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/TourModel');
const User = require('./../../models/UserModel');
const Review = require('./../../models/ReviewModel');

dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;

const DB_URL = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('Connected...'));

const tours = fs.readFileSync(`${__dirname}/tours.json`, {
  encoding: 'utf8',
});
const users = fs.readFileSync(`${__dirname}/users.json`, {
  encoding: 'utf8',
});
const reviews = fs.readFileSync(`${__dirname}/reviews.json`, {
  encoding: 'utf8',
});

const toursData = JSON.parse(tours);
const usersData = JSON.parse(users);
const reviewsData = JSON.parse(reviews);

const importData = async () => {
  try {
    await Tour.create(toursData, {
      // validateBeforeSave: false,
    });
    await User.create(usersData, {
      validateBeforeSave: false,
    });
    await Review.create(reviewsData, {
      // validateBeforeSave: false,
    });
    console.log('Data imported successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
