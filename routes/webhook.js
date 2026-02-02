import express from "express";
import transactionRepository from "../repositories/transaction.repository.js";
import jobService from "../services/job.service.js";
import logger from "../startup/logger.js";
import stripe from "../utils/stripe.js";

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const { transactionId, jobId, seller, amount, deliveryDate } =
          session.metadata || {};

        if (!transactionId || !jobId || !seller || !amount || !deliveryDate) {
          logger.error("Missing metadata in session:", session);
          return res.status(400).send("Missing required metadata");
        }

        await transactionRepository.transactionSuccess({
          id: transactionId,
          gatewayRef: session.id,
        });

        await jobService.placeOrder({
          jobId,
          budgetAmount: amount,
          deliveryDate,
          seller,
        });
      }

      return res.status(200).send();
    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
