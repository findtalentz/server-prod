import mongoose from "mongoose";
import { validateBlog } from "../models/Blog.js";
import blogRepository from "../repositories/blog.repository.js";
import APIError from "../utils/APIError.js";

const blogService = {
  getBlogs: async function (query) {
    const response = await blogRepository.getBlogs(query);
    return { data: response.blogs, count: response.totalCount };
  },
  createBlog: async function (blog) {
    const { error } = validateBlog(blog);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }

    const newBlog = await blogRepository.createBlog(blog);
    return { blog: newBlog };
  },

  updateBlogById: async function (id, blog) {
    const { error } = validateBlog(blog);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    const getBlog = await blogRepository.getBlogById(id);
    if (!getBlog) {
      throw new APIError(404, "Blog not found!");
    }
    const updatedBlog = await blogRepository.updateBlogById(id, blog);
    return updatedBlog;
  },

  getBlogById: async function (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError(400, "Invalid blog ID");
    }

    const blog = await blogRepository.incrementView(id);
    if (!blog) {
      throw new APIError(404, "Blog not found");
    }

    return blog;
  },

  deleteBlogById: async function (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError(400, "Invalid blog ID");
    }
    return await blogRepository.deleteBlogById(id);
  },
};

export default blogService;
