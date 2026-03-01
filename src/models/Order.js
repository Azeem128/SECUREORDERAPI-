const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Stationery",
        "Office Supplies",
        "Electronics",
        "IT Equipment",
        "Furniture",
        "Cleaning Supplies",
        "Groceries / Refreshments",
        "Services",
        "Others",
      ],
      required: true,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    notes: [
      {
        text: { type: String, required: true },
        userName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    cancelReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-calculate totalPrice before save
orderSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);