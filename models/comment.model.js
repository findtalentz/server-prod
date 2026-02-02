import Joi from "joi";
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    reqTime: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Delivery date must be in the future",
      },
    },
    reqFund: {
      type: Number,
      min: [5, "Amount must be at least $5"],
      max: [10000, "Amount cannot exceed $10,000"],
    },
    reqType: {
      type: String,
      enum: ["COMMENT", "FUND_REQUEST", "TIME_REQUEST", "DELIVERY"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "CANCELLED"],
      default: "PENDING",
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
    attachments: [{ type: String }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

const validateCreateComment = (data) => {
  const schema = Joi.object({
    message: Joi.string().min(2).max(1000).required().label("Message"),
    job: Joi.string().required().label("Job"),
    reqTime: Joi.date()
      .greater("now")
      .messages({
        "date.greater": "Delivery date must be in the future",
      })
      .label("Request Time"),
    reqFund: Joi.number()
      .min(5)
      .max(10000)
      .messages({
        "number.min": "Amount must be at least $5",
        "number.max": "Amount cannot exceed $10,000",
      })
      .label("Request Fund"),
    reqType: Joi.string()
      .valid("COMMENT", "FUND_REQUEST", "TIME_REQUEST", "DELIVERY")
      .required()
      .label("Request Type"),
    attachments: Joi.array()
      .items(Joi.string().uri())
      .optional()
      .messages({
        "string.uri": "Attachment must be a valid URL",
      })
      .label("Attachments"),
    seller: Joi.string().label("Seller"),
    client: Joi.string().label("Client"),
  });

  return schema.validate(data);
};

export { Comment, validateCreateComment as validateCreateApplication };
