const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authcontroller = require('./../controllers/authcontroller');
const router = express.Router({ mergeParams: true });

router.use(authcontroller.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authcontroller.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getBooking)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking);
module.exports = router;
