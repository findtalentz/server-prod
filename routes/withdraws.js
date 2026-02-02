import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { User } from "../models/user.model.js";
import { Withdraw } from "../models/withdraw.js";
import { PaymentMethod } from "../models/PaymentMethod.js";
import { BankAccount } from "../models/BankAccount.js";
import { PaypalAccount } from "../models/PaypalAccount.js";
import Response from "../utils/Response.js";
import APIError from "../utils/APIError.js";

const router = express.Router();
router.get("/", [auth, admin], async (req, res) => {
  try {
    const {
      orderBy,
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
      status,
    } = req.query;

    // Build base query
    let query = Withdraw.find().populate("user", "firstName lastName email");

    // Apply filters
    if (status) {
      query = query.where("status").equals(status);
    }

    // Apply sorting
    if (orderBy) {
      const sortDirection = sortOrder === "desc" ? -1 : 1;
      query = query.sort({ [orderBy]: sortDirection });
    } else {
      // Default sorting by newest first
      query = query.sort({ createdAt: -1 });
    }

    // Apply pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    query = query.skip(skip).limit(Number(pageSize));

    const withdraws = await query.exec();

    // Get total count with same filters
    let countQuery = Withdraw.find();
    if (status) {
      countQuery = countQuery.where("status").equals(status);
    }
    const totalCount = await countQuery.countDocuments();

    res
      .status(200)
      .send(
        new Response(
          true,
          "Withdraw requests fetched successfully",
          withdraws,
          totalCount,
          Number(page),
          Number(pageSize)
        )
      );
  } catch (error) {
    console.error("Error fetching withdraw requests:", error);
    res.status(500).send(new Response(false, "Internal server error"));
  }
});

router.get("/earning", auth, async (req, res) => {
  try {
    const completedWithdraws = await Withdraw.find({
      user: req.user._id,
      status: "COMPLETED",
    });

    const totalEarning = completedWithdraws.reduce((total, withdraw) => {
      return total + (withdraw.amount || 0);
    }, 0);

    res
      .status(200)
      .send(
        new Response(true, "Earnings calculated successfully", totalEarning)
      );
  } catch (error) {
    console.error("Error calculating earnings:", error);
    res.status(500).send(new Response(false, "Server error"));
  }
});

router.get("/earning/pending", auth, async (req, res) => {
  try {
    const pendingWithdraws = await Withdraw.find({
      user: req.user._id,
      status: "PENDING",
    });

    const totalEarning = pendingWithdraws.reduce((total, withdraw) => {
      return total + (withdraw.amount || 0);
    }, 0);

    res
      .status(200)
      .send(
        new Response(true, "Earnings calculated successfully", totalEarning)
      );
  } catch (error) {
    console.error("Error calculating earnings:", error);
    res.status(500).send(new Response(false, "Server error"));
  }
});

// Get user's withdraw requests
router.get("/my", auth, async (req, res) => {
  try {
    const {
      orderBy,
      sortOrder = "asc",
      status,
      page = 1,
      pageSize = 10,
    } = req.query;

    // Build base query for user's withdraws
    let query = Withdraw.find({ user: req.user._id }).populate(
      "user",
      "firstName lastName email"
    );

    // Apply status filter if provided
    if (status) {
      query = query.where("status").equals(status);
    }

    // Apply sorting
    if (orderBy) {
      const sortDirection = sortOrder === "desc" ? -1 : 1;
      query = query.sort({ [orderBy]: sortDirection });
    } else {
      // Default sorting by newest first
      query = query.sort({ createdAt: -1 });
    }

    // Apply pagination
    const skip = (Number(page) - 1) * Number(pageSize);
    query = query.skip(skip).limit(Number(pageSize));

    const withdraws = await query.exec();

    // Get total count with same filters
    let countQuery = Withdraw.find({ user: req.user._id });
    if (status) {
      countQuery = countQuery.where("status").equals(status);
    }
    const totalCount = await countQuery.countDocuments();

    res
      .status(200)
      .send(
        new Response(
          true,
          "Withdraw requests fetched successfully",
          withdraws,
          totalCount,
          Number(page),
          Number(pageSize)
        )
      );
  } catch (error) {
    console.error("Error fetching user withdraw requests:", error);
    res.status(500).send(new Response(false, "Internal server error"));
  }
});

