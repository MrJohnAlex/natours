const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authcontroller = require('./../controllers/authcontroller');
const router = express.Router({ mergeParams: true });

router.use(authcontroller.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authcontroller.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authcontroller.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authcontroller.restrictTo('user', 'admin'),
    reviewController.updateReview
  );
module.exports = router;
