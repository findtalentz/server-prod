import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read translate-en.txt
const instructions = fs.readFileSync(
  path.join(__dirname, "..", "prompts", "translate-en.txt"),
  "utf-8"
);

const translateService = {
  async getTranslatedText(text) {
    const responses = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: instructions.replace("{{text}}", text) },
      ],
      temperature: 0.2,
      max_tokens: 400,
    });

    return responses.choices[0].message.content;
  },
};

export default translateService;
