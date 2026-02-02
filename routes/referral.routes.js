import express from "express";
import referralController from "../controllers/referrarl.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, referralController.createReferral);

export default router;
