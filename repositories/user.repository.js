import { User } from "../models/user.model.js";

const userRepository = {
  createUser: async (userData) => {
    const user = new User(userData);
    return await user.save();
  },

  updateUser: async (id, updateData) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  },

  findUserByEmail: async (email) => {
    return await User.findOne({ email });
  },

  findUserById: async (id) => {
    return await User.findById(id);
  },

  verifyUser: async (id) => {
    return await User.findByIdAndUpdate(
      id,
      { emailStatus: "VERIFIED" },
      { new: true }
    );
  },
};

export default userRepository;
