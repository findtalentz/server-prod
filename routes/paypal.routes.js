import express from "express";
import auth from "../middlewares/auth.js";
import { Transaction } from "../models/transaction.js";
import paypalService from "../services/paypal.service.js";
import transactionRepository from "../repositories/transaction.repository.js";
import jobService from "../services/job.service.js";
import logger from "../startup/logger.js";
import Response from "../utils/Response.js";

const router = express.Router();

/**
 * Capture PayPal payment after user approval
 * This endpoint is called from the frontend after PayPal redirect
 */
router.post("/capture", auth, async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).send(
        new Response(false, "Missing orderId or transactionId")
      );
    }

    // Get transaction to verify it belongs to the user
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).send(
        new Response(false, "Transaction not found")
      );
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).send(
        new Response(false, "Unauthorized access to transaction")
      );
    }

    if (transaction.status === "completed") {
      return res.status(200).send(
        new Response(true, "Payment already completed", { transaction })
      );
    }

    // Capture the PayPal order
    const capture = await paypalService.captureOrder(orderId);

    if (capture.status === "COMPLETED") {
      // Get metadata from transaction document
      const metadata = transaction.orderMetadata;
      
      if (!metadata || !metadata.jobId || !metadata.seller || !metadata.deliveryDate) {
        logger.error("Missing metadata in transaction:", { transactionId });
        return res.status(400).send(
          new Response(false, "Missing required metadata in transaction")
        );
      }

      // Update transaction status
      await transactionRepository.transactionSuccess({
        id: transactionId,
        gatewayRef: orderId,
      });

      // Place the order
      await jobService.placeOrder({
        jobId: metadata.jobId.toString(),
        budgetAmount: transaction.amount,
        deliveryDate: metadata.deliveryDate,
        seller: metadata.seller.toString(),
      });

      logger.info(`✅ PayPal payment captured successfully: ${orderId}`);

      return res.status(200).send(
        new Response(true, "Payment captured successfully", {
          transactionId,
          orderId,
          capture,
        })
      );
    } else {
      // Payment not completed
      await Transaction.findByIdAndUpdate(transactionId, {
        status: "failed",
      });

      return res.status(400).send(
        new Response(false, `Payment status: ${capture.status}`)
      );
    }
  } catch (error) {
    logger.error("PayPal capture error:", error);
    return res.status(500).send(
      new Response(false, "Failed to capture payment", { error: error.message })
    );
  }
});

/**
 * PayPal webhook handler
 * This endpoint receives webhook events from PayPal
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = JSON.parse(req.body.toString());
      
      logger.info("PayPal webhook received:", event.event_type);

      // Handle different PayPal webhook events
      if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const resource = event.resource;
        const orderId = resource.supplementary_data?.related_ids?.order_id;
        
        if (!orderId) {
          logger.error("Missing order ID in PayPal webhook");
          return res.status(400).send("Missing order ID");
        }

        // Get order details to find transaction
        const order = await paypalService.getOrder(orderId);
        const customId = order.purchase_units[0]?.custom_id;

        if (!customId) {
          logger.error("Missing custom_id (transactionId) in PayPal order");
          return res.status(400).send("Missing transaction ID");
        }

        // Find transaction by ID
        const transaction = await Transaction.findById(customId);
        if (!transaction) {
          logger.error(`Transaction not found: ${customId}`);
          return res.status(404).send("Transaction not found");
        }

        if (transaction.status === "completed") {
          logger.info(`Transaction already completed: ${customId}`);
          return res.status(200).send();
        }

        // Update transaction status
        await transactionRepository.transactionSuccess({
          id: customId,
          gatewayRef: orderId,
        });

        // Get metadata from transaction and place order
        const metadata = transaction.orderMetadata;
        if (metadata && metadata.jobId && metadata.seller && metadata.deliveryDate) {
          await jobService.placeOrder({
            jobId: metadata.jobId.toString(),
            budgetAmount: transaction.amount,
            deliveryDate: metadata.deliveryDate,
            seller: metadata.seller.toString(),
          });
        }

        logger.info(`✅ PayPal webhook processed: ${orderId}`);
      }

      return res.status(200).send();
    } catch (error) {
      logger.error("PayPal webhook error:", error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

export default router;

