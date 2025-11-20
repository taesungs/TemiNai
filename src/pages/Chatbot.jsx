import React, { useState, useRef, useEffect } from "react";
import botImg from "../assets/robot.png";
import micImg from "../assets/microphone.png";
import sendImg from "../assets/send.png";
import backImg from "../assets/back.png";
import { useNavigate } from "react-router-dom";
import { sendQuestionToGemini } from "../api/geminiRequest"; // ⭐ Gemini API 불러오기

export default function ChatBot({ title }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 무엇이 궁금하신가요?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ⭐ Temi STT 결과 받기
  useEffect(() => {
    window.receiveSpeech = function (text) {
      console.log("🟢 Temi에서 받은 음성 인식:", text);
      setInput(text);
    };
    return () => {
      delete window.receiveSpeech;
    };
  }, []);

  // ⭐ Temi에게 말하기
  const sendToTemi = (text) => {
    try {
      if (window.TemiInterface && window.TemiInterface.speakText) {
        window.TemiInterface.speakText(text);
        console.log("🔵 Temi에게 말하기 요청:", text);
      } else {
        console.log("⚠️ TemiInterface.speakText 없음 (웹 환경)");
      }
    } catch (err) {
      console.error("❌ Temi 전송 오류:", err);
    }
  };

  // ⭐ Gemini API 호출
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const question = input;
    setInput("");
    setLoading(true);

    try {
      const answer = await sendQuestionToGemini(question);

      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
      sendToTemi(answer);
    } catch (err) {
      console.error("❌ Gemini 호출 실패:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "죄송합니다. 응답 중 오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ⭐ 새로운 메시지 오면 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ⭐ 마이크 버튼 클릭 (Temi 또는 브라우저 STT)
  const handleMicClick = () => {
    try {
      if (window.TemiInterface && window.TemiInterface.startListening) {
        window.TemiInterface.startListening();
        console.log("🎙️ Temi STT 시작");
      } else {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert("이 브라우저는 음성 인식을 지원하지 않습니다 😢 (Chrome 권장)");
          return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "ko-KR";
        recognition.start();

        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setInput(text);
          console.log("🎧 인식된 문장:", text);
        };

        recognition.onerror = (e) => console.error("음성 인식 오류:", e);
      }
    } catch (err) {
      console.error("🎤 마이크 클릭 오류:", err);
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
              답변을 불러오는 중입니다...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ⭐ 입력창 */}
        <div className="flex flex-row items-center justify-between w-[700px] h-[60px] mx-auto rounded-full border-[4px] border-black px-[20px] bg-white shadow-md">
          <button
            onClick={handleMicClick}
            className="flex items-center justify-center w-[40px] h-[40px] mr-3 cursor-pointer hover:scale-105 transition"
          >
            <img src={micImg} alt="mic" className="w-[28px] h-[28px]" />
          </button>

          <input
            type="text"
            placeholder="    << 마이크를 클릭하여 무엇이든 물어보세요!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow outline-none border-none text-[20px] text-gray-800 h-[50px] bg-transparent placeholder-[#939393]"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className={`w-[40px] h-[40px] ml-4 rounded-full flex items-center justify-center 
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105 transition"}`}
          >
            <img src={sendImg} alt="send" className="w-[35px] h-[35px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
