import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";

// 로그
console.log("🔑 GEMINI:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
console.log("AWS REGION:", process.env.AWS_REGION);
console.log("AWS BUCKET:", process.env.S3_BUCKET_NAME);
console.log(
  "AWS ACCESS:",
  process.env.AWS_ACCESS_KEY_ID ? "Loaded" : "Missing"
);

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_ORIGINS = [
  "https://appassets.androidplatform.net",
  "http://appassets.androidplatform.net",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  next();
});

// JSON Body 처리
app.use(bodyParser.json({ limit: "50mb" }));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
      default-src 'self';
      img-src 'self' data: blob: https://*.amazonaws.com https://*.cloudfront.net;
      font-src 'self' data: https://fonts.gstatic.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      connect-src 'self' 
        http://localhost:8080 
        https://*.amazonaws.com 
        https://*.cloudfront.net 
        https://appassets.androidplatform.net 
        http://appassets.androidplatform.net 
        https://*.trycloudflare.com;
    `.replace(/\s{2,}/g, " ")
  );
  next();
});

/*  
==========================================
  ⭐ Body Parser
==========================================
*/
app.use(bodyParser.json({ limit: "50mb" }));

/*  
==========================================
  ⭐ 정적 파일 서빙
==========================================
*/
app.use("/assets", express.static(path.join(__dirname, "../src/assets")));

/*  
==========================================
  ⭐ AWS S3 클라이언트
==========================================
*/
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/*  
==========================================
  ⭐ Gemini API 라우트
==========================================
*/
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/gemini", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
      넌 부산 벡스코 co-show 행사장 안내 로봇이야.
      사용자가 이해하기 쉽게 간결하고 친절하게 대답해.
      사용자 질문: "${question}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ error: "Gemini API Error" });
  }
});

/*  
==========================================
  ⭐ 이미지 업로드 API (S3)
==========================================
*/
app.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    const [, base64] = image.split(",");
    const buffer = Buffer.from(base64, "base64");
    const key = `temi/${uuidv4()}.png`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    });

    await s3.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ url });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

/*  
==========================================
  ⭐ 기본 라우트
==========================================
*/
app.get("/", (req, res) => res.send("S3 Upload Server is Running"));

/*  
==========================================
  ⭐ 서버 실행
==========================================
*/
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

console.log("================================");
console.log("AWS REGION:", process.env.AWS_REGION);
console.log("AWS BUCKET:", process.env.S3_BUCKET_NAME);
console.log(
  "AWS ACCESS:",
  process.env.AWS_ACCESS_KEY_ID ? "Loaded" : "Missing"
);
console.log("GEMINI API:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
console.log("================================");
