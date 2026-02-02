import reviewRepository from "../repositories/review.repository.js";
import APIError from "../utils/APIError.js";
import Response from "../utils/Response.js";

const reviewController = {
  // ✅ Create a new review
  async createReview(req, res) {
    const reviewData = req.body;

    // Basic validation
    if (!reviewData.job || !reviewData.seller || !reviewData.buyer) {
      throw new APIError("Job ID and User ID are required", 400);
    }

    const newReview = await reviewRepository.createReview(reviewData);
    return res
      .status(201)
      .send(new Response(true, "Review created successfully", newReview));
  },

  // ✅ Get all reviews by job ID
  async getReviewByJobId(req, res) {
    const { jobId } = req.params;

    if (!jobId) throw new APIError("Job ID is required", 400);

    const review = await reviewRepository.getReviewByJobId(jobId);
    return res
      .status(200)
      .send(new Response(true, "Reviews fetched successfully", review));
  },
  async getReviewsBySellerId(req, res) {
    const { sellerId } = req.params;

    const reviews = await reviewRepository.getReviewsBySellerId(sellerId);
    return res
      .status(200)
      .send(
        new Response(
          true,
          "Reviews fetched successfully",
          reviews,
          reviews.length
        )
      );
  },
};

export default reviewController;
