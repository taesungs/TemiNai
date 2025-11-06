import React from "react";
import { useNavigate } from "react-router-dom";
import coShowImg from "../assets/coshow.png";
import busanImg from "../assets/busan.png";
import commonImg from "../assets/ox_select.png";

export default function QuizCategory() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden ">
      {/* 제목 */}
      <h1 className="text-[60px] font-extrabold text-[#0D98BA] mb-16 drop-shadow-sm">
        카테고리 선택
      </h1>

      {/* 카드 영역 */}
      <div className="flex flex-row justify-center items-start gap-[100px] mt-[20px]">
        {/* 행사 */}
        <div
          onClick={() => navigate("/quiz/play", { state: { category: "coshow" } })}
          className="cursor-pointer w-[350px] h-[560px] bg-white border-6 border-[#0D98BA] 
          rounded-[40px] flex flex-col items-center justify-start shadow-lg"
        >
          <h2 className="text-[36px] font-extrabold text-black mt-10 mb-4">행사</h2>
          <p className="text-[18px] text-gray-600 mb-6 text-center px-6">
            CO-SHOW 관련 퀴즈를 풀어보세요!
          </p>
          <img
            src={coShowImg}
            alt="CO-SHOW"
            className="w-[260px] h-[340px] object-cover rounded-[20px]"
          />
        </div>

        {/* 부산 */}
        <div
          onClick={() => navigate("/quiz/play", { state: { category: "busan" } })}
          className="cursor-pointer w-[350px] h-[560px] bg-white border-6 border-[#0D98BA] 
          rounded-[40px] flex flex-col items-center justify-start shadow-lg"
        >
          <h2 className="text-[36px] font-extrabold text-black mt-10 mb-4">부산</h2>
          <p className="text-[18px] text-gray-600 mb-6 text-center px-6">
            부산의 명소와 문화에 대해 풀어보세요!
          </p>
          <img
            src={busanImg}
            alt="부산"
            className="w-[260px] h-[340px] object-contain rounded-[20px]"
          />
        </div>

        {/* 일반 상식 */}
        <div
          onClick={() => navigate("/quiz/play", { state: { category: "common" } })}
          className="cursor-pointer w-[350px] h-[560px] bg-white border-6 border-[#0D98BA] 
          rounded-[40px] flex flex-col items-center justify-start shadow-lg"
        >
          <h2 className="text-[36px] font-extrabold text-black mt-10 mb-4">일반 상식</h2>
          <p className="text-[18px] text-gray-600 mb-6 text-center px-6">
            재미있는 상식 퀴즈로 도전해보세요!
          </p>
          <img
            src={commonImg}
            alt="일반 상식"
            className="w-[260px] h-[340px] object-contain rounded-[20px]"
          />
        </div>
      </div>
    </div>
  );
}
