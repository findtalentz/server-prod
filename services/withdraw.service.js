import withdrawRepository from "../repositories/withdraw.repository.js";
import APIError from "../utils/APIError.js";

const withdrawService = {
  updateWithdraw: async (id, data) => {
    const withdraw = await withdrawRepository.findWithdrawById(id);
    if (!withdraw) throw new APIError(404, "Data not found");
    return await withdrawRepository.updateWithdraw(id, data);
  },
};

export default withdrawService;
