import { Review } from "../models/Review.js";

const reviewRepository = {
  async createReview(data) {
    try {
      const review = new Review(data);
      return await review.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error("User has already reviewed this job");
      }
      throw new Error(`Failed to create review: ${error.message}`);
    }
  },

  async getReviewByJobId(jobId) {
    try {
      const review = await Review.findOne({ job: jobId })
        .populate("seller")
        .populate("buyer");

      if (!review) {
        return null;
      }

      // Return with average rating included
      return {
        ...review.toObject(), // Convert mongoose document to plain object
        averageRating: review.getAverageRating(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch review: ${error.message}`);
    }
  },

  async getReviewsBySellerId(sellerId) {
    try {
      const reviews = await Review.find({ seller: sellerId })
        .populate("seller")
        .populate("buyer")
        .sort({ createdAt: -1 });

      return reviews.map((review) => ({
        ...review.toObject(),
        averageRating: review.getAverageRating(),
      }));
    } catch (error) {
      throw new Error(`Failed to fetch user reviews: ${error.message}`);
    }
  },
};

export default reviewRepository;
