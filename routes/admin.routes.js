import express from "express";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/accept/withdraw", [auth, admin], adminController.acceptWithdraw);

export default router;
