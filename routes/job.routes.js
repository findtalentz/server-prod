import express from "express";
import jobController from "../controllers/job.controller.js";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", jobController.getJobs);
router.get("/count", jobController.sellerJobCount);
router.get("/client", auth, jobController.getClientJobs);
router.get("/seller", auth, jobController.getSellerJobs);
router.get("/:id", jobController.getJobById);
router.post("/", auth, jobController.createJob);
router.put("/:id", auth, jobController.updateJob);
router.delete("/:id", [auth, admin], jobController.deleteJob);

export default router;
