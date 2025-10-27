import React, { useRef, useEffect } from "react";

const CameraPreview = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera access error:", err));
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    onCapture(dataUrl);
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-[300px] rounded-lg shadow-md"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        onClick={handleCapture}
        className="mt-3 bg-pink-500 text-white py-2 px-4 rounded-lg"
      >
        📸 촬영
      </button>
    </div>
  );
};

export default CameraPreview;
