import express from "express";
import categoryController from "../controllers/category.controller.js";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", [auth, admin], categoryController.createCategory);
router.get("/", categoryController.getAllCategorys);
router.get("/job", categoryController.getJobCategorys);
router.get("/blog", categoryController.getBlogCategorys);
router.get("/:id", categoryController.getCategoryById);
router.delete("/:id", [auth, admin], categoryController.deleteCategoryById);
router.put("/:id", [auth, admin], categoryController.deleteCategoryById);

export default router;
