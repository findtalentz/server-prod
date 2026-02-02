import { Portfolio } from "../models/portfolio.js";

const portfolioRepository = {
  createPortfolio: async function (data) {
    const newPortfolio = await Portfolio.create(data);
    await newPortfolio.save();
    return newPortfolio;
  },

  getPortfolio: async function (author) {
    return await Portfolio.find({ author }).populate("author", [
      "_id",
      "image",
      "firstName",
      "lastName",
    ]);
  },

  updatePortfolio: async function ({ id, data }) {
    return await Portfolio.findByIdAndUpdate(id, { ...data });
  },

  deletePortfolio: async function (id) {
    return await Portfolio.findByIdAndDelete(id);
  },
  getPortfolioById: async function (id) {
    return await Portfolio.findById(id);
  },
};

export default portfolioRepository;
