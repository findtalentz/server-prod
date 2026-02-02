import notificationRepository from "../repositories/notification.repository.js";
import Response from "../utils/Response.js";

const notificationController = {
  getNotifications: async (req, res) => {
    const notifications = await notificationRepository.getNotifications(
      req.user._id
    );
    return res
      .status(200)
      .send(new Response(true, "Success", notifications, notifications.length));
  },
  markAsRead: async (req, res) => {
    const { id } = req.params;
    const notification = await notificationRepository.markAsRead(id);
    return res.status(200).send(new Response(true, "Success", notification));
  },
  markAllAsRead: async (req, res) => {
    await notificationRepository.markAllAsRead(req.user._id);
    return res.status(200).send(new Response(true, "Success"));
  },
  deleteNotification: async (req, res) => {
    const { id } = req.params;
    const notification = await notificationRepository.deleteNotification(id);
    return res.status(200).send(new Response(true, "Success", notification));
  },
};

export default notificationController;
