import { Notification } from "../models/Notification.js";

const notificationRepository = {
  createNotification: async (data) => {
    return await Notification.create(data);
  },
  getNotifications: async (user) => {
    return await Notification.find({ user })
      .sort("-createdAt")
      .populate("user", "firstName lastName role");
  },
  markAsRead: async (id) => {
    return await Notification.findByIdAndUpdate(id, { status: "Read" });
  },
  markAllAsRead: async (user) => {
    return await Notification.updateMany({ user }, { status: "Read" });
  },

  deleteNotification: async (id) => {
    return await Notification.findByIdAndDelete(id);
  },
};

export default notificationRepository;
