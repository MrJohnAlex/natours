const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:name', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.logingForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
module.exports = router;
