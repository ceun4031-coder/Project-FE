// src/pages/quiz/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { ProgressBar } from "./components/ProgressBar";
import { QuizQuestion } from "./components/QuizQuestion";
import "./QuizPage.css";

import { fetchQuizzes, submitQuizResult } from "../../api/quizApi";

import { LearningProgressHeader } from "../learning/components/LearningProgressHeader";
import { LearningResultSection } from "../learning/components/LearningResultSection";

const MAX_WRONG_DISPLAY = 20;

// 문제 객체에서 단어만 추출
const extractWordFromQuestion = (q) => {
  if (!q) return "";

  if (typeof q.word === "string" && q.word.trim().length > 0) {
    return q.word.trim();
  }

  const src =
    (typeof q.question === "string" && q.question) ||
    (typeof q.questionText === "string" && q.questionText) ||
    "";

  if (!src) return "";

  const singleMatch = src.match(/'([^']+)'/);
  if (singleMatch && singleMatch[1]) {
    return singleMatch[1].trim();
  }

  const doubleMatch = src.match(/"([^"]+)"/);
  if (doubleMatch && doubleMatch[1]) {
    return doubleMatch[1].trim();
  }

  return src
    .split(/\s+/)[0]
    .replace(/^[\[\(]+/, "")
    .replace(/[\]\)\?:]+$/, "")
    .trim();
};

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source = searchParams.get("source") || "quiz"; // "quiz" | "wrong-note"
  const limit = searchParams.get("limit") || 10;

  // 레벨
  const rawLevel = searchParams.get("level");
  const rawLevelLower = rawLevel ? rawLevel.toLowerCase() : null;
  const levelLabel =
    !rawLevelLower || rawLevelLower === "all" ? "All" : rawLevel;

  // API에 넘길 값: all/null 이면 필터 없음
  const levelForApi =
    !rawLevelLower || rawLevelLower === "all" ? null : rawLevelLower;

  // 분야(domain)
  const rawDomain = searchParams.get("domain") || "All";
  const DOMAIN_LABEL_MAP = {
    All: "전체 분야",
    "Daily Life": "일상생활",
    "People & Feelings": "사람/감정",
    Business: "직장/비즈니스",
    "School & Learning": "학교/학습",
    Travel: "여행/교통",
    "Food & Health": "음식/건강",
    Technology: "기술/IT",
  };
  const domainLabel = DOMAIN_LABEL_MAP[rawDomain] || rawDomain;

  // 배지에 찍을 텍스트
  const badgeText = `${domainLabel} | Lv.${levelLabel}`;

  // 선택된 단어 id들 (오답노트/카드 결과에서 넘어온 경우)
  const wordIdsParam = searchParams.get("wordIds");
  const wordIds = wordIdsParam
    ? wordIdsParam
        .split(",")
        .map((x) => Number(x))
        .filter((n) => !Number.isNaN(n))
    : undefined;

  const isWrongMode = source === "wrong-note";

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrongQuizWords, setWrongQuizWords] = useState([]);

  // 각 문항 정답 여부 기록: [{ wordId, correct }]
  const [answerResults, setAnswerResults] = useState([]);

  const [animateBars, setAnimateBars] = useState(false);

  // 결과 화면 막대 애니메이션 제어
  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(() => setAnimateBars(true), 60);
      return () => clearTimeout(id);
    }
    setAnimateBars(false);
  }, [isFinished]);

  // 퀴즈 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchQuizzes({
          source,
          limit: Number(limit),
          level: levelForApi,
          wordIds,
        });

        if (!data || data.length === 0) {
          throw new Error("풀 수 있는 문제가 없습니다.");
        }

        setQuestions(data);
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsFinished(false);
        setWrongQuizWords([]);
        setAnswerResults([]);
      } catch (err) {
        console.error("❌ 퀴즈 로드 실패:", err.response?.data || err);
        setError("문제를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // wordIdsParam 이 바뀌면 다시 로드
  }, [source, limit, levelForApi, wordIdsParam]);

  const wrapperClassName = [
    "quiz-page-wrapper",
    isWrongMode ? "quiz-page-wrapper--wrong" : null,
  ]
    .filter(Boolean)
    .join(" ");

  // 로딩
  if (isLoading) {
    return (
      <div className={wrapperClassName}>
        <div className="quiz-layout">
          <Spinner fullHeight={true} message="퀴즈를 불러오는 중입니다..." />
        </div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className={wrapperClassName}>
        <div className="quiz-layout">
          <div className="quiz-page quiz-page--error">
            <AlertCircle size={40} className="quiz-error-icon" />
            <h3>오류 발생</h3>
            <p>{error}</p>
            <div className="quiz-error-actions">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(-1)}
              >
                뒤로 가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const themeClass = isWrongMode ? "quiz-page--wrong" : "";
  const totalCount = questions.length || 1;
  const currentStep = Math.min(currentIndex + 1, totalCount);
  const incorrectCount = totalCount - score;
  const accuracy =
    totalCount > 0 ? Math.round((score / totalCount) * 100) : 0;

  const isAnswered = selectedOption !== null;
  const currentQuestion = !isFinished ? questions[currentIndex] : null;

  const resultTitle = isWrongMode ? "오답 퀴즈 결과" : "퀴즈 결과";
  const resultSubtitle = isWrongMode
    ? "이번에 틀린 문제를 기준으로 약한 단어를 다시 정리해 보세요."
    : "이번 퀴즈에서 헷갈렸던 단어를 중심으로 한 번 더 복습해 보세요.";

  const wrongSafe = Array.isArray(wrongQuizWords) ? wrongQuizWords : [];

  // 선택지 클릭
const handleOptionClick = (choiceIndex) => {
  if (selectedOption !== null) return;

  const currentQ = questions[currentIndex];
  const isCorrect = choiceIndex === currentQ.answer;

  setSelectedOption(choiceIndex);

  if (isCorrect) {
    setScore((prev) => prev + 1);
  } else {
    setWrongQuizWords((prev) => {
      const wordText = extractWordFromQuestion(currentQ);
      const normalized = (wordText || "").trim();
      if (!normalized) return prev;

      const lower = normalized.toLowerCase();
      if (prev.some((w) => w.text.toLowerCase() === lower)) {
        return prev;
      }

      // 1) 백엔드에서 온 meaning 계열
      const meaningFromApi =
        currentQ.meaningKo ||
        currentQ.meaning_ko ||
        currentQ.meaning ||
        currentQ.korean ||
        "";

      // 2) 정답 보기 (보통 뜻이 들어있음)
      const correctOptionText = Array.isArray(currentQ.options)
        ? currentQ.options[currentQ.answer] ?? ""
        : "";

      const finalMeaning = meaningFromApi || correctOptionText || "";

      // 🔹 레벨 값 정리
      const resolvedLevel =
        currentQ.level ??
        currentQ.wordLevel ??
        currentQ.word_level ??
        currentQ.difficulty ??
        currentQ.levelId ??
        rawLevel ?? // URL에서 온 레벨 (필터)
        null;

      const newItem = {
        text: normalized,
        wordId: currentQ.wordId,
        wrongWordId: currentQ.wrongWordId,
        meaning: finalMeaning,
        meaningKo: finalMeaning,
        level: resolvedLevel,
      };

      return [...prev, newItem];
    });
  }

  const resultItem = {
    wordId: currentQ.wordId,
    correct: isCorrect,
  };

  setAnswerResults((prev) => {
    const next = [...prev];
    next[currentIndex] = resultItem;
    return next;
  });
};


  // 다음 문제 / 결과 보기
  const handleNext = async () => {
    if (selectedOption === null) return;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      return;
    }

    // 마지막 문제 → 결과 저장
    try {
      const answersPayload = questions.map((q, idx) => {
        const recorded = answerResults[idx];
        return {
          wordId: q.wordId,
          correct: recorded ? !!recorded.correct : false,
        };
      });

      await submitQuizResult({
        mode: isWrongMode ? "wrong" : "normal",
        answers: answersPayload,
      });
    } catch (err) {
      console.error("❌ 결과 전송 실패:", err.response?.data || err);
    }

    setIsFinished(true);
  };

  // 결과 화면에서 AI 스토리 이동
  const handleGoStory = () => {
    const wrongWordsPayload = wrongSafe
      .filter((w) => w.text && w.text.trim().length > 0)
      .map((w) => ({
        text: w.text.trim(),
        word: w.text.trim(),
        wordId: w.wordId ?? null,
        wrongWordId: w.wrongWordId ?? null,
        meaning:
          w.meaningKo || w.meaning_ko || w.meaning || w.korean || "",
      }));

    navigate("/stories/create", {
      state: {
        from: isWrongMode ? "wrong-quiz" : "quiz",
        mode: isWrongMode ? "wrong" : "normal",
        score,
        total: questions.length,
        wrongWords: wrongWordsPayload,
      },
    });
  };

  const handleGoLearningHome = () => {
    navigate("/learning");
  };

  return (
    <div className={wrapperClassName}>
      <div className="quiz-layout">
        {/* 진행 화면 */}
        {!isFinished && currentQuestion ? (
          <>
            <LearningProgressHeader
              title={isWrongMode ? "오답 퀴즈" : "실전 퀴즈"}
              subtitle={
                isWrongMode
                  ? "틀렸던 단어들만 다시 객관식으로 점검합니다."
                  : "객관식 문제로 오늘 학습한 단어를 한 번 더 확인해 보세요."
              }
              badgeLabel={badgeText}
              badgeVariant={isWrongMode ? "orange" : "purple"}
              showBackButton
              onBack={handleGoLearningHome}
              progressText={`${currentStep} / ${totalCount}`}
              progressVariant={isWrongMode ? "warning" : "primary"}
              progressBar={
                <ProgressBar
                  current={currentStep}
                  total={totalCount}
                  variant={isWrongMode ? "warning" : "primary"}
                  showLabel={false}
                  className="lp-progress-bar"
                />
              }
            />

            <div className={`quiz-page ${themeClass}`}>
              <section className="quiz-learning">
                <main className="quiz-main">
                  <section className="quiz-question-box">
                    <h2 className="quiz-question-text">
                      {currentQuestion.question}
                    </h2>
                  </section>

                  <section className="quiz-options-section">
                    <QuizQuestion
                      question={{
                        choices: currentQuestion.options.map(
                          (text, index) => ({
                            id: index,
                            text,
                          })
                        ),
                        answerId: currentQuestion.answer,
                      }}
                      selectedChoiceId={selectedOption}
                      isAnswered={isAnswered}
                      isCorrect={
                        isAnswered &&
                        selectedOption === currentQuestion.answer
                      }
                      onSelect={handleOptionClick}
                    />
                  </section>

                  <footer className="quiz-footer">
                    {isAnswered && (
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
                  </footer>
                </main>
              </section>
              
            </div>
          </>
        ) : (
          // 결과 화면
          <section className="quiz-learning-result">
            <header className="quiz-result-header">
              <h1 className="quiz-result-title">{resultTitle}</h1>
              <p className="quiz-result-subtitle">{resultSubtitle}</p>
            </header>

            <LearningResultSection
              unknownTitle="이번에 헷갈렸던 단어"
              unknownSubtitle="이번 퀴즈에서 틀린 문제에 등장한 단어들입니다."
              emptyUnknownMessage="헷갈린 단어 없이 모두 정확히 맞혔어요."
              unknownItems={wrongSafe}
              maxUnknownDisplay={MAX_WRONG_DISPLAY}
              getUnknownKey={(w, i) => w.wordId ?? w.text ?? i}
              getUnknownWord={(w) => w.text || w.word || ""}
              getUnknownMeaning={(w) =>
                w.meaningKo ||
                w.meaning_ko ||
                w.meaning ||
                w.korean ||
                ""
              }
                getUnknownMetaTags={(w) => {
    const tags = [];
    if (w.level != null && w.level !== "") {
      tags.push(`Lv.${w.level}`);
    }
    return tags;
  }}
              buildMoreHintMessage={(restCount) =>
                `그 외 ${restCount}개 단어는 오답 노트에서 계속 확인할 수 있어요.`
              }
              primaryLabel="맞은 문제"
              primaryValue={`${score}문제`}
              primaryProgress={
                <ProgressBar
                  value={
                    animateBars ? (score / (totalCount || 1)) * 100 : 0
                  }
                  variant="primary"
                  showLabel={false}
                  className="quiz-stat-progress"
                />
              }
              primaryValueClassName="stat-known"
              secondaryLabel="틀린 문제"
              secondaryValue={`${incorrectCount}문제`}
              secondaryProgress={
                <ProgressBar
                  value={
                    animateBars
                      ? (incorrectCount / (totalCount || 1)) * 100
                      : 0
                  }
                  variant="warning"
                  showLabel={false}
                  className="quiz-stat-progress"
                />
              }
              secondaryValueClassName="stat-unknown"
              extraLabel="정답률"
              extraValue={`${accuracy}%`}
              primaryButtonLabel="AI 스토리 생성하기"
              onPrimaryButtonClick={handleGoStory}
              secondaryButtonLabel="학습 홈으로 이동"
              onSecondaryButtonClick={handleGoLearningHome}
            />
          </section>
        )}
        
      </div>
      
    </div>
  );
};

export default QuizPage;