// Create new withdraw request
router.post("/", auth, async (req, res) => {
  try {
    const { amount, paymentMethodId, paymentGateway } = req.body;

    // Validate input
    if (!amount || !paymentMethodId || !paymentGateway) {
      return res
        .status(400)
        .send(new Response(false, "Amount, payment method, and payment gateway are required"));
    }

    // Validate payment gateway
    if (!["stripe", "paypal"].includes(paymentGateway)) {
      return res
        .status(400)
        .send(new Response(false, "Invalid payment gateway. Use 'stripe' or 'paypal'"));
    }

    // Check if amount is valid
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 30 || numericAmount > 10000) {
      return res
        .status(400)
        .send(new Response(false, "Amount must be between $30 and $10,000"));
    }

    // Check user balance
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send(new Response(false, "User not found"));
    }

    if (user.balance < numericAmount) {
      return res
        .status(400)
        .send(new Response(false, "Insufficient funds in your wallet"));
    }

    // Validate payment method exists and belongs to user
    const paymentMethod = await PaymentMethod.findOne({
      _id: paymentMethodId,
      user: req.user._id,
    });

    if (!paymentMethod) {
      return res
        .status(404)
        .send(new Response(false, "Payment method not found"));
    }

    // Validate payment method type matches gateway
    if (paymentMethod.methodType === "bank" && paymentGateway !== "stripe") {
      return res
        .status(400)
        .send(new Response(false, "Bank accounts can only be used with Stripe"));
    }

    if (paymentMethod.methodType === "paypal" && paymentGateway !== "paypal") {
      return res
        .status(400)
        .send(new Response(false, "PayPal accounts can only be used with PayPal"));
    }

    // Additional validation for Stripe
    if (paymentGateway === "stripe" && !user.stripeAccountId) {
      return res
        .status(400)
        .send(new Response(false, "Stripe account not connected. Please connect your Stripe account first."));
    }

    // Additional validation for PayPal
    if (paymentGateway === "paypal") {
      const paypalAccount = await PaypalAccount.findById(paymentMethodId);
      if (!paypalAccount || !paypalAccount.email) {
        return res
          .status(400)
          .send(new Response(false, "Invalid PayPal account"));
      }
    }

    // Create withdraw request
    const newWithdraw = await Withdraw.create({
      amount: numericAmount,
      user: req.user._id,
      status: "PENDING",
      paymentMethodId,
      paymentGateway,
    });

    // Deduct from user's wallet balance
    user.balance -= numericAmount;
    await user.save();

    res
      .status(201)
      .send(
        new Response(
          true,
          "Withdraw request submitted successfully",
          newWithdraw
        )
      );
  } catch (error) {
    console.error("Error creating withdraw request:", error);
    res.status(500).send(new Response(false, "Internal server error"));
  }
});

router.post("/approve", [auth, admin], async (req, res) => {
  try {
    const { withdrawId, sellerId, amount } = req.body;
    
    if (!withdrawId || !sellerId || !amount) {
      return res
        .status(400)
        .send(new Response(false, "Missing required fields: withdrawId, sellerId, amount"));
    }

    // Use admin service to process withdrawal
    const adminService = (await import("../services/admin.service.js")).default;
    await adminService.acceptWithdraw({ sellerId, amount, withdrawId });
    
    res.status(200).send(new Response(true, "Withdrawal approved and processed successfully"));
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    res.status(500).send(new Response(false, error.message || "Internal server error"));
  }
});

router.post("/cancel", [auth, admin], async (req, res) => {
  const { withdrawId } = req.body;
  await Withdraw.findByIdAndUpdate(withdrawId, { status: "FAILED" });
  res.status(200).send(new Response(true, "Completed"));
});

export default router;
