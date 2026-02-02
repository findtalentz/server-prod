import mongoose from "mongoose";
import Joi from "joi";

const ReferralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refereeEmail: {
      type: String,
      required: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REWORDED"],
      default: "PENDING",
    },
    rewardAmount: {
      type: Number,
      default: 100,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Referral = mongoose.model("Referral", ReferralSchema);

export function validateReferral(referral) {
  const schema = Joi.object({
    referrer: Joi.string().required().label("Referrer"),
    refereeEmail: Joi.string().email().required().label("Email"),
  });

  return schema.validate(referral);
}
