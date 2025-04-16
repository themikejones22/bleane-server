const {
  Schema,
  Types: { ObjectId },
} = require("mongoose");

module.exports.client = [
  "_id",
  "userId",
  "amount",
  "currency",
  "service",
  "paid",
  "paidAt",
  "createdAt",
];

const schema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    service: {
      title: {
        type: String,
        trim: true,
        required: true,
      },
      type: {
        type: String,
        trim: true,
        required: true,
      },
      url: {
        type: String,
        trim: true,
        default: "",
      },
    },
    paid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    // To not avoid empty object when creating the document
    minimize: false,
    // To automatically write creation/update timestamps
    // Note: the update timestamp will be updated automatically
    timestamps: true,
  }
);

schema.index({ userId: -1 });

module.exports.mongodb = schema;
