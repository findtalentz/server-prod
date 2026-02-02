import { Application } from "../models/Application.js";

const applicationRepository = {
  createApplication: async (data) => {
    return await Application.create(data);
  },
  getClientApplicationsByJob: async (job, client) => {
    return await Application.find({ job, client }).populate("seller");
  },
  getSellerApplicationByJob: async (job, seller) => {
    return await Application.findOne({ job, seller }).populate("seller");
  },
  updateApplication: async (id, data) => {
    return await Application.findByIdAndUpdate(id, data, {
      new: true,
    });
  },
  getClientApplications: async (client) => {
    return await Application.find({ client, isViewed: false })
      .populate("seller")
      .populate("job", "status");
  },
  isApplyed: async (job, seller) => {
    const application = await Application.findOne({ job, seller });
    return application ? true : false;
  },
};

export default applicationRepository;
