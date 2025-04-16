const httpStatus = require("http-status");
const _ = require("lodash");
const { clientSchema } = require("../../../models/user/user");
const {
  usersService,
  emailService,
  loginActivitiesService,
} = require("../../../services");
const success = require("../../../config/success");
const { user: userNotifications } = require("../../../config/notifications");

module.exports.authenticateUser = async (req, res, next) => {
  try {
    const user = req.user;
    const { lang, deviceToken, socketId } = req.query;

    const newUser = await usersService.authenticateUser(
      user,
      lang,
      deviceToken
    );

    // Create the response object
    const response = _.pick(newUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);

    // Connect user's socket to their own room
    usersService.joinSocketToUserRoom(socketId, user._id);

    // Parse client data
    const { osName } = usersService.parseUserAgent(req);

    // Send login activity email to user
    await emailService.sendLoginActivityEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getName(),
      osName
    );

    // Send notification to user
    await usersService.sendNotification(
      [user._id],
      userNotifications.newLoginActivity(user.getLastLogin())
    );

    // Add login activity to user
    await loginActivitiesService.createLoginActivity(req, user);
  } catch (err) {
    next(err);
  }
};

module.exports.recordVisit = async (req, res, next) => {
  try {
    const { user, visitor } = req.body;

    // Create the response object
    const response = { success: true, error: false };
    res.status(httpStatus.CREATED).json(response);

    const { osName, browser, ua } = usersService.parseUserAgent(req);
    const browserName = `${browser.name} ${browser.version}`;

    await emailService.sendNewWebsiteVisit(
      "en",
      "thedev.samer@gmail.com",
      user,
      visitor,
      osName,
      browserName,
      ua
    );
  } catch (err) {
    next(err);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email } = req.body;

    const updatedUser = await usersService.updateProfile(user, name, email);

    // Create the response object
    const response = {
      user: _.pick(updatedUser, clientSchema),
      token: updatedUser.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.updateEmail = async (req, res, next) => {
  try {
    const user = req.user;
    const { email } = req.body;

    // Asking service to update user's profile data
    const updatedUser = await usersService.updateEmail(user, email);

    // Create the response object
    const response = {
      user: _.pick(updatedUser, clientSchema),
      token: updatedUser.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);

    // Construct verification email
    const host = req.get("host");
    const protocol =
      host.split(":")[0] === "localhost" ? "http://" : "https://";
    const endpoint = "/api/users/email/verify/fast";
    const code = updatedUser.getCode("email");
    const token = updatedUser.genAuthToken();
    const verificationLink = `${protocol}${host}${endpoint}?code=${code}&token=${token}`;

    // Send email to user
    await emailService.sendChangeEmail(
      updatedUser.getLanguage(),
      updatedUser.getEmail(),
      updatedUser.getCode("email"),
      updatedUser.getName(),
      verificationLink
    );
  } catch (err) {
    next(err);
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  try {
    const user = req.user;
    const avatar = req?.files?.avatar;

    // Asking service to remove user's avatar picture
    const newUser = await usersService.updateAvatar(user, avatar);

    // Create the response object
    const response = _.pick(newUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to remove user's avatar picture
    const newUser = await usersService.deleteAvatar(user);

    // Create the response object
    const response = _.pick(newUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.switchLanguage = async (req, res, next) => {
  try {
    const user = req.user;

    const updatedUser = await usersService.switchLanguage(user);

    const response = _.pick(updatedUser, clientSchema);

    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.updateLink = async (req, res, next) => {
  try {
    const user = req.user;
    const { linkKey } = req.params;
    const { link: linkValue } = req.body;

    const updatedUser = await usersService.updateLink(user, linkKey, linkValue);

    const response = _.pick(updatedUser, clientSchema);

    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.removeLink = async (req, res, next) => {
  try {
    const user = req.user;
    const { linkKey } = req.params;

    const updatedUser = await usersService.removeLink(user, linkKey);

    const response = _.pick(updatedUser, clientSchema);

    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.seeNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to mark all user's notifications as seen
    const notifications = await usersService.seeNotifications(user);

    // Create the response object
    const response = {
      notifications,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.clearNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to delete all user's notifications
    const notifications = await usersService.clearNotifications(user);

    // Create the response object
    const response = {
      notifications,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.disableNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to disable notifications for user
    const updatedUser = await usersService.disableNotifications(user);

    // Create the response object
    const response = _.pick(updatedUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.enableNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to enable notifications for user
    const updatedUser = await usersService.enableNotifications(user);

    // Create the response object
    const response = _.pick(updatedUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.requestAccountDeletion = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to delete all user's notifications
    const newUser = await usersService.requestAccountDeletion(user);

    // Create the response object
    const response = success.auth.accountDeletionCodeSent;

    // Send response back to the client
    res.status(httpStatus.OK).json(response);

    // Construct deletion link
    const host = req.get("host");
    const protocol =
      host.split(":")[0] === "localhost" ? "http://" : "https://";
    const endpoint = "/api/users/account/deletion/confirm";
    const code = newUser.getCode("deletion");
    const token = newUser.genAuthToken();
    const deletionLink = `${protocol}${host}${endpoint}?code=${code}&token=${token}`;

    // Send email to user
    await emailService.sendAccountDeletionCodeEmail(
      newUser.getLanguage(),
      newUser.getEmail(),
      newUser.getName(),
      deletionLink
    );
  } catch (err) {
    next(err);
  }
};

module.exports.confirmAccountDeletion = async (req, res, next) => {
  try {
    const { token, code } = req.query;

    // Delete user and their data
    const user = await usersService.confirmAccountDeletion(token, code);

    // Create the response object
    const response = success.auth.accountDeleted[user.getLanguage()];

    // Send response back to the client
    res.status(httpStatus.OK).send(response);

    // Send an email to the user
    await emailService.sendAccountDeletedEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getName()
    );
  } catch (err) {
    next(err);
  }
};

module.exports.resendEmailVerificationCode = async (req, res, next) => {
  try {
    const user = req.user;
    const { lang } = req.query;

    // Asking service to send user's emailverification code
    const newUser = await usersService.resendEmailVerificationCode(user, lang);

    // Create the response object
    const response = {
      ok: true,
      message: success.auth.emailVerificationCodeSent,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);

    // Sending email verification code to user's email
    // Construct verification email
    const host = req.get("host");
    const protocol =
      host.split(":")[0] === "localhost" ? "http://" : "https://";
    const endpoint = "/api/users/email/verify/fast";
    const code = newUser.getCode("email");
    const token = newUser.genAuthToken();
    const verificationLink = `${protocol}${host}${endpoint}?code=${code}&token=${token}`;

    await emailService.sendVerificationCodeEmail(
      newUser.getLanguage(),
      newUser.getEmail(),
      code,
      newUser.getName(),
      verificationLink
    );
  } catch (err) {
    next(err);
  }
};

module.exports.verifyEmail = (key) => async (req, res, next) => {
  try {
    const user = req.user;
    const { code } = req.body;

    // Asking service to verify user's email
    const verifiedUser = await usersService.verifyEmail(key, user, code);

    // Create the response object
    const response = _.pick(verifiedUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);

    // Notify user that proccess is accomplished successfully
    // and send a message to user's email
    await emailService.sendEmailVerifiedEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getName()
    );
  } catch (err) {
    next(err);
  }
};

module.exports.checkCode = (key) => async (req, res, next) => {
  try {
    const user = req.user;
    const { code } = req.body;

    // Asking service to check for user's
    // verification code status
    const {
      isCorrect,
      isValid,
      remainingDays,
      remainingHours,
      remainingMinutes,
      remainingSeconds,
    } = usersService.checkCode(key, user, code);

    // Create the response object
    const response = {
      key,
      isValid,
      isCorrect,
      remainingDays,
      remainingHours,
      remainingMinutes,
      remainingSeconds,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.checkIfEmailUsed = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the given email used
    const isUsed = await usersService.checkIfEmailUsed(email);

    // Create the response object
    const response = {
      email,
      isUsed,
    };

    // Send the response back to client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.verifyEmailByLink = async (req, res, next) => {
  try {
    const { token, code } = req.query;

    const user = await usersService.verifyEmailByLink(token, code);

    // Create the response object
    const response = success.auth.emailVerified[user.getLanguage()];

    // Send response back to the client
    res.status(httpStatus.OK).send(response);

    // Send email to user
    await emailService.sendEmailVerifiedEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getName()
    );
  } catch (err) {
    next(err);
  }
};

module.exports.sendForgotPasswordCode = async (req, res, next) => {
  try {
    let { email, sendTo } = req.query;

    // Asking service to update user's password reset code
    const user = await usersService.sendForgotPasswordCode(email);

    // Create the response object
    const response = {
      ok: true,
      message: success.auth.passwordResetCodeSentToEmail,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);

    // Send password reset code to email
    await emailService.sendForgotPasswordEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getCode("password"),
      user.getName()
    );
  } catch (err) {
    next(err);
  }
};

module.exports.handleForgotPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    // Asking service to reset user's password using the forgot
    // password code that the user has received it
    const user = await usersService.resetPasswordWithCode(
      email,
      code,
      newPassword
    );

    // Create the response object
    const response = _.pick(user, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);

    // Send email to user
    await emailService.sendPasswordChangedEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getName()
    );
  } catch (err) {
    next(err);
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    // Asking service to change user's password
    const updatedUser = await usersService.changePassword(
      user,
      oldPassword,
      newPassword
    );

    // Create the response object
    const response = {
      user: _.pick(updatedUser, clientSchema),
      token: updatedUser.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);

    // Send email to user
    await emailService.sendPasswordChangedEmail(
      user.getLanguage(),
      user.getEmail(),
      user.getName()
    );
  } catch (err) {
    next(err);
  }
};
