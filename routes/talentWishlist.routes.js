import express from "express";
import talentWishlistController from "../controllers/talentWishlist.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, talentWishlistController.getTalentWishlist);
router.post("/", auth, talentWishlistController.createTalentWishlist);

export default router;
