import {
  validatePortfolio,
  validateUpdatePortfolio,
} from "../models/portfolio.js";
import portfolioRepository from "../repositories/portfolio.repository.js";
import APIError from "../utils/APIError.js";

const portfolioService = {
  createPortfolio: async (data) => {
    const { error } = validatePortfolio(data);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    return await portfolioRepository.createPortfolio(data);
  },

  updatePortfolio: async ({ id, data }) => {
    const { error } = validateUpdatePortfolio(data);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    return await portfolioRepository.updatePortfolio({ id, data });
  },
};

export default portfolioService;
