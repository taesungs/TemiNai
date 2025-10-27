import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

const CameraPreview = forwardRef(({ onAllPhotosCaptured }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  // 카메라 스트림 시작
  useEffect(() => {
    let stream;
    (async () => {
      try {
        if (videoRef.current?.srcObject) return; // 중복 방지
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.error("Camera access error:", e);
      }
    })();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // 카운트다운 표시
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      return;
    }
    countdownRef.current = setTimeout(
      () => setCountdown((prev) => prev - 1),
      1000
    );
    return () => clearTimeout(countdownRef.current);
  }, [countdown]);

  // 5초 간격으로 자동 4컷 촬영
  const startAutoCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    const shots = [];

    for (let i = 0; i < 4; i++) {
      setCountdown(5);
      await new Promise((r) => setTimeout(r, 5000));
      const shot = captureFrame();
      shots.push(shot);
      if (i < 3) await new Promise((r) => setTimeout(r, 500)); // 간격
    }

    setCapturing(false);
    if (onAllPhotosCaptured) onAllPhotosCaptured(shots);
  };

  // 부모에서 촬영 시작을 호출 가능
  useImperativeHandle(ref, () => ({ startAutoCapture }));

  // 단일 프레임 캡처
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  return (
    <div className="flex flex-col items-center relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-[320px] rounded-xl shadow"
      />
      <canvas ref={canvasRef} className="hidden" />
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
          <span className="text-white text-[96px] font-bold drop-shadow-lg select-none">
            {countdown}
          </span>
        </div>
      )}
    </div>
  );
});

export default CameraPreview;
