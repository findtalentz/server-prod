import Joi from "joi";
import chatService from "../services/chat.service.js";

const validateChatBody = (body) => {
  const chatSchema = Joi.object({
    prompt: Joi.string().min(1).max(1000).required(),
    conversationId: Joi.string().guid().required(),
  });
  return chatSchema.validate(body);
};

const chatController = {
  async sendMessage(req, res) {
    const body = req.body;
    const { error } = validateChatBody(body);
    if (error) {
      res.status(400).send(error.details[0]?.message);
      return;
    }

    const { prompt, conversationId } = body;
    const response = await chatService.sendMessage(prompt, conversationId);
    res.status(200).json({ message: response.message });
  },
};

export default chatController;
