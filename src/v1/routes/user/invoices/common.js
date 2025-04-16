const { invoicesController } = require("../../../controllers");
const auth = require("../../../middleware/auth");

module.exports = (router) => {
  router.post(
    "/create",
    auth("createOwn", "invoice"),
    invoicesController.createInvoice
  );

  router.get(
    "/my",
    auth("readOwn", "invoice"),
    invoicesController.getMyInvoices
  );

  router.post("/checkout-webhook", invoicesController.checkoutWebhook);
};
