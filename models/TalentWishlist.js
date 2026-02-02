import mongoose from "mongoose";

const TalentWishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

export const TalentWishlist = mongoose.model(
  "TalentWishlist",
  TalentWishlistSchema
);
