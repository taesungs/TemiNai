import React, { useState, useRef } from "react";
import CameraPreview from "../components/CameraPreview";
import PhotoBoothLayout from "../components/PhotoBoothLayout";
import axios from "axios";

const PhotoBooth = () => {
  const [photos, setPhotos] = useState([]);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const canvasRef = useRef(null);

  const handleCapture = (dataUrl) => {
    if (photos.length < 4) setPhotos([...photos, dataUrl]);
  };

  // ✅ 4컷 세로 합성
  const mergePhotos = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 600;
    const gap = 10;
    const imgHeight = 800;
    canvas.width = width;
    canvas.height = photos.length * imgHeight + (photos.length - 1) * gap;

    photos.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        ctx.drawImage(img, 0, i * (imgHeight + gap), width, imgHeight);
        if (i === photos.length - 1) {
          const finalImage = canvas.toDataURL("image/png");
          handleUpload(finalImage);
        }
      };
    });
  };

  // ✅ S3 업로드
  const handleUpload = async (mergedImage) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/upload`,
        { image: mergedImage } // 서버에서 image로 받음
      );
      setUploadedUrl(res.data.url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 space-y-6">
      <h1 className="text-2xl font-bold">🎞 Temi 인생네컷</h1>
      <CameraPreview onCapture={handleCapture} />
      <PhotoBoothLayout photos={photos} />
      <canvas ref={canvasRef} className="hidden" />
      {photos.length === 4 && (
        <button
          onClick={mergePhotos}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg"
        >
          📤 4컷 저장 & 업로드
        </button>
      )}
      {uploadedUrl && (
        <div className="mt-4 text-center">
          <p>✅ 업로드 완료!</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            결과 보기
          </a>
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
