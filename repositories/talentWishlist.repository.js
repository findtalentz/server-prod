import { TalentWishlist } from "../models/TalentWishlist.js";

const talentWishlistRepository = {
  createTalentWishlist: async (data) => {
    return await TalentWishlist.create(data);
  },
  getTalentWishlist: async (user) => {
    return await TalentWishlist.find({ user }).populate("talent");
  },
  getSingleTalentWishlist: async ({ user, talent }) => {
    return await TalentWishlist.findOne({ user, talent });
  },
  removeFromTalentWishlist: async (id) => {
    return await TalentWishlist.findByIdAndDelete(id);
  },
};

export default talentWishlistRepository;
