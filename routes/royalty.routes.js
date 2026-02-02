import express from "express";
import auth from "../middlewares/auth.js";
import royaltyController from "../controllers/royalty.controller.js";

const router = express.Router();

router.get("/seller", auth, royaltyController.royaltyStatusSeller);
router.get("/client", auth, royaltyController.royaltyStatusClient);

export default router;
