import React, { useState, useRef, useEffect } from "react";
import botImg from "../assets/robot.png";
import micImg from "../assets/microphone.png";
//import { sendQuestion } from "../api/request.jsx";
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

  // 🔹 메시지 전송
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const question = input;
    setInput("");
    setLoading(true);

    try {
      const answer = await sendQuestion(question, title);
      setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "죄송합니다. 응답 중 오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Enter 키 전송
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // 🔹 스크롤 항상 맨 아래로 유지
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">
      {/* 🔹 홈 버튼 */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-[100px] left-[0px] flex flex-col items-center cursor-pointer"
      >
        <span className="text-[30px] font-bold text-gray-700">홈</span>
        <div className="flex flex-row gap-[4px] mb-1">
          <img src={backImg} alt="back" className="w-[30px] h-[30px]" />
          <img src={backImg} alt="back" className="w-[30px] h-[30px]" />
        </div>
      </div>

      {/* 🔹 제목 */}
      <h1 className="text-[50px] font-extrabold text-[#00A3E0] mt-[60px] mb-[30px]">
        챗봇
      </h1>

      {/* 🔹 대화창 */}
      <div className="w-[900px] h-[550px] border-2 border-gray-400 rounded-[20px] p-6 flex flex-col bg-white shadow-sm">
        <div className="flex-1 overflow-y-auto mb-4 px-4">
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
                    className="w-[45px] h-[45px] object-contain"
                  />
                  <div className="border border-gray-400 bg-white px-4 py-2 rounded-[18px] rounded-tl-none shadow-sm text-[18px] text-gray-800 max-w-[60%] leading-snug">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-400 bg-white px-4 py-2 rounded-[18px] rounded-tr-none shadow-sm text-[18px] text-gray-800 max-w-[60%] leading-snug">
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {/* 로딩 표시 */}
          {loading && (
            <div className="flex justify-start text-gray-500 text-sm mt-2 ml-12">
              답변을 불러오는 중입니다...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 🔹 입력창 */}
        <div className="flex flex-row items-center justify-between w-[700px] h-[70px] mx-auto rounded-full border-[5px] border-black px-6 bg-white shadow-md">
          <input
            type="text"
            placeholder="무엇이든 물어보세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow outline-none text-[20px] text-gray-800 bg-transparent placeholder-[#939393]"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`w-[40px] h-[40px] ml-4 rounded-full flex items-center justify-center 
            ${loading ? "opacity-60 cursor-not-allowed" : "hover:scale-105 transition"}`}
          >
            <img src={micImg} alt="mic" className="w-[35px] h-[35px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
