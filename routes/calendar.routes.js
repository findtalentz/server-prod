import express from "express";
import { CalendarController } from "../controllers/calendar.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Calendar routes
router.post("/", auth, CalendarController.createCalendar);
router.get("/", auth, CalendarController.getUserCalendars);
router.get("/all", auth, CalendarController.getAllCalendars); // Admin route maybe?
router.get("/search", auth, CalendarController.searchCalendars);
router.get("/upcoming", auth, CalendarController.getUpcomingEvents);
router.get("/stats", auth, CalendarController.getCalendarStats);
router.get("/:id", auth, CalendarController.getCalendar);
router.put("/:id", auth, CalendarController.updateCalendar);
router.delete("/:id", auth, CalendarController.deleteCalendar);

export default router;
