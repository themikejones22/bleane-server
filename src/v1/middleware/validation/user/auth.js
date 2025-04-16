const commonMiddleware = require("../common");

module.exports.validateRegisterWithEmail = [
  commonMiddleware.conditionalCheck("lang", commonMiddleware.checkLanguage),
  commonMiddleware.conditionalCheck(
    "referralCode",
    commonMiddleware.checkReferralCode
  ),
  commonMiddleware.checkName,
  commonMiddleware.checkForRealName("name"),
  commonMiddleware.checkEmail,
  commonMiddleware.checkPassword,
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.next,
  commonMiddleware.limitRegister,
];

module.exports.validateRegisterWithGoogle = [
  commonMiddleware.conditionalCheck("lang", commonMiddleware.checkLanguage),
  commonMiddleware.conditionalCheck(
    "referralCode",
    commonMiddleware.checkReferralCode
  ),
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.next,
  commonMiddleware.limitRegister,
];

module.exports.validateLoginWithEmail = [
  commonMiddleware.conditionalCheck("lang", commonMiddleware.checkLanguage),
  commonMiddleware.checkEmail,
  commonMiddleware.checkPassword,
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.next,
  commonMiddleware.limitLogin,
];

module.exports.validateLoginWithGoogle = [
  commonMiddleware.conditionalCheck("lang", commonMiddleware.checkLanguage),
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.next,
  commonMiddleware.limitLogin,
];
