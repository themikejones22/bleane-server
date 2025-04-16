const { model } = require("mongoose");
const schema = require("./schema");

const Invoice = model("Invoice", schema.mongodb);

module.exports = {
  Invoice,
  clientSchema: schema.client,
};
