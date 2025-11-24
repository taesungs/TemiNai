import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
  useState,
} from "react";

const CameraPreview = forwardRef(({ onAllPhotosCaptured }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  // 📸 5초 간격마다 사진 1장씩 총 4장
  useImperativeHandle(ref, () => ({
    startAutoCapture: async () => {
      if (isCapturing) return;
      setIsCapturing(true);

      const captures = [];

      for (let i = 0; i < 4; i++) {
        // 5초 카운트
        for (let t = 5; t > 0; t--) {
          setCountdown(t);
          await new Promise((res) => setTimeout(res, 1000));
        }

        // 실제 촬영
        const photo = await capturePhoto();
        captures.push(photo);

        // 카운트 초기화
        setCountdown(null);

        // 다음 촬영까지 1초 쉬기 (플래시 후 안정 시간)
        if (i < 3) await new Promise((res) => setTimeout(res, 1000));
      }

      onAllPhotosCaptured(captures);
      setIsCapturing(false);
    },
  }));

  // 🎞 0.78 비율(프레임용)로 캡처
  const capturePhoto = () => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const targetW = 640;
      const targetH = 820;

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetW / targetH;

      let sx, sy, sWidth, sHeight;

      if (videoRatio > targetRatio) {
        sHeight = video.videoHeight;
        sWidth = sHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = video.videoWidth;
        sHeight = sWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        video,
        sx,
        sy,
        sWidth,
        sHeight,
        -targetW,
        0,
        targetW,
        targetH
      );
      ctx.restore();
      const photoData = canvas.toDataURL("image/png");
      resolve(photoData);
    });
  };

  return (
    <div className="flex flex-col items-center relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-xl border shadow-md"
        style={{
          width: "320px",
          height: "410px",
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 카운트다운 오버레이 */}
      {countdown && (
        <div
          className="absolute flex items-center justify-center text-[100px] font-extrabold text-white bg-black bg-opacity-40 rounded-full transition-all duration-300"
          style={{
            width: "220px",
            height: "220px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {countdown}
        </div>
      )}
    </div>
  );
});

export default CameraPreview;
