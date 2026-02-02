import express from "express";
import auth from "../middlewares/auth.js";
import balanceController from "../controllers/balance.controller.js";

const router = express.Router();

router.get("/", auth, balanceController.getUserBalances);
router.post("/", auth, balanceController.createBalance);
router.get("/", auth, balanceController.getAllBalances);
router.get("/:id", auth, balanceController.getBalanceById);
router.put("/:id", auth, balanceController.updateBalance);
router.delete("/:id", auth, balanceController.deleteBalance);
router.post("/clear/pending", auth, balanceController.clearPendingBalances);

export default router;
