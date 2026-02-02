import Joi from "joi";
import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minlength: 5,
      maxlength: 255,
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    evidence: {
      type: String,
      maxlength: 2000,
    },
    description: {
      type: String,
      minlength: 20,
      maxlength: 10000,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

export const Dispute = mongoose.model("Dispute", disputeSchema);

export const validateDispute = (dispute) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 5 characters",
      "string.max": "Title cannot exceed 255 characters",
    }),
    type: Joi.string().required(),
    evidence: Joi.string().uri().allow("").optional().messages({
      "string.uri": "Evidence must be a valid URL",
    }),
    job: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid job ID format",
        "string.empty": "Job ID is required",
      }),
    description: Joi.string().min(20).max(10000).required().messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 20 characters",
      "string.max": "Description cannot exceed 10000 characters",
    }),
  });

  return schema.validate(dispute, {
    abortEarly: false,
    allowUnknown: false,
  });
};
