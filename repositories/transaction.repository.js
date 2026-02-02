import { Transaction } from "../models/transaction.js";

const transactionRepository = {
  transactionSuccess: async ({ id, gatewayRef }) => {
    try {
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        {
          status: "completed",
          gatewayRef,
        },
        { new: true, runValidators: true }
      );

      if (!updatedTransaction) {
        console.warn(`Transaction not found: ${id}`);
        return null;
      }

      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },
};

export default transactionRepository;
