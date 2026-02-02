import { Withdraw } from "../models/withdraw.js";

const withdrawRepository = {
  updateWithdraw: async (id, data) => {
    return await Withdraw.findByIdAndUpdate(id, data);
  },
  findWithdrawById: async (id) => {
    return await Withdraw.findById(id);
  },
};

export default withdrawRepository;
