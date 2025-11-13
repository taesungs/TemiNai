// src/pages/MemoryGameeasy.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import backImg from "../assets/back.png";

const GRID = 4;
const PREVIEW_MS = 5000;
const BEST_KEY = "mem_easy_best_v2";

const SYMBOLS = ["C", "O", "S", "H", "W", "-", "!", "?"];
function makeDeck() {
  const pairs = SYMBOLS.slice(0, (GRID * GRID) / 2);
  const deck = pairs.flatMap((v, i) => [
    { id: `a-${i}`, val: v, open: false, done: false },
    { id: `b-${i}`, val: v, open: false, done: false },
  ]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function msToText(ms) {
  if (!ms) return "00.00s";
  return `${(ms / 1000).toFixed(2)}s`;
}

/* 카드: 3D 플립 + 매치 팝 */
function Card({ data, onClick }) {
  const face = data.open || data.done;
  const blocked = face;
  const size = {
    width: "clamp(72px, 9.5vw, 120px)",
    height: "clamp(72px, 9.5vw, 120px)",
  };
  return (
    <button
      onClick={() => onClick?.(data)}
      aria-disabled={blocked}
      style={{
        ...size,
        padding: 0,
        background: "transparent",
        border: "none",
        pointerEvents: blocked ? "none" : "auto",
      }}
      aria-label={face ? `앞면 ${data.val}` : "카드 뒤집기"}
    >
      <div style={{ perspective: "1000px", width: "100%", height: "100%" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 600ms cubic-bezier(.2,.8,.2,1)",
            transform: face ? "rotateY(180deg)" : "rotateY(0deg)",
            animation: data.done ? "mem-pop 260ms ease-out" : "none",
          }}
        >
          {/* 뒷면 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 28,
              border: "3px solid #000",
              background: "linear-gradient(#efefef,#e8e8e8)",
              boxShadow: "8px 8px 0 rgba(0,0,0,0.18)",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#bdbdbd",
              }}
            />
          </div>
          {/* 앞면 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 28,
              border: "3px solid #000",
              background: "#fff",
              boxShadow: "8px 8px 0 rgba(0,0,0,0.18)",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontWeight: 900,
                lineHeight: 1,
                fontSize: "clamp(28px, 5.4vw, 56px)",
              }}
            >
              {data.val}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function MemoryGameeasy() {
  const navigate = useNavigate();

  const [deck, setDeck] = useState(() => makeDeck());
  const [lock, setLock] = useState(true);
  const [first, setFirst] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [stage, setStage] = useState("intro"); // intro -> play -> result
  const [resultTime, setResultTime] = useState(null);

  const startedAt = useRef(0);
  const timerRef = useRef(null);

  /* 배경 */
  useEffect(() => {
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = "#DDF3F6";
    document.documentElement.style.backgroundColor = "#DDF3F6";
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, []);

  /* 모달 시 스크롤 잠금 */
  useEffect(() => {
    if (stage === "result") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [stage]);

  const start = () => {
    const fresh = makeDeck().map((c) => ({ ...c, open: true }));
    setDeck(fresh);
    setStage("intro");
    setFirst(null);
    setElapsed(0);
    setResultTime(null);
    setLock(true);
    clearInterval(timerRef.current);

    setTimeout(() => {
      setDeck((d) => d.map((c) => ({ ...c, open: false })));
      setStage("play");
      setLock(false);
      startedAt.current = performance.now();
      timerRef.current = setInterval(() => {
        setElapsed(performance.now() - startedAt.current);
      }, 50);
    }, PREVIEW_MS);
  };

  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
  }, []);

  /* ✅ 승리 여부를 안정적으로 계산 */
  const allDone = useMemo(() => deck.length > 0 && deck.every((c) => c.done), [deck]);

  /* ✅ 바뀌는 순간에만 한 번 처리 */
  useEffect(() => {
    if (stage !== "play" || !allDone) return;
    handleWin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, stage]);

  const handleWin = () => {
    clearInterval(timerRef.current);
    const finish = performance.now() - startedAt.current;
    setElapsed(finish);
    setBest((prev) => {
      const next = prev === 0 ? finish : Math.min(prev, finish);
      localStorage.setItem(BEST_KEY, String(next));
      return next;
    });
    setResultTime(finish);
    setStage("result");
    setLock(true);
  };

  const onClickCard = (card) => {
    if (lock || stage !== "play" || card.open || card.done) return;

    setDeck((d) => d.map((c) => (c.id === card.id ? { ...c, open: true } : c)));

    if (!first) {
      setFirst(card);
      return;
    }
    const prev = first;
    setFirst(null);

    if (prev.val === card.val && prev.id !== card.id) {
      // 매치
      setDeck((d) =>
        d.map((c) =>
          c.val === card.val ? { ...c, open: true, done: true } : c
        )
      );
    } else {
      // 불일치
      setLock(true);
      setTimeout(() => {
        setDeck((d) =>
          d.map((c) =>
            c.id === prev.id || c.id === card.id ? { ...c, open: false } : c
          )
        );
        setLock(false);
      }, 650);
    }
  };

  return (
    <div className="min-h-screen">
      {/* keyframes (매치 팝) */}
      <style>{`
        @keyframes mem-pop {
          0%   { transform: scale(1) rotateY(180deg); }
          50%  { transform: scale(1.06) rotateY(180deg); }
          100% { transform: scale(1) rotateY(180deg); }
        }
      `}</style>

      {/* 상단바 (전체 폭 하단선 유지) */}
      <div
        className="sticky top-0 z-10 w-full"
        style={{
          background: "#DDF3F6",
          borderBottom: "3px solid #000",
        }}
      >
        <div
          className="h-[56px] px-6 max-w-[1100px] mx-auto relative"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            Best: {msToText(best)}
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            EASY
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={start}
              style={{
                fontSize: 14,
                border: "2px solid #000",
                padding: "6px 12px",
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
              }}
              title="다시 시작"
              aria-label="다시 시작"
            >
              다시 시작
            </button>
            <button
              onClick={() => navigate("/MemoryGamechoice")}
              title="홈으로"
              aria-label="홈으로"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <img src={backImg} alt="back" style={{ width: 30, height: 30 }} />
              <img
                src={backImg}
                alt="back"
                style={{ width: 30, height: 30, marginLeft: -4 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div style={{ marginTop: 32, paddingInline: 16 }}>
        <div
          className="grid mx-auto"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID}, clamp(72px, 9.5vw, 120px))`,
            gap: "clamp(16px, 2.4vw, 28px)",
            maxWidth: 1100,
          }}
        >
          {deck.map((c) => (
            <Card key={c.id} data={c} onClick={onClickCard} />
          ))}
        </div>
      </div>

      {/* ✅ 승리 모달: 인라인 스타일로 확실히 표시 */}
      {stage === "result" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* dim */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(2px)",
            }}
          />
          {/* modal */}
          <div
            style={{
              position: "relative",
              zIndex: 1001,
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingInline: 16,
            }}
          >
            <div
              style={{
                width: "min(720px, 92vw)",
                borderRadius: 16,
                background: "#0D98BA",
                boxShadow: "0 28px 60px rgba(0,0,0,.35)",
                color: "#fff",
                textAlign: "center",
                padding: "32px 24px",
              }}
            >
              <h2
                style={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontSize: "clamp(28px, 4.6vw, 44px)",
                  margin: 0,
                }}
              >
                성공하셨습니다!!
              </h2>
              <p
                style={{
                  margin: "24px 0 32px",
                  fontSize: "clamp(16px, 2.6vw, 22px)",
                  fontWeight: 600,
                }}
              >
                기록: {msToText(resultTime ?? elapsed).replace("s", "초")}
              </p>
              <button
                onClick={() => navigate("/")}
                style={{
                  border: "none",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#000",
                  fontWeight: 700,
                  padding: "14px 36px",
                  fontSize: "clamp(16px, 2.8vw, 20px)",
                  boxShadow: "0 12px 28px rgba(0,0,0,.25)",
                  cursor: "pointer",
                }}
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
