import express from "express";
import chatController from "../controllers/chat.controller.js";

const router = express.Router();
router.post("/", chatController.sendMessage);

export default router;