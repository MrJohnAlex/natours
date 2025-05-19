const Tour = require('../models/TourModel');
const User = require('../models/UserModel');
const Booking = require('../models/BookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getOverview = catchAsync(async (req, res, next) => {
  // get all tours data from collection
  const tours = await Tour.find();
  // Build template

  // render that template using tours data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const name = req.params.name;
  if (!name) {
    res.status(401).jons({});
  }
  const tour = await Tour.findOne({ name: req.params.name }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.logingForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  try {
    // 1 find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2 find tours with the login user id
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).json({
      title: 'My Tours',
      tours,
    });
  } catch (error) {
    return new AppError('error', error);
  }
});
