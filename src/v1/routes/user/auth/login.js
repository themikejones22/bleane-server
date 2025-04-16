const { authController } = require("../../../controllers");
const { authValidator } = require("../../../middleware/validation");

module.exports = (router) => {
  router.post(
    "/login/email",
    authValidator.validateLoginWithEmail,
    authController.loginWithEmail
  );

  router.post(
    "/login/google",
    authValidator.validateLoginWithGoogle,
    authController.loginWithGoogle
  );
};
