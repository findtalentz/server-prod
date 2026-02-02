import Joi from "joi";
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      minLength: 2,
      maxLength: 255,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      required: true,
    },
    description: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: true,
    },
    status: {
      type: String,
      enum: ["Read", "Unread"],
      default: "Unread",
    },
  },
  { timestamps: true }
);

const validateNotification = (data) => {
  const schema = Joi.object({
    user: Joi.any().required(),
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(10).max(1000).required(),
    type: Joi.string().valid("info", "success", "warning", "error").required(),
  });
  return schema.validate(data);
};

const Notification = mongoose.model("Notification", notificationSchema);

export { Notification, validateNotification };
