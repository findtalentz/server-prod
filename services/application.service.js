import { validateApplication } from "../models/Application.js";
import applicationRepository from "../repositories/application.repository.js";
import APIError from "../utils/APIError.js";

const applicationService = {
  createApplication: async (data) => {
    const { error } = validateApplication(data);
    if (error) throw new APIError(400, error.details[0].message);
    const checkIsApplyed = await applicationRepository.isApplyed(
      data.job,
      data.seller
    );
    if (checkIsApplyed) throw new APIError(400, "Already Applyed");
    return await applicationRepository.createApplication(data);
  },
};

export default applicationService;
