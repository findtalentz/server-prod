import Joi from "joi";
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [120, "Title cannot exceed 120 characters"],
      required: [true, "Title is required"],
    },
    thumbnail: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    body: {
      type: String,
      minlength: [300, "Blog content must be at least 300 characters"],
      maxlength: [20000, "Blog content cannot exceed 20,000 characters"],
      required: [true, "Blog content is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tags cannot exceed 30 characters each"],
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be either draft, published, or archived",
      },
      default: "draft",
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Comprehensive Joi validation
export const validateBlog = (blog) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(120).required().messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 5 characters long",
      "string.max": "Title cannot exceed 120 characters",
    }),
    thumbnail: Joi.string().uri().allow("").optional().messages({
      "string.uri": "Thumbnail must be a valid URL",
    }),
    author: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Author must be a valid ObjectId",
        "any.required": "Author is required",
      }),
    body: Joi.string().min(300).max(20000).required().messages({
      "string.empty": "Blog content is required",
      "string.min": "Blog content must be at least 300 characters",
      "string.max": "Blog content cannot exceed 20,000 characters",
    }),
    category: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Category must be a valid ObjectId",
        "any.required": "Category is required",
      }),
    tags: Joi.array().items(Joi.string().max(30)).optional(),
    status: Joi.string()
      .valid("draft", "published", "archived")
      .default("draft"),
    featured: Joi.boolean().default(false),
  });

  return schema.validate(blog);
};

export const Blog = mongoose.model("Blog", BlogSchema);
