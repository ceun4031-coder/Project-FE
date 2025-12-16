// src/pages/story/StoryCreatePage.jsx
import { ArrowLeft, Book, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Button from "../../components/common/Button";
import "./StoryCreatePage.css";

import { generateAiStory } from "../../api/aiStoryApi";
import { getUnusedWrongLogs } from "../../api/wrongApi";

const MAX_SELECTED_WORDS = 5;
const MAX_VISIBLE_MISTAKES = 15;

const StoryCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 미사용 오답 풀 (flat DTO)
  // 권장 필드: { wrongWordId, wordId, word, meaning, wrongAt?, totalWrong? }
  const [mistakePool, setMistakePool] = useState([]);
  const [loadingMistakes, setLoadingMistakes] = useState(true);

  // 선택된 오답 (mistakePool item 그대로 보관)
  const [selected, setSelected] = useState([]);

  // ✅ 퀴즈/오답노트에서 넘어온 오답: "상단 고정" (선택 여부와 무관)
  const [pinnedIds, setPinnedIds] = useState([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [initializedFromParams, setInitializedFromParams] = useState(false);

  const state = location.state || {};
  const incomingWrongWords = Array.isArray(state.wrongWords) ? state.wrongWords : [];
  const hasQuizWords = incomingWrongWords.length > 0;

  /* ============================================================================
   * Utils
   * ========================================================================== */

  const toNumberOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const toTime = (v) => {
    if (!v) return 0;
    const t = Date.parse(v);
    return Number.isFinite(t) ? t : 0;
  };

  const parseIncoming = (item) => {
    if (!item || typeof item !== "object") return { id: null, text: "" };

    const id =
      toNumberOrNull(item.wrongLogId) ??
      toNumberOrNull(item.wrongWordId) ??
      toNumberOrNull(item.wrongAnswerLogId) ??
      toNumberOrNull(item.id) ??
      null;

    const text = String(item.word ?? item.text ?? "").trim();
    return { id, text };
  };

  // ✅ "항상 최신순" 기준 (wrongAt desc 우선, 없으면 wrongWordId desc로 fallback)
  const compareByLatest = (a, b) => {
    const ta = toTime(a?.wrongAt);
    const tb = toTime(b?.wrongAt);
    if (tb !== ta) return tb - ta;

    const ia = Number(a?.wrongWordId ?? 0);
    const ib = Number(b?.wrongWordId ?? 0);
    if (ib !== ia) return ib - ia;

    const sa = String(a?.word ?? "").toLowerCase();
    const sb = String(b?.word ?? "").toLowerCase();
    if (sa < sb) return -1;
    if (sa > sb) return 1;
    return 0;
  };

  /* ============================================================================
   * Derived: indexes
   * ========================================================================== */

  const poolIndex = useMemo(() => {
    const byId = new Map();
    const byWordLower = new Map();

    for (const m of Array.isArray(mistakePool) ? mistakePool : []) {
      const id = toNumberOrNull(m?.wrongWordId);
      if (id != null) byId.set(id, m);

      const w = typeof m?.word === "string" ? m.word.trim().toLowerCase() : "";
      if (!w) continue;

      // 같은 word가 여러 개면 더 최신 것을 저장
      const prev = byWordLower.get(w);
      if (!prev || compareByLatest(m, prev) < 0) {
        // compareByLatest는 "내림차순" 정렬 기준이라, m이 더 최신이면 m이 앞(작은 값)이어야 함
        // 그래서 여기서는 compareByLatest(m, prev) < 0 이면 m이 더 우선
        byWordLower.set(w, m);
      }
    }

    return { byId, byWordLower };
  }, [mistakePool]);

  const selectedIdSet = useMemo(
    () => new Set(selected.map((s) => Number(s.wrongWordId))),
    [selected]
  );

  const pinnedIdSet = useMemo(
    () => new Set(pinnedIds.map((v) => Number(v))),
    [pinnedIds]
  );

  /* ============================================================================
   * Derived: ordered list
   * 요구사항:
   *  1) 퀴즈/오답노트 유입 오답(pinned) "항상 상단"
   *  2) 선택한 항목도 상단에 유지(단, pinned 다음)
   *  3) 나머지는 항상 최신순
   * ========================================================================== */

  const pinnedItemsSorted = useMemo(() => {
    const items = pinnedIds
      .map((id) => poolIndex.byId.get(Number(id)))
      .filter(Boolean);

    // pinned도 최신순 유지
    items.sort(compareByLatest);
    return items;
  }, [pinnedIds, poolIndex.byId]);

  const selectedNonPinnedSorted = useMemo(() => {
    const items = selected.filter((s) => !pinnedIdSet.has(Number(s.wrongWordId)));
    items.sort(compareByLatest);
    return items;
  }, [selected, pinnedIdSet]);

  const restSorted = useMemo(() => {
    const items = (Array.isArray(mistakePool) ? mistakePool : []).filter((m) => {
      const id = Number(m.wrongWordId);
      if (pinnedIdSet.has(id)) return false;
      if (selectedIdSet.has(id)) return false;
      return true;
    });

    items.sort(compareByLatest);
    return items;
  }, [mistakePool, pinnedIdSet, selectedIdSet]);

  const orderedMistakes = useMemo(() => {
    return [...pinnedItemsSorted, ...selectedNonPinnedSorted, ...restSorted];
  }, [pinnedItemsSorted, selectedNonPinnedSorted, restSorted]);

  const visibleMistakes = useMemo(
    () => orderedMistakes.slice(0, MAX_VISIBLE_MISTAKES),
    [orderedMistakes]
  );

  const hasMoreMistakes = orderedMistakes.length > MAX_VISIBLE_MISTAKES;
  const isFull = selected.length >= MAX_SELECTED_WORDS;

  /* ============================================================================
   * Navigation
   * ========================================================================== */

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/stories");
  };

  const handleOpenMistakePage = () => {
    navigate("/learning/wrong-notes?tab=story");
  };

  /* ============================================================================
   * Load
   * ========================================================================== */

  useEffect(() => {
    let alive = true;

    const fetchMistakes = async () => {
      try {
        setLoadingMistakes(true);
        const res = await getUnusedWrongLogs();
        if (!alive) return;
        setMistakePool(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("오답 목록 로딩 실패:", e);
        if (!alive) return;
        setMistakePool([]);
      } finally {
        if (!alive) return;
        setLoadingMistakes(false);
      }
    };

    fetchMistakes();
    return () => {
      alive = false;
    };
  }, []);

  /* ============================================================================
   * Auto Pin + Auto Select
   * 요구사항:
   *  - 퀴즈 오답이 5개 이상이어도 "유입된 오답 전체"를 상단 고정
   *  - 자동 선택은 최대 5개만 (나머지는 고정만)
   * ========================================================================== */

  useEffect(() => {
    if (initializedFromParams || loadingMistakes) return;

    const pinnedSet = new Set();
    const addPinned = (id) => {
      const n = toNumberOrNull(id);
      if (n == null) return;
      if (pinnedSet.has(n)) return;
      // pool에 있는(=미사용 오답) 것만 고정 대상으로 인정
      if (!poolIndex.byId.has(n)) return;
      pinnedSet.add(n);
    };

    // 1) state.wrongWords → id 우선, 없으면 word로 매칭
    for (const it of incomingWrongWords) {
      const { id, text } = parseIncoming(it);

      if (id != null) {
        addPinned(id);
        continue;
      }

      if (text) {
        const found = poolIndex.byWordLower.get(text.toLowerCase());
        if (found?.wrongWordId != null) addPinned(found.wrongWordId);
      }
    }

    // 2) query: wrongWordIds=1,2,3
    const idsParam = searchParams.get("wrongWordIds");
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((v) => toNumberOrNull(v.trim()))
        .filter((n) => n != null);
      for (const id of ids) addPinned(id);
    }

    const pinnedArr = Array.from(pinnedSet);

    // ✅ pinned 전체 상단 고정
    if (pinnedArr.length > 0) setPinnedIds(pinnedArr);

    // ✅ 자동 선택은 pinned 중 최신순 기준 상위 5개
    if (pinnedArr.length > 0) {
      const pinnedItems = pinnedArr
        .map((id) => poolIndex.byId.get(id))
        .filter(Boolean)
        .sort(compareByLatest);

      setSelected(pinnedItems.slice(0, MAX_SELECTED_WORDS));
    }

    setInitializedFromParams(true);
  }, [
    initializedFromParams,
    loadingMistakes,
    incomingWrongWords,
    searchParams,
    poolIndex.byId,
    poolIndex.byWordLower,
  ]);

  /* ============================================================================
   * Selection
   * ========================================================================== */

  const toggleSelect = (item) => {
    if (isGenerating) return;

    const id = toNumberOrNull(item?.wrongWordId);
    if (!id) return;

    const exists = selected.some((s) => Number(s.wrongWordId) === id);
    if (exists) {
      setSelected((prev) => prev.filter((s) => Number(s.wrongWordId) !== id));
      return;
    }

    if (selected.length >= MAX_SELECTED_WORDS) {
      alert(`단어는 최대 ${MAX_SELECTED_WORDS}개까지만 선택할 수 있어요.`);
      return;
    }

    setSelected((prev) => [...prev, item]);
  };

  const removeSelected = (wrongWordId) => {
    const id = toNumberOrNull(wrongWordId);
    if (!id) return;
    setSelected((prev) => prev.filter((s) => Number(s.wrongWordId) !== id));
  };

  const handleClearAll = () => {
    if (!selected.length) return;
    setSelected([]);
  };

  /* ============================================================================
   * Generate
   * ========================================================================== */

  const handleGenerate = async () => {
    if (selected.length === 0 || isGenerating) return;

    const wrongAnswerLogIds = selected
      .map((s) => toNumberOrNull(s.wrongWordId))
      .filter((n) => n != null);

    if (wrongAnswerLogIds.length === 0) {
      alert("선택된 단어의 오답 로그 ID가 없습니다.\n다시 선택해 주세요.");
      return;
    }

    try {
      setIsGenerating(true);

      const aiResult = await generateAiStory({ wrongAnswerLogIds });
      if (!aiResult?.success) {
        throw new Error(aiResult?.message || "AI 스토리 생성에 실패했습니다.");
      }

      navigate(`/stories/${aiResult.storyId}`);
    } catch (e) {
      console.error("스토리 생성 실패:", e);
      alert(e?.message || "스토리를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ============================================================================
   * Render
   * ========================================================================== */

  const pinnedCount = pinnedItemsSorted.length;

  return (
    <div className="page-container">
      <div className="story-page story-create-page">
        <nav className="story-nav">
          <button type="button" onClick={handleBack} className="nav-back-btn">
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        <div className="create-layout">
          <aside className="mistake-sidebar">
            <div className="mistake-header">
              <h3>
                <Book size={18} className="text-primary-500" /> 오답 노트
              </h3>
              <span className="nav-badge" style={{ fontSize: "0.8rem" }}>
                {mistakePool.length}
              </span>
            </div>

       <p className="mistake-desc">
  단어를 선택해 스토리를 만들 수 있어요. 목록은 최신 오답부터 표시됩니다.
</p>

            <div className="mistake-list">
              {loadingMistakes && (
                <p className="mistake-loading">오답 단어를 불러오는 중입니다...</p>
              )}

              {!loadingMistakes &&
                visibleMistakes.map((item) => {
                  const id = Number(item.wrongWordId);
                  const isSelected = selectedIdSet.has(id);

                  return (
                    <div
                      key={item.wrongWordId}
                      className={`mistake-card ${isSelected ? "is-selected" : ""}`}
                      onClick={() => toggleSelect(item)}
                    >
                      <div className="card-top">
                       <span className="card-word">{item.word}</span>

                        {isSelected && <span className="selected-mark">선택됨</span>}
                      </div>
                      <div className="card-meaning">{item.meaning}</div>
                    </div>
                  );
                })}
            </div>

            {hasMoreMistakes && (
              <div className="mistake-footer">
                <span className="mistake-more-text">
                  상단 고정/선택 우선, 최대 {MAX_VISIBLE_MISTAKES}개만 표시 중
                </span>
             <button
  type="button"
  className="mistake-more-btn"
  onClick={handleOpenMistakePage}
>
  전체 보기
</button>

              </div>
            )}
          </aside>

          <main className="builder-main">
            <header className="builder-header">
              <div className="builder-heading">
                <div className="builder-heading-row">
                  <Sparkles className="builder-heading-icon" size={18} />
                  <h3 className="builder-heading-title">AI 스토리</h3>
                </div>
                <p className="builder-heading-desc">
                  {hasQuizWords
                    ? `유입된 오답은 상단 고정됩니다. 자동 선택은 최대 ${MAX_SELECTED_WORDS}개만 되며, 필요하면 좌측에서 교체 선택하세요.`
                    : "좌측에서 단어를 선택하면, 해당 단어들로 연습용 영어 스토리를 만들어 드립니다."}
                </p>
              </div>

              <span className={`nav-badge nav-badge--small ${isFull ? "nav-badge--alert" : ""}`}>
                {selected.length} / {MAX_SELECTED_WORDS}
              </span>
            </header>

            <section className="selected-words">
              <div className="selected-words-header">
                <div className="selected-words-text">
                  <h4 className="selected-words-title">선택된 단어</h4>
                  <p className="selected-words-caption">
                    최대 {MAX_SELECTED_WORDS}개까지 선택할 수 있어요.
                  </p>
                </div>

                {selected.length > 0 && (
                  <button
                    type="button"
                    className="chips-clear-btn"
                    onClick={handleClearAll}
                    disabled={isGenerating}
                  >
                    전체 해제
                  </button>
                )}
              </div>

              <div className="chips-container">
                {selected.length === 0 ? (
                  <div className="chips-empty">좌측 오답 노트에서 단어를 선택해 주세요.</div>
                ) : (
                  <div className="chips-wrap">
                    {selected.map((item) => (
                      <span key={item.wrongWordId} className="word-chip mistake">
                        {item.word}
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelected(item.wrongWordId);
                          }}
                          disabled={isGenerating}
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <div className="builder-footer">
              <Button
                full
                size="lg"
                disabled={selected.length === 0 || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? "AI가 스토리를 만드는 중..." : "스토리 생성하기"}
              </Button>
            </div>
          </main>
        </div>

        {isGenerating && (
          <div className="story-generate-overlay">
            <div className="story-generate-modal">
              <div className="story-generate-spinner" />
              <p className="story-generate-title">AI가 스토리를 만드는 중입니다</p>
              <p className="story-generate-desc">
                선택한 단어들을 자연스러운 문맥 속에 녹이고 있어요.
                <br />
                잠시만 기다려 주세요.
              </p>

              {selected.length > 0 && (
                <div className="story-generate-words">
                  {selected.map((w) => (
                    <span key={w.wrongWordId} className="story-generate-chip">
                      {w.word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCreatePage;
