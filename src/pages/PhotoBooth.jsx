import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import CameraPreview from "../components/CameraPreview";
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

const PhotoBooth = () => {
  const navigate = useNavigate();

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
      const origW = 1630;
      const origH = 1146;

      const frameWidth = 1200;
      const frameHeight = (origH / origW) * frameWidth;

      canvas.width = frameWidth;
      canvas.height = frameHeight;

      ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);

      const ratioX = frameWidth / origW;
      const ratioY = frameHeight / origH;

      const basePositions = [
        { x: 832, y: 97, w: 320, h: 400 },
        { x: 1214, y: 97, w: 320, h: 400 },
        { x: 832, y: 655, w: 320, h: 400 },
        { x: 1214, y: 650, w: 320, h: 400 },
      ];

      const positions = basePositions.map((p) => ({
        x: p.x * ratioX,
        y: p.y * ratioY,
        w: p.w * ratioX,
        h: p.h * ratioY,
      }));

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
    <div>
      {/*  홈 버튼 (왼쪽 상단 고정, 화살표 2개) */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-[100px] right-[1200px] flex flex-col items-center cursor-pointer"
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
      {/* 중앙 콘텐츠 영역 */}
      <div className="flex flex-col items-center justify-center w-full min-h-screen">
        <h1 className="text-2xl font-bold text-sky-600 mb-4 text-center">
          테미네컷 - {theme.toUpperCase()} 테마
        </h1>

        {!isFinished && (
          <>
            <CameraPreview
              ref={cameraRef}
              onAllPhotosCaptured={handleAllPhotosCaptured}
            />

            <button
              onClick={startShooting}
              className="mt-10 bg-pink-500 text-white w-[230px] h-[80px] rounded-full text-4xl font-extrabold flex items-center justify-center hover:bg-pink-600 active:scale-95 transition-transform tracking-wide"
            >
              📷 촬영 시작
            </button>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {isFinished && qrUrl && (
          <div className="flex flex-row items-start gap-6 mt-4">
            <img
              src={canvasRef.current?.toDataURL()}
              className="w-[420px] rounded-lg border"
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
