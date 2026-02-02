import blogService from "../services/blog.service.js";
import translateService from "../services/translate.service.js";
import APIError from "../utils/APIError.js";
import Response from "../utils/Response.js";

class BlogController {
  static async createBlog(req, res) {
    const newBlog = await blogService.createBlog({
      ...req.body,
      author: req.user._id,
    });
    return res.status(201).send(new Response(true, "Blog Created", newBlog));
  }

  static async deleteBlogById(req, res) {
    const updatedBlog = await blogService.deleteBlogById(
      req.params.id,
      req.body
    );
    return res
      .status(201)
      .send(new Response(true, "Blog Created", updatedBlog));
  }

  static async getBlogs(req, res) {
    const response = await blogService.getBlogs(req.query);

    const blogs = response.data;

    return res
      .status(200)
      .send(
        new Response(
          true,
          "Blogs retrieved successfully",
          blogs,
          response.count
        )
      );
  }

  static async getBlogById(req, res) {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);
    if (
      blog.status !== "published" &&
      (!req.user || req.user.id !== blog.author._id.toString())
    ) {
      throw new APIError(404, "Blog not found");
    }

    const { language } = req.query;

    if (language && language === "en") {
      blog.title = await translateService.getTranslatedText(blog.title);
      blog.body = await translateService.getTranslatedText(blog.body);
    }

    return res
      .status(200)
      .json(new Response(true, "Blog retrieved successfully", blog));
  }

  static async updateBlogById(req, res) {
    const { id } = req.params;
    const updatedBlog = await blogService.updateBlogById(id, {
      ...req.body,
      author: req.user._id,
    });
    return res
      .status(200)
      .send(new Response(true, "Blog Updated", updatedBlog));
  }

  static async deleteBlog(req, res) {
    const deletedBlog = await blogService.deleteBlogById(req.params.id);
    return res
      .status(200)
      .send(new Response(true, "Blog Deleted", deletedBlog));
  }
}

export default BlogController;
