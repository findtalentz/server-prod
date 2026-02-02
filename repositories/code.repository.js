import { Code } from "../models/code.model.js";

const codeRepository = {
  createCode: async (codeData) => {
    const code = new Code(codeData);
    return await code.save();
  },

  getCode: async (userId, code) => {
    return await Code.findOne({ user: userId, code: code });
  },

  updateCode: async (user, code) => {
    const getCode = await Code.findOne({ user });
    if (getCode) {
      return Code.findByIdAndUpdate(
        getCode._id,
        { code, createdAt: new Date() },
        { new: true, upsert: true }
      );
    }
    return await Code.create({ user, code });
  },

  deleteCode: async (id) => {
    return await Code.findByIdAndDelete(id);
  },
};

export default codeRepository;
