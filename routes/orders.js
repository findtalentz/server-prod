import express from "express";
import auth from "../middlewares/auth.js";
import { Transaction } from "../models/transaction.js";
import stripe from "../utils/stripe.js";
import paypalService from "../services/paypal.service.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { amount, seller, deliveryDate, job, paymentGateway = "stripe" } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!amount || !seller || !deliveryDate || !job) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate payment gateway
    if (!["stripe", "paypal"].includes(paymentGateway)) {
      return res.status(400).json({ error: "Invalid payment gateway. Use 'stripe' or 'paypal'" });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: userId,
      type: "checkout",
      amount,
      status: "pending",
      paymentGateway,
      orderMetadata: {
        jobId: job,
        seller,
        deliveryDate,
      },
    });

    if (paymentGateway === "stripe") {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Job Payment",
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.ORIGIN}/deposit-success?session_id={CHECKOUT_SESSION_ID}&payment_gateway=stripe`,
        cancel_url: `${process.env.ORIGIN}/deposit-cancelled`,
        metadata: {
          transactionId: transaction._id.toString(),
          jobId: job.toString(),
          seller,
          deliveryDate,
          amount,
        },
      });

      return res.status(200).json({ 
        url: session.url,
        paymentGateway: "stripe",
        transactionId: transaction._id.toString(),
      });
    } else if (paymentGateway === "paypal") {
      // Create PayPal order
      const paypalOrder = await paypalService.createOrder({
        amount,
        transactionId: transaction._id.toString(),
        jobId: job.toString(),
        seller,
        deliveryDate,
      });

      // Store PayPal order ID in transaction gatewayRef for reference
      await Transaction.findByIdAndUpdate(transaction._id, {
        gatewayRef: paypalOrder.id,
      });

      return res.status(200).json({
        url: paypalOrder.approvalUrl,
        paymentGateway: "paypal",
        orderId: paypalOrder.id,
        transactionId: transaction._id.toString(),
      });
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
