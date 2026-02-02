import express from "express";
import jobWishlistController from "../controllers/jobWishlist.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, jobWishlistController.getJobWishlist);
router.post("/", auth, jobWishlistController.createJobWishlist);

export default router;
