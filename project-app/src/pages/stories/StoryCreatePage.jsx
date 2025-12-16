// src/pages/story/StoryCreatePage.jsx
import { ArrowLeft, Book, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Button from "../../components/common/Button";
import "./StoryCreatePage.css";

import { generateAiStory } from "../../api/aiStoryApi";
import { getUnusedWrongLogs } from "../../api/wrongApi";

/**
 * StoryCreatePage
 *
 * 백엔드 수정 없이 사용(현재 wrongApi.getUnusedWrongLogs가 flat DTO로 내려주도록 정규화함)
 *  - mistakePool item: { wrongWordId, wordId, word, meaning }
 *
 * 동작:
 *  1) 스토리에 아직 사용되지 않은 오답 목록 로드
 *  2) (옵션) Quiz/WrongNote에서 넘어온 값으로 자동 선택(최대 5개)
 *  3) 선택된 wrongWordId들로 /api/ai/story 생성 요청
 *  4) 성공 시 /stories/{storyId} 로 이동 (state로 story를 넘기지 않음)
 */

const MAX_SELECTED_WORDS = 5;
const MAX_VISIBLE_MISTAKES = 15;

const StoryCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  /* ============================================================================
   * State
   * ========================================================================== */

  // 스토리에 아직 사용되지 않은 오답 풀(화면용 flat DTO)
  const [mistakePool, setMistakePool] = useState([]);
  const [loadingMistakes, setLoadingMistakes] = useState(true);

  // 선택된 오답(실제 요청에 쓰는 PK: wrongWordId)
  // item: { wrongWordId, wordId, word, meaning }
  const [selected, setSelected] = useState([]);

  // 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [initializedFromParams, setInitializedFromParams] = useState(false);

  const state = location.state || {};
  const hasQuizWords = Array.isArray(state.wrongWords) && state.wrongWords.length > 0;

  /* ============================================================================
   * Utils (유입 state/query를 최소한으로만 해석)
   * ========================================================================== */

  const toNumberOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Quiz/WrongNote에서 넘어온 item을 "가능한 범위에서" 읽어오는 최소 파서
  // (백엔드 수정이 아니라 프론트 라우팅 state 포맷이 흔들릴 수 있어서 방어 최소치만 둠)
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

  /* ============================================================================
   * Derived
   * ========================================================================== */

  const isFull = selected.length >= MAX_SELECTED_WORDS;
  const visibleMistakes = useMemo(
    () => mistakePool.slice(0, MAX_VISIBLE_MISTAKES),
    [mistakePool]
  );
  const hasMoreMistakes = mistakePool.length > MAX_VISIBLE_MISTAKES;

  /* ============================================================================
   * Navigation
   * ========================================================================== */

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/stories");
  };

  const handleOpenMistakePage = () => {
    navigate("/learning/wrong-notes");
  };

  /* ============================================================================
   * Data Load: unused wrong logs
   * ========================================================================== */

  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        setLoadingMistakes(true);
        const res = await getUnusedWrongLogs();
        setMistakePool(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("오답 목록 로딩 실패:", e);
        setMistakePool([]);
      } finally {
        setLoadingMistakes(false);
      }
    };

    fetchMistakes();
  }, []);

  /* ============================================================================
   * Auto Select: from location.state.wrongWords and/or ?wrongWordIds=
   * ========================================================================== */

  useEffect(() => {
    if (initializedFromParams || loadingMistakes) return;

    const selectedMap = new Map(); // key: wrongWordId, value: item

    // 1) state.wrongWords → id 우선 매칭, 없으면 text로 pool에서 매칭(최소 fallback)
    const incoming = Array.isArray(state.wrongWords) ? state.wrongWords : [];
    for (const it of incoming) {
      if (selectedMap.size >= MAX_SELECTED_WORDS) break;

      const { id, text } = parseIncoming(it);

      // id로 우선 매칭
      if (id != null) {
        const found = mistakePool.find((m) => Number(m.wrongWordId) === id);
        if (found && !selectedMap.has(found.wrongWordId)) {
          selectedMap.set(found.wrongWordId, found);
        }
        continue;
      }

      // id가 없으면 text로만 최소 매칭
      if (text) {
        const lower = text.toLowerCase();
        const found = mistakePool.find(
          (m) => typeof m.word === "string" && m.word.toLowerCase() === lower
        );
        if (found && !selectedMap.has(found.wrongWordId)) {
          selectedMap.set(found.wrongWordId, found);
        }
      }
    }

    // 2) query: /stories/create?wrongWordIds=1,2,3
    if (selectedMap.size < MAX_SELECTED_WORDS) {
      const idsParam = searchParams.get("wrongWordIds");
      if (idsParam) {
        const ids = idsParam
          .split(",")
          .map((v) => toNumberOrNull(v.trim()))
          .filter((n) => n != null);

        for (const id of ids) {
          if (selectedMap.size >= MAX_SELECTED_WORDS) break;
          const found = mistakePool.find((m) => Number(m.wrongWordId) === id);
          if (found && !selectedMap.has(found.wrongWordId)) {
            selectedMap.set(found.wrongWordId, found);
          }
        }
      }
    }

    const initial = Array.from(selectedMap.values());
    if (initial.length > 0) setSelected(initial);

    setInitializedFromParams(true);
  }, [
    initializedFromParams,
    loadingMistakes,
    mistakePool,
    searchParams,
    state.wrongWords,
  ]);

  /* ============================================================================
   * Selection Handlers (기준: wrongWordId)
   * ========================================================================== */

  const toggleSelect = (item) => {
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

    // 백엔드 기준: wrongAnswerLogIds = WRONG_ANSWER_LOG의 PK 목록(= wrongWordId)
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

      // 상세 페이지는 서버에서 다시 로딩하므로 state 전달 제거
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

  return (
    <div className="page-container">
      <div className="story-page story-create-page">
        {/* 상단 네비게이션 */}
        <nav className="story-nav">
          <button type="button" onClick={handleBack} className="nav-back-btn">
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        {/* 메인 레이아웃 */}
        <div className="create-layout">
          {/* LEFT: 오답 노트 */}
          <aside className="mistake-sidebar">
            <div className="mistake-header">
              <h3>
                <Book size={18} className="text-primary-500" /> 오답 노트
              </h3>
              <span className="nav-badge" style={{ fontSize: "0.8rem" }}>
                {mistakePool.length}
              </span>
            </div>

            <p className="mistake-desc">최근 퀴즈에서 실수한 단어들입니다.</p>

            <div className="mistake-list">
              {loadingMistakes && (
                <p className="mistake-loading">오답 단어를 불러오는 중입니다...</p>
              )}

              {!loadingMistakes &&
                visibleMistakes.map((item) => {
                  const isSelected = selected.some(
                    (s) => Number(s.wrongWordId) === Number(item.wrongWordId)
                  );

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
                  최근 오답 {MAX_VISIBLE_MISTAKES}개만 표시 중
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

          {/* RIGHT: 스토리 빌더 */}
          <main className="builder-main">
            <header className="builder-header">
              <div className="builder-heading">
                <div className="builder-heading-row">
                  <Sparkles className="builder-heading-icon" size={18} />
                  <h3 className="builder-heading-title">AI 스토리</h3>
                </div>
                <p className="builder-heading-desc">
                  {hasQuizWords
                    ? "방금 퀴즈에서 틀린 단어들이 자동으로 선택되었습니다. 필요하면 좌측에서 단어를 더 선택하거나 해제하세요."
                    : "좌측에서 단어를 선택하면, 해당 단어들로 연습용 영어 스토리를 만들어 드립니다."}
                </p>
              </div>

              <span
                className={`nav-badge nav-badge--small ${
                  isFull ? "nav-badge--alert" : ""
                }`}
              >
                {selected.length} / {MAX_SELECTED_WORDS}
              </span>
            </header>

            {/* 선택된 단어 섹션 */}
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
                          onClick={() => removeSelected(item.wrongWordId)}
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 하단 버튼 영역 */}
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

        {/* 생성 중 모달 스피너 */}
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
