import { validateViews } from "../models/Views.js";
import viewsRepository from "../repositories/views.repository.js";
import APIError from "../utils/APIError.js";

const viewsService = {
  incrementViews: async (data) => {
    const { error } = validateViews(data);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }

    const existingView = await viewsRepository.getViewByTypeAndIp({
      ip: data.ip,
      type: data.type,
      subjectId: data.subjectId,
    });
    if (existingView) return;

    const updated = await viewsRepository.incrementViews(data);
    return updated;
  },
};

export default viewsService;
