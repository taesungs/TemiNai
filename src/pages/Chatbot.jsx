import React, { useState, useRef, useEffect } from "react";
import botImg from "../assets/robot.png";
import micImg from "../assets/microphone.png";
import sendImg from "../assets/send.png";
import backImg from "../assets/back.png";
import { useNavigate } from "react-router-dom";
import { sendQuestionToGemini } from "../api/geminiRequest"; // ⭐ Gemini API 불러오기

// phase: "idle" | "listening" | "responding"

export default function ChatBot({ title }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 무엇이 궁금하신가요?" },
  ]);
  const [input, setInput] = useState("");

  const [phase, setPhase] = useState("idle"); // ⭐ 3단계 상태
  const recognitionRef = useRef(null); // 브라우저 STT 인스턴스
  const chatEndRef = useRef(null);

  const isListening = phase === "listening";
  const loading = phase === "responding";

  // ⭐ 공통 전송 함수 (텍스트 직접 입력 or STT 결과 둘 다 사용)
  const handleSend = async (overrideText) => {
    let question = (overrideText ?? input).trim();
  
    // ⭐ 예외처리: 빈 문자열이면 전송하지 않음
    if (!question) {
      console.log("⚠️ 빈 텍스트 감지 — 전송하지 않음");
  
      // 안내 메시지 출력
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "말이 잘 들리지 않았어요. 다시 한 번 말씀해 주세요!",
        },
      ]);
  
      // Temi에게도 말하게 하고 싶다면
      try {
        if (window.TemiInterface?.speakText) {
          window.TemiInterface.speakText("말이 잘 들리지 않았어요. 다시 말씀해 주세요.");
        }
      } catch (e) {
        console.warn("Temi 안내 음성 실패:", e);
      }
  
      // 다시 대기 상태
      setPhase("idle");
      // 입력창 비우기
      if (!overrideText) setInput("");
      return;
    }
  
    // 아래는 원래 코드 -------------------------
    setMessages((prev) => [...prev, { sender: "user", text: question }]);
  
    if (!overrideText) setInput("");
    setPhase("responding");
  
    try {
      const answer = await sendQuestionToGemini(question);
  
      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
  
      if (window.TemiInterface?.speakText) {
        window.TemiInterface.speakText(answer);
      }
    } catch (err) {
      console.error("❌ Gemini 호출 실패:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "죄송합니다. 응답 중 오류가 발생했습니다." },
      ]);
    } finally {
      setPhase("idle");
    }
  };
  

  // ⭐ Temi STT 결과 받기 (Android에서 window.receiveSpeech 호출)
  useEffect(() => {
    window.receiveSpeech = function (text) {
      console.log("🟢 Temi에서 받은 음성 인식:", text);
      // Temi에서 인식이 끝났다는 건 → 여기까지 말하겠다는 뜻이므로 바로 전송
      handleSend(text); // 이미 phase가 responding일 수도 있지만 그대로 유지
    };
    return () => {
      delete window.receiveSpeech;
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ⭐ 새로운 메시지 오면 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⭐ 컴포넌트 언마운트 시 STT 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("cleanup STT error:", e);
        }
      }
    };
  }, []);

  // ⭐ 마이크 버튼 클릭 (3단계 상태 반영)
  const handleMicClick = () => {
    // 응답 기다리는 중이면 마이크 막기
    if (phase === "responding") {
      console.log("⌛ 응답 대기 중에는 STT 시작 불가");
      return;
    }

    try {
      // 📌 1) Temi가 있는 경우
      if (window.TemiInterface && window.TemiInterface.startListening) {
        if (!isListening) {
          // 1단계 → 2단계: 대기 → 듣는 상태
          window.TemiInterface.startListening();
          console.log("🎙️ Temi STT 시작");
          setPhase("listening");
        } else {
          // 2단계: 다시 누르면 “여기까지 말하겠다” → STT 종료 + 바로 응답중 UI
          if (window.TemiInterface.stopListening) {
            window.TemiInterface.stopListening();
            console.log("🛑 Temi STT 종료 요청");
          } else {
            console.log("⚠️ TemiInterface.stopListening 없음");
          }
          // 👇 여기서 바로 3단계 UI로 전환
          setPhase("responding");
          // 이후 Temi가 인식 마치고 window.receiveSpeech(text) 호출 → handleSend(text)에서 그대로 responding 유지
        }
        return;
      }

      // 📌 2) 브라우저 STT (웹 테스트용)
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다 😢 (Chrome 권장)");
        return;
      }

      // 이미 듣는 중이면 → stop (2단계 → 3단계 준비: 응답중 UI로 먼저 전환)
      if (isListening && recognitionRef.current) {
        console.log("🛑 브라우저 STT 종료 요청");
        // 👇 UI 먼저 응답중으로
        setPhase("responding");
        recognitionRef.current.stop();
        return;
      }

      // 새 인스턴스 생성 후 시작 (1단계 → 2단계)
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎙️ 브라우저 STT 시작");
        setPhase("listening"); // 2단계: 듣는 상태
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        console.log("🎧 인식된 문장:", text);
        // “여기까지 말하겠다” → 인식된 문장으로 곧바로 전송
        handleSend(text); // 2단계 → 3단계 (이미 responding이면 그대로 유지)
      };

      recognition.onerror = (e) => {
        console.error("음성 인식 오류:", e);
        // 에러면 다시 idle
        setPhase("idle");
      };

      recognition.onend = () => {
        console.log("🛑 브라우저 STT onend");
        recognitionRef.current = null;
        // onresult에서 handleSend가 잘 호출되면 phase는 responding 상태일 것.
        // 만약 아직 listening 상태였다면(인식 실패 etc.) idle로 돌려줌.
        setPhase((prev) => (prev === "listening" ? "idle" : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("🎤 마이크 클릭 오류:", err);
      setPhase("idle");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">
      {/* ⭐ 헤더: 홈 버튼 + 제목 (같은 라인) */}
      <div className="flex flex-row items-center justify-between w-full px-[40px] mt-[60px] mb-[30px]">
        {/* 홈 버튼 */}
        <div
          onClick={() => navigate("/")}
          className="flex flex-col items-center cursor-pointer"
        >
          <span className="text-[30px] font-bold text-gray-700">홈</span>
          <div className="flex flex-row gap-[4px] mb-1">
            <img src={backImg} alt="back" className="w-[30px] h-[30px]" />
            <img src={backImg} alt="back" className="w-[30px] h-[30px]" />
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-[50px] font-extrabold text-[#0D98BA] text-center">
          챗봇
        </h1>

        {/* 오른쪽 여백 (밸런스 맞춤) */}
        <div className="w-[80px]"></div>
      </div>

      {/* ⭐ 대화창 */}
      <div className="w-[1100px] h-[550px] border-2 border-gray-400 rounded-[20px] p-[20px] flex flex-col bg-white shadow-sm">
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto mb-[20px] px-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex mb-5 ${
                msg.sender === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              {msg.sender === "bot" ? (
                <div className="flex flex-row items-start gap-3">
                  <img
                    src={botImg}
                    alt="bot"
                    className="w-[70px] h-[70px] object-contain mt-1"
                  />
                  <div className="bg-[#D9D9D9] px-[15px] py-[11px] rounded-[18px] rounded-tl-none shadow-sm text-[20px] text-gray-800 max-w-[65%] leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="bg-[#C5E5ED] px-[15px] py-[11px] rounded-[18px] rounded-tr-none shadow-sm text-[20px] text-gray-800 max-w-[65%] leading-relaxed">
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start text-gray-500 text-sm mt-2 ml-12">
              응답을 불러오는 중입니다...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ⭐ 입력부: 마이크 메인 + 텍스트 보조 + 상태 안내 */}
        <div className="flex flex-col items-center w-full mt-1 mb-1">
          {/* 메인 음성 입력 버튼 */}
          <button
            onClick={handleMicClick}
            disabled={phase === "responding"}
            className={`relative flex items-center justify-center 
      w-[90px] h-[90px] rounded-full shadow-xl 
      transition transform
      ${
        phase === "listening"
          ? "bg-red-500 animate-pulse"
          : phase === "responding"
          ? "bg-gray-500 opacity-80 cursor-not-allowed"
          : "bg-[#1e88e5] hover:scale-105 active:scale-95"
      }
      text-white`}
          >
            {/* 상태별 아이콘 구분 */}
            {phase === "responding" ? (
              // 3단계: 응답 중 → 스피너
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              // 1, 2단계: 대기 / 듣는 중 → 마이크 아이콘
              <img src={micImg} alt="mic" className="w-[45px] h-[45px]" />
            )}

            {/* 2단계 전용 REC 뱃지 */}
            {phase === "listening" && (
              <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[11px] font-bold px-2 py-[2px] rounded-full shadow">
                REC
              </span>
            )}
          </button>

          {/* 상태 안내 텍스트 + 아이콘 */}
          <div className="mt-2 text-sm text-gray-700 h-5 flex items-center gap-2">
            {phase === "idle" && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
                <span>마이크를 눌러 질문을 말할 수 있어요.</span>
              </>
            )}

            {phase === "listening" && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>듣는 중입니다. 다시 누르면 여기까지를 보낼게요.</span>
              </>
            )}

            {phase === "responding" && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>응답을 불러오는 중입니다...</span>
              </>
            )}
          </div>

          {/* 보조 텍스트 입력 바 */}
          <div
            className="flex flex-row items-center justify-between 
                  w-[700px] h-[55px] mt-3 mx-auto 
                  rounded-full border-[3px] border-gray-400 
                  px-[18px] bg-white shadow-md"
          >
            <input
              type="text"
              placeholder="필요하면 텍스트로 직접 입력해도 좋아요."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow outline-none border-none 
                 text-[20px] text-gray-800 bg-transparent placeholder-[#999]"
              disabled={loading}
            />

            <button
              onClick={() => handleSend()}
              disabled={loading}
              className={`w-[40px] h-[40px] rounded-full flex items-center justify-center 
        ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-110 transition"}`}
            >
              <img src={sendImg} alt="send" className="w-[35px] h-[35px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
