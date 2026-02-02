import express from "express";
import auth from "../middlewares/auth.js";
import { BankAccount } from "../models/BankAccount.js";
import { PaymentMethod } from "../models/PaymentMethod.js";
import { PaypalAccount } from "../models/PaypalAccount.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.post("/bank-accounts", auth, async (req, res) => {
  const user = req.user._id;
  const isAdded = await BankAccount.findOne({ user, ...req.body });
  if (isAdded)
    return res
      .status(400)
      .send(new Response(false, "Bank account already added."));
  const bankAccount = new BankAccount({ user, ...req.body });
  await bankAccount.save();

  res.status(201).json(new Response(true, "Success"));
});

router.post("/paypal-accounts", auth, async (req, res) => {
  const user = req.user._id;
  const isAdded = await PaypalAccount.findOne({ user, ...req.body });
  if (isAdded)
    return res
      .status(400)
      .send(new Response(false, "Paypal account already added."));
  const paypalAccount = new PaypalAccount({ user, ...req.body });
  await paypalAccount.save();

  return res.status(201).send(new Response(true, "Success"));
});

router.get("/", auth, async (req, res) => {
  const paymentMethods = await PaymentMethod.find({
    user: req.user._id,
  });
  res.status(200).send(new Response(true, "Success", paymentMethods));
});

router.get("/all", auth, async (req, res) => {
  const paymentMethods = await PaymentMethod.find().populate(
    "user",
    "firstName firstName email image"
  );
  res.status(200).send(new Response(true, "Success", paymentMethods));
});

router.delete("/paypal/:id", auth, async (req, res) => {
  await PaypalAccount.findByIdAndDelete(req.params.id);
  return res.status(200).send(new Response(true, "Success"));
});

router.delete("/bank/:id", auth, async (req, res) => {
  await BankAccount.findByIdAndDelete(req.params.id);
  return res.status(200).send(new Response(true, "Success"));
});

router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
    }
  );
  res.status(200).send(new Response(true, "Success", updatedPaymentMethod));
});

export default router;
