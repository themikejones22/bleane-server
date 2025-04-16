const axios = require("axios");

module.exports.getStripePublishableKey = () => {
  try {
    const publishableKey = process.env.CHECKOUT_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("No stripe publishable key on the server");
    }

    return publishableKey;
  } catch (err) {
    throw err;
  }
};

module.exports.createPaymentLink = async (
  customer,
  reference,
  description,
  amount
) => {
  try {
    const url = "https://api.sandbox.checkout.com/payment-links";

    const payload = {
      amount: amount * 100,
      currency: "GBP",
      reference,
      description,
      customer: {
        email: customer.email,
        name: customer.name,
      },
      billing: {
        address: {
          country: "GB",
        },
      },
      processing_channel_id: "pc_loilg3lb45ye5ehvxybkway3ku",
      return_url: "https://itconsults.site/invoices",
    };

    const headers = {
      Authorization: "Bearer " + process.env.CHECKOUT_SECRET_KEY,
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, payload, { headers });
    paymentLink = response.data._links.redirect.href;
    return paymentLink;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
};
