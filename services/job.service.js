import orderCongratulationsEmail from "../mails/orderCongratulationsEmail.js";
import { validateJob, validateUpdatableJobData } from "../models/job.js";
import { User } from "../models/user.model.js";
import jobRepository from "../repositories/job.repository.js";
import APIError from "../utils/APIError.js";
import transporter from "../utils/transporter.js";
import { notificationService } from "./notification.service.js";

const jobService = {
  getJobs: async function (query) {
    const { jobs, totalCount } = await jobRepository.getJobs(query);
    return { jobs, totalCount };
  },
  getClientJobs: async function (author, status) {
    return await jobRepository.getClientJobs(author, status);
  },

  getSellerJobs: async function (author, status) {
    return await jobRepository.getSellerJobs(author, status);
  },

  placeOrder: async function ({ jobId, budgetAmount, deliveryDate, seller }) {
    const job = await jobRepository.updateJob(jobId, {
      status: "IN_PROGRESS",
      seller,
      budgetAmount,
      startDate: new Date(),
      deliveryDate,
    });

    await notificationService.createNotification({
      user: seller,
      title: "Congratulations! You Got a New Job",
      description: `You got a contract. from ${job.author.firstName} ${job.author.lastName}.`,
      type: "success",
    });

    const user = await User.findById(seller);

    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Congratulations! You Got a New Job",
      html: orderCongratulationsEmail(
        `${user.firstName} ${user.lastName}`,
        `${job.author.firstName} ${job.author.lastName}`,
        job.title
      ),
    });
  },

  getJobById: async function (id) {
    return await jobRepository.getJobById(id);
  },
  createJob: async function (job) {
    const { error } = validateJob(job);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    return await jobRepository.createJob(job);
  },

  updateJob: async function (jobId, updatedData) {
    const { error } = validateUpdatableJobData(updatedData);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    return await jobRepository.updateJob(jobId, updatedData);
  },
  deleteJob: async function (jobId) {
    return await jobRepository.deleteJob(jobId);
  },
  sellerJobCount: async function (seller) {
    return await jobRepository.sellerJobCount(seller);
  },
};

export default jobService;
