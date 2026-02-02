import express from "express";
import commentController from "../controllers/comment.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, commentController.createComment);
router.post("/approve/delivery", auth, commentController.approveDelivery);
router.post("/approve/time", auth, commentController.approveTimeRequest);

router.get("/job/:jobId", auth, commentController.getCommentByJob);

router.put("/:id", auth, commentController.updateComment);

router.get("/client", auth, commentController.getCommentByClient);

export default router;
