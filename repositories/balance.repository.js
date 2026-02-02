import { Balance } from "../models/balance.model.js";

const balanceRepository = {
  // Create new balance entry
  create: async (payload) => {
    return await Balance.create(payload);
  },

  // Find by ID
  findById: async (id) => {
    return await Balance.findById(id).populate("job").populate("client");
  },

  // Find one with filter
  findOne: async (filter) => {
    return await Balance.findOne(filter).populate("job").populate("client");
  },

  // Find all with optional filter
  findAll: async (filter = {}) => {
    return await Balance.find(filter)
      .sort({ createdAt: -1 })
      .populate("job")
      .populate("client");
  },

  // Update by ID
  updateById: async (id, updateData) => {
    return await Balance.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  },

  // Delete by ID
  deleteById: async (id) => {
    return await Balance.findByIdAndDelete(id);
  },

  deleteMany: async (ids = []) => {
    return await Balance.deleteMany({
      _id: { $in: ids },
    });
  },

  // Custom: find all pending balances clearing today or earlier
  findClearingBalances: async () => {
    return await Balance.find({
      status: "PENDING",
      clearDate: { $lte: new Date() },
    });
  },

  // Custom: find all balances of a specific user
  findByUser: async (userId) => {
    return await Balance.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("job")
      .populate("client");
  },
};

export default balanceRepository;
