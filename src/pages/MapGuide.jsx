import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapImg from "../assets/mapguide.png";
import backImg from "../assets/back.png";

export default function GuideMap() {
  const navigate = useNavigate();

  const [showCenterMessage, setShowCenterMessage] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [startMessage, setStartMessage] = useState("");
  const [EndMessage, setEndMessage] = useState("");

  // 3초 뒤 중앙 안내문 자동으로 사라지게
  useEffect(() => {
    if (!showCenterMessage) return;
    const timer = setTimeout(() => setShowCenterMessage(false), 3000);
    return () => clearTimeout(timer);
  }, [showCenterMessage]);

  // "안내를 시작합니다" 메세지도 3초 후 자동으로 사라지게
  useEffect(() => {
    if (!startMessage) return;
    const timer = setTimeout(() => setStartMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [startMessage]);

  // "안내를 종료합니다" 메세지 3초 후 자동으로 사라지게
  useEffect(() => {
    if (!EndMessage) return;
    const timer = setTimeout(() => setEndMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [EndMessage]);

  const goHome = () => {
    navigate("/"); // 홈으로 이동
  };

  const startNavigation = (boothId) => {
    console.log("Start navigation to:", boothId);
    // 여기에서 temi 로봇 길안내 API 호출
  };


  const handleBoothClick = (booth) => {
    setSelectedBooth(booth);
    setIsConfirmOpen(true);
    speak(`${booth.name} 부스로 이동하겠습니까?`);
  };

  const handleConfirmYes = () => {
    if (!selectedBooth) return;
    setIsConfirmOpen(false);

    const msg = `${selectedBooth.name} 부스로 안내를 시작합니다.`;
    setStartMessage(msg);
    speak(msg);  // 안내 시작 음성
    startNavigation(selectedBooth.id);
  };

  const handleConfirmNo = () => {
    setIsConfirmOpen(false);
    setSelectedBooth(null);
  };

  const handleArrived = () => {
    const msg = "목적지에 도착하였습니다. 안내를 종료합니다."
    setEndMessage(msg);
    speak(msg);
  };

  // 글자를 소리로 읽어주는 함수
  function speak(text) {
  try {
    // 🔵 Temi Android 환경 (브릿지 호출)
    if (window.TemiInterface && window.TemiInterface.speak) {
      window.TemiInterface.speak(text);
      console.log("🔵 Temi에게 speak 요청:", text);
      return; // Temi 환경이면 여기서 종료
    }
  } catch (err) {
    console.error("❌ Temi 브릿지 오류:", err);
  }

  // ⚪ 웹 환경 Text-to-Speech fallback
  if (!window.speechSynthesis) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 1.1;
  utter.pitch = 1.2;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);

  console.log("🖥️ Web TTS 실행:", text);
}

  // 중앙 안내문이 켜졌을 때 음성 안내
  useEffect(() => {
    if (showCenterMessage) {
      speak("이동할 부스를 선택해주세요.");
    }
  }, [showCenterMessage]);


  // 지도 위 투명 박스들
  const booths = [
    {
      id: "rest area",
      name: "휴게 공간",
      style: { top: "4%", left: "7.5%", width: "19%", height: "3%" },
    },
    {
      id: "rest area",
      name: "휴게 공간",
      style: { top: "3%", left: "55.5%", width: "30%", height: "4%" },
    },
    {
      id: "public Relations Center",
      name: "부산시 홍보관",
      style: { top: "25%", left: "38%", width: "8%", height: "5%" },
    },
    {
      id: "immersive media",
      name: "실감 미디어",
      style: { top: "10%", left: "7.5%", width: "19%", height: "14%" },
    },
    {
      id: "data security",
      name: "데이터 보안",
      style: { top: "9%", left: "55.5%", width: "18%", height: "15%" },
    },
    {
      id: "future car",
      name: "미래 자동차",
      style: { top: "9%", left: "73%", width: "18%", height: "15%" },
    },
    {
      id: "secondary battery",
      name: "이차전지",
      style: { top: "29%", left: "7.5%", width: "14%", height: "21%" },
    },
    {
      id: "bio health",
      name: "바이오 헬스",
      style: { top: "29%", left: "22%", width: "13%", height: "21%" },
    },
    {
      id: "intelligent robot",
      name: "지능형 로봇",
      style: { top: "29%", left: "46%", width: "14%", height: "21%" },
    },
    {
      id: "new energy business",
      name: "에너지 신사업",
      style: { top: "29%", left: "60%", width: "14%", height: "21%" },
    },
    {
      id: "eco-up",
      name: "에코업",
      style: { top: "29%", left: "78%", width: "14%", height: "21%" },
    },
    {
      id: "big-data",
      name: "빅데이터",
      style: { top: "50%", left: "7.5%", width: "14%", height: "21%" },
    },
    {
      id: "next generation display",
      name: "차세대 디스플레이",
      style: { top: "50%", left: "22%", width: "13%", height: "21%" },
    },
    {
      id: "ai",
      name: "인공지능",
      style: { top: "50%", left: "46%", width: "14%", height: "21%" },
    },
    {
      id: "next generation communications",
      name: "차세대 통신",
      style: { top: "50%", left: "60%", width: "14%", height: "21%" },
    },
    {
      id: "advanced materials",
      name: "첨단소재",
      style: { top: "50%", left: "78%", width: "14%", height: "21%" },
    },
    {
      id: "coss sphere",
      name: "coss 스피어",
      style: { top: "65%", left: "32%", width: "15%", height: "17%" },
    },
    {
      id: "next generation semiconductor",
      name: "차세대 반도체",
      style: { top: "76%", left: "7.5%", width: "14%", height: "21%" },
    },
    {
      id: "green bio",
      name: "그린 바이오",
      style: { top: "76%", left: "22%", width: "13%", height: "21%" },
    },
    {
      id: "internet of things",
      name: "사물 인터넷",
      style: { top: "76%", left: "46%", width: "14%", height: "21%" },
    },
    {
      id: "semiconductor department manager",
      name: "반도체 소부장",
      style: { top: "76%", left: "60%", width: "14%", height: "21%" },
    },
    {
      id: "aviation drone",
      name: "항공드론",
      style: { top: "76%", left: "78%", width: "14%", height: "21%" },
    },
  ];

  return (
    <div className="w-screen h-screen flex flex-col bg-white">
      {/* 1. 맨 위 길 안내 바 */}
      <div className="w-full h-14 flex items-center justify-center">
        <h1 className="text-2xl font-extrabold text-[#02A4D3]">길 안내</h1>
      </div>

      {/* 2. 홈 버튼 – 화면 기준 고정 */}
      <div
        onClick={goHome}
        className="flex flex-col items-center cursor-pointer select-none"
        style={{
          position: "fixed",
          top: "15%",
          left: "15%",
          zIndex: 30,
        }}
      >
        <span className="text-[30px] font-semibold text-black mb-1">홈</span>
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

      {/* 3. 지도 영역 */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="relative mx-auto"
          style={{
            width: "90vw",
            maxWidth: "800px",
            aspectRatio: "1700 / 1300", // mapguide.png 비율
          }}
        >
          <img
            src={mapImg}
            alt="부스 지도"
            className="w-full h-full object-contain"
          />

          {/* 중앙 안내 문구 */}
          {showCenterMessage && (
            <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",    // 흰 배경
              borderRadius: 24,              // 둥근 모서리
              padding: "20px 32px",
              minWidth: 260,
              maxWidth: "80%",
              textAlign: "center",
              border: "none",                // 테두리 없음
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)", // 살짝 그림자(명암 오버레이는 없음)
            }}
          >
            <p
              style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#111111",            // 진한 글씨색
            }}
          >
            이동할 부스를 선택해주세요!
          </p>
        </div>
      )}

          {/* 부스 클릭 박스들 */}
          {booths.map((booth) => (
            <button
              key={booth.id}
              onClick={() => handleBoothClick(booth)}
              className="absolute bg-transparent cursor-pointer"
              style={{
                ...booth.style,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
              }}
            />
          ))}
        </div>
      </div>

      {/*  이동 확인 모달  */}
      {isConfirmOpen && selectedBooth && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "24px 32px",
              textAlign: "center",
              minWidth: 260,
              maxWidth: "80vw",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          >
            <p
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 24,
              }}
            >
              {selectedBooth.name} 부스로 이동하겠습니까?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <button
                onClick={handleConfirmYes}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#02A4D3",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                예
              </button>
              <button
                onClick={handleConfirmNo}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#e5e5e5",
                  color: "#333",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "안내를 시작합니다" */}
      {startMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            zIndex: 40, // 확인 모달보다 살짝 낮게
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "20px 28px",
              textAlign: "center",
              minWidth: 260,
              maxWidth: "80vw",
              border: "2px solid #02A4D3",
              boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#02A4D3",
              }}
            >
              {startMessage}
            </p>
          </div>
        </div>
      )}

      {/* 목적지 도착 안내문 */}
      {EndMessage && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: "20px 32px",
            minWidth: 260,
            maxWidth: "80%",
            textAlign: "center",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          }}
        >
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#111111",
            }}
          >
            {EndMessage}
          </p>
        </div>
      )}
    </div>
  );
}

