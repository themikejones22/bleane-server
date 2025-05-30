const { User } = require("../../../models/user/user");
const { ApiError } = require("../../../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../../../config/errors");
const googleService = require("../google");

module.exports.loginWithEmail = async (email, password, deviceToken, lang) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.incorrectCredentials;
      throw new ApiError(statusCode, message);
    }

    // Check if user is deleted
    const isDeleted = user.isDeleted();

    // Check if user has a password
    // HINT: this happens when a user registers with Google
    if (!user.hasPassword()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.auth.hasNoPassword;
      throw new ApiError(statusCode, message);
    }

    // Decoding user's password and comparing it with the password argument
    if (!(await user.comparePassword(password))) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.auth.incorrectCredentials;
      throw new ApiError(statusCode, message);
    }

    // Check if user was deleted and restore it
    if (user.isDeleted()) {
      user.restoreAccount();
    }

    // Update user's device token
    user.updateDeviceToken(deviceToken);

    // Update user's favorite language
    user.updateLanguage(lang);

    // Update user's last login date
    user.updateLastLogin();

    // Save user to the DB
    await user.save();

    return {
      user,
      isDeleted,
    };
  } catch (err) {
    throw err;
  }
};

module.exports.loginWithGoogle = async (googleToken, deviceToken, lang) => {
  try {
    // Decode google token and get user's data
    const googleUser = await googleService.decodeToken(googleToken);

    // Check if user exist
    const user = await User.findOne({ email: googleUser.email });
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.googleAuthError;
      throw new ApiError(statusCode, message);
    }

    // Check if user is deleted
    const isDeleted = user.isDeleted();

    // Check if user was deleted and restore it
    if (user.isDeleted()) {
      user.restoreAccount();
    }

    // Update user's device token
    user.updateDeviceToken(deviceToken);

    // Update user's favorite language
    user.updateLanguage(lang);

    // Update user's last login date
    user.updateLastLogin();

    // Save user to the DB
    await user.save();

    return {
      user,
      isDeleted,
    };
  } catch (err) {
    throw err;
  }
};
