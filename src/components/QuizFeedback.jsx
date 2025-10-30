import React from "react";
import robotBlueImg from "../assets/robot_blue.png";
import robotRedImg from "../assets/robot_red.png";

export default function QuizFeedback({ type, message, explanation }) {
  const isCorrect = type === "correct";
  const robotImg = isCorrect ? robotBlueImg : robotRedImg;

  return (
    <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
      <div
        className={`relative flex flex-row items-center justify-center gap-8 rounded-[40px] shadow-2xl px-16 py-10
          ${isCorrect ? "bg-[#0D98BA]" : "bg-[#EF5350]"}`}
        style={{
          width: "900px",
          height: "400px",
          color: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {/* 왼쪽 텍스트 영역 */}
        <div className="flex flex-col items-center justify-center text-center flex-1">
          <h3 className="text-[50px] font-extrabold mb-2 leading-tight text-white">
            {message}
          </h3>

          {/* 설명 (오답일 때만 표시) */}
          {!isCorrect && (
            <p className="text-[25px] font-medium text-white/90 max-w-[420px] leading-snug">
              {explanation}
            </p>
          )}
        </div>



        {/* 오른쪽 로봇 이미지 */}
        <div className="flex items-center justify-center pr-8">
        <img
            src={robotImg}
            alt="robot"
            className="w-[200px] h-[200px] object-contain translate-x-[-80px]"
        />
        </div>

      </div>
    </div>
  );
}
