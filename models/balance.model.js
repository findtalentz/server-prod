import mongoose from "mongoose";
import Joi from "joi";

const BalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      min: 4,
      max: 100000,
      require: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CLEARED", "HELD"],
      default: "PENDING",
    },
    clearDate: {
      type: Date,
      default: () => {
        const clearDate = new Date();
        clearDate.setDate(clearDate.getDate() + 15);
        return clearDate;
      },
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Balance = mongoose.model("Balance", BalanceSchema);

const validateBalance = (data) => {
  const schema = Joi.object({
    user: Joi.string().required(),
    job: Joi.string().required(),
    amount: Joi.number().min(4).max(100000).required(),
    client: Joi.string().required(),
  });

  return schema.validate(data);
};

export { Balance, validateBalance };
