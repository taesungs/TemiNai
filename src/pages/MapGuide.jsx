import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import mapImg from "../assets/mapguide.png";
import backImg from "../assets/back.png";
import { booths } from "../data/Booths";
import { coshowEvents } from "../data/coshowEvents";
import qrRace from "../assets/robotqr/경주로봇 만들기.png";
import qrDog from "../assets/robotqr/dogbot.png";
import qrSpider from "../assets/robotqr/유선 스파이더로봇 만들기.png";
import qrGyro from "../assets/robotqr/자이로 외발주행로봇 만들기.png";
import qrClean from "../assets/robotqr/청소로봇 만들기.png";
import qrHumanoid from "../assets/robotqr/휴머노이드 이론교육 및 미션수행.png";
import qrAi from "../assets/robotqr/aidrawing.png";
import qrRoboShow from "../assets/robotqr/ROBO SHOW.png";

const START_POI_NAME = "intelligent robot"; // 지능형 로봇 부스를 시작점으로 잡음

export default function GuideMap() {
    const navigate = useNavigate();

    const [showCenterMessage, setShowCenterMessage] = useState(true);
    const [selectedBooth, setSelectedBooth] = useState(null);
    const [showIntro, setShowIntro] = useState(false); // 1단계 부스 설명 팝업
    const [isConfirmOpen, setIsConfirmOpen] = useState(false); // 2단계 이동 팝업
    const [startMessage, setStartMessage] = useState("");
    const [isGoHome, setIsGoHome] = useState(false);

    // 도착 이후 흐름용 상태
    const [showArrivedPopup, setShowArrivedPopup] = useState(false); // 목적지 도착
    const [showContinuePopup, setShowContinuePopup] = useState(false); // 테미 사용 여부
    const [showReturningPopup, setShowReturningPopup] = useState(false); // 복귀 창
    const [showQrPopup, setShowQrPopup] = useState(false); // 웨이팅 나우 QR 팝업

    //부스 QR
    const [currentQr, setCurrentQr] = useState(null);

    // 1분 자동 복귀 타이머
    const inactivityTimerRef = useRef(null);

    // 체험 프로그램 목록 - 카테고리별 그룹화
    const [expandedCategories, setExpandedCategories] = useState({});

    // 카테고리별로 이벤트 그룹화
    const groupedEvents = useMemo(() => {
        const groups = {};
        coshowEvents.forEach((event) => {
            const category = event.category || "기타";
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(event);
        });
        return groups;
    }, []);

    // 카테고리 토글
    const toggleCategory = (category) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const qrByTitle = {
    "일반인 로봇 교육 프로그램 1(경주로봇 만들기)": qrRace,
    "로봇아 멍멍해봐 4족보행로봇 훈련": qrDog,
    "일반인 로봇 교육 프로그램4(유선 스파이더로봇 만들기)": qrSpider,
    "자이로 외발주행로봇 만들기": qrGyro,
    "청소로봇 만들기": qrClean,
    "일반인 로봇 교육프로그램5(휴머노이드 이론교육 및 미션수행)": qrHumanoid,
    "AI 드로잉 로봇 및 오목 로봇 체험": qrAi,
    "ROBO SHOW(4족보행 로봇 및 테미 체험)": qrRoboShow,
    };

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

    // 지능형 로봇 부스인지 확인
    const isIntelligentRobotBooth = (booth) => {
      console.log("###### isIntelligentRobotBooth: "+ booth)
        return (      
            booth?.id === "intelligent robot" || booth?.name === "지능형 로봇"
        );
    };

    const handleBoothClick = (booth) => {
        setSelectedBooth(booth);
        if (booth.description) {
            setShowIntro(true); // 음성 없음
        } else {
            setIsConfirmOpen(true);
        }
    };

    // 1단계 부스 소개 3초 후 + 2단계 이동 확인 팝업
    useEffect(() => {
        if (!showIntro || !selectedBooth?.description) return;

        const timer = setTimeout(() => {
            setShowIntro(false); // 1단계 닫기
            setIsConfirmOpen(true); // 2단계 이동 팝업 열기
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
        speak(msg); // 안내 시작 음성
        startNavigation(selectedBooth);
    };

    // "안내를 시작합니다" 메세지 3초 후 자동으로 사라지게
    useEffect(() => {
        if (!startMessage) return;
        const timer = setTimeout(() => setStartMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [startMessage]);

    const goHome = () => {
        navigate("/"); // 홈으로 이동
    };

    const startNavigation = (booth) => {
        console.log("Start navigation to:", booth);

        if (window.TemiInterface && window.TemiInterface.goToBooth) {
            window.TemiInterface.goToBooth(booth.poi);
            console.log("🚀 Navigation started to:", booth.poi);
            // 도착 여부는 onGoToLocationStatusChanged 이벤트로 판독
        }
    };

    const handleConfirmNo = () => {
        setIsConfirmOpen(false);
    };

    // 시작 지점으로 보내는 함수
    const goToStartPoint = () => {
        console.log("🏠 Returning to start point");
        if (window.TemiInterface && window.TemiInterface.goToBooth) {
            window.TemiInterface.goToBooth(START_POI_NAME);
            console.log("🚀 Navigation started to start point:", START_POI_NAME);
        }
    };

    // 목적지 도착 팝업 + 지능형 로봇이면 QR, 아니면 계속 이용 여부
    const handleArrived = () => {
        const msg = "목적지에 도착하였습니다.";
        setShowArrivedPopup(true);
        speak(msg);

        // 2초 후 분기 처리
        setTimeout(() => {
            setShowArrivedPopup(false);
                setShowContinuePopup(true);
                speak("테미를 계속 이용하시겠습니까?");
        }, 4000);

    };

    // QR 팝업 닫기 → 계속 이용 여부 팝업으로
    const handleQrClose = () => {
        setShowQrPopup(false);
        setShowContinuePopup(true);
        speak("테미를 계속 이용하시겠습니까?");
    };

    // 예(계속 이용) 클릭 → 페이지 유지 + 1분 무조작 자동 복귀
    const handleContinueYes = () => {
        setShowContinuePopup(false);
        startInactivityWatchdog();
    };

    // 아니오(이용 종료) 클릭 → 5초 후 시작점 복귀
    const handleContinueNo = () => {
        setShowContinuePopup(false);
        setShowReturningPopup(true);
        speak("안전을 위해 시작 지점으로 복귀합니다.");

        setTimeout(() => {
            setShowReturningPopup(false);
            goToStartPoint();
            clearInactivityWatchdog();
        }, 5000);
    };

    // 1분 무조작 자동 복귀 타이머 시작/초기화 + 1분 후 자동으로 홈 화면으로 이동
    const startInactivityWatchdog = () => {
        clearInactivityWatchdog();

        const id = setTimeout(() => { 
            speak("안전을 위해 시작 지점으로 복귀합니다.");
            goHome(); // 홈 화면으로 이동
            goToStartPoint();
            clearInactivityWatchdog();
        }, 60 * 1000); // 1분

        inactivityTimerRef.current = id;
    };

    const clearInactivityWatchdog = () => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    };

    // 사용자 터치/클릭이 있을 때마다 타이머 리셋 (타이머가 켜져 있을 때만)
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!inactivityTimerRef.current) return; // 활성화된 타이머 없으면 무시
            startInactivityWatchdog();
        };

        window.addEventListener("click", handleUserInteraction);
        window.addEventListener("touchstart", handleUserInteraction);

        return () => {
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("touchstart", handleUserInteraction);
        };
    }, []);

    // Temi 이동 상태 이벤트로 목적지 도착 감지
    useEffect(() => {
        console.log("🔧 Setting up navigation listener...");

        // 🔹 Temi 없는 웹 환경이면 바로 종료
        if (!window.TemiInterface) {
            console.log("ℹ️ TemiInterface 없음(웹 환경) → 리스너 등록 생략");
            return;
        }

        // 리스너 저장소 초기화
        if (!window.TemiInterface._listeners) {
         window.TemiInterface._listeners = {};
        }

        // 리스너 함수 정의
        const listener = (event) => {
            console.log("🚙 Temi 이동 이벤트 수신:", event);

            if (event?.status?.toLowerCase() === "complete") {
                console.log("✅ 목적지 도착!");
                handleArrived();
            }
        };

        // 리스너 저장
        window.TemiInterface._listeners["onGoToLocationStatusChanged"] = listener;

        // Android에 리스너 등록 알림
        if (window.TemiInterface.addListener) {
            window.TemiInterface.addListener("onGoToLocationStatusChanged");
            console.log("✅ Navigation listener registered");
        }

        return () => {
            console.log("🧹 Removing navigation listener...");
            if (window.TemiInterface && window.TemiInterface.removeListener) {
                window.TemiInterface.removeListener("onGoToLocationStatusChanged");
            }
            if (window.TemiInterface && window.TemiInterface._listeners) {
                delete window.TemiInterface._listeners["onGoToLocationStatusChanged"];
            }
        };
    }, []);


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
                <h1 className="text-2xl font-extrabold text-[#02A4D3]">
                    길 안내
                </h1>
            </div>

            {/* 2. 홈 버튼 */}
            <div
                onClick={goHome}
                className="flex flex-col items-center cursor-pointer select-none"
                style={{
                    position: "fixed",
                    top: "5%",
                    left: "5%",
                    zIndex: 30,
                }}
            >
                <span className="text-[30px] font-semibold text-black mb-1">
                    홈
                </span>
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
                        style={{
                            width: 30,
                            height: 25,
                            display: "block",
                            marginLeft: -4,
                        }}
                        draggable="false"
                    />
                </div>
            </div>

            {/* 3. 지도 + 체험 프로그램 목록 */}
            <div className="flex-1 flex items-center justify-center px-6 pb-4 overflow-hidden">
                <div className="flex flex-row gap-4 w-full h-full items-center justify-center">
                    {/* 왼쪽: 지도 영역 */}
                    <div
                        className="relative flex-shrink-0"
                        style={{
                            height: "calc(100vh - 100px)",
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
                                    backgroundColor: "#ffffff",
                                    borderRadius: 24,
                                    padding: "20px 32px",
                                    minWidth: 260,
                                    maxWidth: "80%",
                                    textAlign: "center",
                                    border: "none",
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
                                    이동할 부스를 선택해주세요!
                                </p>
                            </div>
                        )}

                        {/* 부스 클릭 박스들 */}
                        {booths.map((booth) => (
                            <button
                                key={booth.id}
                                onClick={() => handleBoothClick(booth)}
                                className="absolute cursor-pointer transition-all duration-200 hover:bg-blue-200 hover:bg-opacity-40 hover:border-2 hover:border-blue-500"
                                style={{
                                    ...booth.style,
                                    border: "1px solid transparent",
                                    outline: "none",
                                    backgroundColor: "transparent",
                                    borderRadius: "4px",
                                }}
                                title={booth.name}
                            />
                        ))}
                    </div>

                    {/* 오른쪽: 체험 프로그램 목록 */}
                    <aside
                        className="flex-shrink-0 bg-gradient-to-br from-[#f8fafc] to-[#e8f4f8] border-2 border-[#02A4D3]/20 rounded-3xl shadow-lg flex flex-col overflow-hidden"
                        style={{
                            width: 400,
                            height: "calc(100vh - 100px)",
                            marginRight: "30px"
                        }}
                    >
                        {/* 헤더 - 그라디언트 배경 */}
                        <div className="pt-4 pb-3 bg-gradient-to-r from-[#02A4D3] to-[#0284c7] text-white">
                            <div className="px-4">
                                <h2 className="text-xl font-extrabold mb-1 flex items-center gap-2 justify-center">
                                    <span className="text-2xl">🎯</span>
                                    체험 프로그램
                                </h2>
                                <p className="text-[12px] text-white/90 leading-snug text-center">
                                    카테고리를 펼쳐서 부스를 찾거나, 지도에서 직접
                                    눌러보세요
                                </p>
                            </div>
                        </div>

                        {/* 카테고리별 아코디언 목록 */}
                        <div className="flex- overflow-y-auto p-2 space-y-2">
                            {Object.entries(groupedEvents).map(
                                ([category, events]) => {
                                    const isExpanded =
                                        expandedCategories[category];

                                    return (
                                        <div
                                            key={category}
                                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200/80 transition-all duration-200 hover:shadow-md"
                                        >
                                            {/* 카테고리 헤더 */}
                                            {/* 카테고리 헤더 */}
                                            <button
                                                onClick={() =>
                                                    toggleCategory(category)
                                                }
                                                className="
                                                w-full
                                                flex items-center justify-between
                                                bg-gradient-to-r from-white to-gray-50
                                                hover:from-[#02A4D3]/5 hover:to-[#02A4D3]/10
                                                transition-all duration-200
                                                "
                                                style={{
                                                    padding: "18px 20px", // ← 세로·가로 패딩 크게
                                                    minHeight: 64, // ← 최소 높이 64px
                                                    backgroundColor:
                                                        category === "지능형로봇" ? "rgba(0, 170, 255, 0.08)" : "white",
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#02A4D3]/10 flex items-center justify-center">
                                                        <span
                                                            className="text-[15px] font-bold"
                                                            style={{
                                                                color: category === "지능형로봇" ? "#02A4D3" : "#02A4D3",
                                                            }}
                                                        >
                                                            {events.length}
                                                        </span>
                                                    </div>

                                                     <span
                                                        className="text-[16px] font-bold"
                                                        style={{
                                                            color: category === "지능형로봇" ? "#02A4D3" : "#000",
                                                        }}
                                                    >
                                                        {category}
                                                    </span>
                                                </div>

                                                <div
                                                    className="text-[#02A4D3] transition-transform duration-200 text-xl"
                                                    style={{
                                                        transform: isExpanded
                                                            ? "rotate(180deg)"
                                                            : "rotate(0deg)",
                                                            color: category === "지능형 로봇" ? "#02A4D3" : "#02A4D3",
                                                    }}
                                                >
                                                    ▼
                                                </div>
                                            </button>

                                            {/* 카테고리 내 부스 목록 */}
                                            {/* 카테고리 내 부스 목록 */}
                                            {isExpanded && (
                                                <div className="bg-white">
                                                    {events.map((ev, idx) => {
                                                        const qrImg = qrByTitle[ev.title];

                                                        return(
                                                        <div
                                                            key={
                                                                ev.title +
                                                                ev.detailUrl
                                                            }
                                                            className="
          px-4
          border-l-4 border-[#02A4D3]
          hover:bg-[#02A4D3]/5
          transition-all duration-150
          cursor-pointer group
          flex           /* ← 전체 줄을 flex로 */
          items-center   /* ← 세로 가운데 정렬 */
        "
                                                            style={{
                                                                paddingTop: 14,
                                                                paddingBottom: 14, // ← 세로 패딩 크게 (기존보다 확 넓게)
                                                                borderTop:
                                                                    idx === 0
                                                                        ? "1px solid #e5e7eb"
                                                                        : "none",
                                                                borderBottom:
                                                                    "1px solid #f3f4f6",
                                                                minHeight: 72, // ← 한 칸 최소 72px
                                                            }}
                                                        >
                                                            <span className="text-[#02A4D3] mr-2 group-hover:scale-110 transition-transform">
                                                                📍
                                                            </span>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="text-[14px] font-bold text-gray-900 group-hover:text-[#02A4D3] transition-colors">
                                                                    {ev.title}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                                                    <span className="text-gray-400">
                                                                        👥
                                                                    </span>
                                                                    {ev.target
                                                                        .replace(
                                                                            "참여대상 :",
                                                                            ""
                                                                        )
                                                                        .trim()}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                                                    <span className="text-gray-400">
                                                                        ⏱️
                                                                    </span>
                                                                    {ev.duration
                                                                        .replace(
                                                                            "소요시간 :",
                                                                            ""
                                                                        )
                                                                        .trim()}
                                                                </div>
                                                                {ev.category.includes("지능형로봇") && qrByTitle[ev.title] && (
                                                                    <span
                                                                        onClick={() => {
                                                                        setCurrentQr(qrImg);   // 선택한 QR 저장
                                                                        setShowQrPopup(true);  // 팝업 열기
                                                                    }}
                                                                    className="mt-1 inline-flex items-center gap-1 text-[11px] 
                                                                    font-semibold text-[#02A4D3] underline cursor-pointer"
                                                                >
                                                                    📱 NOW WAITING
                                                                </span>
                                                            )}
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {/* 하단 안내 */}
                        <div className="px-4 py-2 bg-white/80 border-t border-gray-200/80">
                            <p className="text-[10px] text-gray-500 text-center">
                                총 {coshowEvents.length}개의 체험 프로그램
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* 1단계: 부스 소개 팝업 */}
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
                        <p
                            style={{
                                fontSize: 18,
                                fontWeight: 800,
                                lineHeight: 1.5,
                                marginBottom: 12,
                                color: "#111111",

                            }}
                        >
                            {`${selectedBooth.name} 부스에서는`}
                        </p>

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

            {/* 이동 확인 모달 */}
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
                        zIndex: 40,
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

            {/* 1단계: 도착 팝업 */}
            {showArrivedPopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        zIndex: 55,
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
                            목적지에 도착하였습니다.
                        </p>
                    </div>
                </div>
            )}

            {/* 2단계: 계속 이용 여부 팝업 */}
            {showContinuePopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        zIndex: 56,
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
                            테미를 계속 이용하시겠습니까?
                        </p>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 16,
                            }}
                        >
                            <button
                                onClick={handleContinueYes}
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
                                onClick={handleContinueNo}
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

            {/* 3단계: "안전을 위해 시작 지점으로 복귀합니다." 팝업 */}
            {showReturningPopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        zIndex: 57,
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
                            안전을 위해 시작 지점으로 복귀합니다.
                        </p>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#666",
                                marginTop: 8,
                            }}
                        >
                            잠시만 기다려 주세요.
                        </p>
                    </div>
                </div>
            )}

            {/* 웨이팅 나우 QR 코드 팝업 (지능형 로봇 전용) */}
{showQrPopup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,             // 화면이 작을 때 여백
    }}
  >
    <div
      style={{
        // 🔵 absolute/transform 없애고 flex 가운데 정렬만 사용
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 32,
        padding: "16px 20px",
        width: "100%",
        maxWidth: "420px",      // 팝업 가로 최대
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
        textAlign: "center",
        boxShadow: "0 30px 60px rgba(102, 126, 234, 0.5)",
        border: "4px solid #FFD700",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          fontSize: 28,
          marginBottom: 8,
        }}
      >
        ⭐ 🤖 ⭐
      </div>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#FFD700",
          marginBottom: 8,
        }}
      >
        지능형 로봇 사업단
      </h2>

      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#FFFFFF",
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        🎫 웨이팅 나우 QR 코드
        <br />
        <span style={{ fontSize: 14, color: "#E0E0E0" }}>
          스캔하면 대기 없이 바로 체험!
        </span>
      </p>

      {/* QR 코드 영역 */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: "20px",
          marginBottom: 16,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        {currentQr ? (
          <img
            src={currentQr}
            alt="QR 코드"
            style={{
              width: 200,
              height: 200,
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              borderRadius: 12,
            }}
            draggable="false"
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              margin: "0 auto",
              backgroundColor: "#F0F0F0",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            ❗
            <br />
            <span style={{ fontSize: 14, color: "#666" }}>QR 없음</span>
          </div>
        )}

        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            fontWeight: 600,
            color: "#667eea",
          }}
        >
          카메라로 스캔해주세요
        </p>
      </div>

      {/* 안내 문구 */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: 16,
          padding: "10px 14px",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: "#FFD700",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          💡 체험 혜택
        </p>
        <ul
          style={{
            fontSize: 12,
            color: "#FFFFFF",
            textAlign: "left",
            lineHeight: 1.8,
            paddingLeft: 18,
            margin: 0,
          }}
        >
          <li>대기 시간 없이 우선 체험</li>
          <li>AI 교육용 로봇 직접 조종</li>
          <li>보행 로봇 체험</li>
        </ul>
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={handleQrClose}
        style={{
          width: "100%",
          padding: "12px 20px",
          borderRadius: 999,
          border: "3px solid #FFD700",
          backgroundColor: "#FFFFFF",
          color: "#667eea",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          transition: "all 0.3s",
          boxShadow: "0 6px 16px rgba(255, 215, 0, 0.4)",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#FFD700";
          e.target.style.color = "#FFFFFF";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "#FFFFFF";
          e.target.style.color = "#667eea";
        }}
      >
        ✅ 확인
      </button>
    </div>
  </div>
)}

        </div>
    );
}
