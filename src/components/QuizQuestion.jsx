import React from "react";
import robotImg from "../assets/robot.png";

export default function QuizQuestion({
  question,
  onAnswer,
  category,
  time = 15,
}) {
  const categoryNames = {
    coshow: "행사",
    busan: "부산",
    common: "일반 상식",
  };

  const displayCategory = categoryNames[category] || "퀴즈";

  return (
    <div className="flex flex-col items-center justify-center">
      {/* 상단 제목 + 로봇 */}
      <div className="flex items-center gap-2 mb-[40px]">
        <img src={robotImg} alt="robot" className="w-[55px] h-[55px]" />
        <h2 className="text-[#0D98BA] text-[26px] font-bold">
          [{displayCategory} 퀴즈]
        </h2>
      </div>

      {/* 문제 박스 */}
      <div className="w-[900px] h-[80px] border-[6px] border-[#0D98BA] rounded-full px-8 py-3 mb-[40px] flex items-center justify-center">
        <p className="text-[30px] font-extrabold text-black text-center">
          {question}
        </p>
      </div>

      {/* 타이머 바 */}
      <div className="w-[900px] h-[25px] border-4 border-[#000000] rounded-full overflow-hidden bg-[#000000] relative mb-[45px]">
        <div
          className="h-full rounded-full transition-all duration-[1000ms] ease-linear origin-left"
          style={{
            transform: `scaleX(${time / 15})`,
            transformOrigin: "left",
            background: `linear-gradient(to right, #0D98BA, #FFD700, #FF4C4C)`,
            filter: `brightness(${0.8 + (time / 15) * 0.4})`,
          }}
        />
      </div>

      {/* O / X 버튼 */}
      <div className="flex gap-[150px]">
        {/* O 버튼 */}
        <button
          onClick={() => onAnswer("O")}
          className="w-[260px] h-[330px] border-[6px] border-[#0080FF] text-[#0080FF]
                     rounded-[30px] text-[60px] font-extrabold bg-white
                     hover:bg-blue-50 transition-all duration-200
                     flex items-center justify-center
                     shadow-[0_8px_20px_rgba(0,128,255,0.25)] hover:shadow-[0_12px_30px_rgba(0,128,255,0.4)]"
          style={{
            backgroundColor: "white",
            WebkitAppearance: "none",
            appearance: "none",
            outline: "none",
          }}
        >
          O
        </button>

        {/* X 버튼 */}
        <button
          onClick={() => onAnswer("X")}
          className="w-[260px] h-[330px] border-[6px] border-[#FF0000] text-[#FF0000]
                     rounded-[30px] text-[60px] font-extrabold bg-white
                     hover:bg-red-50 transition-all duration-200
                     flex items-center justify-center
                     shadow-[0_8px_20px_rgba(255,0,0,0.25)] hover:shadow-[0_12px_30px_rgba(255,0,0,0.4)]"
          style={{
            backgroundColor: "white",
            WebkitAppearance: "none",
            appearance: "none",
            outline: "none",
          }}
        >
          X
        </button>
      </div>
    </div>
  );
}
