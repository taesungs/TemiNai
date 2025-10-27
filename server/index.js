import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(bodyParser.json({ limit: "15mb" }));

// Content Security Policy (필요한 리소스만 허용)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';
    img-src 'self' data: blob: https://*.amazonaws.com https://*.cloudfront.net;
    font-src 'self' data: https://fonts.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    connect-src 'self' http://localhost:8080 https://*.amazonaws.com https://*.cloudfront.net;
  `.replace(/\s{2,}/g, " ")
  );
  next();
});

// 정적 파일 서빙 (폰트, 이미지)
app.use("/assets", express.static(path.join(__dirname, "../src/assets")));

// AWS S3 클라이언트 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// [POST] /upload — 프론트에서 받은 이미지 업로드
app.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });

    // base64 -> buffer 변환
    const [META, base64] = image.split(",");
    const buffer = Buffer.from(base64, "base64");

    // 파일명 생성
    const key = `temi/${uuidv4()}.png`;

    // S3 업로드
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
    });
    await s3.send(command);

    // URL 반환
    const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 테스트용 기본 경로
app.get("/", (req, res) => res.send("S3 Upload Server is Running "));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
