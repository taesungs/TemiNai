import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { BsHandIndex } from "react-icons/bs";
import backImg from "../assets/back.png";
import { useNavigate } from "react-router-dom";
import one from "../assets/recommand/1.jpeg";
import two from "../assets/recommand/2.jpeg";
import three from "../assets/recommand/3.jpeg";
import four from "../assets/recommand/4.jpeg";
import five from "../assets/recommand/5.jpeg";
import six from "../assets/recommand/6.jpeg";
import seven from "../assets/recommand/7.jpeg";
import eight from "../assets/recommand/8.jpeg";
import nine from "../assets/recommand/9.jpeg";
import ten from "../assets/recommand/10.jpeg";
import eleven from "../assets/recommand/11.jpeg";
import twelve from "../assets/recommand/12.jpeg";
import thirteen from "../assets/recommand/13.jpeg";
import fourteen from "../assets/recommand/14.jpeg";
import fifteen from "../assets/recommand/15.jpeg";
import sixteen from "../assets/recommand/16.jpeg";
import seventeen from "../assets/recommand/17.jpeg";
import eighteen from "../assets/recommand/18.jpeg";
import ninteen from "../assets/recommand/19.jpeg";
import twenty from "../assets/recommand/20.jpeg";

const Recommendation = () => {
  const [tab, setTab] = useState("맛집");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const restaurantList = [
    {
      id: 1,
      name: "대게만찬",
      menu: "대게요리",
      rating: 4.0,
      address: "부산 기장군 기장읍 기장해안로 266 더이스트인부산 3층",
      time: "11:00 ~ 21:40",
      phone: "0507-1438-3638",
      desc: "가성비 좋은 고깃집으로 지역 주민들에게 인기 있는 곳입니다.",
      image: one,
    },
    {
      id: 2,
      name: "금수복국 해운대본점",
      menu: "복어요리",
      rating: 4.2,
      address: "부산 해운대구 중동1로43번길 23",
      time: "24시간 영업",
      phone: "0507-1334-3600",
      desc: "부산 해운대에서 복지리로 해장 + 식사하기 좋은 50년 전통 명소입니다.",
      image: two,
    },
    {
      id: 3,
      name: "해운대암소갈비집",
      menu: "한우갈비",
      rating: 3.9,
      address: "부산 해운대구 해운대해변로 333 해운대암소갈비집",
      time: "11:30 ~ 22:00",
      phone: "051-746-3333",
      desc: "해운대 바다 인근에서 한우 생갈비·양념갈비 제대로 즐기는 터줏대감 느낌을 주는 곳입니다.",
      image: three,
    },
    {
      id: 4,
      name: "쌍둥이돼지국밥 본점",
      menu: "돼지국밥",
      rating: 3.9,
      address: "부산 남구 유엔평화로 35-1",
      time: "09:00 ~ 22:00",
      phone: "051-628-7021",
      desc: "내장국밥·돼지국밥 중심으로 지역 주민에게 인기 있는 국밥집입니다.",
      image: four,
    },
    {
      id: 5,
      name: "백화양곱창",
      menu: "양곱창",
      rating: 4.0,
      address: "부산 중구 자갈치로23번길 6 1층",
      time: "12:00 ~ 24:00",
      phone: "051-245-0105",
      desc: "곱창 팬이라면 놓치기 아쉬운 부산 중구 양곱창 맛집입니다.",
      image: five,
    },
    {
      id: 6,
      name: "원조개금밀면",
      menu: "밀면",
      rating: 3.8,
      address: "부산 부산진구 가야공원로14번길 88-8 원조개금밀면",
      time: "11:00 ~ 20:00",
      phone: "-",
      desc: "부산식 밀면의 대표격, 빠른 식사나 간식으로도 추천합니다.",
      image: six,
    },
    {
      id: 7,
      name: "할매재첩국집",
      menu: "재첩국",
      rating: 4.2,
      address: "부산 사상구 낙동대로1530번길 20-15 할매재첩국",
      time: "10:00 ~ 22:00",
      phone: "051-301-7069",
      desc: "남천/광안리 인근에서 바다향 나는 재첩국으로 몸보신하기 좋은 집입니다.",
      image: seven,
    },
    {
      id: 8,
      name: "가마솥생복집",
      menu: "복어요리",
      rating: 4.2,
      address: "부산 기장군 기장읍 차성로 327-2",
      time: "09:00 ~ 21:00(매주 월요일 휴무)",
      phone: "051-722-2995",
      desc: "부산 기장·정관 쪽에서 복요리 전문으로 알려진 숨은 맛집입니다.",
      image: eight,
    },
    {
      id: 9,
      name: "마산곱창",
      menu: "곱창",
      rating: 4.1,
      address: "부산 부산진구 신천대로 290",
      time: "17:00 ~ 24:00(매주 일요일 휴무)",
      phone: "02-123-4567",
      desc: "서면 인근에서 늦은 밤까지 곱창·볶음밥으로 마무리하기 좋은 곳입니다.",
      image: nine,
    },
    {
      id: 10,
      name: "내호냉면",
      menu: "냉면",
      rating: 3.9,
      address: "부산 남구 우암번영로26번길 17",
      time: "10:30 ~ 19:00",
      phone: "0507-1333-6195",
      desc: "남구 우암번영로에서 물밀면·양념가오리회와 함께 가볍게 즐길 수 있는 냉면집입니다.",
      image: ten,
    },
  ];

  const attractionList = [
    {
      id: 11,
      name: "롯데월드 어드벤처 부산",
      menu: "테마파크",
      rating: 4.1,
      address: "부산 기장군 기장읍 동부산관광로 42",
      time: "10:00 ~ 21:00",
      phone: "1661-2000",
      desc: "가족, 연인, 친구와 함께 소중한 추억을 만들 수 있는 대규모 테마파크입니다.",
      image: eleven,
    },
    {
      id: 12,
      name: "해운대해수욕장",
      menu: "해변",
      rating: 4.6,
      address: "부산 해운대구 우동",
      time: "-",
      phone: "051-749-5700",
      desc: "부산을 대표하는 해변, 모래사장과 스카이라인이 매력적인 장소입니다.",
      image: twelve,
    },
    {
      id: 13,
      name: "감천문화마을",
      menu: "문화마을",
      rating: 4.4,
      address: "부산 사하구 감내2로 203 감천문화마을안내센터",
      time: "-",
      phone: "051-204-1444",
      desc: "색채가 화려한 골목길과 예술작품이 어우러진 ‘부산의 산토리니’라 불리는 마을입니다.",
      image: thirteen,
    },
    {
      id: 14,
      name: "광안리해수욕장",
      menu: "해변",
      rating: 4.7,
      address: "부산 수영구 광안해변로 219",
      time: "10:00 ~ 22:00",
      phone: "051-622-4251",
      desc: "광안대교 야경과 해변 분위기가 조화를 이루는 인기 해변입니다.",
      image: fourteen,
    },
    {
      id: 15,
      name: "해동용궁사",
      menu: "사찰",
      rating: 4.4,
      address: "부산 기장군 기장읍 용궁길 86 해동용궁사",
      time: "04:30 ~ 19:20",
      phone: "051-722-7744",
      desc: "바다 절벽 위에 위치해 파도 소리와 함께 느낄 수 있는 사찰입니다.",
      image: fifteen,
    },
    {
      id: 16,
      name: "부산타워",
      menu: "전망대",
      rating: 4.2,
      address: "부산 중구 용두산길 37-30",
      time: "10:00 ~ 22:00",
      phone: "051-601-1800",
      desc: "부산 시내와 바다 전망을 한눈에 볼 수 있는 대표 전망대입니다.",
      image: sixteen,
    },
    {
      id: 17,
      name: "씨라이프 부산 아쿠아리움",
      menu: "아쿠아리움",
      rating: 4.2,
      address: "부산 해운대구 해운대해변로 266",
      time: "10:00 ~ 19:00(주말엔 20:00까지)",
      phone: "051-740-1700",
      desc: "해운대 해변 근처에 위치한 바닷속 생물 체험 가능한 실내 시설입니다.",
      image: seventeen,
    },
    {
      id: 18,
      name: "태종대공원",
      menu: "자연공원",
      rating: 4.4,
      address: "부산 영도구 전망로 120",
      time: "-",
      phone: "-",
      desc: "부산 영도 끝자락 절벽과 숲길이 어우러진 자연 명소입니다.",
      image: eighteen,
    },
    {
      id: 19,
      name: "비프광장",
      menu: "거리문화",
      rating: 4.0,
      address: "부산 중구 구덕로 44",
      time: "-",
      phone: "051-253-8523",
      desc: "부산 영화제 거리로 유명하고 다양한 길거리 음식과 분위기가 있는 장소입니다.",
      image: ninteen,
    },
    {
      id: 20,
      name: "평화공원",
      menu: "근린공원",
      rating: 4.3,
      address: "부산 남구 대연동 707",
      time: "-",
      phone: "051-607-6362",
      desc: "가성비 좋은 고깃집으로 지역 주민들에게 인기 있는 곳입니다.",
      image: twenty,
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
          fontSize: "60px",
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
          justifyContent: "center", // 왼쪽 정렬
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
            width: "120%",
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
                  borderRadius: "16px",
                  overflow: "hidden", // 둥근 모서리에 맞게 이미지 잘림 방지
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt={selected.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // 이미지 꽉 차게
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: "600", color: "#555" }}>
                    가게 사진
                  </span>
                )}
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
