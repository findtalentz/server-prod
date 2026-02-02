import express from "express";
import viewsController from "../controllers/views.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", viewsController.incrementProfileViews);
router.get("/data", auth, viewsController.getViewsData);

export default router;
