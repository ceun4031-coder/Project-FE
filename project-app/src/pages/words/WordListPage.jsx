import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle,
  Clock,
  LayoutGrid,
  Star,
  BookOpen,
  Archive,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import {
  addFavorite,
  getWordList,
  removeFavorite,
  toggleProgress,
} from "../../api/wordApi";
import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import "./WordListPage.css";

// --- 상수 데이터 ---
// 품사 필터 (partOfSpeech)
const CATEGORY_OPTIONS = [
  { label: "전체 품사", value: "All" },
  { label: "명사 (Noun)", value: "Noun" },
  { label: "동사 (Verb)", value: "Verb" },
  { label: "형용사 (Adj)", value: "Adj" },
  { label: "부사 (Adv)", value: "Adv" },
];

// 분야 필터 (domain)
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

// 난이도 필터 (WORD_LEVEL → level)
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
  const [mode, setMode] = useState("all"); // all | favorite | learning | completed
  const [filter, setFilter] = useState(FILTER_INITIAL);
  const [sortKey, setSortKey] = useState("default"); // default | alphabet | level
  const [openDropdown, setOpenDropdown] = useState(null);

  // --- 데이터 로딩 ---
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getWordList(0, 100); // GET /api/words?page=0&size=100
        if (cancelled) return;

        // 백엔드가 { content: [...] } 형태면 content, 아니면 배열 그대로
        setWords(Array.isArray(data?.content) ? data.content : data || []);
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

    // 낙관적 업데이트
    setWords((prev) =>
      prev.map((w) =>
        w.wordId === word.wordId ? { ...w, isFavorite: !currentStatus } : w
      )
    );

    try {
      currentStatus
        ? await removeFavorite(word.wordId) // DELETE /api/favorites/{wordId}
        : await addFavorite(word.wordId); // POST /api/favorites/{wordId}
    } catch (err) {
      console.error("즐겨찾기 실패", err);
      setWords(originalWords); // 실패 시 롤백
    }
  };
  const handleToggleComplete = async (wordId, e) => {
    e.stopPropagation();

    const target = words.find((w) => w.wordId === wordId);
    // 이미 완료된 단어면 리스트에서는 아무 동작 안 함 (단방향 UX)
    if (!target || target.isCompleted) return;

    const originalWords = [...words];

    // UI 먼저 완료로 표시
    setWords((prev) =>
      prev.map((w) =>
        w.wordId === wordId ? { ...w, isCompleted: true } : w
      )
    );

    try {
      // 아직 완료가 아니었던 상태에서만 호출하므로 두 번째 인자는 false(미완료 상태 기준)
      await toggleProgress(wordId, false);
    } catch (err) {
      console.error("학습 상태 변경 실패", err);
      setWords(originalWords); // 실패하면 롤백
    }
  };



  const handleModeChange = (type) => {
    setMode(type);
    setSearchParams({ page: "0" });
  };

  // 드롭다운 로직
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

  const resetFilters = () => {
    setFilter(FILTER_INITIAL);
    setSearch("");
    setMode("all");
    setSearchParams({ page: "0" });
  };

  // --- 통계 및 필터링 (useMemo) ---
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

  const statItems = [
    {
      key: "all",
      label: "전체 단어",
      count: words.length,
      icon: <LayoutGrid size={20} />,
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
        />
      ),
      color: "yellow",
    },
    {
      key: "learning",
      label: "학습예정",
      count: learningCount,
      icon: <BookOpen size={20} />,
      color: "blue",
    },
    {
      key: "completed",
      label: "학습완료",
      count: completedCount,
      icon: <Archive size={20} />,
      color: "green",
    },
  ];

  const filteredAndSortedWords = useMemo(() => {
    let result = words.filter((w) => {
      if (mode === "favorite" && !w.isFavorite) return false;
      if (mode === "learning" && w.isCompleted) return false;
      if (mode === "completed" && !w.isCompleted) return false;
      return true;
    });

    result = result.filter((w) => {
      // 품사 필터: partOfSpeech
      if (filter.category !== "All" && w.partOfSpeech !== filter.category)
        return false;

      // 분야 필터: domain
      if (filter.domain !== "All" && w.domain !== filter.domain) return false;

      // 난이도 필터: level (DDL: WORD_LEVEL)
      if (
        filter.level !== "All" &&
        Number(w.level) !== Number(filter.level)
      )
        return false;

      // 검색어 필터: word / meaning
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

    // 정렬 (옵션)
    if (sortKey === "alphabet") {
      result.sort((a, b) => (a.word || "").localeCompare(b.word || ""));
    } else if (sortKey === "level") {
      result.sort(
        (a, b) => (a.level ?? 999) - (b.level ?? 999)
      );
    }

    return result;
  }, [words, mode, filter, search, sortKey]);

  // --- 페이지네이션 로직 ---
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
                  className={`stat-card no-select ${mode === key ? "active" : ""
                    } ${color}`}
                  onClick={() => handleModeChange(key)}
                >
                  <div className={`stat-icon-wrapper bg-${color}`}>
                    {icon}
                  </div>
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

      {/* 2. 컨트롤 영역 (필터 & 검색) */}
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
                    className={`dropdown-btn no-select ${filter[id] !== "All" ? "selected" : ""
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
                          className={`dropdown-item ${filter[id] === opt.value ? "active" : ""
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
            <div className="spinner"></div>
            <span>단어장을 불러오는 중입니다...</span>
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
                    <article
                      key={w.wordId}
                      className={`word-card ${w.isCompleted ? "completed" : ""
                        }`}
                      onClick={() => handleCardClick(w.wordId)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* 카드 상단: 단어 및 액션 */}
                      <div className="word-card-top">
                        <h3
                          className={`word-card-title ${(w.word || "").length > 12 ? "small-title" : ""
                            }`}
                          title={w.word}
                        >
                          {w.word}
                        </h3>
                        <div className="word-card-actions">
                          {/* 학습 완료 버튼: 리스트에서는 단방향(완료만 가능, 취소 없음) */}
                          <button
                            type="button"
                            title={
                              w.isCompleted ? "이미 학습 완료된 단어" : "학습 완료로 표시"
                            }
                            className={`status-icon-btn no-select ${w.isCompleted ? "done disabled" : "learning"
                              }`}
                            onClick={
                              w.isCompleted
                                ? undefined
                                : (e) => handleToggleComplete(w.wordId, e)
                            }
                            disabled={w.isCompleted}
                          >
                            {w.isCompleted ? (
                              <CheckCircle size={18} strokeWidth={2.5} />
                            ) : (
                              <Clock size={18} strokeWidth={2.5} />
                            )}
                          </button>

                          <button
                            type="button"
                            title={w.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                            className={`star-btn no-select ${w.isFavorite ? "active" : ""}`}
                            onClick={(e) => handleToggleFavorite(w, e)}
                          >
                            <Star
                              size={18}
                              fill={w.isFavorite ? "currentColor" : "none"}
                              strokeWidth={2}
                            />
                          </button>
                        </div>

                      </div>

                      {/* 태그 정보 */}
                      <div className="word-tags-row">
                        {typeof w.level === "number" && (
                          <span className="tag tag-level">
                            Lv.{w.level}
                          </span>
                        )}
                        {w.partOfSpeech && (
                          <span className="tag tag-pos">
                            {w.partOfSpeech}
                          </span>
                        )}
                        {w.domain && (
                          <span className="tag tag-domain">
                            {w.domain}
                          </span>
                        )}
                      </div>

                      {/* 뜻 정보 */}
                      <div className="word-meaning-row">
                        <p className="word-meaning">{meaningPreview}</p>
                      </div>

                      {/* 하단 링크 */}
                      <div className="word-card-bottom">
                        <div className="view-detail">
                          자세히 보기{" "}
                          <ArrowRight
                            size={14}
                            className="arrow-icon"
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="status-msg empty-search">
                <Search size={48} className="mb-4 text-gray-300" />
                <p>조건에 맞는 단어가 없습니다.</p>
                <button className="reset-btn" onClick={resetFilters}>
                  필터 초기화
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. 페이지네이션 */}
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
