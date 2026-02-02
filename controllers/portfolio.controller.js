import portfolioRepository from "../repositories/portfolio.repository.js";
import portfolioService from "../services/portfolio.service.js";
import Response from "../utils/Response.js";

const portfolioController = {
  getPortfolio: async (req, res) => {
    const portfolio = await portfolioRepository.getPortfolio(req.user._id);
    return res
      .status(200)
      .send(new Response(true, "Success", portfolio, portfolio.length));
  },
  getUserPortfolio: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).send(new Response(false, "User ID is required"));
    }
    const portfolio = await portfolioRepository.getPortfolio(userId);
    return res
      .status(200)
      .send(new Response(true, "Success", portfolio, portfolio.length));
  },
  createPortfolio: async (req, res) => {
    const portfolio = await portfolioService.createPortfolio({
      ...req.body,
      author: req.user._id,
    });
    return res
      .status(201)
      .send(new Response(true, "Portfolio Created", portfolio));
  },
  updatePortfolio: async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const portfolio = await portfolioService.updatePortfolio({ id, data });
    return res
      .status(200)
      .send(new Response(true, "Portfolio updated", portfolio));
  },
  deletePortfolio: async (req, res) => {
    const { id } = req.params;
    const portfolio = await portfolioRepository.deletePortfolio(id);
    return res
      .status(200)
      .send(new Response(true, "Portfolio deleted", portfolio));
  },
  getPortfolioById: async (req, res) => {
    const { id } = req.params;
    const portfolio = await portfolioRepository.getPortfolioById(id);
    return res.status(200).send(new Response(true, "Success", portfolio));
  },
};

export default portfolioController;
