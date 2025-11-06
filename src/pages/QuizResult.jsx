import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import robotBlueImg from "../assets/robot_blue.png";
import backImg from "../assets/back.png"; // ← 홈 화살표 이미지 추가

export default function QuizResult() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const score = state?.score || 0;
  const total = state?.total || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative">

        {/* 🔹 홈 버튼 (왼쪽 상단 고정, 화살표 2개) */}
        <div
          onClick={() => navigate("/")}
          className="absolute top-[120px] left-[-80px] flex flex-col items-center cursor-pointer"
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

      {/* 결과 박스 */}
      <div
        className="bg-[#0D98BA] rounded-[40px] shadow-2xl flex flex-row items-center justify-center gap-[100px] px-20 py-12"
        style={{
          width: "900px",
          height: "400px",
          color: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {/* 왼쪽 텍스트 영역 */}
        <div className="flex flex-col justify-center items-start text-left">
          <p className="text-[40px] font-extrabold mb-[0px]">퀴즈 완료!!</p>
          <p className="text-[26px] font-extrabold mt-[0px] mb-[6px]">
            열심히 참여해주셔서 정말 고마워요
          </p>

          <p className="text-[26px] font-semibold">
            당신은 총{" "}
            <span className="font-bold text-white">{total}</span>문제 중{" "}
            <span className="font-bold text-white">{score}</span>문제를 맞혔습니다!
          </p>
          <p className="text-[30px] font-semibold">제가 간식을 준비했어요!! 🍪</p>
        </div>

        {/* 오른쪽 로봇 이미지 */}
        <div className="flex items-center justify-center">
          <img
            src={robotBlueImg}
            alt="robot"
            className="w-[200px] h-[200px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
