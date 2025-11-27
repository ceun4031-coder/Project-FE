// pages/word/components/WordCard.jsx
import "./WordCard.css";

function WordCard({ word, isExpanded, onToggleFavorite, onToggleComplete }) {
  return (
    <div className={`word-card ${isExpanded ? "expanded" : ""}`}>
      <div className="word-card-header">
        <div className="word-main">
          <div className="word-title-row">
            <h3 className="word-text">{word.word}</h3>
            {/* 펼치기 아이콘 */}
            <span className={`expand-icon ${isExpanded ? "open" : ""}`}>
              ▾
            </span>
          </div>

          <div className="word-meta">
            <span className="badge pos">{word.partOfSpeech}</span>
            <span className="badge domain">
              {word.domain || word.category}
            </span>
            <span className="badge level">{`Lv.${word.level}`}</span>
          </div>
        </div>

        <div className="word-actions">
          {/* 즐겨찾기 토글 */}
          <button
            type="button"
            className={`fav-icon ${word.isFavorite ? "on" : ""}`}
            onClick={onToggleFavorite}
            aria-pressed={word.isFavorite}
            aria-label={word.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            {word.isFavorite ? "⭐" : "☆"}
          </button>

          {/* 학습 상태 토글 버튼 */}
          <button
            type="button"
            className={`status-toggle-btn ${
              word.isCompleted ? "done" : "learning"
            }`}
            onClick={onToggleComplete}
          >
            {word.isCompleted ? "완료 취소" : "학습 완료"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="word-card-body">
          {word.meaning && (
            <p className="word-meaning">{word.meaning}</p>
          )}
          {word.exampleSentence && (
            <p className="word-example">"{word.exampleSentence}"</p>
          )}
        </div>
      )}

      {/* 펼치기/접기 힌트 영역 */}
      <div className={`card-expand-hint ${isExpanded ? "open" : ""}`}>
        <span className="hint-text">
          {isExpanded ? "자세히 보기 접기" : "의미/예문 자세히 보기"}
        </span>
        <span className="hint-icon">{isExpanded ? "▲" : "▼"}</span>
      </div>
    </div>
  );
}

export default WordCard;
