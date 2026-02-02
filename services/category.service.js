import { validateCategory } from "../models/category.model.js";
import categoryRepository from "../repositories/category.repository.js";
import APIError from "../utils/APIError.js";

const categoryService = {
  createCategory: async (data) => {
    const { error } = validateCategory(data);
    if (error) throw new APIError(400, error.details[0].message);
    return categoryRepository.createCategory(data);
  },
};

export default categoryService;
