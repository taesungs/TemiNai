import React from "react";
import backImg from "../assets/back.png";
import { useNavigate } from "react-router-dom";
import promoVideo from "../assets/promovideo.mp4";

export default function PromoVideo() {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/"); // 홈으로 이동
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-start bg-white font-sans relative">
      {/* 중앙 제목 */}
      <h1 className="text-[48px] font-extrabold text-[#0D98BA] mt-10">
        홍보 영상
      </h1>

      <div
        onClick={goHome}
        className="flex flex-col items-center cursor-pointer select-none"
        style={{
          position: "absolute",
          top: 110, 
          left: 300,  
        }}
      >
        <span className="text-[30px] text-sm font-semibold text-black mb-1">홈</span>
        <div className="flex items-center" style={{ gap: "7px" }}>
          <img
            src={backImg}
            alt="뒤로가기"
            style={{ width: 30, height: 25, display: "block" }}
            draggable="false"
          />
          <img
            src={backImg}
            alt="뒤로가기"
            style={{ width: 30, height: 25, display: "block", marginLeft: -4 }}
            draggable="false"
          />
        </div>
      </div>

      {/* 본문 콘텐츠 */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 mt -[-100px]">
        <video
          src={promoVideo}
          controls
          autoPlay
          muted
          loop
          className="w-[min(70vw,900px)] rounded-2xl shadow-lg"
        />
      </div>

      {/* 하단 고정 문구 */}
      <div 
        style={{
          position:"fixed",
          bottom: 16,
          color: "#7d7d7d",
          fontSize: "13px",
          textAlign: "center",
          fontStyle: "italic",
        }}>
        본 영상은 2025 CO-SHOW의 공식 홍보 영상이 아닌,
        <br />테미나이조 팀이 자체 제작한 비공식 홍보 콘텐츠입니다.
      </div>

    </div>
  );
}
