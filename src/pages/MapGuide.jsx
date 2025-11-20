import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapImg from "../assets/mapguide.png";
import backImg from "../assets/back.png";
import { booths } from "../data/Booths";

export default function GuideMap() {
  const navigate = useNavigate();

  const [showCenterMessage, setShowCenterMessage] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showIntro, setShowIntro] = useState(false); // 1단계 부스 설명 팝업
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // 2단계 이동 팝업
  const [startMessage, setStartMessage] = useState("");
  const [EndMessage, setEndMessage] = useState("");

  // 3초 뒤 중앙 안내문 자동으로 사라지게
  useEffect(() => {
    if (!showCenterMessage) return;
    const timer = setTimeout(() => setShowCenterMessage(false), 3000);
    return () => clearTimeout(timer);
  }, [showCenterMessage]);

    // 중앙 안내문이 켜졌을 때 음성 안내
  useEffect(() => {
    if (showCenterMessage) {
      speak("이동할 부스를 선택해주세요.");
    }
  }, [showCenterMessage]);

  const handleBoothClick = (booth) => {
    setSelectedBooth(booth);
    if (booth.description) {
      setShowIntro(true); // 음성 없음
    } else {
      setIsConfirmOpen(true);
    }
  };

  // 1단계 부스 소개 3초 후 + 2단계 이동 확인 팝업 3초 후 자동으로 사라지게
  useEffect(() => {
    if (!showIntro || !selectedBooth?.description) return;

    const timer = setTimeout(() => {
      setShowIntro(false); // 1단계 닫기
      setIsConfirmOpen(true); // 2단께 이동 팝업 열기

    }, 3000);
    return () => clearTimeout(timer);
  }, [showIntro, selectedBooth]);

  // 2단계 이동 확인 팝업이 열릴 때만 음성 안내
  useEffect(() => {
    if (isConfirmOpen && selectedBooth) {
      speak(`${selectedBooth.name} 부스로 이동하겠습니까?`);
    }
  }, [isConfirmOpen, selectedBooth]);

  const handleConfirmYes = () => {
    if (!selectedBooth) return;
    setIsConfirmOpen(false);

    const msg = `${selectedBooth.name} 부스로 안내를 시작합니다.`;
    setStartMessage(msg);
    speak(msg);  // 안내 시작 음성
    startNavigation(selectedBooth.id);
  };

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

      {/* 1단계: 부스 소개 팝업 (모든 부스 공통) */}
      {showIntro && selectedBooth?.description && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            zIndex: 45,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: "20px 24px",
              minWidth: 260,
              maxWidth: "80vw",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          >
            {/*첫 줄: "00부스에서는" */}
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: 12,
              }}
            >
              {`${selectedBooth.name} 부스에서는`}
            </p>

            {/* 두 번째 줄: 부스 설명 */}
            <p
              style={{
                fontSize: 17,
                fontWeight: 500,
                lineHeight: 1.45,
                color: "#444",
                marginBottom: 12,
              }}
            >
        {selectedBooth.description}
      </p>

            <p
              style={{
                fontSize: 13,
                color: "#999",
              }}
            >
              3초 뒤 이동 선택 화면으로 넘어갑니다…
            </p>
          </div>
        </div>
      )}


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

