import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QRCode from "react-qr-code";
import CameraPreview from "../components/CameraPreview";
import axios from "axios";

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

const PhotoBooth = () => {
  const [_, setPhotos] = useState([]);
  const [qrUrl, setQrUrl] = useState("");
  const [theme, setTheme] = useState("basic");
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const selected = searchParams.get("theme") || "basic";
    setTheme(selected);
  }, [searchParams]);

  const handleAllPhotosCaptured = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    mergeWithThemeFrame(capturedPhotos, theme);
  };

  const mergeWithThemeFrame = async (photoArray, themeName) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const frame = new Image();
    frame.src = frames[themeName] || frames.basic;

    frame.onload = async () => {
      // 템플릿 원본 비율 (1630×1146)
      const frameWidth = 816;
      const frameHeight = (1146 / 1630) * frameWidth;
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);

      const ratioX = frameWidth / 1630;
      const ratioY = frameHeight / 1146;

      // ✅ 수정된 최종 좌표
      const basePositions = [
        { x: 875, y: 112, w: 278, h: 357 }, // 좌상
        { x: 1220, y: 112, w: 278, h: 357 }, // 우상
        { x: 875, y: 582, w: 278, h: 357 }, // 좌하
        { x: 1220, y: 582, w: 278, h: 357 }, // 우하
      ];

      const positions = basePositions.map((p) => ({
        x: p.x * ratioX,
        y: p.y * ratioY,
        w: p.w * ratioX,
        h: p.h * ratioY,
      }));

      // 각 사진 삽입
      for (let i = 0; i < Math.min(photoArray.length, 4); i++) {
        const img = new Image();
        img.src = photoArray[i];

        await new Promise((resolve) => {
          img.onload = () => {
            const { x, y, w, h } = positions[i];

            // 비율 유지 + 프레임에 딱 맞게 꽉 채움 (cover 방식)
            const ratio = Math.max(w / img.width, h / img.height);
            const newW = img.width * ratio;
            const newH = img.height * ratio;
            const offsetX = x + (w - newW) / 2;
            const offsetY = y + (h - newH) / 2;

            ctx.drawImage(img, offsetX, offsetY, newW, newH);
            resolve();
          };
        });
      }

      const finalImage = canvas.toDataURL("image/png");
      uploadToS3(finalImage);
      setIsFinished(true);
    };
  };

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

  const startShooting = () => {
    cameraRef.current.startAutoCapture();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-[Pretendard] space-y-6 relative">
      <h1 className="text-2xl font-bold text-sky-600 mt-6">
        🎞 테미네컷 - {theme.toUpperCase()} 테마
      </h1>

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
