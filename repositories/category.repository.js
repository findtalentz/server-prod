import { Category } from "../models/category.model.js";

const categoryRepository = {
  createCategory: async (data) => {
    return await Category.create(data);
  },
  getJobCategorys: async () => {
    return await Category.find({ type: "JOB" });
  },
  getBlogCategorys: async () => {
    return await Category.find({ type: "BLOG" });
  },
  getAllCategorys: async () => {
    return await Category.find();
  },
  getCategoryById: async (id) => {
    return await Category.findById(id);
  },
  deleteCategoryById: async (id) => {
    return await Category.findByIdAndDelete(id);
  },
  getCategoryByIdAndUpdate: async (id, data) => {
    return await Category.findByIdAndUpdate(id, data);
  },
};

export default categoryRepository;
