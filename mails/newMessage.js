import dotenv from "dotenv";
dotenv.config();

const newMessageEmail = (receiverName, senderName, chatId, message) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #007bff;">📩 New Message from ${senderName}</h2>
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${receiverName}, you just received a new message from <strong> ${senderName} </strong>.
        </p>
        <blockquote style="font-size: 15px; color: #555; margin: 20px auto; padding: 15px; border-left: 4px solid #007bff; background: #f9f9f9;">
          ${message || "📎 Sent an attachment"}
        </blockquote>
        <a href="${process.env.ORIGIN}/chat/${chatId}" 
          style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          Open Chat
        </a>
        <p style="font-size: 14px; color: #777; margin-top: 30px;">
          Reply quickly to keep the conversation going 🚀
        </p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2025 Herdoy.dev. All rights reserved.
      </div>
    </div>
  </div>
`;

export default newMessageEmail;
