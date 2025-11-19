import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";

const CameraPreview = forwardRef(({ onAllPhotosCaptured }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasStream, setHasStream] = useState(false);

  // 👉 Temi 환경에서도 돌아가도록 카메라 시작 함수
  const startCamera = async () => {
    if (hasStream) return true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia not supported in this WebView");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // 필요하면 environment로 변경
        audio: false,
      });

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        // Temi WebView에서 재생 강제
        try {
          await video.play();
        } catch (e) {
          console.error("video.play() error:", e);
        }
      }

      setHasStream(true);
      console.log("Camera started");
      return true;
    } catch (err) {
      const name = err && err.name ? err.name : "";
      const message = err && err.message ? err.message : err;
      console.error("Camera access error:", name, message);
      return false;
    }
  };

  // 🎞 프레임 비율(0.78 근처) 맞춰 캡처
  const capturePhoto = () => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
        resolve(null);
        return;
      }

      const targetW = 640;
      const targetH = 820; // 0.78 비율 근처

      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetW / targetH;

      let sx, sy, sWidth, sHeight;

      if (videoRatio > targetRatio) {
        // 비디오가 더 넓은 경우 → 좌우 크롭
        sHeight = video.videoHeight;
        sWidth = sHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
      } else {
        // 비디오가 더 세로로 긴 경우 → 상하 크롭
        sWidth = video.videoWidth;
        sHeight = sWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
      const photoData = canvas.toDataURL("image/png");
      resolve(photoData);
    });
  };

  // 📸 자동 촬영 시퀀스 (5초 카운트다운 + 4장)
  const autoCaptureSequence = async () => {
    console.log("################ autoCaptureSequence start #################");
    if (isCapturing) return;
    setIsCapturing(true);

    const ok = await startCamera();
    if (!ok) {
      setIsCapturing(false);
      return;
    }

    const captures = [];

    for (let i = 0; i < 4; i++) {
      // 5초 카운트다운
      for (let t = 5; t > 0; t--) {
        setCountdown(t);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 1000));
      }

      // 플래시 효과
      setFlash(true);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, 150));
      setFlash(false);

      // 실제 촬영
      // eslint-disable-next-line no-await-in-loop
      const photo = await capturePhoto();
      if (photo) {
        captures.push(photo);
      }

      setCountdown(null);

      // 마지막 사진이 아니라면 1초 쉬기
      if (i < 3) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    onAllPhotosCaptured(captures);
    setIsCapturing(false);
  };

  // 🔁 부모에서 버튼 클릭으로 촬영 시작
  useImperativeHandle(ref, () => ({
    startAutoCapture: autoCaptureSequence,
  }));

  // ✅ 페이지 로드시 카메라 프리뷰만 시작
  useEffect(() => {
    startCamera();
  }, []);

  // 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      const stream = video && video.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-xl border shadow-md"
        style={{ width: "320px", height: "410px", objectFit: "cover", transform: "scaleY(180deg)" }}
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

      {/* 플래시 효과 */}
      {flash && (
        <div className="absolute inset-0 bg-white opacity-90 animate-pulse" style={{width: "100%", height: "100%"}} />
      )}
    </div>
  );
});

export default CameraPreview;