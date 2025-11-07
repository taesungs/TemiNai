import React from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css";
import robotImg from "../assets/robotimg.png"; // 업로드한 로봇 이미지 경로 맞게 조정

const MainPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/select");
  };

  return (
    <div className="main-container">
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
