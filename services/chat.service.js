import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import conversationRepository from "../repositories/conversation.repository.js";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read chatbot.txt
const template = fs.readFileSync(
  path.join(__dirname, "..", "prompts", "chatbot.txt"),
  "utf-8"
);

// Read HerdoyDev.md
const agencyInfo = fs.readFileSync(
  path.join(__dirname, "..", "prompts", "HerdoyDev.md"),
  "utf-8"
);

const instructions = template.replace("{{agencyInfo}}", agencyInfo);

const chatService = {
  async sendMessage(prompt, conversationId) {
    const responses = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      instructions,
      temperature: 0.2,
      max_output_tokens: 400,
      previous_response_id:
        conversationRepository.getLastResponseId(conversationId),
    });

    conversationRepository.setLastResponseId(conversationId, responses.id);

    return { id: responses.id, message: responses.output_text };
  },
};

export default chatService;
