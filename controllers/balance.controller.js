import balanceService from "../services/balance.service.js";
import Response from "../utils/Response.js";

const balanceController = {
  // Create balance
  createBalance: async (req, res) => {
    const result = await balanceService.createBalance(req.body);
    res
      .status(201)
      .json(new Response(true, "Balance created successfully", result));
  },

  // Get balance by ID
  getBalanceById: async (req, res) => {
    const result = await balanceService.getBalanceById(req.params.id);

    res
      .status(200)
      .send(new Response(true, "Balance fetched successfully", result));
  },

  // Get all balances (with pagination support)
  getAllBalances: async (req, res) => {
    const { page = 1, pageSize = 10, ...filter } = req.query;

    const result = await balanceService.getAllBalances(filter);

    res.status(200).send(
      new Response(
        true,
        "Balances fetched successfully",
        result,
        result.length, // count
        page,
        pageSize
      )
    );
  },

  // Update balance
  updateBalance: async (req, res) => {
    const result = await balanceService.updateBalance(req.params.id, req.body);

    res
      .status(200)
      .send(new Response(true, "Balance updated successfully", result));
  },

  // Delete balance
  deleteBalance: async (req, res) => {
    const result = await balanceService.deleteBalance(req.params.id);

    res
      .status(200)
      .send(new Response(true, "Balance deleted successfully", result));
  },

  // Get balances for a user
  getUserBalances: async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;

    const result = await balanceService.getUserBalances(req.user._id);

    res
      .status(200)
      .send(
        new Response(
          true,
          "User balances fetched successfully",
          result,
          result.length,
          page,
          pageSize
        )
      );
  },

  // Clear pending → cleared
  clearPendingBalances: async (req, res) => {
    const result = await balanceService.clearPendingBalances();
    res
      .status(200)
      .send(
        new Response(true, "Pending balances cleared successfully", result)
      );
  },
};

export default balanceController;
