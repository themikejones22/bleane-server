const {
  invoicesService,
  paymentService,
  emailService,
  usersService,
} = require("../../../services");
const httpStatus = require("http-status");
const { clientSchema } = require("../../../models/user/invoice");
const _ = require("lodash");

module.exports.createInvoice = async (req, res, next) => {
  try {
    const user = req.user;
    const { amount, title, type, url } = req.body;

    const invoice = await invoicesService.createInvoice(
      user,
      amount,
      title,
      type,
      url
    );

    const paymentLink = await paymentService.createPaymentLink(
      user,
      invoice._id,
      title,
      amount
    );

    // Create the response object
    const response = {
      invoice: _.pick(invoice, clientSchema),
      paymentLink,
    };

    // Send the response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    next(err);
  }
};

module.exports.getMyInvoices = async (req, res, next) => {
  try {
    const user = req.user;

    const invoices = await invoicesService.getMyInvoices(user);

    // Create the response object
    const response = {
      invoices: invoices.map((invoice) => _.pick(invoice, clientSchema)),
    };

    // Send the response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.checkoutWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "payment_approved") {
      const invoiceId = event.data.reference;

      const invoice = await invoicesService.markInvoiceAsPaid(invoiceId);

      const user = await usersService.findUserById(invoice.userId);

      await emailService.sendInvoiceForCustomer(
        user.display.language,
        user.email,
        user.name,
        invoice.service.title,
        invoice.service.type,
        invoice.service.url,
        invoice.amount
      );
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.log(err.message);
  }
};
