import React from "react";
import { useNavigate } from "react-router-dom";

// 아이콘/이미지 (프로젝트에 맞게 경로만 확인하면 돼)
import robotImg from "../assets/robot.png";
import backImg from "../assets/back.png";

export default function MemoryGamechoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* 🔹 홈 버튼 (왼쪽 상단 고정, 화살표 2개) */}
            <div
              onClick={() => navigate("/")}
              className="absolute top-[100px] left-[0px] flex flex-col items-center cursor-pointer"
            >
              {/* 홈 텍스트 */}
              <span className="text-[30px] font-bold text-gray-700">홈</span>

              {/* 화살표 두 개 */}
              <div className="flex flex-row gap-[4px] mb-1">
                <img
                  src={backImg}
                  alt="back"
                  className="w-[30px] h-[30px] object-contain"
                />
                <img
                  src={backImg}
                  alt="back"
                  className="w-[30px] h-[30px] object-contain"
                />
              </div>
            </div>

      <div className="mx-auto mt-10 mb-16 w-[1200px] max-w-[92vw] rounded-md p-8 border-0">


        {/* 타이틀 */}
        <h1 className="text-center text-[56px] font-extrabold text-[#0D98BA]">
          난이도 선택
        </h1>

    

      {/* 로봇 + 말풍선 안내 */}
      <div className="mt-3 flex justify-center">
        <img
          src={robotImg}
          alt="로봇"
          className="w-[56px] h-[56px] object-contain rounded-md border border-[#0D98BA]/40 bg-white shadow-sm"
        />
        <div className="inline-flex items-center gap-3 rounded-full border-[4px] border-[#0D98BA] px-6 py-2 shadow-sm">
          <span className="text-[20px] font-semibold text-slate-700">
            난이도를 선택해주세요!
          </span>
        </div>
        
      </div>

        {/* 카드 2열: 항상 가로 정렬 */}
        <div className="mt-10 grid grid-cols-2 place-items-center gap-16">
          {/* EASY 카드 */}
          <div className="flex flex-col items-center">
            <div className="relative w-[360px] rounded-[28px] border-[6px] border-[#0EA5A7] bg-[#DFF3F6] p-8 text-center shadow-[16px_18px_0_rgba(148,163,184,0.45)]">
              <h2 className="text-[40px] font-extrabold text-black mb-6">
                EASY
              </h2>

              <ul className="list-disc text-left text-[20px] leading-[1.6] pl-6 mb-8">
                <li>4*4</li>
                <li>제한시간 60초</li>
              </ul>

              <p className="text-[16px] text-gray-700">
                기억력 연습에 딱 좋아요!
              </p>
            </div>

            {/* 버튼(카드 아래) */}
            <button
              onClick={() => navigate("/MemoryGameeasy")}
              className="mt-6 w-[300px] rounded-full bg-[#1E90FF] px-6 py-3 text-[20px] font-bold text-white shadow-[0_14px_22px_rgba(30,144,255,0.35)] hover:brightness-110"
            >
              쉬운 단계 도전하기
            </button>
          </div>

          {/* HARD 카드 */}
          <div className="flex flex-col items-center">
            <div className="relative w-[360px] rounded-[28px] border-[6px] border-[#7C3AED] bg-[#ECEAF7] p-8 text-center shadow-[16px_18px_0_rgba(148,163,184,0.45)]">
              <h2 className="text-[40px] font-extrabold text-black mb-6">
                HARD
              </h2>

              <ul className="list-disc text-left text-[20px] leading-[1.6] pl-6 mb-8">
                <li>6*6</li>
                <li>제한시간 150초</li>
              </ul>

              <p className="text-[16px] text-gray-700">
                집중력의 한계에 도전해보세요!
              </p>
            </div>

            {/* 버튼(카드 아래) */}
            <button
              onClick={() => navigate("/MemoryGamehard")}
              className="mt-6 w-[300px] rounded-full bg-[#6F36D9] px-6 py-3 text-[20px] font-bold text-white shadow-[0_14px_22px_rgba(111,54,217,0.35)] hover:brightness-110"
            >
              어려운 단계 도전하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
