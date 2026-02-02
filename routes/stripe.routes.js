import { Router } from "express";
import stripeController from "../controllers/stripe.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.get("/connect-bank", auth, stripeController.connectBankAccount);

export default router;
