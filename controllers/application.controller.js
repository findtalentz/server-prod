import applicationRepository from "../repositories/application.repository.js";
import applicationService from "../services/application.service.js";
import Response from "../utils/Response.js";

const applicationController = {
  createApplication: async (req, res) => {
    const application = await applicationService.createApplication({
      seller: req.user._id,
      ...req.body,
    });
    return res
      .status(201)
      .send(new Response(true, "Application Created", application));
  },

  updateApplication: async (req, res) => {
    const application = await applicationRepository.updateApplication(
      req.params.id,
      req.body
    );
    return res
      .status(200)
      .send(new Response(true, "Application updated", application));
  },

  isApplyed: async (req, res) => {
    const isApplyed = await applicationRepository.isApplyed(
      req.body.job,
      req.user._id
    );
    return res.status(200).send(new Response(true, "", isApplyed));
  },

  getClientApplicationsByJob: async (req, res) => {
    const applications = await applicationRepository.getClientApplicationsByJob(
      req.params.jobId,
      req.user._id
    );
    return res
      .status(200)
      .send(new Response(true, "Success", applications, applications.length));
  },

  getSellerApplicationByJob: async (req, res) => {
    const application = await applicationRepository.getSellerApplicationByJob(
      req.params.jobId,
      req.user._id
    );
    return res.status(200).send(new Response(true, "Success", application));
  },

  getClientApplications: async (req, res) => {
    const applications = await applicationRepository.getClientApplications(
      req.user._id
    );
    return res.status(200).send(new Response(true, "Success", applications));
  },
};

export default applicationController;
