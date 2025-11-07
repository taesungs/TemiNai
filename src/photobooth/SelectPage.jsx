import React from "react";
import { useNavigate } from "react-router-dom";
import "./SelectPage.css";

const SelectPage = () => {
  const navigate = useNavigate();

  const themes = [
    {
      id: "basic",
      title: "[기본]",
      desc: "깔끔한 프레임으로 담아보세요!",
      color: "basic",
    },
    {
      id: "busan",
      title: "[부산]",
      desc: "부산의 대표 관광지를 담았어요!",
      color: "busan",
    },
    {
      id: "coshow",
      title: "[CO-SHOW]",
      desc: "박람회 분위기를 담아보세요!",
      color: "coshow",
    },
    {
      id: "robot",
      title: "[로봇]",
      desc: "우리의 안내 로봇 테미를 담아보세요!",
      color: "robot",
    },
  ];

  const handleSelect = (themeId) => {
    navigate(`/booth?theme=${themeId}`);
  };

  return (
    <div className="select-container">
      {/* 제목 */}
      <h1 className="select-title">테마 선택</h1>
      <p className="select-sub">마음에 드는 테마를 선택해주세요!</p>

      {/* 카드 그리드 */}
      <div className="theme-grid">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`theme-card ${theme.color}`}
            onClick={() => handleSelect(theme.id)}
          >
            <p className="theme-title">{theme.title}</p>
            <p className="theme-desc">{theme.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectPage;
