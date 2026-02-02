import express from "express";
import {
  identityVerificationRejectedEmail,
  identityVerificationSuccessEmail,
} from "../mails/verifications.js";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { Id } from "../models/Id.js";
import { KYC } from "../models/KYC.js";
import { Passport } from "../models/passport.js";
import { User } from "../models/user.model.js";
import Response from "../utils/Response.js";
import transporter from "../utils/transporter.js";

const router = express.Router();

router.post("/id", auth, async (req, res) => {
  const user = req.user._id;

  const id = new Id({
    user,
    verificationType: "id",
    status: "pending",
    ...req.body,
  });

  await id.save();
  await User.findByIdAndUpdate(user, { identityStatus: "PENDING" });

  res
    .status(201)
    .json(new Response(true, "ID verification submitted successfully", id));
});

router.post("/passport", auth, async (req, res) => {
  const user = req.user._id;

  const passport = new Passport({
    user,
    verificationType: "passport",
    status: "pending",
    ...req.body,
  });

  await passport.save();
  await User.findByIdAndUpdate(user, { identityStatus: "PENDING" });

  res
    .status(201)
    .json(
      new Response(
        true,
        "Passport verification submitted successfully",
        passport
      )
    );
});

router.get("/", [auth, admin], async (req, res) => {
  try {
    const {
      search,
      orderBy,
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
      status,
      verificationType,
      createdAtStart,
      createdAtEnd,
      ...filters
    } = req.query;

    // Base query
    let query = KYC.find().populate("user", "firstName lastName email");

    // Search functionality
    if (search) {
      query = query.or([
        { "user.firstName": { $regex: search, $options: "i" } },
        { "user.lastName": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ]);
    }

    // Status filter
    if (status) {
      query = query.where("status").equals(status);
    }

    // Verification type filter
    if (verificationType) {
      query = query.where("verificationType").equals(verificationType);
    }

    // Date range filter
    if (createdAtStart || createdAtEnd) {
      const dateFilter = {};
      if (createdAtStart) dateFilter.$gte = new Date(createdAtStart);
      if (createdAtEnd) dateFilter.$lte = new Date(createdAtEnd);
      query = query.where("createdAt").equals(dateFilter);
    }

    // Handle discriminator-specific filters
    if (verificationType === "id") {
      if (filters.frontImage) {
        query = query.where("frontImage").equals(filters.frontImage);
      }
      if (filters.backImage) {
        query = query.where("backImage").equals(filters.backImage);
      }
    } else if (verificationType === "passport") {
      if (filters.passportImage) {
        query = query.where("passportImage").equals(filters.passportImage);
      }
    }

    // Sorting
    if (orderBy) {
      const sortDirection = sortOrder === "desc" ? -1 : 1;

      // Handle sorting by user fields
      if (orderBy.includes("user.")) {
        const userField = orderBy.split(".")[1];
        query = query.sort({ [`user.${userField}`]: sortDirection });
      }
      // Handle sorting by discriminator fields
      else if (
        verificationType === "id" &&
        ["frontImage", "backImage"].includes(orderBy)
      ) {
        query = query.sort({ [orderBy]: sortDirection });
      } else if (
        verificationType === "passport" &&
        orderBy === "passportImage"
      ) {
        query = query.sort({ [orderBy]: sortDirection });
      }
      // Default sorting on KYC fields
      else {
        query = query.sort({ [orderBy]: sortDirection });
      }
    }

    // Pagination
    const skip = (page - 1) * pageSize;
    query = query.skip(skip).limit(parseInt(pageSize));

    // Execute query
    const verifications = await query.exec();

    // Count query (matches the same filters as the main query)
    let countQuery = KYC.find();

    if (search) {
      countQuery = countQuery.or([
        { "user.firstName": { $regex: search, $options: "i" } },
        { "user.lastName": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ]);
    }

    if (status) {
      countQuery = countQuery.where("status").equals(status);
    }

    if (verificationType) {
      countQuery = countQuery
        .where("verificationType")
        .equals(verificationType);
    }

    if (createdAtStart || createdAtEnd) {
      const dateFilter = {};
      if (createdAtStart) dateFilter.$gte = new Date(createdAtStart);
      if (createdAtEnd) dateFilter.$lte = new Date(createdAtEnd);
      countQuery = countQuery.where("createdAt").equals(dateFilter);
    }

    // Handle discriminator-specific filters for count
    if (verificationType === "id") {
      if (filters.frontImage) {
        countQuery = countQuery.where("frontImage").equals(filters.frontImage);
      }
      if (filters.backImage) {
        countQuery = countQuery.where("backImage").equals(filters.backImage);
      }
    } else if (verificationType === "passport") {
      if (filters.passportImage) {
        countQuery = countQuery
          .where("passportImage")
          .equals(filters.passportImage);
      }
    }

    const totalCount = await countQuery.countDocuments();

    res
      .status(200)
      .json(
        new Response(
          true,
          "Verifications retrieved successfully",
          verifications,
          totalCount,
          page,
          pageSize
        )
      );
  } catch (error) {
    console.error("Error fetching verifications:", error);
    res.status(500).json(new Response(false, "Server error", null));
  }
});

router.get("/my", auth, async (req, res) => {
  const verifications = await KYC.find({
    user: req.user._id,
  }).select("-__v");

  res
    .status(200)
    .json(
      new Response(true, "Verifications retrieved successfully", verifications)
    );
});

router.post("/approve", [auth, admin], async (req, res) => {
  const { id } = req.query;

  const kyc = await KYC.findByIdAndUpdate(
    id,
    { status: "verified" },
    { new: true }
  );

  const user = await User.findByIdAndUpdate(kyc.user, {
    identityStatus: "VERIFIED",
  });

  await KYC.deleteMany({
    user: user._id,
    status: { $in: ["pending", "rejected"] },
  });

  await transporter.sendMail({
    from: "noreply@findtalentz.com",
    to: user.email,
    subject: "Identity Verified",
    text: "Hello world?",
    html: identityVerificationSuccessEmail(
      user.firstName + " " + user.lastName
    ),
  });

  res.status(200).json(new Response(true, "Identity verification Completed"));
});

router.post("/reject", [auth, admin], async (req, res) => {
  const { id } = req.query;
  const kyc = await KYC.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true }
  );

  const user = await User.findByIdAndUpdate(kyc.user, {
    identityStatus: "UNVERIFIED",
  });
  await transporter.sendMail({
    from: "noreply@findtalentz.com",
    to: user.email,
    subject: "Identity Verification Rejected",
    text: "Hello world?",
    html: identityVerificationRejectedEmail(
      user.firstName + " " + user.lastName
    ),
  });

  res.status(200).json(new Response(true, "Identity verification Rejected"));
});

export default router;
