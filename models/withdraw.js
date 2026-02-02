import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      min: 30,
      max: 10000,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true,
    },
    gatewayRef: {
      type: String,
      // Stripe transfer ID or PayPal payout batch ID
    },
  },
  {
    timestamps: true,
  }
);

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
