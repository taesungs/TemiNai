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

  /** ===============================
   *   사진 병합 함수 (최종본)
   * =============================== */
  const mergeWithThemeFrame = async (photoArray, themeName) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const frame = new Image();
    frame.src = frames[themeName] || frames.basic;

    frame.onload = async () => {
      // 원본 템플릿 크기
      const origW = 1630;
      const origH = 1146;

      // 출력 해상도 업그레이드 (1200px)
      const frameWidth = 1200;
      const frameHeight = (origH / origW) * frameWidth;

      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // 프레임 그리기
      ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);

      // 비율 변환
      const ratioX = frameWidth / origW;
      const ratioY = frameHeight / origH;

      // ★ 템플릿 내부 정확한 좌표
      const basePositions = [
        { x: 832, y: 97, w: 320, h: 400 }, // 좌상
        { x: 1214, y: 97, w: 320, h: 400 }, // 우상
        { x: 832, y: 655, w: 320, h: 400 }, // 좌하
        { x: 1214, y: 650, w: 320, h: 400 }, // 우하
      ];

      const positions = basePositions.map((p) => ({
        x: p.x * ratioX,
        y: p.y * ratioY,
        w: p.w * ratioX,
        h: p.h * ratioY,
      }));

      // ★ 사진 삽입 (cover 방식)
      for (let i = 0; i < Math.min(photoArray.length, 4); i++) {
        const img = new Image();
        img.src = photoArray[i];

        await new Promise((resolve) => {
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
        });
      }

      const finalImage = canvas.toDataURL("image/png");
      uploadToS3(finalImage);
      setIsFinished(true);
    };
  };

  /** ===============================
   *  업로드 영역
   * =============================== */
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

  /** 촬영 시작 */
  const startShooting = () => {
    cameraRef.current.startAutoCapture();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-[Pretendard] space-y-6 relative">
      <h1 className="text-2xl font-bold text-sky-600 mt-6">
        테미네컷 - {theme.toUpperCase()} 테마
      </h1>

      {!isFinished && (
        <>
          <CameraPreview
            ref={cameraRef}
            onAllPhotosCaptured={handleAllPhotosCaptured}
          />

          <div className="mt-10">
            <button
              onClick={startShooting}
              className="
      bg-pink-500 text-white
      w-[230px] h-[80px]
      rounded-full
      text-4xl font-extrabold
      flex items-center justify-center
      hover:bg-pink-600 active:scale-95
      transition-transform duration-150
      tracking-wide
    "
            >
              📷 촬영 시작
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* ==========================
          결과 화면 (QR → 오른쪽)
         ========================== */}
      {isFinished && qrUrl && (
        <div className="flex flex-row items-start gap-6 mt-4">
          {/* 결과 사진 */}
          <img
            src={canvasRef.current?.toDataURL()}
            alt="result"
            className="w-[420px] rounded-lg border"
          />

          {/* QR 영역 */}
          <div className="flex flex-col items-center">
            <QRCode value={qrUrl} size={200} />
            <p className="text-gray-600 text-sm mt-3 text-center">
              QR코드를 스캔하여 사진을 다운로드하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
