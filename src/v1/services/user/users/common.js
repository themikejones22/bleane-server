const { User } = require("../../../models/user/user");
const httpStatus = require("http-status");
const localStorage = require("../../storage/local");
const cloudStorage = require("../../cloud/storage");
const { ApiError } = require("../../../middleware/apiError");
const errors = require("../../../config/errors");
const innerServices = require("./inner");
const adminServices = require("./admin");

module.exports.findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    return null;
  }
};

module.exports.authenticateUser = async (user, lang, deviceToken) => {
  try {
    // [OPTIONAL]: Update user's favorite language
    user.updateLanguage(lang);

    // [OPTIONAL]: Update user's device token
    user.updateDeviceToken(deviceToken);

    // Update user's last login date
    user.updateLastLogin();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.resendEmailVerificationCode = async (user) => {
  try {
    // Check if user's email is verified
    if (user.isEmailVerified()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.emailAlreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Update user's email verification code
    user.updateCode(key);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.verifyEmail = async (user, code) => {
  try {
    // Check if user's emailis verified
    if (user.isEmailVerified()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user[`${key}AlreadyVerified`];
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode(key, code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isValidCode = user.isValidCode(key);
    if (!isValidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email
    user.verifyEmail();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.checkCode = (key, user, code) => {
  try {
    // Check if code is valid
    const isValid = user.isValidCode(key);

    // Check if code is correct
    const isCorrect = user.isMatchingCode(key, code);

    // Calculate remaining time
    const { days, hours, minutes, seconds } = user.getCodeRemainingTime(key);

    return {
      isValid,
      isCorrect,
      remainingDays: days,
      remainingHours: hours,
      remainingMinutes: minutes,
      remainingSeconds: seconds,
    };
  } catch (err) {
    throw err;
  }
};

module.exports.checkIfEmailUsed = async (email) => {
  try {
    // Find user with the given email
    const user = await User.findOne({ email });
    return !!user;
  } catch (err) {
    throw err;
  }
};

module.exports.verifyEmailByLink = async (token, code) => {
  try {
    const payload = innerServices.validateToken(token);

    // Check if user exists
    const user = await User.findById(payload.sub);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user's email is already verified
    if (user.isEmailVerified()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.emailAlreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode("email", code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isValidCode = user.isValidCode("email");
    if (!isValidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email
    user.verifyEmail();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.sendForgotPasswordCode = async (email) => {
  try {
    // Check if user exists
    const user = await adminServices.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Update password reset code
    user.updateCode("password");

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.resetPasswordWithCode = async (email, code, newPassword) => {
  try {
    // Check if user exists
    const user = await adminServices.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode("password", code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isValidCode = user.isValidCode("password");
    if (!isValidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Update password
    await user.updatePassword(newPassword);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.changePassword = async (user, oldPassword, newPassword) => {
  try {
    // Decoding user's password and comparing it with the old password
    if (!(await user.comparePassword(oldPassword))) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.auth.incorrectOldPassword;
      throw new ApiError(statusCode, message);
    }

    // Decoding user's password and comparing it with the new password
    if (await user.comparePassword(newPassword)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.oldPasswordMatchNew;
      throw new ApiError(statusCode, message);
    }

    // Update password
    await user.updatePassword(newPassword);

    // Save user
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.updateProfile = async (user, name, email) => {
  try {
    if (name) {
      user.updateName(name);
    }

    if (email) {
      user.updateEmail(email);
    }

    if (name || email) {
      await user.save();
    }

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.updateEmail = async (user, email) => {
  try {
    // Check if new email equals the previous email
    if (user.getEmail() === email) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.newEmailMatchesPrev;
      throw new ApiError(statusCode, message);
    }

    // Checking if email used
    const isEmailUsed = await adminServices.findUserByEmail(email);
    if (isEmailUsed) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.auth.emailUsed;
      throw new ApiError(statusCode, message);
    }

    // Update user's email
    user.updateEmail(email);

    // Mark user's email as not verified
    user.unverifyEmail();

    // Update user's email verification code
    user.updateCode("email");

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.updateAvatar = async (user, avatar) => {
  try {
    // Check if user has an avatar that's stored on the bucket
    if (user.getAvatarURL() && !user.hasGoogleAvatar()) {
      await cloudStorage.deleteFile(user.getAvatarURL());
      user.clearAvatarURL();
    }

    // Store file locally in the `uploads` folder
    const localPhoto = await localStorage.storeFile(avatar);

    // Upload file from `uploads` folder to cloud bucket
    const cloudPhotoURL = await cloudStorage.uploadFile(localPhoto);

    // Delete previous avatar picture from cloud bucket
    await cloudStorage.deleteFile(user.getAvatarURL());

    // Update user's avatar URL
    user.updateAvatarURL(cloudPhotoURL);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.deleteAvatar = async (user) => {
  try {
    // Check if doesn's have an avatar URL
    if (!user.getAvatarURL()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.noAvatar;
      throw new ApiError(statusCode, message);
    }

    // Check if user's avatar URL does not point
    // to this server or any of app's storage buckets
    if (!user.hasGoogleAvatar()) {
      await cloudStorage.deleteFile(user.getAvatarURL());
    }

    // Set user's avatar to an empty string
    user.clearAvatarURL();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.switchLanguage = async (user) => {
  try {
    // Switch user's language
    user.switchLanguage();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.updateLink = async (user, linkKey, linkValue) => {
  try {
    // Update user's link
    user.updateLink(linkKey, linkValue);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.removeLink = async (user, linkKey) => {
  try {
    // Update user's link
    user.removeLink(linkKey);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.seeNotifications = async (user) => {
  try {
    // Check all user's notifications
    const { isAllSeen, list } = user.seeNotifications();

    // Throw an error in case of all user's notifications
    // are already seen
    if (isAllSeen) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.notificationsSeen;
      throw new ApiError(statusCode, message);
    }

    // Save the user
    await user.save();

    // Return user's notifications
    return list;
  } catch (err) {
    throw err;
  }
};

module.exports.clearNotifications = async (user) => {
  try {
    // Clear notifications
    const isEmpty = user.clearNotifications();

    // Check if notifications are empty
    if (isEmpty) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.noNotifications;
      throw new ApiError(statusCode, message);
    }

    // Save the user
    await user.save();

    // Return user's notifications
    return user.notifications;
  } catch (err) {
    throw err;
  }
};

module.exports.disableNotifications = async (user) => {
  try {
    // Disable notifications for user
    user.disableNotifications();

    // Save the user
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.enableNotifications = async (user) => {
  try {
    // Disable notifications for user
    user.enableNotifications();

    // Save the user
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.requestAccountDeletion = async (user) => {
  try {
    // Update user's account deletion code
    user.updateCode("deletion");

    // Save the user
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.confirmAccountDeletion = async (token, code) => {
  try {
    const payload = innerServices.validateToken(token);

    // Check if user exists
    const user = await User.findById(payload.sub);
    if (!user || user.isDeleted()) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode("deletion", code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isValidCode = user.isValidCode("deletion");
    if (!isValidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Mark user as deleted
    // user.markAsDeleted();

    // Delete user from the DB
    await user.deleteOne();

    return user;
  } catch (err) {
    throw err;
  }
};
