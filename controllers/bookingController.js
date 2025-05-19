const stripe = require('stripe')(
  'sk_test_51LCEpDKItufubWq0tVWbpGasuXyhJIJmJYajvA5iioi1NVSuVmmUK41fDiQigdGzTXw7j0BiSr5RtWm2U8s3zltq00kjS5ZRYB'
);
const Tour = require('../models/TourModel');
const Booking = require('../models/BookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  try {
    // 1 Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2 Create checkout session

    const session = await stripe.checkout.sessions.create({
      payment_method_type: ['card'],
      success_url: `${req.protocol}://${re.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${re.get('host')}/tour/${tour.name}`,
      customer_email: req.user.email,
      client_reference_id: reqe.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://natours.dev/img/tours/{$tour.imageCover}`],
          amount: tour.price * 100,
          currency: 'usd',
          quantity: 1,
        },
      ],
    });

    // 3 Create session and response

    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (error) {
    return new AppError('Error', 500);
  }
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.body;
  if (!tour && !user && !price) return next();
  await Booking.create({
    tour,
    user,
    price,
  });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
