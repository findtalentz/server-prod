import express from "express";
import userController from "../controllers/user.controller.js";

const router = express.Router();

router.put("/increment-view/:id", userController.incrementProfileView);

export default router;
