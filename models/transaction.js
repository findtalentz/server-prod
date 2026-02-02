import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["deposit", "checkout"] },
    amount: Number,
    status: { type: String, enum: ["pending", "completed", "failed"] },
    gatewayRef: String,
    paymentGateway: { type: String, enum: ["stripe", "paypal"], default: "stripe" },
    // Metadata for order placement (used for PayPal since it doesn't support metadata)
    orderMetadata: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      deliveryDate: Date,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
