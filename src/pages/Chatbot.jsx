import React, { useState, useRef, useEffect } from "react";
import botImg from "../assets/robot.png";
import micImg from "../assets/microphone.png";
import sendImg from "../assets/send.png";
import backImg from "../assets/back.png";
import { useNavigate } from "react-router-dom";

export default function ChatBot({ title }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Temi SDK에서 음성 인식(STT) 결과를 받는 함수 (Android -> JS)
  useEffect(() => {
    window.receiveSpeech = function (text) {
      console.log("🟢 Temi에서 받은 음성 인식:", text);
      setInput(text);
    };
    return () => {
      delete window.receiveSpeech;
    };
  }, []);

  // ✅ Temi 로봇에게 텍스트를 음성으로 말하게 시키는 함수
  const sendToTemi = (text) => {
    try {
      if (window.TemiInterface && window.TemiInterface.speakText) {
        // Temi SDK의 TTS 호출
        window.TemiInterface.speakText(text);
        console.log("🔵 Temi에게 말하기 요청:", text);
      } else {
        console.log("⚠️ TemiInterface.speakText 없음 (웹 환경)");
      }
    } catch (err) {
      console.error("❌ Temi 전송 오류:", err);
    }
  };

  // ✅ 사용자 입력 전송
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const question = input;
    setInput("");
    setLoading(true);

    try {
      // 여기에 실제 서버 연동 (예: sendQuestion(question, title))
      const answer = "이건 Temi 로봇에서 말하게 될 응답입니다."; 
      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
      sendToTemi(answer); // 로봇이 말하도록 요청
    } catch (err) {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 마이크 버튼 클릭 시 음성 인식 시작
  const handleMicClick = () => {
    try {
      if (window.TemiInterface && window.TemiInterface.startListening) {
        // 🔹 Temi SDK에서 STT 시작 (실제 서비스용)
        window.TemiInterface.startListening();
        console.log("🎙️ Temi STT 시작");
      } else {
        // 🔹 브라우저 테스트용 (Web Speech API)
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
      {/* ✅ 홈 버튼 */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-[130px] left-[10px] flex flex-col items-center cursor-pointer"
      >
        <span className="text-[30px] font-bold text-gray-700">홈</span>
        <div className="flex flex-row gap-[4px] mb-1">
          <img src={backImg} alt="back" className="w-[30px] h-[30px]" />
          <img src={backImg} alt="back" className="w-[30px] h-[30px]" />
        </div>
      </div>

      {/* ✅ 제목 */}
      <h1 className="text-[50px] top-[130px] font-extrabold text-[#0D98BA] mt-[60px] mb-[30px] text-center">
        챗봇
      </h1>

      {/* 🔹 대화창 */}
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

        {/* 🔹 입력창 */}
        <div className="flex flex-row items-center justify-between w-[700px] h-[60px] mx-auto rounded-full border-[4px] border-black px-[20px] bg-white shadow-md">
          {/* 🎤 마이크 버튼 (왼쪽) */}
          <button
            onClick={handleMicClick}
            className="flex items-center justify-center w-[40px] h-[40px] mr-3 cursor-pointer hover:scale-105 transition"
          >
            <img src={micImg} alt="mic" className="w-[28px] h-[28px]" />
          </button>

          {/* 입력창 */}
          <input
            type="text"
            placeholder="    << 마이크를 클릭하여 무엇이든 물어보세요!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow outline-none border-none text-[20px] text-gray-800 h-[50px] bg-transparent placeholder-[#939393]"
          />

          {/* 전송 버튼 */}
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
