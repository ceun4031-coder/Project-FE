// pages/word/WordListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getWordList,
  addFavorite,
  removeFavorite,
  toggleProgress,
} from "../../api/wordApi";
import "./WordListPage.css";
import WordCard from "../../components/words/WordCard";
import WordFilter from "../../components/words/WordFilter";

const FILTER_INITIAL = {
  category: "All", // 품사
  domain: "All",   // 분야
  level: "All",    // 난이도
};

function WordListPage() {
  // 데이터 상태
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI 상태
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all"); // 'all' | 'favorite' | 'learning' | 'completed'
  const [filter, setFilter] = useState(FILTER_INITIAL);

  // 초기 로딩
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getWordList(1, 100);
        if (cancelled) return;
        setWords(Array.isArray(data.content) ? data.content : data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setError("단어장을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // 즐겨찾기 토글
  const handleToggleFavorite = async (word, e) => {
    e.stopPropagation();

    const originalWords = words;
    const currentStatus = word.isFavorite;

    setWords((prev) =>
      prev.map((w) =>
        w.wordId === word.wordId ? { ...w, isFavorite: !currentStatus } : w
      )
    );

    try {
      if (currentStatus) {
        await removeFavorite(word.wordId);
      } else {
        await addFavorite(word.wordId);
      }
    } catch (err) {
      console.error("즐겨찾기 변경 실패", err);
      setWords(originalWords);
      alert("즐겨찾기 변경 중 오류가 발생했습니다.");
    }
  };

  // 학습 상태 토글
  const handleToggleComplete = async (wordId, e) => {
    e.stopPropagation();

    const originalWords = words;

    setWords((prev) =>
      prev.map((w) =>
        w.wordId === wordId ? { ...w, isCompleted: !w.isCompleted } : w
      )
    );

    try {
      await toggleProgress(wordId);
    } catch (err) {
      console.error("학습 상태 변경 실패", err);
      setWords(originalWords);
      alert("학습 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleCardClick = (wordId) => {
    setExpandedId((prev) => (prev === wordId ? null : wordId));
  };

  const handleModeChange = (type) => setMode(type);

  const resetFilters = () => {
    setFilter(FILTER_INITIAL);
    setSearch("");
  };

  // 파생 상태
  const favoriteCount = useMemo(
    () => words.filter((w) => w.isFavorite).length,
    [words]
  );
  const learningCount = useMemo(
    () => words.filter((w) => !w.isCompleted).length,
    [words]
  );
  const completedCount = useMemo(
    () => words.filter((w) => w.isCompleted).length,
    [words]
  );

  // 1차: 모드(전체/즐겨찾기/학습중/학습완료) 필터
  const modeFilteredWords = useMemo(() => {
    return words.filter((w) => {
      if (mode === "favorite" && !w.isFavorite) return false;
      if (mode === "learning" && w.isCompleted) return false;
      if (mode === "completed" && !w.isCompleted) return false;
      return true;
    });
  }, [words, mode]);

  // 2차: 드롭다운 + 검색 필터
  const filteredWords = useMemo(() => {
    return modeFilteredWords.filter((w) => {
      // 품사
      if (filter.category !== "All" && w.partOfSpeech !== filter.category) {
        return false;
      }

      // 분야 (필드명 맞춰서 domain/category 중 하나 사용)
      if (filter.domain !== "All" && w.domain !== filter.domain) {
        return false;
      }

      // 난이도 (level: number)
      if (filter.level !== "All" && w.level !== filter.level) {
        return false;
      }

      // 검색어
      if (
        search &&
        !w.word.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [modeFilteredWords, filter, search]);

  const isEmptyAll = !loading && !error && words.length === 0;

  return (
    <div className="wordlist-wrapper">
      <h2 className="page-title">나의 단어장</h2>
      <p className="page-sub">저장된 단어들을 관리하고 복습하세요.</p>

      {/* 상단 통계 + 뷰 필터 */}
<div className="stats-row">
  <div className="stats-boxes">
    {/* 전체 단어 */}
    <button
      type="button"
      className={`stats-card mode-all ${mode === "all" ? "active" : ""}`}
      onClick={() => handleModeChange("all")}
    >
      <div className="stats-icon-box purple">📘</div>
      <div className="stats-text">
        <span className="stats-label">전체 단어</span>
        <span className="stats-count">{words.length}</span>
      </div>
    </button>

    {/* 즐겨찾기 */}
    <button
      type="button"
      className={`stats-card mode-favorite ${
        mode === "favorite" ? "active" : ""
      }`}
      onClick={() => handleModeChange("favorite")}
    >
      <div className="stats-icon-box yellow">⭐</div>
      <div className="stats-text">
        <span className="stats-label">즐겨찾기</span>
        <span className="stats-count">{favoriteCount}</span>
      </div>
    </button>

    {/* 학습중 */}
    <button
      type="button"
      className={`stats-card mode-learning ${
        mode === "learning" ? "active" : ""
      }`}
      onClick={() => handleModeChange("learning")}
    >
      <div className="stats-icon-box blue">📖</div>
      <div className="stats-text">
        <span className="stats-label">학습중</span>
        <span className="stats-count">{learningCount}</span>
      </div>
    </button>

    {/* 학습완료 */}
    <button
      type="button"
      className={`stats-card mode-completed ${
        mode === "completed" ? "active" : ""
      }`}
      onClick={() => handleModeChange("completed")}
    >
      <div className="stats-icon-box green">✅</div>
      <div className="stats-text">
        <span className="stats-label">학습완료</span>
        <span className="stats-count">{completedCount}</span>
      </div>
    </button>
  </div>
</div>

      {/* 필터 / 검색 */}
      <div className="filter-search-row">
        <WordFilter filter={filter} setFilter={setFilter} />

        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="단어 검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="card-section">
        {loading && (
          <div className="loading-msg">단어장을 불러오는 중입니다… ⏳</div>
        )}

        {!loading && error && (
          <div className="error-msg">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && isEmptyAll && (
          <div className="empty-msg">
            <p>저장된 단어가 없습니다. 먼저 단어를 추가해 보세요. 📭</p>
          </div>
        )}

        {!loading && !error && !isEmptyAll && (
          <div className="card-grid">
            {filteredWords.length > 0 ? (
              filteredWords.map((w) => (
                <div key={w.wordId} onClick={() => handleCardClick(w.wordId)}>
                  <WordCard
                    word={w}
                    isExpanded={expandedId === w.wordId}
                    onToggleFavorite={(e) => handleToggleFavorite(w, e)}
                    onToggleComplete={(e) => handleToggleComplete(w.wordId, e)}
                  />
                </div>
              ))
            ) : (
              <div className="empty-msg">
                <p>조건에 맞는 단어가 없습니다. 🍂</p>
                <button className="reset-btn" onClick={resetFilters}>
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WordListPage;
