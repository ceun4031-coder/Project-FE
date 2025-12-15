// src/pages/story/StoryCreatePage.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Book, Sparkles, X } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

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

  // 오답 데이터 풀
  const [mistakePool, setMistakePool] = useState([]);
  const [loadingMistakes, setLoadingMistakes] = useState(true);

  // 선택된 단어
  const [selectedWords, setSelectedWords] = useState([]);

  // 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [initializedFromParams, setInitializedFromParams] = useState(false);

  const state = location.state || {};
  const hasQuizWords =
    Array.isArray(state.wrongWords) && state.wrongWords.length > 0;

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

        const mapped = (res || []).map((item) => {
          const rawWord = item.word;

          // 서버에서 word가 문자열 / 객체 둘 다 올 수 있음
          const wordText =
            typeof rawWord === "string"
              ? rawWord
              : rawWord?.word ?? "";

          const meaningText =
            item.meaning ??
            (typeof rawWord === "object" ? rawWord?.meaning : "") ??
            "";

          return {
            // 오답 로그 PK
            id:
              item.wrongWordId ??
              item.wrongAnswerLogId ??
              item.id,

            // 단어 PK (wordId도 같이 보존)
            wordId:
              item.wordId ??
              (typeof rawWord === "object"
                ? rawWord.wordId ?? rawWord.id ?? null
                : null),

            word: wordText,
            meaning: meaningText,
          };
        });

        setMistakePool(mapped);
      } catch (e) {
        console.error("오답 목록 로딩 실패:", e);
      } finally {
        setLoadingMistakes(false);
      }
    };

    fetchMistakes();
  }, []);

  // 2) Quiz / WrongNote 에서 넘어온 단어 자동 선택
  useEffect(() => {
    // 아직 오답 목록 못 불러왔거나, 이미 한 번 초기화 했으면 패스
    if (initializedFromParams || loadingMistakes) return;

    const wrongWordsFromState = Array.isArray(state.wrongWords)
      ? state.wrongWords
      : [];

    const initialSelected = [];

    // (1) QuizPage / 다른 페이지에서 state.wrongWords 로 넘어온 케이스
    if (wrongWordsFromState.length > 0) {
      wrongWordsFromState.forEach((item) => {
        if (initialSelected.length >= MAX_SELECTED_WORDS) return;

        const text = (item.word || item.text || "").trim();
        if (!text) return;

        const lower = text.toLowerCase();
        if (initialSelected.some((w) => w.text.toLowerCase() === lower)) return;

        // 1차: state에 직접 실려온 ID들
        let wrongLogId =
          item.wrongLogId ??
          item.wrongWordId ??
          item.wrongAnswerLogId ??
          item.id ??
          null;

        // 2차: mistakePool 기준으로 wordId / 단어 텍스트로 매칭해서 wrongLogId 보완
        if (!wrongLogId && mistakePool.length > 0) {
          const itemWordId =
            item.wordId != null ? Number(item.wordId) : null;

          // 2-1) wordId 기준 매칭
          if (itemWordId != null && !Number.isNaN(itemWordId)) {
            const matchedById = mistakePool.find(
              (m) =>
                m.wordId != null &&
                Number(m.wordId) === itemWordId
            );
            if (matchedById) {
              wrongLogId = matchedById.id;
            }
          }

          // 2-2) 그래도 없으면 단어 텍스트 기준 매칭
          if (!wrongLogId) {
            const matchedByText = mistakePool.find(
              (m) =>
                typeof m.word === "string" &&
                m.word.toLowerCase() === lower
            );
            if (matchedByText) {
              wrongLogId = matchedByText.id;
            }
          }
        }

        initialSelected.push({
          text,
          source: "mistake",
          wrongLogId,
        });
      });
    }

    // (2) WrongNotePage → /stories/create?wrongWordIds=... 로 온 경우 (기존 동작 유지)
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
          if (
            initialSelected.some(
              (w) => w.text.toLowerCase() === lower
            )
          )
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
  }, [
    state.wrongWords,
    searchParams,
    mistakePool,
    loadingMistakes,
    initializedFromParams,
  ]);

  // 단어 토글 선택
  const toggleSelectWord = (wordText, source = "mistake", wrongLogId = null) => {
    const normalized = (wordText || "").trim();
    if (!normalized) return;

    const lower = normalized.toLowerCase();
    const exists = selectedWords.some((w) => w.text.toLowerCase() === lower);

    if (exists) {
      setSelectedWords((prev) =>
        prev.filter((w) => w.text.toLowerCase() !== lower)
      );
      return;
    }

    if (selectedWords.length >= MAX_SELECTED_WORDS) {
      alert(`단어는 최대 ${MAX_SELECTED_WORDS}개까지만 선택할 수 있어요.`);
      return;
    }

    setSelectedWords((prev) => [
      ...prev,
      { text: normalized, source, wrongLogId },
    ]);
  };

  const selectWord = (wordObj) => {
    toggleSelectWord(wordObj.word, "mistake", wordObj.id);
  };

  const removeWord = (textToRemove) => {
    setSelectedWords((prev) =>
      prev.filter((w) => w.text !== textToRemove)
    );
  };

  const handleClearAll = () => {
    if (!selectedWords.length) return;
    setSelectedWords([]);
  };

  const handleOpenMistakePage = () => {
    navigate("/learning/wrong-notes");
  };

  const isFull = selectedWords.length >= MAX_SELECTED_WORDS;

  const visibleMistakes = mistakePool.slice(0, MAX_VISIBLE_MISTAKES);
  const hasMoreMistakes = mistakePool.length > MAX_VISIBLE_MISTAKES;

  // 스토리 생성
  const handleGenerate = async () => {
    if (selectedWords.length === 0 || isGenerating) return;

    const wrongLogIds = selectedWords
      .map((w) => w.wrongLogId)
      .filter((id) => id != null);

    if (wrongLogIds.length === 0) {
      alert(
        "선택된 단어에 연결된 오답 로그 ID가 없습니다.\n다시 선택해 주세요."
      );
      return;
    }

    try {
      setIsGenerating(true);

      const aiResult = await generateAiStory({
        wrongAnswerLogIds: wrongLogIds,
      });

      if (!aiResult?.success) {
        throw new Error(aiResult?.message || "AI 스토리 생성에 실패했습니다.");
      }

          navigate(`/stories/${aiResult.storyId}`, {
          state: {
            story: {
              storyId: aiResult.storyId,

              // ✅ 여기 핵심
              title: aiResult.title,     // 영어 제목
              titleKo: aiResult.titleKo,   // 한글 제목

              storyEn: aiResult.storyEn,
              storyKo: aiResult.storyKo,
              createdAt: new Date().toISOString(),
              words:
                aiResult.usedWords?.map((w) =>
                  typeof w === "string" ? { text: w } : w
                ) || [],
            },
          },
        });

    } catch (e) {
      console.error("스토리 생성 실패:", e);
      alert(e.message || "스토리를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

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
                <p className="mistake-loading">
                  오답 단어를 불러오는 중입니다...
                </p>
              )}

              {!loadingMistakes &&
                visibleMistakes.map((item) => {
                  const isSelected = selectedWords.some(
                    (w) =>
                      w.text.toLowerCase() ===
                      (item.word || "").toLowerCase()
                  );
                  return (
                    <div
                      key={item.id}
                      className={`mistake-card ${
                        isSelected ? "is-selected" : ""
                      }`}
                      onClick={() => selectWord(item)}
                    >
                      <div className="card-top">
                        <span className="card-word">{item.word}</span>
                        {isSelected && (
                          <span className="selected-mark">선택됨</span>
                        )}
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

            {/* 하단 버튼 영역 */}
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

        {/* 생성 중 모달 스피너 */}
        {isGenerating && (
          <div className="story-generate-overlay">
            <div className="story-generate-modal">
              <div className="story-generate-spinner" />
              <p className="story-generate-title">
                AI가 스토리를 만드는 중입니다
              </p>
              <p className="story-generate-desc">
                선택한 단어들을 자연스러운 문맥 속에 녹이고 있어요.
                <br />
                잠시만 기다려 주세요.
              </p>

              {selectedWords.length > 0 && (
                <div className="story-generate-words">
                  {selectedWords.map((w) => (
                    <span key={w.text} className="story-generate-chip">
                      {w.text}
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
