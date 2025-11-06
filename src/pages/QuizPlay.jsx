import React, { useState, useEffect, useRef } from "react";
import QuizQuestion from "../components/QuizQuestion";
import QuizFeedback from "../components/QuizFeedback";
import QuizData from "../data/QuizData";
import { useNavigate, useLocation } from "react-router-dom";

export default function QuizPlay() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const category = state?.category || "busan";

  //  랜덤으로 3문항만 추출
  const allQuestions = QuizData?.[category] || [];
  const questions = React.useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [category]);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [time, setTime] = useState(15);
  const timerRef = useRef(null);

  // 타이머 정리
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 데이터 없을 때
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-red-500">
        <h2 className="text-2xl font-bold mb-4">⚠️ 카테고리 데이터가 없습니다.</h2>
        <button
          onClick={() => navigate("/category")}
          className="px-6 py-3 bg-[#0D98BA] text-white rounded-lg font-bold"
        >
          카테고리로 돌아가기
        </button>
      </div>
    );
  }

  // 타이머 로직
  useEffect(() => {
    clearTimer();
    setTime(15);

    timerRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearTimer();
          handleAnswer(null); // 시간 초과시 오답 처리
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [current]);

  // 정답 판정 로직
  const handleAnswer = (choice) => {
    clearTimer();
    const q = questions[current];
    if (!q) return;

    const userAnswer = choice === "O";
    const isCorrect = userAnswer === q.answer;

    let newScore = score;

    if (choice === null) {
      setFeedback({
        type: "wrong",
        message: "⏰ 시간 초과!",
        explanation: q.explanation,
      });
    } else if (isCorrect) {
      newScore += 1;
      setScore(newScore);
      setFeedback({
        type: "correct",
        message: "정답입니다!!",
        explanation: "",
      });
    } else {
      setFeedback({
        type: "wrong",
        message: "아쉽네요...",
        explanation: q.explanation,
      });
    }

    const delay = choice === null ? 3000 : 2000;

    setTimeout(() => {
      setFeedback(null);
      const next = current + 1;

      if (next < questions.length) {
        setCurrent(next);
      } else {
        navigate("/quiz/result", {
          state: {
            score: newScore,
            total: questions.length,
          },
        });
      }
    }, delay);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative">
      <QuizQuestion
        question={questions[current].question}
        category={category}
        onAnswer={handleAnswer}
        time={time}
      />

      {feedback && (
        <QuizFeedback
          type={feedback.type}
          message={feedback.message}
          explanation={feedback.explanation}
        />
      )}
    </div>
  );
}
