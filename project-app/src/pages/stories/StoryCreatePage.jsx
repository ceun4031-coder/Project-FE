// src/pages/story/StoryCreatePage.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Book, Sparkles, X } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import Button from "../../components/common/Button";
import "./StoryCreatePage.css";

import { generateAiStory, saveStory } from "../../api/aiStoryApi";
import { getUnusedWrongLogs } from "../../api/wrongApi";

const MAX_SELECTED_WORDS = 5;
const MAX_VISIBLE_MISTAKES = 15;

// UI에서는 선택 안 하지만, 백엔드에 넘길 기본 값
const DEFAULT_DIFFICULTY = "intermediate";
const DEFAULT_STYLE = "narrative";

const StoryCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 오답 데이터
  const [mistakePool, setMistakePool] = useState([]);
  const [loadingMistakes, setLoadingMistakes] = useState(true);

  const [selectedWords, setSelectedWords] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // URL/state 기반 자동선택 처리 여부
  const [initializedFromParams, setInitializedFromParams] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/stories");
    }
  };

  // 1) 스토리에 아직 사용되지 않은 오답 목록 로딩
  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        const res = await getUnusedWrongLogs();
        // [{ wrongWordId, word, meaning }, ...]
        const mapped = (res || []).map((item) => ({
          id: item.wrongWordId,
          word: item.word,
          meaning: item.meaning,
        }));
        setMistakePool(mapped);
      } catch (e) {
        console.error("오답 목록 로딩 실패:", e);
      } finally {
        setLoadingMistakes(false);
      }
    };

    fetchMistakes();
  }, []);

  // 2) 퀴즈/오답 노트에서 넘어온 단어 자동 선택
  useEffect(() => {
    if (initializedFromParams) return;

    const state = location.state || {};

    const wrongWordsFromState = Array.isArray(state.wrongWords)
      ? state.wrongWords
      : [];

    const initialSelected = [];

    // (1) QuizPage 에서 온 wrongWords 자동 선택 (정규/오답 공통)
    if (wrongWordsFromState.length > 0) {
      wrongWordsFromState.forEach((item) => {
        if (initialSelected.length >= MAX_SELECTED_WORDS) return;

        const text = (item.word || item.text || "").trim();
        if (!text) return;

        const lower = text.toLowerCase();
        if (initialSelected.some((w) => w.text.toLowerCase() === lower)) return;

        initialSelected.push({
          text,
          source: "mistake",
          wrongLogId: item.wrongWordId ?? item.id ?? null,
        });
      });
    }

    // (2) WrongNotePage → /stories/create?wrongWordIds=... 로 온 경우
    if (initialSelected.length < MAX_SELECTED_WORDS) {
      const idsParam = searchParams.get("wrongWordIds");

      if (idsParam && mistakePool.length > 0) {
        const idSet = new Set(
          idsParam
            .split(",")
            .map((id) => Number(id.trim()))
            .filter(Boolean)
        );

        mistakePool.forEach((item) => {
          if (initialSelected.length >= MAX_SELECTED_WORDS) return;
          if (!idSet.has(item.id)) return;

          const text = (item.word || "").trim();
          if (!text) return;

          const lower = text.toLowerCase();
          if (initialSelected.some((w) => w.text.toLowerCase() === lower))
            return;

          initialSelected.push({
            text,
            source: "mistake",
            wrongLogId: item.id,
          });
        });
      }
    }

    if (initialSelected.length > 0) {
      setSelectedWords(initialSelected);
    }

    setInitializedFromParams(true);
  }, [location.state, searchParams, mistakePool, initializedFromParams]);

  // 좌측 카드: 단어 토글 선택
  const toggleSelectWord = (wordText, source = "mistake", wrongLogId = null) => {
    const normalized = wordText.trim();
    if (!normalized) return;

    const lower = normalized.toLowerCase();
    const exists = selectedWords.some((w) => w.text.toLowerCase() === lower);

    // 이미 선택된 단어면 → 해제
    if (exists) {
      setSelectedWords((prev) =>
        prev.filter((w) => w.text.toLowerCase() !== lower)
      );
      return;
    }

    // 새로 선택
    if (selectedWords.length >= MAX_SELECTED_WORDS) {
      alert(`단어는 최대 ${MAX_SELECTED_WORDS}개까지만 선택할 수 있어요.`);
      return;
    }

    setSelectedWords((prev) => [...prev, { text: normalized, source, wrongLogId }]);
  };

  const selectWord = (wordObj) => {
    // mistakePool의 item: { id: wrongWordId, word, meaning }
    toggleSelectWord(wordObj.word, "mistake", wordObj.id);
  };

  const removeWord = (textToRemove) => {
    setSelectedWords((prev) => prev.filter((w) => w.text !== textToRemove));
  };

  const handleClearAll = () => {
    if (!selectedWords.length) return;
    setSelectedWords([]);
  };

  const handleOpenMistakePage = () => {
    // 실제 라우트에 맞춰서 사용 (예: /wrong-note 또는 /learning/wrong-notes)
    navigate("/learning/wrong-notes");
  };

  const isFull = selectedWords.length >= MAX_SELECTED_WORDS;

  // 좌측에 표시되는 오답 단어 (최근 N개)
  const visibleMistakes = mistakePool.slice(0, MAX_VISIBLE_MISTAKES);
  const hasMoreMistakes = mistakePool.length > MAX_VISIBLE_MISTAKES;

  const handleGenerate = async () => {
    if (selectedWords.length === 0 || isGenerating) return;

    try {
      setIsGenerating(true);

      const words = selectedWords.map((w) => w.text);
      const wrongLogIds = selectedWords
        .filter((w) => w.source === "mistake" && w.wrongLogId)
        .map((w) => w.wrongLogId);

      // 1) AI 스토리 생성
      const aiResult = await generateAiStory({
        words,
        difficulty: DEFAULT_DIFFICULTY,
        style: DEFAULT_STYLE,
      });

      if (!aiResult || !aiResult.storyEn || !aiResult.storyKo) {
        throw new Error("AI 스토리 생성 결과가 올바르지 않습니다.");
      }

      // 2) 스토리 저장
      const title =
        words.length > 0 ? `Story with ${words.join(", ")}` : "AI Story";

      const saved = await saveStory({
        title,
        storyEn: aiResult.storyEn,
        storyKo: aiResult.storyKo,
        wrongLogIds,
      });

      // 3) 상세 페이지로 이동
      navigate(`/stories/${saved.storyId}`, {
        state: {
          story: {
            storyId: saved.storyId,
            title: saved.title,
            storyEn: saved.storyEn,
            storyKo: saved.storyKo,
            createdAt: saved.createdAt,
            words:
              aiResult.usedWords?.map((w) =>
                typeof w === "string" ? { text: w } : w
              ) || [],
          },
        },
      });
    } catch (e) {
      console.error("스토리 생성 실패:", e);
      alert("스토리를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 퀴즈에서 온 단어가 있었는지 여부 (UI 안내 문구용)
  const state = location.state || {};
  const hasQuizWords =
    Array.isArray(state.wrongWords) && state.wrongWords.length > 0;

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

            <p className="mistake-desc">
              최근 퀴즈에서 실수한 단어들입니다.
            </p>

            <div className="mistake-list">
              {loadingMistakes && (
                <p className="mistake-loading">오답 단어를 불러오는 중입니다...</p>
              )}

              {!loadingMistakes &&
                visibleMistakes.map((item) => {
                  const isSelected = selectedWords.some(
                    (w) => w.text.toLowerCase() === item.word.toLowerCase()
                  );
                  return (
                    <div
                      key={item.id}
                      className={`mistake-card ${isSelected ? "is-selected" : ""}`}
                      onClick={() => selectWord(item)}
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
                {selectedWords.length} / {MAX_SELECTED_WORDS}
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
                {selectedWords.length > 0 && (
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
                {selectedWords.length === 0 ? (
                  <div className="chips-empty">
                    좌측 오답 노트에서 단어를 선택해 주세요.
                  </div>
                ) : (
                  <div className="chips-wrap">
                    {selectedWords.map((item, idx) => (
                      <span key={idx} className={`word-chip ${item.source}`}>
                        {item.text}
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() => removeWord(item.text)}
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
                disabled={selectedWords.length === 0 || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? "AI가 스토리를 만드는 중..." : "스토리 생성하기"}
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoryCreatePage;
