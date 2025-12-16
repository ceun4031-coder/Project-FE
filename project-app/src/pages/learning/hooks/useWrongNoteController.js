// src/pages/wrongnote/hooks/useWrongNoteController.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getWrongList } from "@/api/wrongApi";

const PAGE_SIZE = 10;
const STORY_MAX_SELECT = 5;

/** normalize 기준: "Y" */
const isUsedInStory = (item) => item?.isUsedInStory === "Y";
const getWrongCount = (item) => item?.totalWrong ?? 0;

const getLastWrongTime = (item) => {
  const raw = item?.wrongAt;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export function useWrongNoteController() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ============================================================================
   * Tab: URL (?tab=story) > location.state.tab > default(study)
   * ========================================================================== */

  const getTabFromRoute = useCallback(() => {
    const q = String(searchParams.get("tab") || "").toLowerCase();
    const s = String(location.state?.tab || "").toLowerCase();
    const t = q || s;
    return t === "story" ? "story" : "study";
  }, [searchParams, location.state]);

  // tab: study | story
  const [tab, setTab] = useState(getTabFromRoute);
  const isStoryTab = tab === "story";

  // filters
  const [filters, setFilters] = useState({ sortBy: "latest" });

  // ui state
  const [selectedIds, setSelectedIds] = useState([]); // wrongWordId[]
  const [page, setPage] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null); // "sort" | null

  // URL 변경(뒤로/앞으로/직접 진입) 시 tab 동기화
  useEffect(() => {
    const nextTab = getTabFromRoute();
    if (nextTab !== tab) {
      setTab(nextTab);
      setPage(0);
      setSelectedIds([]);
      setOpenDropdown(null);
    }
  }, [getTabFromRoute, tab]);

  /* ============================================================================
   * Data
   * ========================================================================== */

  const {
    data: rawItems = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["wrongNotes", "list"],
    queryFn: getWrongList,
  });

  /* ============================================================================
   * Derived
   * ========================================================================== */

  // tab counts (1 pass)
  const tabCounts = useMemo(() => {
    let used = 0;
    for (const it of rawItems) if (isUsedInStory(it)) used += 1;
    const total = rawItems.length;
    return { total, storyable: total - used };
  }, [rawItems]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // wrongWordId -> wordId (quiz/card params)
  const selectedWordIds = useMemo(() => {
    if (selectedIds.length === 0 || rawItems.length === 0) return [];
    const out = [];
    for (const it of rawItems) {
      if (!selectedIdSet.has(it.wrongWordId)) continue;
      const n = Number(it.wordId);
      if (!Number.isNaN(n)) out.push(n);
    }
    return out;
  }, [selectedIds, rawItems, selectedIdSet]);

  // tab filter + sort
  const processedItems = useMemo(() => {
    const { sortBy } = filters;

    const base = isStoryTab ? rawItems.filter((it) => !isUsedInStory(it)) : rawItems;

    return [...base].sort((a, b) => {
      const aDate = getLastWrongTime(a);
      const bDate = getLastWrongTime(b);
      const aWrong = getWrongCount(a);
      const bWrong = getWrongCount(b);

      switch (sortBy) {
        case "oldest":
          return aDate - bDate;
        case "mostWrong":
          if (bWrong !== aWrong) return bWrong - aWrong;
          return bDate - aDate;
        case "latest":
        default:
          return bDate - aDate;
      }
    });
  }, [rawItems, filters, isStoryTab]);

  // pagination
  const totalPages = useMemo(
    () => Math.ceil(processedItems.length / PAGE_SIZE) || 0,
    [processedItems.length]
  );

  const pagedItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return processedItems.slice(start, start + PAGE_SIZE);
  }, [processedItems, page]);

  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  /* ============================================================================
   * Selection
   * ========================================================================== */

  // selection: single toggle (story tab capped)
  const toggleSelectId = useCallback(
    (id) => {
      setSelectedIds((prev) => {
        const idx = prev.indexOf(id);
        if (idx >= 0) {
          const next = prev.slice();
          next.splice(idx, 1);
          return next;
        }
        if (isStoryTab && prev.length >= STORY_MAX_SELECT) return prev;
        return [...prev, id];
      });
    },
    [isStoryTab]
  );

  // selection: page toggle (story tab capped)
  const toggleSelectPage = useCallback(
    (checked) => {
      const pageIds = pagedItems.map((i) => i.wrongWordId);

      setSelectedIds((prev) => {
        if (!checked) {
          const pageSet = new Set(pageIds);
          return prev.filter((id) => !pageSet.has(id));
        }

        const prevSet = new Set(prev);
        const candidates = pageIds.filter((id) => !prevSet.has(id));

        if (!isStoryTab) return [...prev, ...candidates];

        const remain = Math.max(0, STORY_MAX_SELECT - prev.length);
        if (remain <= 0) return prev;
        return [...prev, ...candidates.slice(0, remain)];
      });
    },
    [pagedItems, isStoryTab]
  );

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  /* ============================================================================
   * Tab / Dropdown
   * ========================================================================== */

  const handleTabChange = useCallback(
    (nextTab) => {
      setTab(nextTab);
      setPage(0);
      setSelectedIds([]);
      setOpenDropdown(null);

      // ✅ URL 동기화: /learning/wrong-notes?tab=story
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          if (nextTab === "story") p.set("tab", "story");
          else p.delete("tab");
          return p;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleDropdownToggle = useCallback((id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }, []);

  const handleDropdownChange = useCallback((id, nextValue) => {
    if (id === "sort") setFilters({ sortBy: nextValue });
    setPage(0);
    setOpenDropdown(null);
  }, []);

  const isSortActive = filters.sortBy !== "latest";

  const handleResetSort = useCallback(() => {
    setFilters({ sortBy: "latest" });
    setOpenDropdown(null);
    setPage(0);
  }, []);

  /* ============================================================================
   * Action guards
   * ========================================================================== */

  const selectedCount = selectedIds.length;
  const canStudy = selectedWordIds.length > 0;

  const storyLimitReached = isStoryTab && selectedCount >= STORY_MAX_SELECT;
  const canCreateStory = isStoryTab && selectedCount > 0;

  /* ============================================================================
   * Actions
   * ========================================================================== */

  const handleReviewAsQuiz = useCallback(() => {
    if (!canStudy) return;
    const ids = selectedWordIds.join(",");
    navigate(`/learning/quiz?source=wrong-note&wordIds=${encodeURIComponent(ids)}`);
  }, [canStudy, navigate, selectedWordIds]);

  const handleReviewAsCard = useCallback(() => {
    if (!canStudy) return;
    const ids = selectedWordIds.join(",");
    navigate(`/learning/card?source=wrong-note&wordIds=${encodeURIComponent(ids)}`);
  }, [canStudy, navigate, selectedWordIds]);

  const handleCreateStory = useCallback(() => {
    if (!canCreateStory) return;
    const ids = selectedIds.join(",");
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(ids)}`);
  }, [canCreateStory, navigate, selectedIds]);

  /* ============================================================================
   * View flags
   * ========================================================================== */

  const hasAnyItems = rawItems.length > 0;
  const hasProcessedItems = processedItems.length > 0;

  const showEmptyNoData = !isLoading && !isError && !hasAnyItems;
  const showControls = !isLoading && !isError && hasAnyItems;
  const showTable = showControls && hasProcessedItems;
  const showEmptyFiltered = showControls && !hasProcessedItems;

  const hintText = useMemo(() => {
    if (isStoryTab)
      return `스토리 미사용 오답만 보여요. 최대 ${STORY_MAX_SELECT}개 선택 후 생성.`;
    return "단어 선택 후 퀴즈/카드로 학습합니다.";
  }, [isStoryTab]);

  const emptyTextByTab = useMemo(() => {
    if (isStoryTab) {
      return {
        title: "스토리로 만들 오답이 없습니다.",
        desc: "스토리에 아직 사용하지 않은 오답이 없습니다.",
        actionLabel: "오답학습 보기",
        onAction: () => handleTabChange("study"),
      };
    }
    return {
      title: "조건에 맞는 오답이 없습니다.",
      desc: "정렬을 변경하거나 다시 시도해 보세요.",
      actionLabel: "정렬 초기화",
      onAction: handleResetSort,
    };
  }, [isStoryTab, handleResetSort, handleTabChange]);

  const goBack = useCallback(() => navigate(-1), [navigate]);

  return {
    // data
    rawItems,
    isLoading,
    isError,
    refetch,

    // ui state
    tab,
    isStoryTab,
    filters,
    openDropdown,
    page,
    setPage,
    selectedIds,
    selectedIdSet,
    selectedCount,

    // derived
    tabCounts,
    processedItems,
    pagedItems,
    totalPages,
    isSortActive,
    canStudy,
    canCreateStory,
    storyLimitReached,
    hintText,
    emptyTextByTab,

    // view flags
    showEmptyNoData,
    showControls,
    showTable,
    showEmptyFiltered,

    // handlers
    toggleSelectId,
    toggleSelectPage,
    clearSelection,
    handleTabChange,
    handleDropdownToggle,
    handleDropdownChange,
    handleResetSort,
    handleReviewAsQuiz,
    handleReviewAsCard,
    handleCreateStory,
    goBack,
  };
}
