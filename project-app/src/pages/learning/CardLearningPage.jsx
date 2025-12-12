// src/pages/learning/CardLearningPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, Circle } from "lucide-react";

import { Flashcard } from "./components/Flashcard";
import { ProgressBar } from "./components/ProgressBar";
import "./CardLearningPage.css";

import { fetchCardItems, submitCardResult } from "../../api/cardApi";

import { LearningProgressHeader } from "../learning/components/LearningProgressHeader";
import { LearningResultSection } from "../learning/components/LearningResultSection";

// ✅ 공통 스피너
import Spinner from "../../components/common/Spinner";

const MAX_UNKNOWN_DISPLAY = 20;

export default function CardLearningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "card";
  const wordIdsParam = searchParams.get("wordIds");
  const wordIds = wordIdsParam
    ? wordIdsParam
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  const limit = Number(searchParams.get("limit") || 20);

  // UI 표시용
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

  // 레벨(level)
  const rawLevel = searchParams.get("level");
  const rawLevelLower = rawLevel ? rawLevel.toLowerCase() : null;

  const levelLabel =
    !rawLevelLower || rawLevelLower === "all" ? "All" : rawLevel;

  // 최종 라벨 텍스트
  const badgeText = `${domainLabel} | Lv.${levelLabel}`;

  const isWrongMode = source === "wrong-note";

  // API용
  const apiLevel = rawLevel === "All" ? undefined : rawLevel;
  const apiCategory = rawDomain === "All" ? undefined : rawDomain;

  // 상태값
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [unknownWords, setUnknownWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const total = cards.length;
  const current = cards[currentIndex] || null;

  const pageClassName = [
    "card-page",
    isWrongMode ? "card-page--wrong" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const learningSectionClass = [
    "card-learning",
    isWrongMode ? "card-learning--wrong" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const resultSectionClass = [
    "card-learning-result",
    isWrongMode ? "card-learning-result--wrong" : null,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    let cancelled = false;

    const loadCards = async () => {
      setLoading(true);

      try {
        const data = await fetchCardItems({
          source,
          wordIds,
          limit,
          level: apiLevel,
          category: apiCategory,
        });

        if (cancelled) return;

        setCards(data || []);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCount(0);
        setUnknownCount(0);
        setUnknownWords([]);
        setIsFinished(false);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "❌ 카드 로드 실패:",
          err.response?.status,
          err.response?.data || err.message
        );
        // 실패 시 이전 카드 잔상 방지
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCount(0);
        setUnknownCount(0);
        setUnknownWords([]);
        setIsFinished(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCards();

    return () => {
      cancelled = true;
    };
  }, [source, wordIdsParam, limit, apiLevel, apiCategory]);

  // ✅ 로딩 화면(스피너 적용)
  if (loading) {
    return (
      <div className={pageClassName}>
        <section className={learningSectionClass}>
          <LearningProgressHeader
            title={isWrongMode ? "오답 카드 학습" : "카드 학습"}
            subtitle="학습 카드를 불러오는 중입니다."
            badgeLabel={badgeText}
            badgeVariant={isWrongMode ? "orange" : "purple"}
            showBackButton
            onBack={() => navigate("/learning")}
          />
          <div className="cl-main">
            <Spinner fullHeight={false} message="카드 준비 중..." />
          </div>
        </section>
      </div>
    );
  }

  // 카드가 하나도 없을 때
  if (!loading && total === 0) {
    return (
      <div className={pageClassName}>
        <section className={learningSectionClass}>
          <LearningProgressHeader
            title={isWrongMode ? "오답 카드 학습" : "카드 학습"}
            subtitle="학습할 카드가 없습니다. 조건을 바꿔 다시 시도해 보세요."
            badgeLabel={badgeText}
            badgeVariant={isWrongMode ? "orange" : "purple"}
            showBackButton
            onBack={() => navigate("/learning")}
          />
          <div className="cl-empty">현재 조건에 맞는 학습 카드가 없습니다.</div>
        </section>
      </div>
    );
  }

  const handleAnswer = async (result) => {
    if (!current) return;

    const wordId = current.wordId;
    if (!wordId) {
      console.error("❌ wordId 없음!", current);
      return;
    }

    // 통계 계산
    if (result === "known") {
      setKnownCount((v) => v + 1);
    } else {
      setUnknownCount((v) => v + 1);
    }

    // unknown 기록 저장
    if (result === "unknown") {
      setUnknownWords((prev) => {
        if (prev.some((w) => w.wordId === wordId)) return prev;

        return [
          ...prev,
          {
            wordId,
            word: current.frontText,
            meaning: current.backText,
            level: current.level,
          },
        ];
      });
    }

    // 서버 반영
    try {
      await submitCardResult({ wordId, result });
    } catch (err) {
      console.error("❌ 제출 오류:", err);
    }

    // 다음 카드 이동 또는 종료
    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const accuracy = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return (
    <div className={pageClassName}>
      {!isFinished ? (
        <section className={learningSectionClass}>
          <LearningProgressHeader
            title={isWrongMode ? "오답 카드 학습" : "카드 학습"}
            subtitle={
              isWrongMode
                ? "틀렸던 단어들을 다시 카드로 복습해 보세요."
                : "플래시 카드로 단어를 빠르게 암기해 보세요."
            }
            badgeLabel={badgeText}
            badgeVariant={isWrongMode ? "orange" : "purple"}
            progressText={`${currentIndex + 1} / ${total}`}
            progressVariant={isWrongMode ? "warning" : "primary"}
            progressBar={
              <ProgressBar
                current={currentIndex + 1}
                total={total}
                variant={isWrongMode ? "warning" : "primary"}
                showLabel={false}
                className="lp-progress-bar"
              />
            }
            showBackButton
            onBack={() => navigate("/learning")}
          />

          <div className="cl-main">
            <Flashcard
              front={current?.frontText}
              back={current?.backText}
              isFlipped={isFlipped}
              onToggle={() => setIsFlipped((f) => !f)}
            />

            <footer className="cl-actions actions-ox">
              <button
                className="btn-unknown"
                onClick={() => handleAnswer("unknown")}
              >
                <X size={32} />
              </button>
              <button
                className="btn-known"
                onClick={() => handleAnswer("known")}
              >
                <Circle size={28} strokeWidth={3} />
              </button>
            </footer>
          </div>
        </section>
      ) : (
        <section className={resultSectionClass}>
          <header className="quiz-result-header">
            <h1 className="quiz-result-title">
              {isWrongMode ? "오답 카드 학습 결과" : "카드 학습 결과"}
            </h1>
            <p className="quiz-result-subtitle">
              {isWrongMode
                ? "틀렸던 단어 위주로 다시 정리해 보세요."
                : "이번 카드 학습에서 헷갈렸던 단어를 중심으로 다시 복습해 보세요."}
            </p>
          </header>

          <LearningResultSection
            unknownTitle="이번에 헷갈렸던 단어"
            unknownSubtitle="카드 학습 중 '몰랐다'를 선택한 단어들입니다."
            emptyUnknownMessage="헷갈린 단어 없이 모두 잘 기억하고 있어요."
            unknownItems={unknownWords}
            maxUnknownDisplay={MAX_UNKNOWN_DISPLAY}
            getUnknownKey={(item, index) => item.wordId ?? index}
            getUnknownWord={(item) => item.word || ""}
            getUnknownMeaning={(item) => item.meaning || ""}
            getUnknownMetaTags={(item) => {
              const tags = [];
              if (item.level != null) tags.push(`Lv.${item.level}`);
              return tags;
            }}
            buildMoreHintMessage={(restCount) =>
              `그 외 ${restCount}개 단어는 오답 노트에서 계속 확인할 수 있어요.`
            }
            primaryLabel="기억한 단어"
            primaryValue={`${knownCount}개`}
            primaryProgress={
              <ProgressBar
                value={total > 0 ? (knownCount / total) * 100 : 0}
                variant="primary"
                showLabel={false}
                className="quiz-stat-progress"
              />
            }
            primaryValueClassName="stat-known"
            secondaryLabel="헷갈린 단어"
            secondaryValue={`${unknownCount}개`}
            secondaryProgress={
              <ProgressBar
                value={total > 0 ? (unknownCount / total) * 100 : 0}
                variant="warning"
                showLabel={false}
                className="quiz-stat-progress"
              />
            }
            secondaryValueClassName="stat-unknown"
            extraLabel="정답률"
            extraValue={`${accuracy}%`}
            secondaryButtonLabel="학습 홈으로 이동"
            onSecondaryButtonClick={() => navigate("/learning")}
          />
        </section>
      )}
    </div>
  );
}
