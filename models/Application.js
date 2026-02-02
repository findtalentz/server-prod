import Joi from "joi";
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      minLength: 50,
      maxLenght: 2000,
      required: true,
    },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", ApplicationSchema);

const validateApplication = (application) => {
  const schema = Joi.object({
    client: Joi.string().hex().length(24).required(),
    seller: Joi.string().hex().length(24).required(),
    job: Joi.string().hex().length(24).required(),
    message: Joi.string().min(50).max(2000).required(),
    attachments: Joi.array().items(Joi.string().uri()).optional(),
  });

  return schema.validate(application);
};

export { Application, validateApplication };
