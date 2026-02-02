import Joi from "joi";
import mongoose from "mongoose";

const SubscribeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const validateSubscribe = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};

const Subscribe = mongoose.model("Subscribe", SubscribeSchema);

export { Subscribe, validateSubscribe };
