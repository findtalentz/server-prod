import express from "express";
import portfolioController from "../controllers/portfolio.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, portfolioController.getPortfolio);
router.get("/public", portfolioController.getUserPortfolio);
router.get("/:id", portfolioController.getPortfolioById);
router.post("/", auth, portfolioController.createPortfolio);
router.put("/:id", auth, portfolioController.updatePortfolio);
router.delete("/:id", auth, portfolioController.deletePortfolio);

export default router;
