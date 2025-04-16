const commonMiddleware = require("../common");
const { server } = require("../../../config/system");

module.exports.validateAuthenticateUser = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.conditionalCheck("lang", commonMiddleware.checkLanguage),
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.next,
];

module.exports.validateUpdateProfile = [
  commonMiddleware.conditionalCheck("name", commonMiddleware.checkName),
  commonMiddleware.conditionalCheck("email", commonMiddleware.checkEmail),
  commonMiddleware.next,
];

module.exports.validateUpdateEmail = [
  commonMiddleware.checkEmail,
  commonMiddleware.next,
  commonMiddleware.limitUpdateEmail,
];

module.exports.validateUpdateAvatar = [
  commonMiddleware.checkFile("avatar", server.SUPPORTED_PHOTO_EXTENSIONS, true),
];

////////////////////////////////////////////////////////////
module.exports.validateSendEmailVerificationCode = [
  commonMiddleware.limitSendEmailVerificationCode,
];

module.exports.validateVerifyEmailByLink = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkCode,
  commonMiddleware.next,
];

module.exports.validateHanfleForgotPassword = [
  commonMiddleware.checkEmail,
  commonMiddleware.checkNewPassword,
  commonMiddleware.checkCode,
  commonMiddleware.next,
];

module.exports.validateSendForgotPasswordCode = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkEmail,
  commonMiddleware.conditionalCheck("sendTo", commonMiddleware.checkSendTo),
  commonMiddleware.next,
  commonMiddleware.limitSendForgotPasswordCode,
];

module.exports.validateUpdateLink = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkLinkKey,
  commonMiddleware.checkLinkValue,
  commonMiddleware.next,
];

module.exports.validateRemoveLink = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkLinkKey,
  commonMiddleware.next,
];

module.exports.validateRequestAccountDeletion = [
  commonMiddleware.limitSendAccountDeletionCode,
];

module.exports.validateConfirmAccountDeletion = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkCode,
  commonMiddleware.next,
];

module.exports.validateUpdateUserRole = [
  commonMiddleware.checkEmail,
  commonMiddleware.checkRole(true),
  commonMiddleware.next,
];

module.exports.validateVerifyUser = [
  commonMiddleware.checkEmail,
  commonMiddleware.next,
];

module.exports.validateFindUserByEmail = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkEmail,
  commonMiddleware.checkRole(true),
  commonMiddleware.next,
];

module.exports.validateSendNotification = [
  commonMiddleware.checkUserIds,
  commonMiddleware.checkNotificationTitleEN,
  commonMiddleware.checkNotificationTitleAR,
  commonMiddleware.checkNotificationBodyEN,
  commonMiddleware.checkNotificationBodyAR,
  commonMiddleware.next,
];

module.exports.validateChangePassword = [
  commonMiddleware.conditionalCheck(
    "oldPassword",
    commonMiddleware.checkOldPassword
  ),
  commonMiddleware.checkNewPassword,
  commonMiddleware.next,
];

module.exports.validateCode = [
  commonMiddleware.checkCode,
  commonMiddleware.next,
];

module.exports.validateEmail = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkEmail,
  commonMiddleware.next,
];

module.exports.validateGetMostUsedUsers = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkPage,
  commonMiddleware.checkLimit,
  commonMiddleware.next,
];
