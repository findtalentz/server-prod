import { Job } from "../models/job.js";

const jobRepository = {
  getJobs: async function ({
    search,
    orderBy,
    category,
    jobType,
    budgetType,
    status,
    duration,
    requiredExperienceLevel,
    sortOrder = "asc",
    page = 1,
    pageSize = 10,
  }) {
    let query = Job.find()
      .populate("category", "name")
      .populate("author", "firstName lastName");

    if (search) {
      query = query.or([
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]);
    }

    if (category) {
      query = query.find({ category });
    }
    if (status) {
      query = query.find({ status });
    }

    if (jobType) {
      query = query.find({ jobType });
    }

    if (budgetType) {
      query = query.find({ budgetType });
    }
    if (requiredExperienceLevel) {
      query = query.find({ requiredExperienceLevel });
    }
    if (duration) {
      query = query.find({ duration });
    }

    if (orderBy) {
      const sortDirection = sortOrder === "desc" ? -1 : 1;
      query = query.sort({ [orderBy]: sortDirection });
    }

    const skip = (page - 1) * pageSize;
    query = query.skip(skip).limit(parseInt(pageSize));

    const jobs = await query.exec();

    let countQuery = Job.find();

    if (search) {
      countQuery = countQuery.or([
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]);
    }

    const totalCount = await countQuery.countDocuments();

    return { jobs, totalCount };
  },

  getClientJobs: async function (author, status) {
    return await Job.find({
      author,
      status,
    })
      .populate("category", "name")
      .populate("author", "firstName lastName")
      .populate("seller", "firstName lastName");
  },

  getSellerJobs: async function (seller, status) {
    return await Job.find({
      seller,
      status,
    })
      .populate("category", "name")
      .populate("author", "firstName lastName")
      .populate("seller", "firstName lastName");
  },

  getJobById: async function (id) {
    return await Job.findById(id)
      .populate("author", "firstName lastName image")
      .populate("seller", "firstName lastName image")
      .populate("category");
  },

  createJob: async function (job) {
    return await Job.create(job);
  },
  updateJob: async function (jobId, updatedData) {
    return await Job.findByIdAndUpdate(jobId, updatedData, {
      new: true,
    }).populate("author", "firstName lastName");
  },
  deleteJob: async function (jobId) {
    return await Job.findByIdAndDelete(jobId);
  },

  sellerJobCount: async ({ seller, status = "COMPLETED" }) => {
    return await Job.find({
      seller,
      status,
    });
  },
  completedJobCount: async (userId) => {
    return await Job.countDocuments({
      $or: [{ author: userId }, { seller: userId }],
      status: "COMPLETED",
    });
  },
};

export default jobRepository;
