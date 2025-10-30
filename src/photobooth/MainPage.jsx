import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

const MainPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/select"); // SelectPage.jsx로 이동
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-[Pretendard]">
      {/* 제목 */}
      <h1 className="text-2xl font-extrabold text-[#2563EB] mb-8">인생네컷</h1>

      {/* 안내 카드 */}
      <div className="bg-[#4ea7c5] text-white w-[340px] rounded-3xl shadow-lg p-6 flex flex-col items-center space-y-5">
        <FaRobot className="text-6xl mb-2 opacity-90" />
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            2025 CO-SHOW에 오신 걸 환영합니다!
          </p>
          <p className="text-base font-medium">
            오늘의 추억을 인생네컷으로 남겨보세요!!
          </p>
        </div>
        <button
          onClick={handleClick}
          className="mt-4 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:opacity-90 transition"
        >
          인생네컷 참여하기
        </button>
      </div>
    </div>
  );
};

export default MainPage;
