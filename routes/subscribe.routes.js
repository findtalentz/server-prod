import express from "express";
import subscribeController from "../controllers/subscribe.controller.js";

const router = express.Router();

router.post("/", subscribeController.subscribe);

export default router;
