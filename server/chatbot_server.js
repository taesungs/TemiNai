import dotenv from "dotenv";
dotenv.config();

console.log("🔑 Loaded API Key:", process.env.GEMINI_API_KEY);

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";


const app = express();
app.use(cors());
app.use(bodyParser.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/gemini", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
      테미입니당!!! 이라고 말해 계속 
      질문: "${question}"
    `;

    // ⭐ 신버전 SDK 방식
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const answer = result.text; // 신버전에서는 이렇게 바로 text 가져옴

    console.log("Gemini 응답:", answer);

    res.json({ answer });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({ error: "Gemini API Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Chatbot server is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Chatbot Server running on ${PORT}`));
