import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import CameraPreview from "../components/CameraPreview";
import PhotoBoothLayout from "../components/PhotoBoothLayout";
import axios from "axios";

const PhotoBooth = () => {
  const [photos, setPhotos] = useState([]);
  const [qrUrl, setQrUrl] = useState("");
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);

  // 📸 CameraPreview에서 4컷 촬영 완료 시 자동 호출
  const handleAllPhotosCaptured = (capturedPhotos) => {
    setPhotos(capturedPhotos);
    mergePhotos(capturedPhotos);
  };

  // 🎞️ 4컷 세로 합성
  const mergePhotos = (photoArray) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 600;
    const gap = 10;
    const imgHeight = 800;
    canvas.width = width;
    canvas.height =
      photoArray.length * imgHeight + (photoArray.length - 1) * gap;

    photoArray.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        ctx.drawImage(img, 0, i * (imgHeight + gap), width, imgHeight);
        if (i === photoArray.length - 1) {
          const finalImage = canvas.toDataURL("image/png");
          handleUpload(finalImage);
        }
      };
    });
  };

  // ☁️ S3 업로드
  const handleUpload = async (mergedImage) => {
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

  // 📷 촬영 시작
  const startShooting = () => {
    cameraRef.current.startAutoCapture();
  };

  return (
    <div className="flex flex-col items-center mt-8 space-y-6">
      <h1 className="text-2xl font-bold">🎞 Temi 인생네컷</h1>

      <CameraPreview
        ref={cameraRef}
        onAllPhotosCaptured={handleAllPhotosCaptured}
      />

      <canvas ref={canvasRef} className="hidden" />

      {photos.length === 0 && !qrUrl && (
        <button
          onClick={startShooting}
          className="bg-pink-500 text-white px-5 py-3 rounded-lg text-lg"
        >
          📸 촬영 시작
        </button>
      )}

      {qrUrl && (
        <div className="mt-6 text-center">
          <p className="text-green-600 font-semibold mb-3">
            촬영 및 업로드 완료!
          </p>
          <PhotoBoothLayout photos={photos} />
          <QRCode value={qrUrl} size={200} />
          <p className="mt-2 text-gray-600 text-sm">
            QR로 스캔하여 사진 다운로드
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
