// src/pages/learning/components/LearningResultSection.jsx
import React from "react";
import "./LearningResultSection.css";

/**
 * 학습 결과 공통 레이아웃
 *
 * - 왼쪽: 헷갈린 단어 리스트
 * - 오른쪽: 통계 카드 (상단 2개 + 하단 1개)
 * - 하단: 액션 버튼 (secondary, primary)
 *
 * ProgressBar는 상위에서 생성해서 primaryProgress / secondaryProgress로 넘긴다.
 */
export function LearningResultSection({
  // 헷갈린 단어 카드
  unknownTitle,
  unknownSubtitle,
  emptyUnknownMessage,
  unknownItems,
  maxUnknownDisplay = 20,
  getUnknownKey,
  getUnknownWord,
  getUnknownMeaning,
  getUnknownMetaTags,
  buildMoreHintMessage,

  // 통계 카드(직접 값 전달 방식)
  primaryLabel,
  primaryValue,
  primaryProgress,
  primaryValueClassName = "stat-known",
  secondaryLabel,
  secondaryValue,
  secondaryProgress,
  secondaryValueClassName = "stat-unknown",
  extraLabel,
  extraValue,

  // 통계 카드(카운트만 전달하는 간단 방식)
  knownCount,
  unknownCount,
  total,

  // 버튼
  primaryButtonLabel,
  onPrimaryButtonClick,
  secondaryButtonLabel,
  onSecondaryButtonClick,
}) {
  // -----------------------------
  // 1) 헷갈린 단어 리스트 기본값 처리
  // -----------------------------
  const items = Array.isArray(unknownItems) ? unknownItems : [];
  const limited = items.slice(0, maxUnknownDisplay);
  const restCount =
    items.length > maxUnknownDisplay ? items.length - maxUnknownDisplay : 0;

  const resolvedUnknownTitle =
    unknownTitle ?? "헷갈렸던 단어";

  const resolvedUnknownSubtitle =
    unknownSubtitle ?? "";

  const resolvedEmptyUnknownMessage =
    emptyUnknownMessage ??
    "이번 학습에서 헷갈린 단어 없이 잘 학습했어요!";

  // 기본 getter들
  const defaultGetUnknownKey = (item, index) =>
    item.id ?? item.wordId ?? index;

  const defaultGetUnknownWord = (item) =>
    item.word ??
    item.frontText ??
    item.baseWord ??
    "";

  const defaultGetUnknownMeaning = (item) =>
    item.meaningKo ??
    item.meaning ??
    item.backText ??
    "";

  const defaultGetUnknownMetaTags = (item) => {
    const tags = [];
    if (item.level !== undefined && item.level !== null) {
      tags.push(`Lv.${item.level}`);
    }
    if (item.partOfSpeech) {
      tags.push(item.partOfSpeech);
    }
    if (item.category) {
      tags.push(item.category);
    }
    return tags;
  };

  const keyGetter = getUnknownKey || defaultGetUnknownKey;
  const wordGetter = getUnknownWord || defaultGetUnknownWord;
  const meaningGetter = getUnknownMeaning || defaultGetUnknownMeaning;
  const metaGetter = getUnknownMetaTags || defaultGetUnknownMetaTags;

  // -----------------------------
  // 2) 통계 카드 기본값 처리
  //    - primaryLabel/Value 등이 직접 넘어오면 그걸 우선 사용
  //    - 없으면 knownCount / unknownCount / total 기준으로 기본 값 생성
  // -----------------------------
  const hasKnown = typeof knownCount === "number";
  const hasUnknown = typeof unknownCount === "number";
  const hasTotal = typeof total === "number";

  const resolvedPrimaryLabel =
    primaryLabel ??
    (hasKnown ? "알았다로 표시한 단어" : "");

  const resolvedPrimaryValue =
    primaryValue ??
    (hasKnown ? `${knownCount}개` : "");

  const resolvedSecondaryLabel =
    secondaryLabel ??
    (hasUnknown ? "몰랐다로 표시한 단어" : "");

  const resolvedSecondaryValue =
    secondaryValue ??
    (hasUnknown ? `${unknownCount}개` : "");

  const resolvedExtraLabel =
    extraLabel ??
    (hasTotal ? "총 학습 단어 수" : "");

  const resolvedExtraValue =
    extraValue ??
    (hasTotal ? `${total}개` : "");

  return (
    <>
      {/* 좌/우 카드 그리드 */}
      <div className="learning-result-grid">
        {/* 헷갈린 단어 카드 */}
        <section className="learning-unknown-card">
          <div className="unknown-header">
            <h2 className="unknown-title">{resolvedUnknownTitle}</h2>
            {resolvedUnknownSubtitle && (
              <p className="unknown-subtitle">{resolvedUnknownSubtitle}</p>
            )}
          </div>

          {limited.length === 0 ? (
            <p className="unknown-empty">{resolvedEmptyUnknownMessage}</p>
          ) : (
            <ul className="unknown-list">
              {limited.map((item, index) => {
                const key = keyGetter(item, index);
                const word = wordGetter(item);
                const meaning = meaningGetter(item);
                const metaTags = metaGetter(item) || [];

                return (
                  <li className="unknown-item" key={key}>
                    <div className="unknown-main">
                      <span className="unknown-word">{word}</span>
                      {meaning && (
                        <span className="unknown-meaning">{meaning}</span>
                      )}
                    </div>

                    {metaTags.length > 0 && (
                      <div className="unknown-meta">
                        {metaTags.map((tag, i) => (
                          <span key={i} className="unknown-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {restCount > 0 && (
            <p className="unknown-more-hint">
              {buildMoreHintMessage
                ? buildMoreHintMessage(restCount)
                : `그 외 ${restCount}개 단어는 오답 노트에서 계속 확인할 수 있어요.`}
            </p>
          )}
        </section>

        {/* 통계 카드 */}
        <section className="stats-card">
          {(resolvedPrimaryLabel || resolvedPrimaryValue) && (
            <>
              <div className="stat-row">
                <span className="stat-label">{resolvedPrimaryLabel}</span>
                <span className={`stat-value ${primaryValueClassName}`}>
                  {resolvedPrimaryValue}
                </span>
              </div>
              {primaryProgress && primaryProgress}
            </>
          )}

          {(resolvedSecondaryLabel || resolvedSecondaryValue) && (
            <>
              <div className="stat-row">
                <span className="stat-label">{resolvedSecondaryLabel}</span>
                <span className={`stat-value ${secondaryValueClassName}`}>
                  {resolvedSecondaryValue}
                </span>
              </div>
              {secondaryProgress && secondaryProgress}
            </>
          )}

          {resolvedExtraLabel && resolvedExtraValue && (
            <div className="stat-row simple">
              <span className="stat-label">{resolvedExtraLabel}</span>
              <span className="stat-value">{resolvedExtraValue}</span>
            </div>
          )}
        </section>
      </div>

      {/* 액션 버튼 (공통 스타일: result-btn 사용) */}
      {(primaryButtonLabel || secondaryButtonLabel) && (
        <div className="result-buttons result-buttons--inline">
          {secondaryButtonLabel && onSecondaryButtonClick && (
            <button
              type="button"
              className="result-btn secondary"
              onClick={onSecondaryButtonClick}
            >
              {secondaryButtonLabel}
            </button>
          )}

          {primaryButtonLabel && onPrimaryButtonClick && (
            <button
              type="button"
              className="result-btn primary"
              onClick={onPrimaryButtonClick}
            >
              {primaryButtonLabel}
            </button>
          )}
        </div>
      )}
    </>
  );
}
