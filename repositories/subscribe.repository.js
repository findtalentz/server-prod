import { Subscribe } from "../models/subscribe.js";

const subscribeRepository = {
  findSubscriber: async (email) => {
    return await Subscribe.findOne({ email });
  },
  subscribe: async (email) => {
    return await Subscribe.create({ email });
  },
};

export default subscribeRepository;
