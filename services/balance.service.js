import balanceRepository from "../repositories/balance.repository.js";
import userRepository from "../repositories/user.repository.js";
import { validateBalance } from "../models/balance.model.js";
import APIError from "../utils/APIError.js";

const balanceService = {
  createBalance: async (data) => {
    const { error } = validateBalance(data);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    return await balanceRepository.create(data);
  },

  getBalanceById: async (id) => {
    const balance = await balanceRepository.findById(id);
    if (!balance) {
      throw new APIError(400, "Balance not found");
    }
    return balance;
  },

  getAllBalances: async (filter = {}) => {
    return await balanceRepository.findAll(filter);
  },

  updateBalance: async (id, updateData) => {
    const updated = await balanceRepository.updateById(id, updateData);
    if (!updated) {
      throw new APIError(400, "Balance update failed");
    }
    return updated;
  },

  deleteBalance: async (id) => {
    const deleted = await balanceRepository.deleteById(id);
    if (!deleted) {
      throw new APIError(400, "Balance delete failed");
    }
    return deleted;
  },

  getUserBalances: async (userId) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new APIError(404, "User not found");
    // Get all user balances
    const balances = await balanceRepository.findByUser(userId);

    if (!balances || balances.length === 0) return [];

    // Filter cleared balances
    const clearedBalances = balances.filter(
      (item) => new Date(item.clearDate) < new Date()
    );

    // Total cleared amount
    const totalCleared = clearedBalances.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (totalCleared === 0) {
      return await balances;
    }

    await userRepository.updateUser(userId, {
      $inc: { balance: totalCleared },
    });

    // Delete only cleared balances (IDs only)
    await balanceRepository.deleteMany(clearedBalances.map((b) => b._id));
    return await balances;
  },

  clearPendingBalances: async () => {
    const pendingBalances = await balanceRepository.findClearingBalances();

    let updatedCount = 0;

    for (const balance of pendingBalances) {
      await balanceRepository.updateById(balance._id, {
        status: "CLEARED",
      });
      updatedCount++;
    }

    return {
      message: "Clearing balances complete",
      totalCleared: updatedCount,
    };
  },
};

export default balanceService;
