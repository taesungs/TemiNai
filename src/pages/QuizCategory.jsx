import React from "react";
import { useNavigate } from "react-router-dom";
import coShowImg from "../assets/coshow.png";
import busanImg from "../assets/busan.png";
import commonImg from "../assets/ox_select.png";
import backImg from "../assets/back.png"; // 홈 버튼 화살표 이미지

export default function QuizCategory() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">
      
{/* ⭐ 상단바: 제목 중앙 정렬 */}
<div className="w-full flex justify-center mt-[20px] mb-[40px]">

  {/* 홈 버튼 (absolute) */}
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

  {/* 제목 */}
  <h1 className="text-[45px] font-extrabold text-[#0D98BA] text-center">
    카테고리 선택
  </h1>
</div>


      {/* ⭐ 카드 영역 */}
      <div className="flex flex-row justify-center items-start gap-[60px] mt-[10px]">
        
        {/* 행사 */}
        <div
          onClick={() =>
            navigate("/quiz/play", { state: { category: "coshow" } })
          }
          className="cursor-pointer w-[260px] h-[420px] bg-white border-6 border-[#0D98BA]
          rounded-[30px] flex flex-col items-center justify-start shadow-lg"
        >
          <h2 className="text-[28px] font-extrabold text-black mt-8 mb-3">행사</h2>
          <p className="text-[16px] text-gray-600 mb-4 text-center px-4">
            CO-SHOW 관련 퀴즈를 풀어보세요!
          </p>
          <img
            src={coShowImg}
            alt="CO-SHOW"
            className="w-[180px] h-[220px] object-cover rounded-[16px]"
          />
        </div>

        {/* 부산 */}
        <div
          onClick={() =>
            navigate("/quiz/play", { state: { category: "busan" } })
          }
          className="cursor-pointer w-[260px] h-[420px] bg-white border-6 border-[#0D98BA]
          rounded-[30px] flex flex-col items-center justify-start shadow-lg"
        >
          <h2 className="text-[28px] font-extrabold text-black mt-8 mb-3">부산</h2>
          <p className="text-[16px] text-gray-600 mb-4 text-center px-4">
            부산의 명소, 문화에 대해 풀어보세요!
          </p>
          <img
            src={busanImg}
            alt="부산"
            className="w-[180px] h-[240px] object-contain rounded-[16px]"
          />
        </div>

        {/* 일반 상식 */}
        <div
          onClick={() =>
            navigate("/quiz/play", { state: { category: "common" } })
          }
          className="cursor-pointer w-[260px] h-[420px] bg-white border-6 border-[#0D98BA]
          rounded-[30px] flex flex-col items-center justify-start shadow-lg"
        >
          <h2 className="text-[28px] font-extrabold text-black mt-8 mb-3">
            일반 상식
          </h2>
          <p className="text-[16px] text-gray-600 mb-4 text-center px-4">
            재미있는 상식 퀴즈로 도전해보세요!
          </p>
          <img
            src={commonImg}
            alt="일반 상식"
            className="w-[190px] h-[240px] object-contain rounded-[16px]"
          />
        </div>
      </div>
    </div>
  );
}
