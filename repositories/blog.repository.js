import mongoose from "mongoose";
import { Blog } from "../models/Blog.js";

const blogRepository = {
  getBlogs: async function ({
    page = 1,
    pageSize = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    category,
    author,
    featured,
    search,
  }) {
    const filter = {};

    // Status filter
    if (status && ["draft", "published", "archived"].includes(status)) {
      filter.status = status;
    } else {
      filter.status = "published";
    }

    // Category filter
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    // Author filter
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      filter.author = author;
    }

    // Featured filter
    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Fetch blogs
    const blogs = await Blog.find(filter)
      .populate({ path: "author", select: "firstName lastName image" })
      .populate({ path: "category", select: "name" })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(pageSize));

    const totalCount = await Blog.countDocuments(filter);

    return { blogs, totalCount };
  },

  createBlog: async function (blog) {
    const newBlog = await Blog.create(blog);
    await newBlog.save();
    await newBlog.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name" },
    ]);
    return newBlog;
  },

  getBlogById: async function (id) {
    return await Blog.findById(id).populate("author", "id");
  },

  incrementView: async function (id) {
    return await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate({
        path: "author",
        select: "firstName lastName email image role",
      })
      .populate({ path: "category", select: "name" });
  },

  deleteBlogById: async function (id) {
    return await Blog.findByIdAndDelete(id);
  },
  updateBlogById: async function (id, data) {
    return await Blog.findByIdAndUpdate(id, data, { new: true });
  },
};

export default blogRepository;
