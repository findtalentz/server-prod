import Joi from "joi";
import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const validateCode = (code) => {
  const schema = Joi.object({
    code: Joi.number().required().label("Code"),
    user: Joi.string().required().label("User"),
    type: Joi.string()
      .valid("EMAIL_VERIFICATION", "PASSWORD_RESET")
      .required()
      .label("Type"),
  });
  return schema.validate(code);
};

const Code = mongoose.model("Code", CodeSchema);

export { Code, validateCode };
