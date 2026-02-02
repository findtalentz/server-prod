import { User } from "../models/user.model.js";

export const saveStripeAccountId = async (userId, accountId) => {
  return User.findByIdAndUpdate(
    userId,
    { stripeAccountId: accountId },
    { new: true }
  );
};

export const getUserById = async (userId) => {
  return User.findById(userId);
};
