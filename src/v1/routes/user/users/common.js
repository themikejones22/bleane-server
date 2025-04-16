const { usersController } = require("../../../controllers");
const { userValidator } = require("../../../middleware/validation");
const auth = require("../../../middleware/auth");

module.exports = (router) => {
  //////////////////// AUTHENTICATE ////////////////////
  router.get(
    "/authenticate",
    userValidator.validateAuthenticateUser,
    auth("readOwn", "user", true),
    usersController.authenticateUser
  );

  router.post("/record-visit", usersController.recordVisit);

  //////////////////// PROFILE ////////////////////
  router.patch(
    "/profile/update",
    userValidator.validateUpdateProfile,
    auth("updateOwn", "user"),
    usersController.updateProfile
  );

  router.patch(
    "/profile/email/update",
    userValidator.validateUpdateEmail,
    auth("updateOwn", "user"),
    usersController.updateEmail
  );

  router.patch(
    "/profile/avatar/update",
    userValidator.validateUpdateAvatar,
    auth("updateOwn", "user"),
    usersController.updateAvatar
  );

  router.delete(
    "/profile/avatar/delete",
    auth("updateOwn", "user"),
    usersController.deleteAvatar
  );

  router.patch(
    "/profile/language/switch",
    auth("updateOwn", "user"),
    usersController.switchLanguage
  );

  router.patch(
    "/profile/link/:linkKey/update",
    userValidator.validateUpdateLink,
    auth("updateOwn", "user"),
    usersController.updateLink
  );

  router.delete(
    "/profile/link/:linkKey/remove",
    userValidator.validateRemoveLink,
    auth("updateOwn", "user"),
    usersController.removeLink
  );

  //////////////////// NOTIFICATIONS ////////////////////
  router.get(
    "/notifications/see",
    auth("readOwn", "notification"),
    usersController.seeNotifications
  );

  router.delete(
    "/notifications/clear",
    auth("deleteOwn", "notification"),
    usersController.clearNotifications
  );

  router.patch(
    "/notifications/disable",
    auth("updateOwn", "notification"),
    usersController.disableNotifications
  );

  router.patch(
    "/notifications/enable",
    auth("updateOwn", "notification"),
    usersController.enableNotifications
  );

  //////////////////// ACCOUNT DELETION ////////////////////
  router.get(
    "/account/deletion/request",
    userValidator.validateRequestAccountDeletion,
    auth("deleteOwn", "user", true),
    usersController.requestAccountDeletion
  );

  router.post(
    "/account/deletion/code/check",
    userValidator.validateCode,
    auth("readOwn", "user", true),
    usersController.checkCode("deletion")
  );

  router.get(
    "/account/deletion/confirm",
    userValidator.validateConfirmAccountDeletion,
    usersController.confirmAccountDeletion
  );

  //////////////////// EMAIL ////////////////////
  router
    .route("/email/verify")
    .get(
      auth("readOwn", "emailVerificationCode", true),
      userValidator.validateSendEmailVerificationCode,
      usersController.resendEmailVerificationCode
    )
    .post(
      userValidator.validateCode,
      auth("updateOwn", "emailVerificationCode", true),
      usersController.verifyEmail
    );

  router.post(
    "/verification/email/code/check",
    userValidator.validateCode,
    auth("readOwn", "emailVerificationCode", true),
    usersController.checkCode("email")
  );

  router.post(
    "/email/used",
    userValidator.validateEmail,
    usersController.checkIfEmailUsed
  );

  router.get(
    "/email/verify/fast",
    userValidator.validateVerifyEmailByLink,
    usersController.verifyEmailByLink
  );

  //////////////////// PASSWORD ////////////////////
  router
    .route("/password/forgot")
    .get(
      userValidator.validateSendForgotPasswordCode,
      usersController.sendForgotPasswordCode
    )
    .post(
      userValidator.validateHanfleForgotPassword,
      usersController.handleForgotPassword
    );

  router.patch(
    "/password/change",
    userValidator.validateChangePassword,
    auth("updateOwn", "password"),
    usersController.changePassword
  );
};
