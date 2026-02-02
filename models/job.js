import Joi from "joi";
import mongoose from "mongoose";

// Simple & Clean Job Schema
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "OPEN", "COMPLETED"],
      default: "OPEN",
    },
    description: {
      type: String,
      minlength: 300,
      maxlength: 10000,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
      trim: true,
    },
    deliveryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Delivery date must be in the future",
      },
    },
    startDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    jobType: {
      type: String,
      enum: ["fixed", "hourly", "full-time"],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    company: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
      trim: true,
    },
    budgetAmount: { type: Number, required: true, min: 5, max: 10000 },
    budgetType: { type: String, enum: ["fixed", "custom"], required: true },
    requiredExperienceLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      required: true,
    },
    requiredSkills: [{ type: String, minlength: 1, maxlength: 255 }],
    duration: {
      type: String,
      enum: ["large", "medium", "small"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);

// Basic but effective Joi validation
export const validateJob = (job) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      "string.base": "Job title must be text.",
      "string.empty": "Job title cannot be empty.",
      "string.min": "Job title must have at least 1 character.",
      "string.max": "Job title cannot exceed 255 characters.",
      "any.required": "Job title is required.",
    }),

    location: Joi.string().min(1).max(255).required().messages({
      "string.base": "Location must be text.",
      "string.empty": "Location cannot be empty.",
      "string.min": "Location must have at least 1 character.",
      "string.max": "Location cannot exceed 255 characters.",
      "any.required": "Location is required.",
    }),

    author: Joi.string().required().messages({
      "string.base": "Author must be text.",
      "string.empty": "Author cannot be empty.",
      "any.required": "Author is required.",
    }),

    description: Joi.string().min(300).max(10000).required().messages({
      "string.base": "Description must be text.",
      "string.empty": "Description cannot be empty.",
      "string.min": "Description must be at least 300 characters.",
      "string.max": "Description cannot exceed 10000 characters.",
      "any.required": "Description is required.",
    }),

    jobType: Joi.string()
      .valid("fixed", "hourly", "full-time")
      .required()
      .messages({
        "any.only": "Job type must be either fixed, hourly, or full-time.",
        "any.required": "Job type is required.",
      }),

    category: Joi.string().required().messages({
      "string.base": "Category must be text.",
      "string.empty": "Category cannot be empty.",
      "any.required": "Category is required.",
    }),

    company: Joi.string().min(1).max(255).required().messages({
      "string.base": "Company name must be text.",
      "string.empty": "Company name cannot be empty.",
      "string.min": "Company name must have at least 1 character.",
      "string.max": "Company name cannot exceed 255 characters.",
      "any.required": "Company name is required.",
    }),

    budgetAmount: Joi.number().min(5).max(10000).required().messages({
      "number.base": "Budget amount must be a number.",
      "number.min": "Budget must be at least 5.",
      "number.max": "Budget cannot exceed 10000.",
      "any.required": "Budget amount is required.",
    }),

    budgetType: Joi.string().valid("fixed", "custom").required().messages({
      "any.only": "Budget type must be either fixed or custom.",
      "any.required": "Budget type is required.",
    }),

    requiredExperienceLevel: Joi.string()
      .valid("entry", "intermediate", "expert")
      .required()
      .messages({
        "any.only": "Experience level must be entry, intermediate, or expert.",
        "any.required": "Experience level is required.",
      }),

    requiredSkills: Joi.array()
      .items(
        Joi.string().min(1).max(255).messages({
          "string.base": "Each skill must be text.",
          "string.empty": "Skill cannot be empty.",
          "string.min": "Skill must have at least 1 character.",
          "string.max": "Skill cannot exceed 255 characters.",
        })
      )
      .messages({
        "array.base": "Required skills must be an array.",
      }),

    duration: Joi.string()
      .valid("large", "medium", "small")
      .required()
      .messages({
        "any.only": "Duration must be large, medium, or small.",
        "any.required": "Duration is required.",
      }),
  });

  return schema.validate(job, { abortEarly: false });
};

// Same for updates, but all fields optional
export const validateUpdatableJobData = (job) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255),
    author: Joi.string().required(),
    location: Joi.string().min(1).max(255),
    description: Joi.string().min(300).max(10000),
    jobType: Joi.string().valid("fixed", "hourly", "full-time"),
    category: Joi.string(),
    company: Joi.string().min(1).max(255),
    budgetAmount: Joi.number().min(5).max(10000),
    budgetType: Joi.string().valid("fixed", "custom"),
    deliveryDate: Joi.string(),
    requiredExperienceLevel: Joi.string().valid(
      "entry",
      "intermediate",
      "expert"
    ),
    requiredSkills: Joi.array().items(Joi.string().min(1).max(255)),
    duration: Joi.string().valid("large", "medium", "small"),
  });

  return schema.validate(job);
};
