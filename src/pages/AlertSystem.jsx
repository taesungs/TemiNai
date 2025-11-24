// src/pages/AlertSystem.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backImg from "../assets/back.png";

export default function SecurityMonitor() {
  const navigate = useNavigate();

  // 실시간 모니터링 on/off (UI & 안내용 state)
  const [monitoring, setMonitoring] = useState(false);

  // 마지막 감지 결과
  const [lastResult, setLastResult] = useState(null); // { isAbnormal, label, score, time, camera }

  // 최근 로그
  const [logs, setLogs] = useState([]);

  // 전송된 프레임 수
  const [frameCount, setFrameCount] = useState(0);

  // 버퍼링 상태 (60개 프레임 필요)
  const REQUIRED_FRAMES = 60;

  // 화면 처음 들어올 때 안내
  useEffect(() => {
    speak(
      "실내 이상행동 모니터링 화면입니다. 모니터링 시작 버튼을 누르면, 테미 카메라 영상이 계속 분석됩니다."
    );
  }, []);

  // 모니터링 상태 변경 시 음성 안내 + WebSocket 모니터링 start/stop 호출
  useEffect(() => {
    try {
      if (window.TemiInterface) {
        if (monitoring && window.TemiInterface.startWebSocketMonitoring) {
          console.log("🚀 Starting WebSocket monitoring (100ms interval)...");
          window.TemiInterface.startWebSocketMonitoring();
        } else if (!monitoring && window.TemiInterface.stopWebSocketMonitoring) {
          console.log("🛑 Stopping WebSocket monitoring...");
          window.TemiInterface.stopWebSocketMonitoring();
          setFrameCount(0); // 프레임 카운트 초기화
        }
      }
    } catch (err) {
      console.error("❌ TemiInterface WebSocket monitoring 호출 오류:", err);
    }

    if (monitoring) {
      speak(
        "실시간 모니터링을 시작합니다. 이상행동이 감지되면 알려 드리겠습니다."
      );
    } else {
      speak("모니터링을 중지했습니다.");
    }
  }, [monitoring]);

  // ✅ 네이티브(Android)에서 던지는 콜백 등록
  useEffect(() => {
    // 이상행동 감지 결과 콜백 (서버에서 분석 완료 시)
    function handleAbnormalResult(isAbnormal, label, score) {
      console.log("📥 Android → React: 분석 결과 수신", { isAbnormal, label, score });

      const normalized = {
        isAbnormal: !!isAbnormal,
        label: label || (isAbnormal ? "이상 행동" : "정상 행동"),
        score: typeof score === "number" ? score : 0,
        time: new Date().toLocaleTimeString("ko-KR", { hour12: false }),
        camera: "테미 카메라",
      };

      // 동일 이벤트면 무시
      setLastResult((prev) => {
        if (
          prev &&
          prev.time === normalized.time &&
          prev.label === normalized.label &&
          prev.isAbnormal === normalized.isAbnormal
        ) {
          return prev;
        }

        // 로그 업데이트
        setLogs((prevLogs) => [normalized, ...prevLogs].slice(0, 50));

        // 이상행동이면 음성 안내
        if (normalized.isAbnormal) {
          speak(
            `이상행동이 감지되었습니다. 유형은 ${
              normalized.label
            }, 신뢰도는 ${Math.round(
              normalized.score * 100
            )} 퍼센트입니다.`
          );
        }

        return normalized;
      });
    }

    // 프레임 전송 콜백 (1초마다)
    function handleFrameSent(count) {
      console.log(`📤 Frame #${count} sent to server`);
      setFrameCount(count);
    }

    // 카메라 에러 콜백
    function handleCameraError(message) {
      console.error("❌ Camera error:", message);
      alert(`카메라 오류: ${message}`);
      setMonitoring(false); // 에러 시 모니터링 중지
    }

    // 분석 에러 콜백
    function handleAbnormalError(message) {
      console.error("❌ Analysis error:", message);
      // 에러는 로그만 남기고 모니터링은 계속
    }

    // 전역 콜백 등록
    window.onAbnormalResult = handleAbnormalResult;
    window.onFrameSent = handleFrameSent;
    window.onCameraError = handleCameraError;
    window.onAbnormalError = handleAbnormalError;

    console.log("✅ Android 콜백 등록 완료");

    // 언마운트 시 정리
    return () => {
      console.log("🧹 Android 콜백 제거");
      delete window.onAbnormalResult;
      delete window.onFrameSent;
      delete window.onCameraError;
      delete window.onAbnormalError;
    };
  }, []);

  const goHome = () => {
    navigate("/");
  };

  // Temi + 웹 공통 TTS
  function speak(text) {
    try {
      if (window.TemiInterface && window.TemiInterface.speak) {
        window.TemiInterface.speak(text);
        console.log("🔵 Temi에게 speak 요청:", text);
        return;
      }
    } catch (err) {
      console.error("❌ Temi 브릿지 오류:", err);
    }

    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 1.05;
    utter.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  const toggleMonitoring = () => {
    setMonitoring((prev) => !prev);
  };

  // 상단 상태 뱃지
  const getStatusBadge = () => {
    if (monitoring && lastResult?.isAbnormal) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          이상행동 감지됨
        </div>
      );
    }
    if (monitoring) {
      // 버퍼링 진행률 표시
      if (frameCount > 0 && frameCount < REQUIRED_FRAMES) {
        const progress = Math.round((frameCount / REQUIRED_FRAMES) * 100);
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            버퍼링 중 ({progress}%)
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          실시간 모니터링 중
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        대기 중
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-white flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <div className="w-full h-14 flex items-center justify-center">
        <h1 className="text-2xl font-extrabold text-[#02A4D3]">
          실내 이상행동 모니터링
        </h1>
      </div>

      {/* 홈 버튼 – Temi 스타일 맞추기 */}
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

      {/* 메인 레이아웃 */}
      <div className="flex-1 flex flex-row items-start justify-center px-6 gap-6 py-4 max-w-[1200px] mx-auto w-full">
        {/* 왼쪽: 카메라 + 현재 상태 */}
        <div className="flex-1 flex flex-col gap-4 min-w-[0]">
          {/* 카메라 영상 자리 */}
          <div className="relative bg-black rounded-2xl overflow-hidden h-[320px] shadow-md">
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
              테미 카메라 실시간 영상 영역
            </div>
            <div className="absolute top-3 left-3">{getStatusBadge()}</div>
          </div>

          {/* 현재 분석 상태 카드 */}
          <div className="bg-[#f7fafc] rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800">현재 상태</h2>
              <span className="text-xs text-gray-500">
                {monitoring && frameCount > 0 ? (
                  <span className="text-emerald-600 font-semibold">
                    프레임: {frameCount}개 전송됨
                  </span>
                ) : (
                  "로봇: 1대 · 카메라: 테미 전면 카메라"
                )}
              </span>
            </div>

            {lastResult ? (
              <div className="space-y-1 text-sm text-gray-800">
                <p>
                  <span className="font-semibold">카메라：</span>
                  {lastResult.camera || "테미 카메라"}
                </p>
                <p>
                  <span className="font-semibold">판정：</span>
                  {lastResult.isAbnormal ? "이상행동 감지" : "정상"}
                </p>
                <p>
                  <span className="font-semibold">유형：</span>
                  {lastResult.label}
                </p>
                <p>
                  <span className="font-semibold">신뢰도：</span>
                  {Math.round((lastResult.score || 0) * 100)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  감지 시각：{lastResult.time}
                </p>
              </div>
            ) : monitoring && frameCount > 0 ? (
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">
                  📊 버퍼링 중...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((frameCount / REQUIRED_FRAMES) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {frameCount} / {REQUIRED_FRAMES} 프레임 수집 완료
                  <br />
                  분석을 위해 {REQUIRED_FRAMES}개의 프레임이 필요합니다.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                아직 감지된 기록이 없습니다. 아래 모니터링 버튼을 눌러
                실시간 분석을 시작해 보세요.
              </p>
            )}
          </div>

          {/* 모니터링 토글 버튼 */}
          <div className="flex justify-center mt-2">
            <button
              onClick={toggleMonitoring}
              className={`px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-3 shadow-md transition ${
                monitoring
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-[#e53935] text-white hover:bg-[#c62828]"
              }`}
            >
              {monitoring ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white" />
                  모니터링 중지
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-white" />
                  실시간 모니터링 시작
                </>
              )}
            </button>
          </div>
        </div>

        {/* 오른쪽: 감지 로그 */}
        <aside className="w-[340px] bg-[#f7fafc] border border-gray-200 rounded-2xl py-4 px-3 shadow-sm flex flex-col h-[420px]">
          <h2 className="text-lg font-bold text-gray-800 mb-1">감지 기록</h2>
          <p className="text-xs text-gray-500 mb-3">
            실시간 모니터링 중 이상행동이 감지되면 이곳에 순서대로 쌓입니다.
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {logs.length === 0 && (
              <p className="text-xs text-gray-400">아직 기록이 없습니다.</p>
            )}

            {logs.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl px-3 py-2 text-xs border ${
                  item.isAbnormal
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">
                    {item.isAbnormal ? "이상행동" : "정상"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {item.time}
                  </span>
                </div>
                <p className="truncate">
                  {item.camera || "테미 카메라"} · {item.label}
                </p>
                <p className="text-[10px] mt-1 text-gray-500">
                  신뢰도: {Math.round((item.score || 0) * 100)}%
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}