import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import robotImg from "../assets/robotimg.png"; // 업로드한 로봇 이미지 경로 맞게 조정
import backImg from "../assets/back.png";

const MainPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/select");
  };

  return (
    <div className="main-container">
      {/* 🔹 홈 버튼 (왼쪽 상단 고정, 화살표 2개) */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-[100px] left-[200px] flex flex-col items-center cursor-pointe "
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
      <h1 className="title">인생네컷</h1>

      <div className="card">
        <img src={robotImg} alt="robot" className="robot-icon" />
        <div className="text-box">
          <p className="welcome-text">2025 CO-SHOW에 오신 걸 환영합니다!</p>
          <p className="sub-text">오늘의 추억을 인생네컷으로 남겨보세요!!</p>
          <button className="participate-btn" onClick={handleClick}>
            인생네컷 참여하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
