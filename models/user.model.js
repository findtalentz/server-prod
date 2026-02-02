import Joi from "joi";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createHash } from "../utils/hash.js";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeAccountId: {
      type: String,
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      minLength: 1,
      maxLength: 255,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    email: {
      type: String,
      minLength: 5,
      maxLength: 255,
      unique: true,
    },
    image: {
      type: String,
      default: "https://i.ibb.co/pBFLMc0m/placeholder.jpg",
      minLength: 5,
      maxLength: 10000,
    },
    phone: {
      type: String,
      minLength: 5,
      maxLength: 255,
    },
    title: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    balance: {
      type: Number,
      default: 0,
    },
    skills: [{ type: String, minLength: 1, maxLength: 255 }],
    languages: [{ type: String, minLength: 1, maxLength: 255 }],
    location: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    about: {
      type: String,
      minLength: 100,
      maxLength: 10000,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 1000,
    },
    role: {
      type: String,
      enum: ["SELLER", "CLIENT", "ADMIN"],
    },
    identityStatus: {
      type: String,
      enum: ["UNVERIFIED", "VERIFIED", "PENDING"],
      default: "UNVERIFIED",
    },
    emailStatus: {
      type: String,
      enum: ["UNVERIFIED", "VERIFIED"],
      default: "UNVERIFIED",
    },
    totalEarning: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await createHash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      role: this.role,
      emailStatus: this.emailStatus,
      identityStatus: this.identityStatus,
    },
    process.env.JWT_KEY
  );
  return token;
};

export const User = mongoose.model("User", userSchema);

export const validateSignup = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    role: Joi.string().valid("SELLER", "CLIENT").label("Role"),
    password: Joi.string().min(8).max(1000).label("Password"),
  });

  return schema.validate(user);
};

export const validateSignupAdmin = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    password: Joi.string().min(8).max(1000).label("Password"),
  });

  return schema.validate(user);
};

export const validateProfileUpdate = (user) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).max(255).required().label("First Name"),
    lastName: Joi.string().min(1).max(255).required().label("Last Name"),
    phone: Joi.string().min(5).max(255).required().label("Phone"),
    location: Joi.string().min(1).max(255).required().label("Location"),
    title: Joi.string().min(1).max(255).required().label("Title"),
    about: Joi.string().min(100).max(10000).required().label("About"),
  });

  return schema.validate(user);
};

export const validateLogin = (credentials) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).email().required().label("Email"),
    password: Joi.string().min(8).max(1000).required().label("Password"),
  });

  return schema.validate(credentials);
};

export const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().min(8).label("Current Password"),
    newPassword: Joi.string().required().min(8).label("New Password"),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("newPassword"))
      .label("Confirm Password")
      .messages({
        "any.only": "Passwords do not match",
      }),
  });
  return schema.validate(data);
};
