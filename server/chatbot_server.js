import dotenv from "dotenv";
dotenv.config();

// API Key 로드 확인 (선택 사항이지만 디버깅에 유용)
console.log("🔑 Loaded API Key:", process.env.GEMINI_API_KEY ? "Success" : "❌ Failed - Check .env file");

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
// JSON 파일을 가져오기 위해 'assert { type: "json" }' 구문을 사용합니다.
import eventData from "./event.json" assert { type: "json" }; 

// --- 서버 설정 ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

// GoogleGenAI 클라이언트 초기화
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// --- Gemini API 호출 핸들러 ---
app.post("/gemini", async (req, res) => {
  try {
    const { question } = req.body;

    // 1. JSON 데이터를 문자열로 변환하여 프롬프트에 삽입
    const programDataJsonString = JSON.stringify(eventData.programs, null, 2);

    const prompt = `
    넌 2025년 11/26~11/29 열리는 부산 벡스코 CO-SHOW 행사 안내 로봇 Temi야.

    # 핵심 규칙
    - Temi는 응답에서 절대 인사말(안녕하세요, 반가워요 등)을 먼저 사용하지 마.
    - 사용자가 인사하면 그때 인사해. 사용자가 먼저 인사하지 않으면 인사를 절대 하지 마.
    - 답변은 반드시 3~5문장 사이로 작성해.
    - 모든 문장은 자연스럽게 작성하고 끝에는 1~2개의 이모지를 붙여.
    - JSON에 없는 정보는 '모르겠다'라고 하지 말고 자연스럽게 일반 지식으로 답변해.

    # 질문 분류 규칙
    1) **프로그램 관련 질문일 때**
    - 아래 JSON 데이터에서 가장 관련 있는 프로그램을 1~2개 골라서 간단히 안내해.
    - 프로그램의 제목, 시간, 요약, 대상 정보를 중심으로 설명해.

    2) **프로그램 관련이 아닐 때 (예: 맛집, 교통, 일정, 일반 정보 등)**
    - 자유롭게 일반 상식으로 답해도 됨.
    - JSON을 언급하거나 "데이터에 없음" 같은 표현 금지.

    # JSON 데이터
    ${programDataJsonString}

    사용자 질문: "${question}"
    `;


    

    // ⭐ 신버전 SDK generateContent 호출 (객체 형식)
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const answer = result.text; // 응답 텍스트는 result.text로 바로 접근
    
    console.log("Gemini 응답:", answer);

    res.json({ answer });

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    // 에러 발생 시 500 상태 코드와 메시지 전송
    res.status(500).json({ error: "Gemini API Error - 서버 로그를 확인하세요." });
  }
});

// --- 기본 경로 응답 ---
app.get("/", (req, res) => {
  res.send("Chatbot server is running!");
});

// --- 서버 실행 ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Chatbot Server running on http://localhost:${PORT}`));