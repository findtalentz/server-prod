import Joi from "joi";
import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      minLength: 1,
      maxLength: 10000,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      minLength: 5,
      maxLength: 10000,
      trim: true,
      require: true,
    },
    images: [
      {
        type: String,
        minLength: 5,
        maxLength: 10000,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        minLength: 1,
        maxLength: 255,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export const validatePortfolio = (portfolio) => {
  const schema = Joi.object({
    author: Joi.string().required(),
    title: Joi.string().min(1).max(255).required().label("Title"),
    description: Joi.string().min(1).max(10000).required().label("Description"),
    role: Joi.string().min(1).max(255).required().label("Role"),
    thumbnail: Joi.string()
      .min(5)
      .max(10000)
      .uri()
      .required()
      .label("Thumbnail"),
    images: Joi.array()
      .items(Joi.string().min(5).max(10000).uri())
      .label("Images"),
    skills: Joi.array().items(Joi.string().min(1).max(255)).label("Skills"),
  });

  return schema.validate(portfolio);
};

export const validateUpdatePortfolio = (portfolio) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required().label("Title"),
    description: Joi.string().min(1).max(10000).required().label("Description"),
    role: Joi.string().min(1).max(255).required().label("Role"),
    thumbnail: Joi.string()
      .min(5)
      .max(10000)
      .uri()
      .required()
      .label("Thumbnail"),
    images: Joi.array()
      .items(Joi.string().min(5).max(10000).uri())
      .label("Images"),
    skills: Joi.array().items(Joi.string().min(1).max(255)).label("Skills"),
  });

  return schema.validate(portfolio);
};
