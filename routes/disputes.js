import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { Dispute, validateDispute } from "../models/Dispute.js";
import { Job } from "../models/job.js";
import { Balance } from "../models/balance.model.js";
import balanceService from "../services/balance.service.js";
import Response from "../utils/Response.js";
import APIError from "../utils/APIError.js";

const router = express.Router();

// GET all disputes
router.get("/", [auth, admin], async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("user", "name email")
      .populate("job", "title");
    res.status(200).send(new Response(true, "Success", disputes));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

// GET dispute by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const dispute = await Dispute.findById(_id)
      .populate("user", "name email")
      .populate("job", "title description");

    if (!dispute) {
      return res
        .status(404)
        .send(
          new Response(false, "The Dispute with the given ID was not found!")
        );
    }
    res.status(200).send(new Response(true, "Success"));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

// POST create new dispute (only authenticated users)
router.post("/", auth, async (req, res) => {
  try {
    const body = req.body;
    const { error } = validateDispute(body);
    if (error)
      return res
        .status(400)
        .send(new Response(false, error.details[0].message));

    // Verify job exists and populate author
    const job = await Job.findById(body.job);
    if (!job) {
      return res
        .status(404)
        .send(new Response(false, "Job not found"));
    }

    // Verify user is the job author (client)
    if (job.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .send(new Response(false, "You can only create disputes for your own jobs"));
    }

    // Create dispute
    const newDispute = await Dispute.create({
      ...body,
      user: req.user._id,
    });

    // If job is completed, hold the payment (put balance in HELD status)
    if (job.status === "COMPLETED") {
      // Find balance for this job - balance.client is the job author (client)
      const balance = await Balance.findOne({ 
        job: body.job,
        client: job.author, // The client who created the job
        status: { $in: ["PENDING", "CLEARED"] } // Only hold if not already held
      });

      if (balance) {
        await balanceService.updateBalance(balance._id, {
          status: "HELD",
        });
      }
    }

    res.status(201).send(new Response(true, "Dispute Created", newDispute));
  } catch (error) {
    console.error("Error creating dispute:", error);
    res.status(500).send(new Response(false, "Something went wrong"));
  }
});

// PUT update dispute (admin only)
router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const _id = req.params.id;
    const dispute = await Dispute.findById(_id).populate("job");

    if (!dispute) {
      return res
        .status(404)
        .send(
          new Response(false, "The dispute with the given ID was not found.")
        );
    }

    const body = req.body;
    const { error } = validateDispute(body);

    const updatedDispute = await Dispute.findByIdAndUpdate(_id, body, {
      new: true,
    })
      .populate("user", "name email")
      .populate("job", "title");

    // If dispute is resolved or closed, release the held payment
    if ((body.status === "resolved" || body.status === "closed")) {
      // Populate job to get author
      const job = await Job.findById(dispute.job);
      
      if (job && job.status === "COMPLETED") {
        // Find balance for this job - balance.client is the job author (client)
        const balance = await Balance.findOne({ 
          job: dispute.job,
          client: job.author, // The client who created the job
          status: "HELD"
        });

        if (balance) {
          // Release the payment - set back to PENDING so it can clear normally
          await balanceService.updateBalance(balance._id, {
            status: "PENDING",
          });
        }
      }
    }

    res.status(200).send(new Response(true, "Dispute Updated", updatedDispute));
  } catch (error) {
    console.error("Error updating dispute:", error);
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

// DELETE dispute (admin only)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const _id = req.params.id;
    const dispute = await Dispute.findById(_id);

    if (!dispute) {
      return res
        .status(404)
        .send(
          new Response(false, "The dispute with the given ID was not found.")
        );
    }

    const deletedDispute = await Dispute.findByIdAndDelete(_id);
    res.status(200).send(new Response(true, "Dispute Deleted", deletedDispute));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

// GET disputes by user ID
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const disputes = await Dispute.find({ user: userId })
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.status(200).send(new Response(true, "Success", disputes));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

// GET disputes by job ID
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const disputes = await Dispute.find({ job: jobId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).send(new Response(true, "Success", disputes));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

export default router;
