import mongoose from "mongoose";

const JobWishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Job",
  },
});

export const JobWishlist = mongoose.model("JobWishlist", JobWishlistSchema);
