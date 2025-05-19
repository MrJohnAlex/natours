const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

userRouter.use(authController.protect);

userRouter.patch('/updatePassword', authController.updatePassword);
userRouter.patch(
  '/updateInfo',
  userController.uploadPhoto,
  userController.resizeUserPhoto,
  userController.updateInfo
);
userRouter.delete('/deleteme', userController.deleteUser);
userRouter.get('/get-me', userController.getMe, userController.getUser);

// only admin can perform this action
userRouter.use(authController.restrictTo('admin'));

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
