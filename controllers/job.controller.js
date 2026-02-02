import jobRepository from "../repositories/job.repository.js";
import jobService from "../services/job.service.js";
import Response from "../utils/Response.js";

const jobController = {
  getJobs: async (req, res) => {
    const { jobs, totalCount } = await jobService.getJobs(req.query);
    return res
      .status(200)
      .send(new Response(true, "Success", jobs, totalCount));
  },

  getSellerJobs: async (req, res) => {
    const { status } = req.query;
    const myJobs = await jobService.getSellerJobs(req.user._id, status);
    return res
      .status(200)
      .send(new Response(true, "Success", myJobs, myJobs.length));
  },
  getClientJobs: async (req, res) => {
    const { status } = req.query;
    const myJobs = await jobService.getClientJobs(req.user._id, status);
    return res
      .status(200)
      .send(new Response(true, "Success", myJobs, myJobs.length));
  },
  getJobById: async (req, res) => {
    const { id } = req.params;
    const job = await jobService.getJobById(id);
    return res.status(200).send(new Response(true, "Success", job));
  },

  createJob: async (req, res) => {
    const newJob = await jobService.createJob({
      ...req.body,
      author: req.user._id,
    });
    return res.status(201).send(new Response(true, "Success", newJob));
  },

  updateJob: async (req, res) => {
    const { id } = req.params;
    const updatedJob = await jobService.updateJob(id, {
      ...req.body,
      author: req.user._id,
    });
    return res.status(200).send(new Response(true, "Success", updatedJob));
  },
  deleteJob: async (req, res) => {
    const { id } = req.params;
    const deletedJob = await jobService.deleteJob(id);
    return res.status(200).send(new Response(true, "Success", deletedJob));
  },

  sellerJobCount: async function (req, res) {
    const sellerJobCount = await jobRepository.sellerJobCount({
      seller: req.query.sellerId,
      status: req.query.status,
    });
    return res
      .status(200)
      .send(new Response(true, "Success", sellerJobCount.length));
  },
};

export default jobController;
