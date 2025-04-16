const { Invoice } = require("../../../models/user/invoice");

module.exports.createInvoice = async (
  user,
  amount,
  serviceTitle,
  serviceType,
  serviceUrl
) => {
  try {
    const invoice = new Invoice({
      userId: user._id,
      currency: "USD",
      amount,
      title: serviceTitle,
      paid: false,
      paidAt: null,
      service: {
        title: serviceTitle,
        type: serviceType,
        url: serviceUrl,
      },
    });

    await invoice.save();

    return invoice;
  } catch (err) {
    throw err;
  }
};

module.exports.getMyInvoices = async (user) => {
  try {
    return await Invoice.find({ userId: user._id }).sort({ _id: -1 });
  } catch (err) {
    throw err;
  }
};

module.exports.markInvoiceAsPaid = async (invoiceId) => {
  try {
    const invoice = await Invoice.findById(invoiceId);

    invoice.paid = true;
    invoice.paidAt = new Date();
    await invoice.save();

    return invoice;
  } catch (err) {
    throw err;
  }
};
