import notificationRepository from "../repositories/notification.repository.js";
import { validateNotification } from "../models/Notification.js";
import APIError from "../utils/APIError.js";

export const notificationService = {
  async createNotification(data) {
    const { error } = validateNotification(data);
    if (error) {
      throw new APIError(400, error.details[0].message);
    }
    return await notificationRepository.createNotification(data);
  },
};
