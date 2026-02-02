import express from "express";
import notificationController from "../controllers/notification.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, notificationController.getNotifications);
router.put("/:id", auth, notificationController.markAsRead);
router.post("/all-read", auth, notificationController.markAllAsRead);
router.delete("/:id", auth, notificationController.deleteNotification);

export default router;
