import categoryRepository from "../repositories/category.repository.js";
import categoryService from "../services/category.service.js";
import Response from "../utils/Response.js";

const categoryController = {
  createCategory: async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    return res
      .status(201)
      .send(new Response(true, "Category Created", category));
  },
  getAllCategorys: async (req, res) => {
    const categorys = await categoryRepository.getAllCategorys();
    return res
      .status(200)
      .send(new Response(true, "Success", categorys, categorys.length));
  },
  getJobCategorys: async (req, res) => {
    const categorys = await categoryRepository.getJobCategorys();
    return res
      .status(200)
      .send(new Response(true, "Success", categorys, categorys.length));
  },
  getBlogCategorys: async (req, res) => {
    const categorys = await categoryRepository.getBlogCategorys();
    return res
      .status(200)
      .send(new Response(true, "Success", categorys, categorys.length));
  },
  getCategoryById: async (req, res) => {
    const category = await categoryRepository.getCategoryById(req.params.id);
    return res.status(200).send(new Response(true, "Success", category));
  },
  deleteCategoryById: async (req, res) => {
    const category = await categoryRepository.deleteCategoryById(req.params.id);
    return res.status(200).send(new Response(true, "Success", category));
  },
  deleteCategoryById: async (req, res) => {
    const category = await categoryRepository.getCategoryByIdAndUpdate(
      req.params.id,
      req.body
    );
    return res
      .status(200)
      .send(new Response(true, "Category Updated", category));
  },
};

export default categoryController;
