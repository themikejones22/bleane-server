const { paymentService } = require("../../../services");
const httpStatus = require("http-status");

module.exports.getCheckoutPublicKey = (req, res, next) => {
  try {
    const publishableKey = paymentService.getStripePublishableKey();

    const response = {
      publishableKey,
    };

    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};
