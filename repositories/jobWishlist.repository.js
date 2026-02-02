import { JobWishlist } from "../models/JobWishlist.js";

const jobWishlistRepository = {
  createJobWishlist: async (data) => {
    return await JobWishlist.create(data);
  },
  getJobWishlist: async (user) => {
    return await JobWishlist.find({ user }).populate("job");
  },
  getSingleJobWishlist: async ({ user, job }) => {
    return await JobWishlist.findOne({ user, job });
  },
  removeFromJobWishlist: async (id) => {
    return await JobWishlist.findByIdAndDelete(id);
  },
};

export default jobWishlistRepository;
