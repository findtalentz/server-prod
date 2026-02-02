import express from "express";
import mongoose from "mongoose";
import auth from "../middlewares/auth.js";
import { Service, validateService } from "../models/service.js";
import Response from "../utils/Response.js";

const router = express.Router();

// GET all services or by userId (query param)
router.get("/", auth, async (req, res) => {
  const services = await Service.find({ userId: req.user._id });
  res
    .status(200)
    .json(new Response(true, "Success", services, services.length));
});

router.get("/public", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json(new Response(false, "User ID is required"));
  }
  const services = await Service.find({ userId });
  res
    .status(200)
    .json(new Response(true, "Success", services, services.length));
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json(new Response(false, "Service not found"));
  }
  res.status(200).json(new Response(true, "Success", service));
});

// POST a new service (auth required)
router.post("/", auth, async (req, res) => {
  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).json(new Response(false, error.details[0].message));
  }

  try {
    const newService = await Service.create(req.body);
    res
      .status(201)
      .json(new Response(true, "Service created successfully", newService));
  } catch (err) {
    res.status(500).json(new Response(false, "Failed to create service"));
  }
});

// PUT update a service by ID (auth required)
router.put("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json(new Response(false, "Invalid service ID format"));
  }

  const { error } = validateService(req.body);
  if (error) {
    return res.status(400).json(new Response(false, error.details[0].message));
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedService) {
      return res.status(404).json(new Response(false, "Service not found"));
    }

    res
      .status(200)
      .json(new Response(true, "Service updated successfully", updatedService));
  } catch (err) {
    res.status(500).json(new Response(false, "Failed to update service"));
  }
});

// DELETE a service by ID (auth required)
router.delete("/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json(new Response(false, "Invalid service ID format"));
  }

  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res.status(404).json(new Response(false, "Service not found"));
    }

    res
      .status(200)
      .json(new Response(true, "Service deleted successfully", deletedService));
  } catch (err) {
    res.status(500).json(new Response(false, "Failed to delete service"));
  }
});

export default router;
