import { ArrowRight, FileQuestion, LayoutGrid, RotateCcw, Search, Star } from "lucide-react";
import { addFavorite, getCompletedList, getFavoriteList, getWordList, removeFavorite } from "../../api/wordApi";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import Spinner from "../../components/common/Spinner";
import FilterDropdown from "../../components/common/FilterDropdown";
import EmptyState from "../../components/common/EmptyState";
import "./WordListPage.css";

// =========================================
// 필터 옵션
// =========================================

// 품사 필터
const CATEGORY_OPTIONS = [
  { label: "전체 품사", value: "All" },
  { label: "명사 (Noun)", value: "Noun" },
  { label: "동사 (Verb)", value: "Verb" },
  { label: "형용사 (Adj)", value: "Adj" },
  { label: "부사 (Adv)", value: "Adv" },
];

// 분야 필터 (값은 category 컬럼과 동일하게)
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

// 난이도 필터
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
const WORDS_QUERY_KEY = ["words", "list"];

function WordListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // =========================================
  // 상태 관리 (UI용)
  // =========================================
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all"); // all | favorite
  const [filter, setFilter] = useState(FILTER_INITIAL);
  const [sortKey, setSortKey] = useState("default"); // default | alphabet | level
  const [openDropdown, setOpenDropdown] = useState(null);

  // =========================================
  // 데이터 로딩 (React Query)
  // =========================================
  const {
  data: words = [],
  isLoading,
  isError,
  error,
} = useQuery({
  queryKey: WORDS_QUERY_KEY,
  queryFn: async () => {
    const [wordPage, favoriteRes, completedRes] = await Promise.all([
      getWordList(0, 100),
      getFavoriteList().catch(() => []),
      getCompletedList().catch(() => []),
    ]);

    const baseWords = Array.isArray(wordPage?.content)
      ? wordPage.content
      : [];

    const favoriteIds = new Set(
      (favoriteRes || []).map((f) => Number(f.wordId))
    );
    const completedIds = new Set(
      (completedRes || []).map((c) => Number(c.wordId))
    );

    return baseWords.map((w) => {
      const id = Number(w.wordId);
      return {
        ...w,
        isFavorite: favoriteIds.has(id) || !!w.isFavorite,
        isCompleted: completedIds.has(id) || !!w.isCompleted,
      };
    });
  },
});


  const errorMessage = isError
    ? "단어장을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
    : null;

  // =========================================
  // 즐겨찾기 토글 (React Query Mutation + 업데이트)
  // =========================================
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ wordId, isFavorite }) => {
      if (isFavorite) {
        await removeFavorite(wordId);
      } else {
        await addFavorite(wordId);
      }
    },
    onMutate: async ({ wordId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: WORDS_QUERY_KEY });

      const previousWords = queryClient.getQueryData(WORDS_QUERY_KEY);

      queryClient.setQueryData(WORDS_QUERY_KEY, (old = []) =>
        old.map((w) =>
          Number(w.wordId) === Number(wordId)
            ? { ...w, isFavorite: !isFavorite }
            : w
        )
      );

      return { previousWords };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousWords) {
        queryClient.setQueryData(WORDS_QUERY_KEY, context.previousWords);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WORDS_QUERY_KEY });
    },
  });

  // =========================================
  // 이벤트 핸들러
  // =========================================
  const handleCardClick = (wordId) => navigate(`/words/${wordId}`);

  const handleToggleFavorite = (word, e) => {
    e.stopPropagation();

    toggleFavoriteMutation.mutate({
      wordId: word.wordId,
      isFavorite: word.isFavorite,
    });
  };

  const handleModeChange = (type) => {
    setMode(type);
    setSearchParams({ page: "0" });
  };

  const toggleDropdown = (id) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  const selectFilterOption = (type, value) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
    setSearchParams({ page: "0" });
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

  // =========================================
  // 파생 값
  // =========================================
  const isFilterActive =
    filter.category !== "All" ||
    filter.domain !== "All" ||
    filter.level !== "All";

  const favoriteCount = useMemo(
    () => words.filter((w) => w.isFavorite).length,
    [words]
  );

  const statItems = [
    {
      key: "all",
      label: "전체 단어",
      count: words.length,
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

  // 필터 + 정렬 적용
  const filteredAndSortedWords = useMemo(() => {
    let result = words.filter((w) => {
      if (mode === "favorite" && !w.isFavorite) return false;
      return true;
    });

    result = result.filter((w) => {
      // 품사 필터
      if (filter.category !== "All" && w.partOfSpeech !== filter.category)
        return false;

      // 분야 필터: filter.domain 값은 category 컬럼과 동일하게 사용
      if (filter.domain !== "All" && w.category !== filter.domain) return false;

      // 난이도 필터
      if (filter.level !== "All" && Number(w.level) !== Number(filter.level))
        return false;

      // 검색어
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

    // 정렬 (현재 UI에서 sortKey 변경은 없지만, 확장 대비)
    if (sortKey === "alphabet") {
      result.sort((a, b) => (a.word || "").localeCompare(b.word || ""));
    } else if (sortKey === "level") {
      result.sort((a, b) => (a.level ?? 999) - (b.level ?? 999));
    }

    return result;
  }, [words, mode, filter, search, sortKey]);

  // =========================================
  // 페이지네이션
  // =========================================
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

  // 완전히 비어있는 단어장 여부
  const isEmptyAll = !isLoading && !errorMessage && words.length === 0;

  // =========================================
  // 렌더링
  // =========================================
  return (
    <div className="page-container wordlist-page">
      {/* 1. 헤더 영역 */}
      <header className="wordlist-header">
        <PageHeader
          title="나의"
          highlight="단어장"
          description="오늘의 학습을 시작하세요."
        />

        {/* 단어가 있을 때만 카테고리(전체 단어 / 즐겨찾기) 버튼 노출 */}
        {!isEmptyAll && (
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
        )}
      </header>

      {/* 2. 컨트롤 영역 (단어가 하나도 없을 때는 숨김) */}
      {!isEmptyAll && (
        <section className="wordlist-controls">
          <div className="controls-left">
            <div className="filter-container">
              {[
                { id: "category", label: "품사", options: CATEGORY_OPTIONS },
                { id: "domain", label: "분야", options: DOMAIN_OPTIONS },
                { id: "level", label: "난이도", options: LEVEL_OPTIONS },
              ].map(({ id, label, options }) => (
                <FilterDropdown
                  key={id}
                  id={id}
                  label={label}
                  options={options}
                  value={filter[id]}
                  isOpen={openDropdown === id}
                  onToggle={toggleDropdown}
                  onChange={selectFilterOption}
                />
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
              <Input
                size="md"
                search
                fullWidth
                placeholder="단어 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="단어 검색"
              />
            </div>
          </div>
        </section>
      )}

      {/* 3. 리스트 영역 */}
      <section className="wordlist-content">
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="status-msg loading">
            <Spinner
              fullHeight={false}
              message="단어장을 불러오는 중입니다..."
            />
          </div>
        )}

        {/* 에러 상태 */}
        {!isLoading && errorMessage && (
          <div className="status-msg error">
            <p>{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 단어장에 단어가 아예 없는 경우 */}
        {!isLoading && !errorMessage && isEmptyAll && (
          <EmptyState
            icon={FileQuestion}
            title="저장된 단어가 없습니다."
            description="새로운 단어를 학습하고 단어장에 추가해 보세요."
            variant="page"
          />
        )}

        {/* 단어는 있는데, 필터/검색 조건으로 0개인 경우 포함 */}
        {!isLoading && !errorMessage && !isEmptyAll && (
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
                      className="word-card card--compact"
                      as="article"
                      title={w.word}
                      onClick={() => handleCardClick(w.wordId)}
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
                      <div className="card-separator" />

                      {/* 태그 */}
                      <div className="word-tags-row">
                        {typeof w.level === "number" && (
                          <span className="tag tag-level">Lv.{w.level}</span>
                        )}
                        {w.partOfSpeech && (
                          <span className="tag tag-pos">
                            {w.partOfSpeech}
                          </span>
                        )}
                        {w.category && (
                          <span className="tag tag-domain">{w.category}</span>
                        )}
                      </div>

                      {/* 뜻 */}
                      <div className="word-meaning-row">
                        <p className="word-meaning">{meaningPreview}</p>
                      </div>

                      {/* 하단 링크 */}
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
              <EmptyState
                icon={FileQuestion}
                title="조건에 맞는 단어가 없습니다."
                description="검색어나 필터를 변경하여 다시 시도해 보세요."
                actionLabel="필터 초기화"
                onAction={resetFilters}
                variant="page"
              />
            )}
          </>
        )}
      </section>

      {/* 4. 페이지네이션 */}
      {!isLoading && !errorMessage && filteredAndSortedWords.length > 0 && (
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