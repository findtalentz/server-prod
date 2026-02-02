import Joi from "joi";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 255,
      required: true,
    },
    type: {
      type: String,
      enum: ["BLOG", "JOB"],
      required: true,
    },
    image: {
      type: String,
      minLength: 5,
      maxLength: 2000,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

export const Category = mongoose.model("Category", categorySchema);

export const validateCategory = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required().label("Name"),
    type: Joi.string().valid("JOB", "BLOG").label("Type"),
    image: Joi.string().uri().label("Image"),
  });
  return schema.validate(category);
};
