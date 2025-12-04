// src/pages/learning/components/Flashcard.jsx
import React from "react";
import "./Flashcard.css";

export function Flashcard({ front, back, isFlipped, onToggle }) {
  const handleClick = () => {
    if (typeof onToggle === "function") {
      onToggle();
    }
  };

  const hasContent = front || back;

  return (
    <div className="flashcard-shell">
      <div
        className={`flashcard ${isFlipped ? "flashcard--flipped" : ""} no-select`}
        onClick={handleClick}
      >
        {/* 앞면 */}
        <div className="flashcard-inner flashcard-inner--front">
          {!hasContent ? (
            <span className="flashcard-empty-text">불러온 단어가 없습니다.</span>
          ) : (
            <>
              <div className="flashcard-word">{front}</div>
              <div className="flashcard-helper">클릭하여 뜻 확인하기</div>
            </>
          )}
        </div>

        {/* 뒷면 */}
        <div className="flashcard-inner flashcard-inner--back">
          {hasContent && (
            <>
              <div className="flashcard-meaning">{back}</div>
              {front && <div className="flashcard-subword">{front}</div>}
              <div className="flashcard-helper-back">
                다시 클릭하여 카드 뒤집기
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flashcard;