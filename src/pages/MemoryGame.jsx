// src/pages/MemoryGame.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


/* ======================= 난이도 설정 ======================= */
const DIFFICULTIES = {
  easy: { grid: 4, time: 60, storageKey: "mem_best_easy" },
  hard: { grid: 6, time: 150, storageKey: "mem_best_hard" },
};

/* ======================= 정적 이미지 (public/) ======================= */
const IMG_INTRO1 = "/memory/game_intro_1/gamestart_1.png";
const IMG_INTRO2 = "/memory/game_intro_2/gamestart_2.png";
const IMG_CHOICE = "/memory/choice/choice.png";

/* ======================= 유틸 ======================= */
const EMOJIS = [
  "🍎","🍌","🍇","🍉","🍒","🍍","🥝","🥕","🥑","🍑","🍊","🥥","🍈","🫐","🍐","🍓","🌽","🥔",
];

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeDeck(grid) {
  const pairs = EMOJIS.slice(0, (grid * grid) / 2);
  const base = pairs.flatMap((v, i) => [
    { id: `a-${i}`, value: v, flipped: false, matched: false },
    { id: `b-${i}`, value: v, flipped: false, matched: false },
  ]);
  return shuffle(base);
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

/* ======================= 이미지 위 핫스팟 컴포넌트 ======================= */
/* content가 있으면 보이는 버튼, 없으면 투명 클릭영역으로 렌더링할게 */
function HotspotImage({ src, alt, hotspots, onHit, debug = false }) {
  return (
    <div className="relative w-[min(960px,92vw)]">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-xl shadow-card border border-slate-200 select-none"
        draggable={false}
      />
      {hotspots.map((h) => {
        const hasContent = Boolean(h.content);
        return (
          <button
            key={h.id}
            type="button"
            aria-label={h.label}
            onClick={() => onHit?.(h.id)}
            className={[
              "absolute z-10",
              "appearance-none outline-none border-0 p-0", // 브라우저 기본 회색 버튼 제거
              hasContent ? "flex items-center justify-center" : "",
              "focus-visible:ring-2 focus-visible:ring-indigo-500/70 rounded-md",
            ].join(" ")}
            style={{
              left: h.left,
              top: h.top,
              width: h.width,
              height: h.height,
              background: hasContent ? "transparent" : "transparent",
              // 위치 확인용 가이드 (필요할 때만 debug=true로 켜줘)
              ...(debug ? { outline: "2px dashed rgba(99,102,241,0.6)" } : {}),
            }}
          >
            {h.content ?? null}
          </button>
        );
      })}
    </div>
  );
}

/* ======================= 카드 컴포넌트 ======================= */
function Card({ card, onClick, disabled, size }) {
  // 요청한 비율 유지할게
  const FRONT_RATIO = 0.69; // 앞면 과일 이모지
  const BACK_RATIO  = 0.72; // 뒷면 🎴 이모지

  const frontSize = Math.round(size * FRONT_RATIO);
  const backSize  = Math.round(size * BACK_RATIO);

  return (
    <button
      aria-label={card.flipped ? `앞면 ${card.value}` : "뒷면"}
      onClick={() => {
        if (!disabled && !card.matched) onClick(card);
      }}
      aria-disabled={disabled || card.matched}
      tabIndex={disabled || card.matched ? -1 : 0}
      style={{ width: size, height: size }}
      className="relative focus:outline-none"
    >
      {/* 회전/클리핑 래퍼 */}
      <div className="relative h-full w-full overflow-hidden rounded-2xl [perspective:1000px]">
        <div
          className={[
            "absolute inset-0 h-full w-full",
            "transition-transform duration-300 ease-out will-change-transform",
            "[transform-style:preserve-3d] [transform-origin:center] [transform:translateZ(0)]",
            card.flipped ? "rotate-y-180" : "rotate-y-0",
          ].join(" ")}
        >
          {/* Back (뒷면) */}
          <div
            className={[
              "absolute inset-0 flex items-center justify-center p-1.5",
              "rounded-2xl border border-slate-300 bg-slate-100",
              "box-border [backface-visibility:hidden]",
            ].join(" ")}
          >
            <span
              style={{ fontSize: backSize, lineHeight: 1 }}
              className="leading-none select-none"
              aria-hidden
            >
              🎴
            </span>
          </div>

          {/* Front (앞면) */}
          <div
            className={[
              "absolute inset-0 flex items-center justify-center p-1.5",
              "rounded-2xl border border-slate-300 bg-white",
              "box-border [backface-visibility:hidden] rotate-y-180",
            ].join(" ")}
          >
            <span
              style={{ fontSize: frontSize, lineHeight: 1 }}
              className="leading-none select-none"
            >
              {card.value}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ======================= 메인 컴포넌트 ======================= */
export default function MemoryGame() {
  const navigate = useNavigate();

  // 화면 흐름: intro1 → intro2 → choice → game(=intro/preview/play/result)
  const [screen, setScreen] = useState("intro1");
  const [mode, setMode] = useState("easy");
  const cfg = DIFFICULTIES[mode];
  const { grid, time: TIME_LIMIT_SEC, storageKey } = cfg;

  const [stage, setStage] = useState("intro"); // intro | preview | play | result
  const [deck, setDeck] = useState(() => makeDeck(grid));
  const [lock, setLock] = useState(false);
  const [firstPick, setFirstPick] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(storageKey) || 0));
  const [result, setResult] = useState(null); // 'win' | 'timeout'

  const headerRef = useRef(null);
  const [cell, setCell] = useState(100);

  useLayoutEffect(() => {
    const rows = grid, cols = grid;
    const GAP = 14;
    function update() {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const availH = window.innerHeight - headerH - 90;
      const availW = Math.min(window.innerWidth - 40, 1200);
      const sizeX = (availW - GAP * (cols - 1)) / cols;
      const sizeY = (availH - GAP * (rows - 1)) / rows;
      const base = Math.max(60, Math.min(170, Math.floor(Math.min(sizeX, sizeY))));
      setCell(base);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [grid]);

  useEffect(() => {
    setDeck(makeDeck(grid));
    setStage("intro");
    setElapsed(0);
    setResult(null);
    setFirstPick(null);
    setBest(Number(localStorage.getItem(storageKey) || 0));
  }, [grid, storageKey]);

  const PREVIEW_MS = 3000;
  const handleStart = () => {
    const fresh = makeDeck(grid).map(c => ({ ...c, flipped: true }));
    setDeck(fresh);
    setElapsed(0);
    setResult(null);
    setFirstPick(null);
    setLock(true);
    setStage("preview");
    setTimeout(() => {
      setDeck(d => d.map(c => ({ ...c, flipped: false })));
      setLock(false);
      setStage("play");
    }, PREVIEW_MS);
  };

  useEffect(() => {
    if (stage !== "play") return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);

  useEffect(() => {
    if (stage === "play" && elapsed >= TIME_LIMIT_SEC) {
      setStage("result");
      setResult("timeout");
    }
  }, [elapsed, stage, TIME_LIMIT_SEC]);

  const handleClick = (card) => {
    if (stage !== "play" || lock || card.flipped || card.matched) return;

    setDeck(d => d.map(c => (c.id === card.id ? { ...c, flipped: true } : c)));

    if (!firstPick) {
      setFirstPick(card);
      return;
    }

    const prev = firstPick;
    setFirstPick(null);

    if (prev.value === card.value && prev.id !== card.id) {
      setDeck(d => d.map(c => (c.value === card.value ? { ...c, matched: true } : c)));
    } else {
      setLock(true);
      setTimeout(() => {
        setDeck(d =>
          d.map(c =>
            c.id === prev.id || c.id === card.id ? { ...c, flipped: false } : c
          )
        );
        setLock(false);
      }, 700);
    }
  };

  useEffect(() => {
    if (stage !== "play") return;
    if (deck.every(c => c.matched)) {
      setStage("result");
      setResult("win");
      setBest(prev => {
        const next = prev === 0 ? elapsed : Math.min(prev, elapsed);
        localStorage.setItem(storageKey, String(next));
        return next;
      });
    }
  }, [deck, stage, elapsed, storageKey]);

  /* ======================= 화면 단계: intro1 / intro2 / choice ======================= */
  if (screen === "intro1") {
    const hotspots = [
      {
        id: "home",
        label: "홈",
        left: "18%",
        top: "22%",
        width: "7%",
        height: "8%",
        // 보이는 텍스트
        content: (
          <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700/90">
            홈
          </span>
        ),
      },
      {
        id: "start",
        label: "게임 시작하기",
        left: "40%",
        top: "57%",
        width: "32%",
        height: "11%",
        // 보이는 텍스트
        content: (
          <span className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm sm:text-base font-semibold shadow">
            게임 시작하기
          </span>
        ),
      },
    ];
    return (
      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
        <div className="w-full max-w-4xl flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-black">메모리 게임</h1>
        </div>
        <HotspotImage
          src={IMG_INTRO1}
          alt="메모리 게임 시작 화면"
          hotspots={hotspots}
          onHit={(id) => {
            if (id === "home") {
              if (navigate) navigate("/");
              else window.location.assign("/");
            } else if (id === "start") {
              setScreen("intro2");
            }
          }}
          // debug
        />
      </div>
    );
  }

  if (screen === "intro2") {
    const hotspots = [
      {
        id: "home",
        label: "홈",
        left: "18%",
        top: "22%",
        width: "7%",
        height: "8%",
        content: (
          <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700/90">
            홈
          </span>
        ),
      },
      {
        id: "start",
        label: "게임 시작하기",
        left: "40%",
        top: "57%",
        width: "32%",
        height: "11%",
        content: (
          <span className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm sm:text-base font-semibold shadow">
            게임 시작하기
          </span>
        ),
      },
    ];
    return (
      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
        <div className="w-full max-w-4xl flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-black">메모리 게임</h1>
        </div>
        <HotspotImage
          src={IMG_INTRO2}
          alt="게임 설명 화면"
          hotspots={hotspots}
          onHit={(id) => {
            if (id === "home") {
              if (navigate) navigate("/");
              else window.location.assign("/");
            } else if (id === "start") {
              setScreen("choice");
            }
          }}
          // debug
        />
      </div>
    );
  }

  if (screen === "choice") {
  // 왼쪽/오른쪽 버튼에 보이는 텍스트 추가
  const hotspots = [
    // 홈은 그대로 투명 영역 (원하면 content 넣어서 보이게 바꿀 수 있어)
    { id: "home", 
      label: "홈", 
      left: "18%", 
      top: "22%", 
      width: "7%", 
      height: "8%",
      content: (
        <span className="px-5 py-2 rounded-full bg-black/60 text-white text-sm sm:text-base font-semibold">
          홈
        </span>
      ),
    },

    // 쉬운 단계 도전하기 (왼쪽)
    {
      id: "easy",
      label: "쉬운 단계 도전하기",
      left: "20%",
      top: "64%",
      width: "23%",
      height: "9%",
      content: (
        <span className="px-5 py-2 rounded-full bg-black/60 text-white text-sm sm:text-base font-semibold">
          쉬운 단계 도전하기
        </span>
      ),
    },

    // 어려운 단계 도전하기 (오른쪽)
    {
      id: "hard",
      label: "어려운 단계 도전하기",
      left: "55%",
      top: "64%",
      width: "23%",
      height: "9%",
      content: (
        <span className="px-5 py-2 rounded-full bg-black/60 text-white text-sm sm:text-base font-semibold">
          어려운 단계 도전하기
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-4xl flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-black">메모리 게임</h1>
      </div>

      <HotspotImage
        src={IMG_CHOICE}
        alt="난이도 선택"
        hotspots={hotspots}
        onHit={(id) => {
          if (id === "home") {
            if (navigate) navigate("/");
            else window.location.assign("/");
          } else if (id === "easy") {
            setMode("easy");
            setScreen("game");
          } else if (id === "hard") {
            setMode("hard");
            setScreen("game");
          }
        }}
        // debug  // 위치 미세조정할 때만 주석 해제해서 테두리 보면서 맞추면 돼
      />
    </div>
  );
}

  /* ======================= 실제 게임 화면 ======================= */
  return (
    <div className="min-h-screen px-4 py-6">
      <header ref={headerRef} className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            메모리 게임{" "}
            <span className="ml-2 align-middle rounded-full border px-3 py-1 text-base font-bold">
              {mode === "easy" ? "EASY" : "HARD"} {grid}×{grid}
            </span>
          </h1>
          <div className="text-slate-600">Best: {best ? formatTime(best) : "--:--"}</div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="font-mono text-slate-800">{formatTime(elapsed)}</div>
          <button
            className="rounded-md bg-slate-200 hover:bg-slate-300 px-3 py-1 text-sm"
            onClick={() => setScreen("choice")}
          >
            난이도 변경
          </button>
          <button
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm"
            onClick={handleStart}
          >
            {stage === "play" || stage === "preview" ? "다시 시작" : "게임 시작"}
          </button>
        </div>
      </header>

      {stage === "intro" && (
        <p className="max-w-6xl mx-auto mt-3 text-slate-600">
          시작을 누르면 카드가 <b>3초간 전체 공개</b>된 뒤 자동으로 뒤집을게. 제한시간은{" "}
          <b>{DIFFICULTIES[mode].time}초</b>야.
        </p>
      )}

      {/* 보드 */}
      <div
        className="mt-6 grid place-items-center w-fit mx-auto"
        style={{
          gridTemplateColumns: `repeat(${grid}, 1fr)`,
          gap: 14,
          pointerEvents: stage === "preview" ? "none" : "auto",
        }}
      >
        {deck.map((c) => (
          <Card
            key={c.id}
            card={c}
            onClick={handleClick}
            disabled={stage !== "play" || lock}
            size={cell}
          />
        ))}
      </div>

      {/* 결과 모달 */}
      {stage === "result" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[min(520px,92vw)] text-center">
            {result === "win" ? (
              <>
                <h2 className="text-2xl font-bold mb-2">성공!</h2>
                <p className="mb-4">기록: {formatTime(elapsed)}</p>
                <p className="text-sm text-slate-500 mb-4">
                  Best: {best ? formatTime(best) : "--:--"}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">시간 초과</h2>
                <p className="mb-4">다음엔 더 빨리 도전해볼게!</p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button
                className="rounded-md bg-slate-200 hover:bg-slate-300 px-4 py-2"
                onClick={() => setStage("intro")}
              >
                홈으로
              </button>
              <button
                className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
                onClick={handleStart}
              >
                다시 도전하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회전 보조 스타일 */}
      <style>{`
        .rotate-y-180 { transform: rotateY(180deg) translateZ(0); }
        .rotate-y-0   { transform: rotateY(0deg)   translateZ(0); }
      `}</style>
    </div>
  );
}
