// src/pages/story/StoryCreatePage.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Book, Sparkles, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/common/Button";
import "./StoryCreatePage.css";

import { generateAiStory } from "../../api/aiStoryApi";
import { saveStory } from "../../api/storyApi";
import { getRecentWrongLogs } from "../../api/wrongApi";

const MAX_SELECTED_WORDS = 5;
const MAX_VISIBLE_MISTAKES = 15;
const DEFAULT_DIFFICULTY = "intermediate";
const DEFAULT_STYLE = "narrative";

const normalize = (v) => (v ? v.trim().toLowerCase() : "");

const StoryCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mistakePool, setMistakePool] = useState([]);
  const [loadingMistakes, setLoadingMistakes] = useState(true);

  const [selectedWords, setSelectedWords] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz에서 온 단어로 자동 초기화했는지 여부
  const [initializedFromState, setInitializedFromState] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/stories");
  };

  // ---------------------------------------------------------
  // 1) 최근 오답 불러오기 (id 기준 최신순 정렬)
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        const res = await getRecentWrongLogs();

        const mapped = (res || []).map((item) => {
          const rawWord = item.word;

          const wordText =
            typeof rawWord === "string"
              ? rawWord
              : rawWord?.word ?? "";

          const meaningText =
            item.meaning ??
            (typeof rawWord === "object" ? rawWord?.meaning : "") ??
            "";

          return {
            id: item.wrongLogId ?? item.id ?? rawWord?.wordId,
            word: wordText,
            meaning: meaningText,
          };
        });

        // id (wrongLogId) 기준 최신순
        const sorted = [...mapped].sort((a, b) => {
          if (a.id == null || b.id == null) return 0;
          return b.id - a.id;
        });

        setMistakePool(sorted);
      } catch (e) {
        console.error("오답 목록 불러오기 실패:", e);
      } finally {
        setLoadingMistakes(false);
      }
    };

    fetchMistakes();
  }, []);

  // ---------------------------------------------------------
  // 2) QuizPage에서 넘어온 오답 단어 자동 선택
  //    - navigate("/stories/create", { state: { wrongWords: [...] } })
  // ---------------------------------------------------------
  useEffect(() => {
    if (initializedFromState) return;
    if (!mistakePool.length) return; // 오답 목록 먼저 로딩

    const state = location.state || {};
    const wrongWordsFromState = Array.isArray(state.wrongWords)
      ? state.wrongWords
      : [];

    if (!wrongWordsFromState.length) {
      setInitializedFromState(true);
      return;
    }

    const nextSelected = [];
    const seen = new Set();

    for (const item of wrongWordsFromState) {
      if (nextSelected.length >= MAX_SELECTED_WORDS) break;

      const text = (item.word || item.text || "").trim();
      if (!text) continue;

      const key = normalize(text);
      if (seen.has(key)) continue;
      seen.add(key);

      // 좌측 리스트(mistakePool)에서 같은 단어 찾기
      const found = mistakePool.find(
        (m) => normalize(m.word) === key
      );

      nextSelected.push({
        text,
        wrongLogId:
          found?.id ??
          item.wrongLogId ??
          item.id ??
          null,
        source: "mistake",
      });
    }

    if (nextSelected.length > 0) {
      setSelectedWords(nextSelected);
    }

    setInitializedFromState(true);
  }, [location.state, mistakePool, initializedFromState]);

  // ---------------------------------------------------------
  // 단어 선택 토글
  // ---------------------------------------------------------
  const toggleSelectWord = (wordText, wrongLogId = null) => {
    const normalizedText = (wordText || "").trim();
    if (!normalizedText) return;

    const lower = normalize(normalizedText);
    const exists = selectedWords.some((w) => normalize(w.text) === lower);

    if (exists) {
      // 이미 선택 → 해제
      setSelectedWords((prev) =>
        prev.filter((w) => normalize(w.text) !== lower)
      );
      return;
    }

    if (selectedWords.length >= MAX_SELECTED_WORDS) {
      alert(`단어는 최대 ${MAX_SELECTED_WORDS}개까지만 선택할 수 있어요.`);
      return;
    }

    // source: "mistake" → .word-chip.mistake, .mistake-card.is-selected 적용 트리거
    setSelectedWords((prev) => [
      ...prev,
      { text: normalizedText, wrongLogId, source: "mistake" },
    ]);
  };

  const selectWord = (item) => {
    toggleSelectWord(item.word, item.id);
  };

  const removeWord = (textToRemove) => {
    setSelectedWords((prev) =>
      prev.filter((w) => normalize(w.text) !== normalize(textToRemove))
    );
  };

  const handleClearAll = () => setSelectedWords([]);

  // ---------------------------------------------------------
  // 스토리 생성
  // ---------------------------------------------------------
  const handleGenerate = async () => {
    if (selectedWords.length === 0 || isGenerating) return;

    try {
      setIsGenerating(true);

      const words = selectedWords.map((w) => w.text);
      const wrongLogIds = selectedWords
        .filter((w) => w.wrongLogId)
        .map((w) => w.wrongLogId);

      const aiResult = await generateAiStory({
        words,
        difficulty: DEFAULT_DIFFICULTY,
        style: DEFAULT_STYLE,
      });

      if (!aiResult?.storyEn || !aiResult?.storyKo) {
        throw new Error("AI 스토리 생성 결과가 올바르지 않습니다.");
      }

      const title =
        words.length > 0 ? `Story with ${words.join(", ")}` : "AI Story";

      const saved = await saveStory({
        title,
        storyEn: aiResult.storyEn,
        storyKo: aiResult.storyKo,
        wrongLogIds,
      });

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
      alert("스토리 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------------------------------------------------
  // 렌더링
  // ---------------------------------------------------------
  const visibleMistakes = mistakePool.slice(0, MAX_VISIBLE_MISTAKES);

  return (
    <div className="page-container">
      <div className="story-page story-create-page">
        {/* 상단 네비 */}
        <nav className="story-nav">
          <button onClick={handleBack} className="nav-back-btn">
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        <div className="create-layout">
          {/* LEFT: 오답 목록 */}
          <aside className="mistake-sidebar">
            <div className="mistake-header">
              <h3>
                <Book size={18} className="text-primary-500" /> 오답 노트
              </h3>
              <span className="nav-badge">{mistakePool.length}</span>
            </div>

            <p className="mistake-desc">최근 퀴즈에서 실수한 단어들입니다.</p>

            <div className="mistake-list">
              {loadingMistakes && (
                <p className="mistake-loading">
                  오답 단어를 불러오는 중입니다...
                </p>
              )}

              {!loadingMistakes &&
                visibleMistakes.map((item) => {
                  const selected = selectedWords.some(
                    (w) => normalize(w.text) === normalize(item.word)
                  );

                  return (
                    <div
                      key={item.id}
                      className={`mistake-card ${
                        selected ? "is-selected" : ""
                      }`}
                      onClick={() => selectWord(item)}
                    >
                      <div className="card-top">
                        <span className="card-word">{item.word}</span>
                        {selected && (
                          <span className="selected-mark">선택됨</span>
                        )}
                      </div>
                      <div className="card-meaning">{item.meaning}</div>
                    </div>
                  );
                })}
            </div>
          </aside>

          {/* RIGHT: 선택 단어 + 버튼 */}
          <main className="builder-main">
            <header className="builder-header">
              <div className="builder-heading">
                <div className="builder-heading-row">
                  <Sparkles className="builder-heading-icon" size={18} />
                  <h3 className="builder-heading-title">AI 스토리</h3>
                </div>
                <p className="builder-heading-desc">
                  좌측 오답 노트에서 단어를 선택하면, 해당 단어들로 영어
                  스토리를 만들어 드립니다.
                </p>
              </div>

              <span
                className={`nav-badge nav-badge--small ${
                  selectedWords.length >= MAX_SELECTED_WORDS
                    ? "nav-badge--alert"
                    : ""
                }`}
              >
                {selectedWords.length} / {MAX_SELECTED_WORDS}
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

                {selectedWords.length > 0 && (
                  <button
                    className="chips-clear-btn"
                    type="button"
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
                      <span
                        key={idx}
                        className={`word-chip ${item.source || ""}`}
                      >
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

            <div className="builder-footer">
              <Button
                full
                size="lg"
                disabled={selectedWords.length === 0 || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating
                  ? "AI가 스토리를 만드는 중..."
                  : "스토리 생성하기"}
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoryCreatePage;
