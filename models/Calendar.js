import Joi from "joi";
import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Event", "Task", "Schedule"],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxLength: 1000,
    },
    note: {
      type: String,
      maxLength: 300,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Calendar = mongoose.model("Calendar", calendarSchema);

const validateCalendar = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).trim().required(),
    type: Joi.string().valid("Event", "Task", "Schedule").required(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    description: Joi.string().min(10).max(1000),
    createdBy: Joi.string().required(),
  });

  return schema.validate(data);
};

export { Calendar, validateCalendar };
