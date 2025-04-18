const { User } = require("../../../models/user/user");
const { ApiError } = require("../../../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../../../config/errors");
const usersService = require("../users");
const googleService = require("../google");

module.exports.registerWithEmail = async (
  email,
  password,
  name,
  deviceToken,
  lang
) => {
  try {
    // Find a user with the given email
    const registeredUser = await User.findOne({ email });

    // Check if there was a user registered with the given email
    if (registeredUser) {
      // Check if password is correct
      const isCorrectPassword = await registeredUser.comparePassword(password);
      if (isCorrectPassword) {
        return {
          user: registeredUser,
          isAlreadyRegistered: true,
        };
      } else {
        const statusCode = httpStatus.FORBIDDEN;
        const message = errors.auth.emailUsed;
        throw new ApiError(statusCode, message);
      }
    }

    // Create user
    const user = new User({
      authType: "email",
      name,
      email,
    });

    // Set user's password
    await user.updatePassword(password);

    // Set user's referral code
    const referralCode = await usersService.genUniqueReferralCode();
    user.setReferralCode(referralCode);

    // Set user's email verification code
    user.updateCode("email");

    // Set user's device token
    user.updateDeviceToken(deviceToken);

    // Set user's favorite language
    user.updateLanguage(lang);

    // Set user's last login date
    user.updateLastLogin();

    // Save user to the DB
    await user.save();

    return {
      user,
      isAlreadyRegistered: false,
    };
  } catch (err) {
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.auth.emailUsed;
      throw new ApiError(statusCode, message);
    }

    throw err;
  }
};

module.exports.registerWithGoogle = async (googleToken, deviceToken, lang) => {
  try {
    // Decode google token and get user's data
    const googleUser = await googleService.decodeToken(googleToken);

    // Find user with google's email
    const registeredUser = await usersService.findUserByEmail(googleUser.email);

    // Return user if it's already registered and tries
    // to register agian with the same gmail
    if (registeredUser) {
      return {
        user: registeredUser,
        isAlreadyRegistered: true,
      };
    }

    // Create user
    const user = new User({
      authType: "google",
      email: googleUser.email,
      name: googleUser.name,
      avatarURL: googleUser.picture || "",
      favLang: lang,
      verified: {
        email: true,
      },
    });

    // Set user's referral code
    const referralCode = await usersService.genUniqueReferralCode();
    user.setReferralCode(referralCode);

    // Set user's device token
    user.updateDeviceToken(deviceToken);

    // Set user's last login date
    user.updateLastLogin();

    // Save user to the DB
    await user.save();

    return {
      user,
      isAlreadyRegistered: false,
    };
  } catch (err) {
    throw err;
  }
};
