import { Referral } from "../models/referral.model.js";

const referralRepository = {
  createReferral: async (data) => {
    return await Referral.create(data);
  },
  findReferralByEmail: async (email) => {
    return await Referral.findOne({ refereeEmail: email }).sort({ _id: 1 });
  },
  completeReferral: async (id) => {
    return Referral.findByIdAndUpdate(id, {
      status: "COMPLETED",
      completedAt: new Date(),
    });
  },
};

export default referralRepository;
