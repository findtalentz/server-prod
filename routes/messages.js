import express from "express";
import newMessageEmail from "../mails/newMessage.js";
import auth from "../middlewares/auth.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.model.js";
import { notificationService } from "../services/notification.service.js";
import { notifyNewMessage } from "../startup/start-server.js";
import Response from "../utils/Response.js";
import transporter from "../utils/transporter.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    return res
      .status(400)
      .json(new Response(true, "Valid chat ID is required"));
  }

  const messages = await Message.find({ chatId }).populate(
    "sender",
    "firstName lastName image"
  );

  res
    .status(200)
    .json(new Response(true, "Success", messages, messages.length));
});

router.post("/", auth, async (req, res) => {
  try {
    const body = req.body;
    const chat = await Chat.findById(body.chatId);
    if (!chat) return res.status(400).send(new Response(false, "Invalid Chat"));
    const lastMessageTime = new Date(chat.updatedAt);

    chat.lastMessage = body.message || "Files";
    await chat.save();

    const newMessage = await Message.create({ ...body, sender: req.user._id });

    // Identify receiver and notify them
    const receiverId =
      req.user._id === chat.buyer.toString()
        ? chat.seller.toString()
        : chat.buyer.toString();

    const receiver = await User.findById(receiverId);

    notifyNewMessage({
      senderId: req.user._id,
      receiverId,
      chatId: body.chatId,
    });

    const now = new Date();
    if (now - lastMessageTime >= 60 * 1000) {
      await notificationService.createNotification({
        user: receiver._id,
        title: `You got a new message from ${receiver.firstName}`,
        description: `You have received a new message from ${receiver.firstName}. Reply now!`,
        type: "success",
      });

      transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: receiver.email,
        subject: `New message from ${req.user.firstName}`,
        html: newMessageEmail(
          receiver.firstName,
          req.user.firstName,
          chat._id,
          body.message
        ),
      });
    }
    res.status(201).send(new Response(true, "Success", newMessage));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

export default router;
