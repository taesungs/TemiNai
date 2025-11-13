// src/pages/MemoryGameeasy.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import backImg from "../assets/back.png";

/** ==== 게임 상수 (EASY 전용) ==== */
const GRID = 4;                     // 4x4
const PREVIEW_MS = 5000;            // 전체 카드 공개 5초
const BEST_KEY = "mem_easy_best_v2";

/** 덱 생성 */
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
  const sec = ms / 1000;
  return `${sec.toFixed(2)}s`;
}

/** ==== 카드 (3D 플립 & 매칭 팝 효과 추가) ==== */
function Card({ data, onClick }) {
  const face = data.open || data.done;
  const blocked = face; // 열려있거나 매치완료면 클릭만 막기

  // 공통 크기(반응형)
  const size = {
    width: "clamp(72px, 9.5vw, 120px)",
    height: "clamp(72px, 9.5vw, 120px)",
  };

  return (
    <button
      onClick={() => onClick?.(data)}
      aria-disabled={blocked}
      className="select-none"
      style={{ ...size, padding: 0, background: "transparent", border: "none", pointerEvents: blocked ? "none" : "auto" }}
      aria-label={face ? `앞면 ${data.val}` : "카드 뒤집기"}
    >
      {/* 3D 원근감 컨테이너 */}
      <div style={{ perspective: "1000px", width: "100%", height: "100%" }}>
        {/* 플리퍼(회전 대상) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 600ms cubic-bezier(.2,.8,.2,1)",
            transform: face ? "rotateY(180deg)" : "rotateY(0deg)",
            // 매칭된 순간 살짝 튀는 애니메이션
            animation: data.done ? "mem-pop 260ms ease-out" : "none",
          }}
        >
          {/* 뒷면(처음 보이는 면) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "28px",
              border: "3px solid #000",
              background: "linear-gradient(#efefef,#e8e8e8)",
              boxShadow: "8px 8px 0 rgba(0,0,0,0.18)",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* 간단한 패턴 점 */}
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#bdbdbd",
              }}
            />
          </div>

          {/* 앞면(문자 표시) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "28px",
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
              className="font-black leading-none"
              style={{ fontSize: "clamp(28px, 5.4vw, 56px)" }}
            >
              {data.val}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/** ==== 메인(EASY) ==== */
export default function MemoryGameeasy() {
  const navigate = useNavigate();

  const [deck, setDeck] = useState(() => makeDeck());
  const [lock, setLock] = useState(true);
  const [first, setFirst] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [stage, setStage] = useState("intro"); // intro -> play -> result

  const startedAt = useRef(0);
  const timerRef = useRef(null);

  // 페이지 전체 배경 고정
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

  /** 시작(프리뷰 -> 플레이) */
  const start = () => {
    const fresh = makeDeck().map((c) => ({ ...c, open: true }));
    setDeck(fresh);
    setStage("intro");
    setFirst(null);
    setElapsed(0);
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

  /** 승리 체크 */
  useEffect(() => {
    if (stage !== "play") return;
    if (deck.every((c) => c.done)) {
      clearInterval(timerRef.current);
      setStage("result");
      const finish = performance.now() - startedAt.current;
      setElapsed(finish);
      setBest((prev) => {
        const next = prev === 0 ? finish : Math.min(prev, finish);
        localStorage.setItem(BEST_KEY, String(next));
        return next;
      });
      alert(`성공! 기록: ${msToText(finish)}`);
    }
  }, [deck, stage]);

  /** 카드 클릭 */
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
      // 불일치 → 잠깐 보여주고 닫기
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
      {/* 전역 keyframes 주입 (flip 보조용 팝 효과) */}
      <style>{`
        @keyframes mem-pop {
          0%   { transform: scale(1) rotateY(180deg); }
          50%  { transform: scale(1.06) rotateY(180deg); }
          100% { transform: scale(1) rotateY(180deg); }
        }
      `}</style>

      {/* ===== 상단바(뷰포트 전체 선 + 내부 고정폭) ===== */}
      <div
        className="sticky top-0 z-10 w-full border-b-[3px] border-black"
        style={{ background: "#DDF3F6" }}
      >
        {/* 내부 컨텐츠는 고정폭으로 간격 고정 */}
        <div className="h-[56px] px-6 max-w-[1100px] mx-auto relative flex items-center justify-between">
          {/* 왼쪽: Best */}
          <div className="text-[18px] font-semibold">Best: {msToText(elapsed)}</div>

          {/* 중앙: EASY (정중앙 고정) */}
          <div className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold tracking-wide">
            EASY
          </div>

          {/* 오른쪽: [다시 시작] + 홈 */}
          <div className="flex items-center gap-3">
            <button
              onClick={start}
              className="text-[14px] border-[2px] border-black px-3 py-1 rounded-lg bg-white hover:bg-black hover:text-white transition"
              aria-label="다시 시작"
              title="다시 시작"
            >
              다시 시작
            </button>
            <button
              onClick={() => navigate("/MemoryGamechoice")}
              className="flex items-center gap-1"
              aria-label="홈으로"
              title="홈으로"
            >
              <img src={backImg} alt="back" className="w-[30px] h-[30px] object-contain" />
              <img src={backImg} alt="back" className="w-[30px] h-[30px] object-contain -ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== 카드 그리드 ===== */}
      <div className="mt-8 px-4">
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: `repeat(${GRID}, clamp(72px, 9.5vw, 120px))`,
            gap: "clamp(16px, 2.4vw, 28px)",
            maxWidth: "1100px",
          }}
        >
          {deck.map((c) => (
            <Card key={c.id} data={c} onClick={onClickCard} />
          ))}
        </div>
      </div>
    </div>
  );
}
