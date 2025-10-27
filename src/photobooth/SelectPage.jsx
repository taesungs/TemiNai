import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const SelectPage = () => {
  const navigate = useNavigate();

  const themes = [
    {
      id: "basic",
      title: "[기본]",
      desc: "깔끔한 프레임으로 담아보세요!",
      color: "border-black text-black hover:bg-black hover:text-white",
    },
    {
      id: "busan",
      title: "[부산]",
      desc: "해운대와 광안대교를 담았어요!",
      color: "border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white",
    },
    {
      id: "coshow",
      title: "[CO-SHOW]",
      desc: "박람회 분위기를 담아보세요!",
      color: "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
    },
    {
      id: "robot",
      title: "[로봇]",
      desc: "우리의 안내 로봇 테마를 담아보세요!",
      color: "border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white",
    },
  ];

  const handleSelect = (themeId) => {
    navigate(`/booth?theme=${themeId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-[Pretendard] px-6 relative">
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-sky-600 mb-3 mt-16">테마 선택</h1>
      <p className="text-gray-700 mb-8 text-center">
        마음에 드는 테마를 선택해주세요!
      </p>

      {/* 테마 카드 */}
      <div className="grid grid-cols-2 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className={`cursor-pointer border-4 rounded-2xl w-44 h-40 flex flex-col items-center justify-center text-center space-y-2 transition-all duration-200 ${theme.color}`}
          >
            <p className="font-bold text-lg">{theme.title}</p>
            <p className="text-sm">{theme.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectPage;
