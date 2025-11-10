import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { BsHandIndex } from "react-icons/bs";
import backImg from "../assets/back.png";
import { useNavigate } from "react-router-dom";

const Recommendation = () => {
  const [tab, setTab] = useState("맛집");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const restaurantList = [
    {
      id: 1,
      name: "00점",
      menu: "고기",
      rating: 3.5,
      address: "서울특별시 강북구 00로 12",
      time: "10:00 ~ 22:00",
      phone: "02-123-4567",
      desc: "가성비 좋은 고깃집으로 지역 주민들에게 인기 있는 곳입니다.",
    },
    {
      id: 2,
      name: "00점",
      menu: "국밥",
      rating: 4.0,
      address: "서울특별시 강북구 00길 21",
      time: "09:00 ~ 21:00",
      phone: "02-987-6543",
      desc: "진한 국물 맛으로 유명한 전통 국밥집입니다.",
    },
  ];

  const attractionList = [
    {
      id: 3,
      name: "00관광지",
      menu: "전망대",
      rating: 4.3,
      address: "서울특별시 중구 00로 11",
      time: "09:00 ~ 19:00",
      phone: "02-555-8888",
      desc: "도심 속에서 서울을 한눈에 볼 수 있는 대표 명소입니다.",
    },
  ];

  const list = tab === "맛집" ? restaurantList : attractionList;

  const handleSelect = (item) => {
    setSelected(selected?.id === item.id ? null : item);
  };

  return (
    <div
      style={{
        fontFamily: "Pretendard, sans-serif",
        color: "#1A1A1A",
        minHeight: "100vh",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 🔹 홈 버튼 (왼쪽 상단 고정, 화살표 2개) */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-[100px] left-[200px] flex flex-col items-center cursor-pointer"
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
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          color: "#2EA3B7",
          margin: "40px 0 50px",
        }}
      >
        맛집 & 관광지 추천
      </h1>

      {/* 탭 버튼 */}
      <div
        style={{
          width: "100%", // 목록과 같은 폭 안에서 왼쪽 정렬
          display: "flex",
          justifyContent: "flex-start", // 왼쪽 정렬
          gap: "0px", // 버튼 사이 간격 제거
          marginBottom: "0",
          marginTop: "50px",
        }}
      >
        {["맛집", "관광지"].map((label, idx) => (
          <button
            key={label}
            onClick={() => {
              setTab(label);
              setSelected(null);
            }}
            style={{
              fontSize: "22px",
              fontWeight: "700",
              padding: "18px 60px",
              borderRadius:
                idx === 0
                  ? "30px 0 0 0" // 왼쪽 버튼 둥글게
                  : "0 30px 0 0", // 오른쪽 버튼 둥글게
              border: `3px solid #2EA3B7`,
              borderLeft: idx === 0 ? "3px solid #2EA3B7" : "none", // 사이 경계선 없애기
              backgroundColor: tab === label ? "#2EA3B7" : "white",
              color: tab === label ? "white" : "#2EA3B7",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      {!selected ? (
        <div
          style={{
            width: "250%",
            borderTop: "3px solid #2EA3B7",
          }}
        >
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                alignItems: "center",
                padding: "30px 0",
                borderBottom: "3px solid #2EA3B7",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f9ff")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "20px",
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >
                {item.menu}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "40px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "18px",
                    color: "#555",
                  }}
                >
                  <FaStar
                    style={{
                      color: "#FFD700",
                      fontSize: "26px",
                      marginTop: "2px",
                    }}
                  />
                  <span>{item.rating.toFixed(1)} / 5</span>
                </div>
                <BsHandIndex style={{ fontSize: "32px", color: "#333" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            border: "3px solid #2EA3B7",
            borderRadius: "20px",
            padding: "35px 40px",
          }}
        >
          <div
            onClick={() => handleSelect(selected)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "3px solid #2EA3B7",
              paddingBottom: "15px",
              marginBottom: "20px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "600" }}>
              {selected.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "25px",
                fontSize: "18px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FaStar style={{ color: "#FFD700", fontSize: "26px" }} />
                <span>{selected.rating} / 5</span>
              </div>
              <BsHandIndex style={{ fontSize: "30px" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "30px" }}>
            <div
              style={{
                flex: "1",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "240px",
                  height: "240px",
                  margin: "0 auto",
                  backgroundColor: "#d3d3d3",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  color: "#555",
                }}
              >
                가게 사진
              </div>
              <div style={{ marginTop: "10px", fontWeight: "600" }}>
                {selected.name}
              </div>
            </div>

            <div
              style={{
                flex: "2",
                fontSize: "24px",
                color: "#333",
                lineHeight: "1.8",
              }}
            >
              <div
                style={{ borderBottom: "2px solid #2EA3B7", padding: "10px 0" }}
              >
                <b>주소</b> {selected.address}
              </div>
              <div
                style={{ borderBottom: "2px solid #2EA3B7", padding: "10px 0" }}
              >
                <b>영업시간</b> {selected.time}
              </div>
              <div
                style={{ borderBottom: "2px solid #2EA3B7", padding: "10px 0" }}
              >
                <b>전화번호</b> {selected.phone}
              </div>
              <div style={{ color: "#888", marginTop: "8px" }}>
                {selected.desc || "가게 설명"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendation;
