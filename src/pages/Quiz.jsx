import React from "react";
import robotImg from "../assets/robot_blue.png";
import backImg from "../assets/back.png"; // ← 화살표 아이콘 (두 개 사용)
import { useNavigate } from "react-router-dom";

export default function Quiz() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">

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

      {/* 제목 */}
      <h1 className="text-[60px] font-extrabold text-[#0D98BA] mb-16 drop-shadow-sm">
        O/X 퀴즈
      </h1>

      {/* 카드 영역 */}
      <div className="bg-[#0D98BA] rounded-[90px] w-[1200px] h-[550px] flex flex-row items-center justify-center gap-24 px-24 shadow-lg">
        {/* 로봇 이미지 */}
        <div className="flex-shrink-0 flex justify-center items-center">
          <img
            src={robotImg}
            alt="로봇"
            className="w-[320px] h-[320px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* 텍스트 + 버튼 */}
        <div className="flex flex-col justify-center items-center space-y-16 text-center">
          <div className="leading-tight space-y-10">
            <p className="text-[35px] font-extrabold text-[#FFFFFF]">
              행사 재미있게 즐기고 계신가요?
            </p>
            <p className="text-[35px] font-extrabold text-[#FFFFFF]">
              지금 O/X 퀴즈를 참여하고 간식을 받아가세요!!
            </p>
          </div>

          {/* 버튼 */}
          <button
            onClick={() => navigate("/QuizCategory")}
            className="bg-[#A66CFF] hover:bg-[#9257e5] text-[#FFFFFF] font-bold 
              px-[120px] py-[30px] rounded-full 
              shadow-none border-none outline-none focus:outline-none 
              transition-transform transform text-[35px] 
              mt-[40px]"
          >
            퀴즈 참여하기
          </button>
        </div>
      </div>
    </div>
  );
}
