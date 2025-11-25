// src/pages/PhotoBooth.jsx
import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "axios";
import backImg from "../assets/back.png";

// 프레임 이미지
import basicFrame from "../assets/themes/basic.png";
import busanFrame from "../assets/themes/busan.png";
import coshowFrame from "../assets/themes/coshow.png";
import robotFrame from "../assets/themes/robot.png";

const frames = {
    basic: basicFrame,
    busan: busanFrame,
    coshow: coshowFrame,
    robot: robotFrame,
};

const MAX_PHOTOS = 4;

const PhotoBooth = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 상태
    const [photos, setPhotos] = useState([]);       // data URL 배열
    const [qrUrl, setQrUrl] = useState("");
    const [theme, setTheme] = useState("basic");
    const [isFinished, setIsFinished] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [countdown, setCountdown] = useState(null); // 카운트다운 5,4,3,2,1

    const canvasRef = useRef(null);

    // 쿼리스트링으로 테마 선택
    useEffect(() => {
        const selected = searchParams.get("theme") || "basic";
        setTheme(selected);
    }, [searchParams]);

    // ✅ 카운트다운 콜백
    useEffect(() => {
        window.temiOnCountdown = (count) => {
            console.log("[PhotoBooth] countdown:", count);
            setCountdown(count);
        };

        return () => {
            if (window.temiOnCountdown) {
                delete window.temiOnCountdown;
            }
        };
    }, []);

    // ✅ 네이티브에서 사진 1장 찍을 때마다 호출되는 콜백
    // 네이티브: webView.evaluateJavascript("window.temiOnPhotoCaptured('file:///...')", null);
    useEffect(() => {
        window.temiOnPhotoCaptured = async (filePath) => {
            if (!filePath) return;
            console.log("[PhotoBooth] captured file:", filePath);

            // 파일 경로를 Base64 data URL로 변환
            try {
                const response = await fetch(filePath);
                const blob = await response.blob();
                const reader = new FileReader();

                reader.onloadend = () => {
                    const dataUrl = reader.result;
                    console.log("[PhotoBooth] converted to dataURL:", dataUrl.slice(0, 50) + "...");

                    setPhotos((prev) => {
                        const next = [...prev, dataUrl];

                        // 아직 4장 미만이면 다음 촬영 예약 (1.5초 대기)
                        if (next.length < MAX_PHOTOS) {
                            setTimeout(() => {
                                if (window.Android && typeof window.Android.capturePhoto === "function") {
                                    window.Android.capturePhoto();
                                }
                            }, 1500);
                        } else {
                            // 4장 채워짐 → 카메라 숨기고 합성 진행
                            if (
                                window.Android &&
                                typeof window.Android.hideInlinePreview === "function"
                            ) {
                                window.Android.hideInlinePreview();
                            }
                            mergeWithThemeFrame(next, theme);
                        }

                        return next;
                    });
                };

                reader.readAsDataURL(blob);
            } catch (error) {
                console.error("[PhotoBooth] Error converting file to dataURL:", error);
            }
        };

        return () => {
            if (window.temiOnPhotoCaptured) {
                delete window.temiOnPhotoCaptured;
            }
        };
    }, [theme]);

    // ✅ 4장 촬영 끝났을 때 프레임에 합성
    const mergeWithThemeFrame = async (photoArray, themeName) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const frame = new Image();
        frame.src = frames[themeName] || frames.basic;

        frame.onload = async () => {
            const origW = 1630;
            const origH = 1146;

            const frameWidth = 1200;
            const frameHeight = (origH / origW) * frameWidth;

            canvas.width = frameWidth;
            canvas.height = frameHeight;

            // 프레임 그리기
            ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);

            const ratioX = frameWidth / origW;
            const ratioY = frameHeight / origH;

            // 실제 PSD 좌표 기준 위치
            const basePositions = [
                { x: 784, y: 97, w: 330, h: 400 },
                { x: 1195, y: 97, w: 330, h: 400 },
                { x: 784, y: 655, w: 330, h: 400 },
                { x: 1195, y: 650, w: 330, h: 400 },
            ];

            const positions = basePositions.map((p) => ({
                x: p.x * ratioX,
                y: p.y * ratioY,
                w: p.w * ratioX,
                h: p.h * ratioY,
            }));

            // 사진 4장 채우기
            for (let i = 0; i < Math.min(photoArray.length, 4); i++) {
                // eslint-disable-next-line no-await-in-loop
                await new Promise((resolve) => {
                    const img = new Image();
                    img.src = photoArray[i];

                    img.onload = () => {
                        const { x, y, w, h } = positions[i];

                        const ratio = Math.max(w / img.width, h / img.height);
                        const newW = img.width * ratio;
                        const newH = img.height * ratio;

                        const offsetX = x + (w - newW) / 2;
                        const offsetY = y + (h - newH) / 2;

                        ctx.drawImage(img, offsetX, offsetY, newW, newH);
                        resolve();
                    };

                    img.onerror = () => {
                        console.error("이미지 로딩 실패", i);
                        resolve();
                    };
                });
            }

            const finalImage = canvas.toDataURL("image/png");
            uploadToS3(finalImage);
            setIsFinished(true);
            setIsCapturing(false);
        };

        frame.onerror = () => {
            console.error("프레임 이미지 로딩 실패");
            setIsCapturing(false);
        };
    };

    // ✅ S3 업로드
    const uploadToS3 = async (mergedImage) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/upload`,
                { image: mergedImage }
            );
            setQrUrl(res.data.url);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    // ✅ 촬영 시작 → 네이티브 inline 카메라 호출
    const startShooting = () => {
        if (
            window.Android &&
            typeof window.Android.startInlinePreview === "function" &&
            typeof window.Android.capturePhoto === "function"
        ) {
            // 상태 초기화
            setPhotos([]);
            setQrUrl("");
            setIsFinished(false);
            setIsCapturing(true);

            // 카메라 박스 띄우기
            window.Android.startInlinePreview();

            // 약간의 딜레이 후 첫 촬영
            setTimeout(() => {
                window.Android.capturePhoto();
            }, 1500);
        } else {
            alert(
                "촬영 기능을 사용할 수 없습니다.\n(Android.startInlinePreview / capturePhoto 인터페이스가 없습니다.)"
            );
        }
    };

    // ✅ 홈으로 나갈 때
    const handleGoHome = () => {
        // 혹시 카메라 켜져 있으면 닫기
        if (
            window.Android &&
            typeof window.Android.hideInlinePreview === "function"
        ) {
            window.Android.hideInlinePreview();
        }
        navigate("/");
    };

    return (
        <div>
            {/* 홈 버튼 (왼쪽 상단 고정, 화살표 2개) */}
            <div
                onClick={handleGoHome}
                className="absolute top-[100px] right-[1200px] flex flex-col items-center cursor-pointer"
            >
                <span className="text-[30px] font-bold text-gray-700">홈</span>

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

            {/* 중앙 콘텐츠 영역 */}
            <div className="flex flex-col items-center justify-center w-full min-h-screen">
                {/* 촬영 중이 아닐 때만 타이틀 표시 */}
                {!isCapturing && (
                    <h1 className="text-2xl font-bold text-sky-600 mb-4 text-center">
                        테미네컷 - {theme.toUpperCase()} 테마
                    </h1>
                )}

                {/* 카운트다운 오버레이 */}
                {countdown !== null && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="text-[200px] font-extrabold text-white animate-pulse">
                            {countdown}
                        </div>
                    </div>
                )}

                {/* 촬영 전/중 상태 */}
                {!isFinished && !isCapturing && (
                    <div className="flex flex-col items-center">
                        <p className="text-lg text-gray-700 mb-6 text-center">
                            촬영 시작 버튼을 누르면
                            <br />
                            테미 화면 안의 포토부스 카메라가 켜지고 자동으로 4장을 촬영합니다.
                        </p>

                        <button
                            onClick={startShooting}
                            disabled={isCapturing}
                            className={`mt-4 bg-pink-500 text-white w-[260px] h-[90px] rounded-full text-4xl font-extrabold flex items-center justify-center tracking-wide transition-transform hover:bg-pink-600 active:scale-95`}
                        >
                            📷 촬영 시작
                        </button>
                    </div>
                )}

                {/* 촬영 중 안내 (카운트다운 없을 때만) */}
                {isCapturing && countdown === null && (
                    <div className="flex flex-col items-center">
                        <p className="text-2xl text-gray-700 font-bold text-center">
                            📸 촬영 중...
                            <br />
                            <span className="text-lg text-gray-500 mt-2">
                                화면 중앙 카메라를 바라봐 주세요
                            </span>
                        </p>
                    </div>
                )}

                {/* 캔버스 (보이지 않게 숨김) */}
                <canvas ref={canvasRef} className="hidden" />

                {/* 촬영 완료 + QR */}
                {isFinished && qrUrl && (
                    <div className="flex flex-row items-start gap-6 mt-4">
                        <img
                            src={canvasRef.current?.toDataURL()}
                            className="w-[420px] rounded-lg border"
                            alt="merged"
                        />

                        <div className="flex flex-col items-center">
                            <QRCode value={qrUrl} size={200} />
                            <p className="text-gray-600 text-sm mt-3 text-center">
                                QR코드를 스캔하여 사진을 다운로드하세요.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoBooth;