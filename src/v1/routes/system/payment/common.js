const { paymentController } = require("../../../controllers");

module.exports = (router) => {
  router.get("/config", paymentController.getCheckoutPublicKey);
};
