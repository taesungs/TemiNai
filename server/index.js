import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ★ Temi WebView Origin 허용 목록
const ALLOWED_ORIGINS = [
  "https://appassets.androidplatform.net",
  "http://appassets.androidplatform.net",
];

// ★ CORS 직접 처리 (보안 강화)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// JSON Body 처리
app.use(bodyParser.json({ limit: "50mb" }));

// ★ CSP 보안정책 — Temi WebView 허용 추가
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';
    img-src 'self' data: blob: https://*.amazonaws.com https://*.cloudfront.net;
    font-src 'self' data: https://fonts.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    connect-src 'self' http://localhost:8080 https://*.amazonaws.com https://*.cloudfront.net https://appassets.androidplatform.net http://appassets.androidplatform.net;
  `.replace(/\s{2,}/g, " ")
  );
  next();
});

// 정적 파일 제공 (폰트/이미지)
app.use("/assets", express.static(path.join(__dirname, "../src/assets")));

// AWS S3 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 업로드 API
app.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    // base64 변환
    const [, base64] = image.split(",");
    const buffer = Buffer.from(base64, "base64");

    // 파일 경로 생성
    const key = `temi/${uuidv4()}.png`;

    // S3 Put
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    });
    await s3.send(command);

    // 업로드 URL 반환
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ url });
  } catch (err) {
    console.error("S3 Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 기본 라우트
app.get("/", (req, res) => res.send("S3 Upload Server is Running"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
