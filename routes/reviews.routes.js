import express from "express";
import reviewController from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", reviewController.createReview);

router.get("/job/:jobId", reviewController.getReviewByJobId);
router.get("/seller/:sellerId", reviewController.getReviewsBySellerId);
export default router;
