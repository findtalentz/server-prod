import userRepository from "../repositories/user.repository.js";
import APIError from "../utils/APIError.js";
import stripe from "../utils/stripe.js";
import withdrawService from "./withdraw.service.js";
import paypalPayoutService from "./paypal-payout.service.js";
import { Withdraw } from "../models/withdraw.js";
import { PaypalAccount } from "../models/PaypalAccount.js";
import logger from "../startup/logger.js";

const adminService = {
  acceptWithdraw: async ({ sellerId, amount, withdrawId }) => {
    const seller = await userRepository.findUserById(sellerId);
    if (!seller) throw new APIError(404, "User not found");

    // Get withdrawal details
    const withdrawal = await Withdraw.findById(withdrawId).populate("paymentMethodId");
    if (!withdrawal) throw new APIError(404, "Withdrawal not found");

    if (seller.balance < amount)
      throw new APIError(400, "Insufficient balance");

    if (amount < 30) throw new APIError(400, "Minimum withdrawal is $30");

    let gatewayRef = null;

    // Process payment based on gateway
    if (withdrawal.paymentGateway === "stripe") {
      // Stripe withdrawal
      if (!seller.stripeAccountId) {
        throw new APIError(400, "Stripe account not connected");
      }

      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        destination: seller.stripeAccountId,
      });

      gatewayRef = transfer.id;
      logger.info(`✅ Stripe transfer created: ${transfer.id} for withdrawal ${withdrawId}`);

    } else if (withdrawal.paymentGateway === "paypal") {
      // PayPal withdrawal
      const paypalAccount = await PaypalAccount.findById(withdrawal.paymentMethodId);
      if (!paypalAccount || !paypalAccount.email) {
        throw new APIError(400, "Invalid PayPal account");
      }

      const payout = await paypalPayoutService.createPayout({
        amount,
        email: paypalAccount.email,
        senderItemId: withdrawId,
      });

      gatewayRef = payout.batchId;
      logger.info(`✅ PayPal payout created: ${payout.batchId} for withdrawal ${withdrawId}`);

    } else {
      throw new APIError(400, "Invalid payment gateway");
    }

    // Update withdrawal status and gateway reference
    await withdrawService.updateWithdraw(withdrawId, {
      status: "COMPLETED",
      gatewayRef,
    });

    // Balance is already deducted when withdrawal was created
    // No need to deduct again here
  },
};

export default adminService;
