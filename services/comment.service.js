import mongoose from "mongoose";
import deliveryAcceptedEmail from "../mails/deliveryAcceptedEmail.js";
import { validateCreateApplication } from "../models/comment.model.js";
import commentRepositeory from "../repositories/comment.repository.js";
import jobRepository from "../repositories/job.repository.js";
import userRepository from "../repositories/user.repository.js";
import APIError from "../utils/APIError.js";
import transporter from "../utils/transporter.js";
import balanceService from "./balance.service.js";
import { notificationService } from "./notification.service.js";

const commentService = {
  createComment: async (data) => {
    const { error } = validateCreateApplication(data);
    if (error) throw new APIError(400, error.details[0].message);
    return await commentRepositeory.createComment(data);
  },
  updateComment: async (id, data) => {
    const comment = await commentRepositeory.getCommentById(id);
    if (!comment)
      throw new APIError(404, "Comment with given id was not found!");
    return await commentRepositeory.updateComment(comment._id, data);
  },

  approveTimeRequest: async ({ commentId, jobId, deliveryDate }) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    if (!commentId || !jobId || !deliveryDate)
      throw new APIError(400, "Invalid request");

    const updatedComment = await commentRepositeory.updateComment(commentId, {
      status: "APPROVED",
    });
    if (!updatedComment) throw new APIError(404, "Comment not found");

    const updatedJob = await jobRepository.updateJob(
      jobId,
      { deliveryDate },
      { new: true }
    );
    if (!updatedJob) throw new APIError(404, "Job not found");

    await session.commitTransaction();
    session.endSession();
  },

  approveDelivery: async (data) => {
    const { commentId, jobId, sellerId, clientId } = data;
    const session = await mongoose.startSession();
    session.startTransaction();

    if (!commentId || !jobId || !sellerId || !clientId)
      throw new APIError(400, "Invalid request");

    await commentRepositeory.updateComment(
      commentId,
      { status: "APPROVED" },
      { new: true }
    );

    const job = await jobRepository.updateJob(
      jobId,
      { status: "COMPLETED", completedAt: new Date() },
      { new: true }
    );

    await balanceService.createBalance({
      user: sellerId,
      job: jobId,
      amount: job.budgetAmount * 0.9,
      client: clientId,
    });

    const seller = await userRepository.updateUser(
      sellerId,
      {
        $inc: {
          totalEarning: job.budgetAmount * 0.9,
        },
      },
      { new: true, session }
    );

    const client = await userRepository.updateUser(
      clientId,
      {
        $inc: {
          totalSpend: job.budgetAmount,
        },
      },
      { new: true, session }
    );

    notificationService.createNotification({
      user: seller._id,
      title: "Delivery Accepted",
      type: "info",
      description:
        "Your client has accepted the delivered work. Payment will be processed according to your agreement.",
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: seller.email,
      subject: `Delivery Accepted by ${client.firstName} ${client.lastName}`,
      html: deliveryAcceptedEmail(
        `${seller.firstName} ${seller.lastName}`,
        `${client.firstName} ${client.lastName}`,
        job.title
      ),
    });

    await session.commitTransaction();
    session.endSession();
  },
};

export default commentService;
