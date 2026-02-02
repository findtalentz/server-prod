import Joi from "joi";
import mongoose from "mongoose";

const viewsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Profile", "Service", "Post"],
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const validateViews = (views) => {
  const schema = Joi.object({
    type: Joi.string().valid("Profile", "Service", "Post").required(),
    ip: Joi.string().ip().required(),
    subjectId: Joi.string().required(),
  });
  return schema.validate(views);
};

export const Views = mongoose.model("Views", viewsSchema);
