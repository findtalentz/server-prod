import express from "express";
import talentController from "../controllers/talent.controller.js";

const router = express.Router();

router.get("/", talentController.findTalents);

export default router;
