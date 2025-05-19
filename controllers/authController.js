const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const cookieOptions = {
  expiresIn: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};
const createAndSendToken = async (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  // Generate JWT
  createAndSendToken(newUser, 200, res, next);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // Check if user exists and password is correct
  const user = await User.findOne({
    email,
  }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // GENERATE JWT TOKEN
  createAndSendToken(user, 200, res, next);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 ) Check if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }
  // 1 ) Generate reset token
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  // 2 ) Send email
  try {
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Reset password email sent',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(error.message));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 ) Get user base on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  // 2 ) Set New password only if token has not expired, set new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  // 3 ) Update user password and reset tokens
  // 4 ) Log user in and sent JWT token
  createAndSendToken(user, 200, res, next);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 = Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization?.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in', 401));
  }
  // 1 = Verfiaction of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3= Check user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('User no longer exists', 401));
  }
  // 4 = Check if user changed password after the token was issued
  if (currentUser.changedPasswordAt(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password. Please login again to continue',
        401
      )
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 = Get user from request
  const user = await User.findById(req.user._id).select('+password');
  // 2 = Check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Incorrect current password', 401));
  }
  // 3 = Update password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4 = Log user in and send JWT token
  createAndSendToken(user, 200, res, next);
});

// only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  try {
    // 1 = Getting token and check of it's there
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
      // 1 = Verfiaction of token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      // 3= Check user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }
      // 4 = Check if user changed password after the token was issued
      if (currentUser.changedPasswordAt(decoded.iat)) {
        return next();
      }

      // Login User
      res.locals.user = currentUser;
      return next();
    }
  } catch (error) {
    return next();
  }
  next();
};
