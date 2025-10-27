import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import CameraPreview from "../components/CameraPreview";
import axios from "axios";

// ✅ 테마 프레임 이미지 import
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

const PhotoBooth = () => {
  const [_, setPhotos] = useState([]);
  const [qrUrl, setQrUrl] = useState("");
  const [theme, setTheme] = useState("basic");
  const [isFinished, setIsFinished] = useState(false); //  촬영 완료 여부
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [searchParams] = useSearchParams();

  // URL에서 테마 읽기
  useEffect(() => {
    const selected = searchParams.get("theme") || "basic";
    setTheme(selected);
  }, [searchParams]);

  //  4컷 촬영 완료 시
  const handleAllPhotosCaptured = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    mergeWithThemeFrame(capturedPhotos, theme);
  };

  //  선택된 테마 프레임에 사진 합성
  const mergeWithThemeFrame = async (photoArray, themeName) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const frame = new Image();
    frame.src = frames[themeName] || frames.basic;

    frame.onload = async () => {
      const frameWidth = 800;
      const frameHeight = 1000; // 여백 조금 확장
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // 프레임 먼저 그림
      ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);

      //  사진 4컷 위치를 프레임에 맞게 조정 (살짝 아래로 내림, 좌우 정렬 개선)
      const positions = [
        { x: 310, y: 150, w: 220, h: 290 },
        { x: 560, y: 150, w: 220, h: 290 },
        { x: 310, y: 480, w: 220, h: 290 },
        { x: 560, y: 480, w: 220, h: 290 },
      ];

      // 사진 삽입
      for (let i = 0; i < photoArray.length; i++) {
        const img = new Image();
        img.src = photoArray[i];
        await new Promise((resolve) => {
          img.onload = () => {
            const { x, y, w, h } = positions[i];
            ctx.drawImage(img, x, y, w, h);
            resolve();
          };
        });
      }

      // 최종 이미지 변환 후 업로드
      const finalImage = canvas.toDataURL("image/png");
      uploadToS3(finalImage);
      setIsFinished(true); //  촬영 완료 상태 변경
    };

    frame.onerror = () => {
      console.error(`❌ 테마 이미지 로드 실패: ${themeName}`);
    };
  };

  //  S3 업로드
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

  // 촬영 시작
  const startShooting = () => {
    cameraRef.current.startAutoCapture();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-[Pretendard] space-y-6 relative">
      <h1 className="text-2xl font-bold text-sky-600 mt-6">
        🎞 Temi 인생네컷 - {theme.toUpperCase()} 테마
      </h1>

      {/*  촬영 중일 때만 카메라 보이기 */}
      {!isFinished && (
        <>
          <CameraPreview
            ref={cameraRef}
            onAllPhotosCaptured={handleAllPhotosCaptured}
          />
          <button
            onClick={startShooting}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl text-lg shadow-md hover:bg-pink-600 transition"
          >
            📷 촬영 시작
          </button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* 촬영 완료 후 완성 이미지 + QR 코드 */}
      {isFinished && qrUrl && (
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-green-600 font-semibold">촬영 및 업로드 완료!</p>
          <img
            src={canvasRef.current?.toDataURL()}
            alt="result"
            className="w-[360px] rounded-lg border"
          />
          <QRCode value={qrUrl} size={200} />
          <p className="text-gray-600 text-sm mt-2">
            QR코드를 스캔하여 사진을 다운로드하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
