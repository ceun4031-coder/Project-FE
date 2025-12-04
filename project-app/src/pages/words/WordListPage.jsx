// src/pages/words/WordListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  FileQuestion,
  LayoutGrid,
  Star,
  ChevronDown,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  addFavorite,
  getWordList,
  removeFavorite,
  getFavoriteList,
  getCompletedList,
} from "../../api/wordApi";
import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import Card from "../../components/common/Card";
import Spinner from "../../components/common/Spinner";
import "./WordListPage.css";

// --- 상수 데이터 (기존과 동일) ---
const CATEGORY_OPTIONS = [
  { label: "전체 품사", value: "All" },
  { label: "명사 (Noun)", value: "Noun" },
  { label: "동사 (Verb)", value: "Verb" },
  { label: "형용사 (Adj)", value: "Adj" },
  { label: "부사 (Adv)", value: "Adv" },
];

const DOMAIN_OPTIONS = [
  { label: "전체 분야", value: "All" },
  { label: "일상생활", value: "Daily Life" },
  { label: "사람/감정", value: "People & Feelings" },
  { label: "직장/비즈니스", value: "Business" },
  { label: "학교/학습", value: "School & Learning" },
  { label: "여행/교통", value: "Travel" },
  { label: "음식/건강", value: "Food & Health" },
  { label: "기술/IT", value: "Technology" },
];

const LEVEL_OPTIONS = [
  { label: "전체 난이도", value: "All" },
  { label: "Lv.1", value: 1 },
  { label: "Lv.2", value: 2 },
  { label: "Lv.3", value: 3 },
  { label: "Lv.4", value: 4 },
  { label: "Lv.5", value: 5 },
  { label: "Lv.6", value: 6 },
];

const FILTER_INITIAL = { category: "All", domain: "All", level: "All" };

function WordListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- 상태 관리 ---
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [filter, setFilter] = useState(FILTER_INITIAL);
  const [sortKey, setSortKey] = useState("default");
  const [openDropdown, setOpenDropdown] = useState(null);

  // --- 데이터 로딩 (기존과 동일) ---
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [wordRes, favoriteRes, completedRes] = await Promise.all([
          getWordList(0, 100),
          getFavoriteList().catch(() => []),
          getCompletedList().catch(() => []),
        ]);

        if (cancelled) return;

        const baseWords = Array.isArray(wordRes?.content)
          ? wordRes.content
          : wordRes || [];

        const favoriteIds = new Set(
          (favoriteRes || []).map((f) => Number(f.wordId))
        );
        const completedIds = new Set(
          (completedRes || []).map((c) => Number(c.wordId))
        );

        const merged = baseWords.map((w) => {
          const id = Number(w.wordId);
          return {
            ...w,
            isFavorite: favoriteIds.has(id) || !!w.isFavorite,
            isCompleted: completedIds.has(id) || !!w.isCompleted,
          };
        });

        setWords(merged);
        setError(null);
      } catch (err) {
        console.error(err);
        if (cancelled) return;
        setError("단어장을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- 핸들러 ---
  const handleCardClick = (wordId) => navigate(`/words/${wordId}`);

  const handleToggleFavorite = async (word, e) => {
    e.stopPropagation();
    const originalWords = [...words];
    const currentStatus = word.isFavorite;

    setWords((prev) =>
      prev.map((w) =>
        w.wordId === word.wordId ? { ...w, isFavorite: !currentStatus } : w
      )
    );

    try {
      currentStatus
        ? await removeFavorite(word.wordId)
        : await addFavorite(word.wordId);
    } catch (err) {
      console.error("즐겨찾기 실패", err);
      setWords(originalWords);
    }
  };

  const handleModeChange = (type) => {
    setMode(type);
    setSearchParams({ page: "0" });
  };

  const toggleDropdown = (name) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const selectFilterOption = (type, value) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
    setSearchParams({ page: "0" });
  };

  const getFilterLabel = (type, options) => {
    const current = filter[type];
    const found = options.find((opt) => opt.value === current);
    return found ? found.label : options[0].label;
  };

  const handleFilterReset = () => {
    setFilter(FILTER_INITIAL);
    setSearchParams({ page: "0" });
  };

  const resetFilters = () => {
    setFilter(FILTER_INITIAL);
    setSearch("");
    setMode("all");
    setSearchParams({ page: "0" });
  };

  const isFilterActive =
    filter.category !== "All" ||
    filter.domain !== "All" ||
    filter.level !== "All";

  // --- 통계 및 필터링 ---
  const favoriteCount = useMemo(
    () => words.filter((w) => w.isFavorite).length,
    [words]
  );

  const statItems = [
    {
      key: "all",
      label: "전체 단어",
      count: words.length,
      // [수정] mode가 'all'일 때만 색상을 채움 (즐겨찾기와 동일한 로직)
      icon: (
        <LayoutGrid
          size={20}
          fill={mode === "all" ? "currentColor" : "none"}
          strokeWidth={2}
        />
      ),
      color: "purple",
    },
    {
      key: "favorite",
      label: "즐겨찾기",
      count: favoriteCount,
      icon: (
        <Star
          size={20}
          fill={mode === "favorite" ? "currentColor" : "none"}
          strokeWidth={2}
        />
      ),
      color: "yellow",
    },
  ];

  const filteredAndSortedWords = useMemo(() => {
    let result = words.filter((w) => {
      if (mode === "favorite" && !w.isFavorite) return false;
      return true;
    });

    result = result.filter((w) => {
      if (filter.category !== "All" && w.partOfSpeech !== filter.category)
        return false;
      if (filter.domain !== "All" && w.domain !== filter.domain) return false;
      if (
        filter.level !== "All" &&
        Number(w.level) !== Number(filter.level)
      )
        return false;
      if (search) {
        const lower = search.toLowerCase();
        const wordText = (w.word || "").toLowerCase();
        const meaningText = (w.meaning || "").toLowerCase();
        if (!wordText.includes(lower) && !meaningText.includes(lower)) {
          return false;
        }
      }
      return true;
    });

    if (sortKey === "alphabet") {
      result.sort((a, b) => (a.word || "").localeCompare(b.word || ""));
    } else if (sortKey === "level") {
      result.sort((a, b) => (a.level ?? 999) - (b.level ?? 999));
    }

    return result;
  }, [words, mode, filter, search, sortKey]);

  // --- 페이지네이션 ---
  const PAGE_SIZE = 12;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedWords.length / PAGE_SIZE)
  );
  const currentPageIndex = Number(searchParams.get("page") || 0);
  const safeIndex = Math.min(Math.max(currentPageIndex, 0), totalPages - 1);
  const startIdx = safeIndex * PAGE_SIZE;
  const pagedWords = filteredAndSortedWords.slice(
    startIdx,
    startIdx + PAGE_SIZE
  );

  const handlePageChange = (nextIndex) => {
    setSearchParams({ page: String(nextIndex) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isEmptyAll = !loading && !error && words.length === 0;

  return (
    <div className="page-container wordlist-page">
      {/* 1. 헤더 영역 */}
      <header className="wordlist-header">
        <PageHeader
          title="나의"
          highlight="단어장"
          description="오늘의 학습을 시작하세요."
        />

        <div className="wordlist-stats-wrapper">
          <nav className="word-stats" aria-label="학습 현황 필터">
            <div className="word-stats-list">
              {statItems.map(({ key, label, count, icon, color }) => (
                <button
                  key={key}
                  type="button"
                  className={`stat-card no-select ${
                    mode === key ? "active" : ""
                  } ${color}`}
                  onClick={() => handleModeChange(key)}
                >
                  <div className={`stat-icon-wrapper bg-${color}`}>{icon}</div>
                  <div className="stat-info">
                    <span className="stat-label">{label}</span>
                    <span className="stat-count">{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* 2. 컨트롤 영역 (기존 유지) */}
      <section className="wordlist-controls">
        <div className="controls-left">
          <div className="filter-container">
            {[
              { id: "category", label: "품사", options: CATEGORY_OPTIONS },
              { id: "domain", label: "분야", options: DOMAIN_OPTIONS },
              { id: "level", label: "난이도", options: LEVEL_OPTIONS },
            ].map(({ id, label, options }) => (
              <div className="filter-group" key={id}>
                <span className="filter-label">{label}</span>
                <div className="dropdown-box">
                  <button
                    type="button"
                    className={`dropdown-btn no-select ${
                      filter[id] !== "All" ? "selected" : ""
                    }`}
                    onClick={() => toggleDropdown(id)}
                  >
                    {getFilterLabel(id, options)}
                    <ChevronDown size={14} className="arrow" />
                  </button>
                  {openDropdown === id && (
                    <div className="dropdown-menu">
                      {options.map((opt) => (
                        <div
                          key={opt.value}
                          className={`dropdown-item ${
                            filter[id] === opt.value ? "active" : ""
                          }`}
                          onClick={() => selectFilterOption(id, opt.value)}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleFilterReset}
                className="filter-reset-btn"
                title="필터 초기화"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="controls-right">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              className="search-input"
              placeholder="단어 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* 3. 리스트 영역 */}
      <section className="wordlist-content">
        {loading && (
          <div className="status-msg loading">
             <Spinner
              fullHeight={false}
              message="단어장을 불러오는 중입니다..."
            />
          </div>
        )}

        {!loading && error && (
          <div className="status-msg error">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              다시 시도
            </button>
          </div>
        )}
{/* 단어장에 단어가 없는경우 인데 나중에 수정하면서 제거하거나 고칠 것 */}
        {!loading && !error && isEmptyAll && (
          <div className="status-msg empty">
            <p>저장된 단어가 없습니다. 📭</p>
            <span className="sub-text">
              새로운 단어를 학습하고 추가해보세요!
            </span>
          </div>
        )}

        {!loading && !error && !isEmptyAll && (
          <>
            {filteredAndSortedWords.length > 0 ? (
              <div className="wordlist-grid">
                {pagedWords.map((w) => {
                  const meaningText = w.meaning || "";
                  const meaningPreview =
                    meaningText.length > 80
                      ? `${meaningText.slice(0, 80)}...`
                      : meaningText || "뜻 정보 없음";

                  return (
                    <Card
                      key={w.wordId}
                      as="article"
                      title={w.word}
                      onClick={() => handleCardClick(w.wordId)}
                      className={w.isCompleted ? "word-card-completed" : ""}
                      meta={
                        <button
                          type="button"
                          className={`star-btn no-select ${
                            w.isFavorite ? "active" : ""
                          }`}
                          onClick={(e) => handleToggleFavorite(w, e)}
                          title={
                            w.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"
                          }
                        >
                          <Star
                            size={18}
                            fill={w.isFavorite ? "currentColor" : "none"}
                            strokeWidth={2}
                          />
                        </button>
                      }
                    >
                      {/* [추가] 구분선: 단어 길이 차이 시각적 보정 */}
                      <div className="card-separator" />

                      {/* 1. 태그 (왼쪽 정렬) */}
                      <div className="word-tags-row">
                        {typeof w.level === "number" && (
                          <span className="tag tag-level">Lv.{w.level}</span>
                        )}
                        {w.partOfSpeech && (
                          <span className="tag tag-pos">{w.partOfSpeech}</span>
                        )}
                        {w.domain && (
                          <span className="tag tag-domain">{w.domain}</span>
                        )}
                      </div>

                      {/* 2. 뜻 (왼쪽 정렬) */}
                      <div className="word-meaning-row">
                        <p className="word-meaning">{meaningPreview}</p>
                      </div>

                      {/* 3. 하단 링크 (우측 하단) */}
                      <div className="word-card-footer">
                        <div className="view-detail">
                          More{" "}
                          <ArrowRight size={14} className="arrow-icon" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // 결과 없음 화면 (기존 유지)
              <div className="status-msg empty-search">
                <div className="empty-icon-wrapper">
                  <FileQuestion size={64} strokeWidth={1.5} />
                </div>
                <p className="empty-title">조건에 맞는 단어가 없습니다.</p>
                <p className="empty-desc">
                  검색어나 필터를 변경하여 다시 시도해 보세요.
                </p>
                <button className="reset-text-btn" onClick={resetFilters}>
                  필터 초기화
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. 페이지네이션 (기존 유지) */}
      {!loading && !error && filteredAndSortedWords.length > 0 && (
        <Pagination
          page={safeIndex}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default WordListPage;