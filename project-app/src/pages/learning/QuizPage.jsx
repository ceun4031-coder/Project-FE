// src/pages/quiz/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

import Button from "../../components/common/Button";
import "./QuizPage.css";

// API 모듈
import { fetchQuizzes, submitQuizResult } from "../../api/quizApi";

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1️⃣ URL 파라미터 파싱 및 레벨 검증
  const source = searchParams.get("source"); // "quiz" | "wrong-note"
  const limit = searchParams.get("limit") || 10;

  const rawLevel = searchParams.get("level");
  const level = rawLevel === "all" || !rawLevel ? "1" : rawLevel;

  // 모드 판별
  const isWrongMode = source === "wrong-note";

  // 상태 관리
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2️⃣ 퀴즈 데이터 가져오기
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          `📡 데이터 요청: 모드=${source}, 문항수=${limit}, 난이도=${level}`
        );

        const data = await fetchQuizzes({
          source,
          limit: Number(limit),
          level,
        });

        if (!data || data.length === 0) {
          throw new Error("풀 수 있는 문제가 없습니다.");
        }

        setQuestions(data);
      } catch (err) {
        console.error("❌ 퀴즈 로드 실패:", err);
        setError("문제를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [source, limit, level]);

  // 정답 선택 핸들러
  const handleOptionClick = (index) => {
    if (selectedOption !== null) return;

    setSelectedOption(index);
    if (index === questions[currentIndex].answer) {
      setScore((prev) => prev + 1);
    }
  };

  // 3️⃣ 다음 문제 이동 및 결과 전송
 const handleNext = async () => {
  if (selectedOption === null) return;

  if (currentIndex + 1 < questions.length) {
    // 다음 문제로 이동
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
  } else {
    // 마지막 문제 → 이미 handleOptionClick 에서 점수 계산됨
    try {
      await submitQuizResult({
        mode: isWrongMode ? "wrong" : "normal",
        score: score,               
        total: questions.length,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("❌ 결과 전송 실패:", err);
    }

    setIsFinished(true);            
  }
};


  // ─── 화면 렌더링 ───

  // 로딩
  if (isLoading) {
    return <div className="loading-screen">퀴즈를 불러오는 중입니다...</div>;
  }

  // 에러
  if (error) {
    return (
      <div className="error-screen">
        <AlertCircle size={48} className="mb-4" color="var(--danger-500)" />
        <h3>오류 발생</h3>
        <p className="mt-12">{error}</p>
        <div className="mt-24">
          <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  const themeClass = isWrongMode ? "theme-orange" : "";

  return (
    <div className={`quiz-page-wrapper ${themeClass}`}>
      <div className="quiz-container">
        {/* 헤더 영역 */}
        <header className="quiz-header">
          <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/learning")}
          aria-label="뒤로 가기"
          style={{ padding: "8px" }}
        >
          <ArrowLeft size={20} />
        </Button>
          <div className="quiz-title">
            {isWrongMode ? "오답 퀴즈" : "실전 퀴즈"}
            <span className="quiz-badge">
              {isWrongMode ? "복습" : `Lv.${level}`}
            </span>
          </div>
          <div style={{ width: "40px" }} />
        </header>

        {/* 퀴즈 진행 화면 */}
        {!isFinished ? (
          <div className="quiz-content">
            {/* 진행 상태 바 */}
            <div className="progress-area">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      ((currentIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="progress-text">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            {/* 문제 텍스트 */}
            <div className="question-section">
              <h2 className="question-text">
                {questions[currentIndex].question}
              </h2>
            </div>

            {/* 보기 버튼 영역 */}
            <div className="options-grid">
              {questions[currentIndex].options.map((option, idx) => {
                const currentQ = questions[currentIndex];

                const cardClass = clsx("option-card", {
                  correct:
                    selectedOption !== null && idx === currentQ.answer,
                  wrong:
                    selectedOption !== null &&
                    idx === selectedOption &&
                    idx !== currentQ.answer,
                  disabled:
                    selectedOption !== null &&
                    idx !== currentQ.answer &&
                    idx !== selectedOption,
                });

                return (
                  <button
                    key={idx}
                    className={cardClass}
                    onClick={() => handleOptionClick(idx)}
                    disabled={selectedOption !== null}
                  >
                    <span className="option-number">{idx + 1}</span>
                    <span className="option-text">{option}</span>

                    {selectedOption !== null && idx === currentQ.answer && (
                      <CheckCircle2
                        className="result-icon correct"
                        size={20}
                      />
                    )}
                    {selectedOption !== null &&
                      idx === selectedOption &&
                      idx !== currentQ.answer && (
                        <XCircle className="result-icon wrong" size={20} />
                      )}
                  </button>
                );
              })}
            </div>

            {/* 다음 버튼 */}
            <div className="mt-24">
              {selectedOption !== null && (
                <Button
                  variant="primary"
                  full
                  size="lg"
                  onClick={handleNext}
                >
                  {currentIndex + 1 === questions.length
                    ? "결과 보기"
                    : "다음 문제"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          // 결과 화면
          <div className="result-section">
            <div className="score-circle">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  lineHeight: 1,
                }}
              >
                <span className="score-number">{score}</span>
                <span className="score-total">/ {questions.length}</span>
              </div>
            </div>
            <h3>
              {score === questions.length ? "완벽해요! 🎉" : "수고하셨어요!"}
            </h3>
            <p className="result-msg">
              {isWrongMode
                ? "틀린 문제를 다시 한번 확인해보세요."
                : "오늘의 학습 목표를 달성했습니다."}
            </p>
            <div className="result-actions">
              <Button
                variant="secondary"
                full
                size="lg"
                onClick={() =>
                  navigate("/stories/create", {
                    state: {
                      from: "quiz",
                      mode: isWrongMode ? "wrong" : "normal",
                      score,
                      total: questions.length,
                    },
                  })
                }
              >
                AI 스토리 생성하기
              </Button>

              <Button
                variant="primary"
                full
                size="lg"
                onClick={() => navigate("/learning")}
              >
                학습 홈으로 이동
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;