import express from "express";
import BlogController from "../controllers/blog.controller.js";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";

const router = express.Router();

router.post("/", auth, BlogController.createBlog);
router.get("/", BlogController.getBlogs);
router.get("/:id", BlogController.getBlogById);
router.delete("/:id", [auth, admin], BlogController.deleteBlog);
router.put("/:id", [auth, admin], BlogController.updateBlogById);

export default router;
