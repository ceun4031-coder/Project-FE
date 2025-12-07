// src/pages/learning/CardLearningPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Circle } from "lucide-react";

import { useLearningEngine } from "./hooks/useLearningEngine";
import { Flashcard } from "./components/Flashcard";
import { ProgressBar } from "./components/ProgressBar";
import "./CardLearningPage.css";

import { LearningProgressHeader } from "../learning/components/LearningProgressHeader";
import { LearningResultSection } from "../learning/components/LearningResultSection";

const MAX_UNKNOWN_DISPLAY = 20;

export default function CardLearningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "card";
  const clusterId = searchParams.get("clusterId") || undefined;
  const wordIdsParam = searchParams.get("wordIds");
  const wordIds = wordIdsParam
    ? wordIdsParam.split(",").map((x) => Number(x))
    : undefined;
  const limit = Number(searchParams.get("limit") || 20);
  const rawLevel = searchParams.get("level");
  const levelLabel = rawLevel === "all" || !rawLevel ? "All" : rawLevel;
  const {
    current,
    currentIndex,
    total,
    loading,
    error,
    isFinished,
    isFlipped,
    knownCount,
    unknownCount,
    toggleFlip,
    markKnown,
    markUnknown,
    // hook에서 지원하면 사용, 아니면 기본값 빈 배열
    unknownWords = [],
  } = useLearningEngine({
    mode: "card",
    source,
    wordIds,
    clusterId,
    limit,
  });

  const isWrongMode = source === "wrong-note";
  const [animateBars, setAnimateBars] = useState(false);

  // 결과 화면 진행 막대 애니메이션
  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(() => setAnimateBars(true), 50);
      return () => clearTimeout(id);
    }
    setAnimateBars(false);
  }, [isFinished]);

  const safeTotal = total || 1;
  const displayIndex = total > 0 ? Math.min(currentIndex + 1, total) : 0;
  const unknownWordsSafe = Array.isArray(unknownWords) ? unknownWords : [];

  const pageClassName = [
    "card-page",
    isWrongMode ? "card-page--wrong" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const handleGoHome = () => {
    navigate("/learning");
  };

const handleGoQuiz = () => {
  const quizSource = source === "wrong-note" ? "wrong-note" : "quiz";

  const params = new URLSearchParams();
  params.set("source", quizSource);
  params.set("limit", String(limit));     // ★ 카드에서 사용하던 문항 수 그대로
  if (rawLevel) {
    params.set("level", rawLevel);        // ★ 선택된 난이도 그대로
  }

  navigate(`/learning/quiz?${params.toString()}`);
};


  if (loading) {
    return <div className="card-page card-page--loading">로딩 중...</div>;
    
  }

  if (error) {
    return (
      <div className="card-page card-page--error">
        카드 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  const resultTitle = isWrongMode ? "오답 카드 학습 완료" : "카드 학습 완료";
  const resultSubtitle = isWrongMode
    ? "이번에 헷갈렸던 단어들을 위주로 다시 확인해보세요."
    : "알았던 단어와 모르는 단어를 나눠서 한 번 더 점검해보면 좋습니다.";

  return (
    <div className={pageClassName}>
      {/* 진행 중 화면 */}
      {!isFinished ? (
        <section
          className={[
            "card-learning",
            isWrongMode ? "card-learning--wrong" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* 상단 진행 헤더 */}
          <LearningProgressHeader
            title={isWrongMode ? "오답 카드 학습" : "카드 학습"}
            subtitle={
              isWrongMode
                ? "틀렸던 단어들만 골라 카드를 뒤집으며 복습합니다."
                : "플래시 카드로 암기하고 퀴즈로 확인하세요."
            }
              badgeLabel={`Lv.${levelLabel}`}
            badgeVariant={isWrongMode ? "orange" : "purple"}
            showBackButton
            onBack={handleGoHome}
            progressText={`${displayIndex} / ${total}`}
            progressVariant={isWrongMode ? "warning" : "primary"}
            progressBar={
              <ProgressBar
                current={displayIndex}
                total={safeTotal}
                variant={isWrongMode ? "warning" : "primary"}
                showLabel={false}
                className="lp-progress-bar"
              />
            }
          />

          {/* 플래시카드 + OX 버튼 */}
          <div className="cl-main">
            <Flashcard
              front={current?.frontText}
              back={current?.backText}
              isFlipped={isFlipped}
              onToggle={toggleFlip}
            />

            <footer className="cl-actions actions-ox">
              <button
                type="button"
                className="btn-unknown"
                onClick={markUnknown}
                aria-label="모르겠다"
              >
                <X size={32} />
              </button>

              <button
                type="button"
                className="btn-known"
                onClick={markKnown}
                aria-label="알겠다"
              >
                <Circle size={28} strokeWidth={3} />
              </button>
            </footer>
          </div>
        </section>
      ) : (
        // 결과 화면
        <section
          className={[
            "card-learning-result",
            isWrongMode ? "card-learning--wrong" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* 상단 제목/설명 */}
          <header className="cl-header">
            <h1 className="cl-title">{resultTitle}</h1>
            <p className="cl-subtitle">{resultSubtitle}</p>
          </header>

          {/* 공통 결과 섹션 사용 */}
          <LearningResultSection
            // 헷갈린 단어 카드
            unknownTitle="헷갈린 단어"
            unknownSubtitle='이번 학습에서 "모르겠다"로 표시한 단어들입니다.'
            emptyUnknownMessage="헷갈린 단어 없이 모두 알고 있었어요."
            unknownItems={unknownWordsSafe}
            maxUnknownDisplay={MAX_UNKNOWN_DISPLAY}
            getUnknownKey={(w, i) => w.wordId ?? w.id ?? w.text ?? i}
            getUnknownWord={(w) => w.text || w.word || ""}
            getUnknownMeaning={(w) =>
              w.meaning || w.korean || w.meaningKo || ""
            }
            getUnknownMetaTags={(w) => {
              const tags = [];
              const pos = w.partOfSpeech || w.pos;
              if (pos) tags.push(pos);
              if (w.level) tags.push(`Lv.${w.level}`);
              return tags;
            }}
            buildMoreHintMessage={(restCount) =>
              `그 외 ${restCount}개 단어는 오답 노트에서 계속 확인할 수 있어요.`
            }
            // 통계 카드
            primaryLabel="알았다"
            primaryValue={`${knownCount}개`}
            primaryProgress={
              <ProgressBar
                value={animateBars ? (knownCount / safeTotal) * 100 : 0}
                variant="primary"
                showLabel={false}
                className="stat-progress"
              />
            }
            primaryValueClassName="stat-known"
            secondaryLabel="모르겠다"
            secondaryValue={`${unknownCount}개`}
            secondaryProgress={
              <ProgressBar
                value={animateBars ? (unknownCount / safeTotal) * 100 : 0}
                variant="warning"
                showLabel={false}
                className="stat-progress"
              />
            }
            secondaryValueClassName="stat-unknown"
            extraLabel="총 학습 단어"
            extraValue={`${total}개`}
            // 버튼
            primaryButtonLabel={
              isWrongMode ? "오답 퀴즈 풀기" : "실전 퀴즈 풀기"
            }
            onPrimaryButtonClick={handleGoQuiz}
            secondaryButtonLabel="학습 홈으로 이동"
            onSecondaryButtonClick={handleGoHome}
          />
        </section>
      )}
    </div>
  );
}
