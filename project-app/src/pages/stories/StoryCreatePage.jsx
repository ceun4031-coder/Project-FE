// src/pages/stories/StoryCreatePage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wand2, ArrowLeft, Hash, ListChecks } from "lucide-react";
import Input from "../../components/common/Input";
import "./StoryCreatePage.css";

const StoryCreatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 퀴즈 오답에서 넘겨줄 때: navigate("/story/create", { state: { baseWords: [...] } })
  const baseWords = location.state?.baseWords || [];

  const [title, setTitle] = useState("");
  const [selectedWords, setSelectedWords] = useState(baseWords);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/story/list");
    }
  };

  const handleToggleWord = (word) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const isFormInvalid =
    !title.trim() || !prompt.trim() || selectedWords.length === 0;

  const handleGenerate = async () => {
    if (isFormInvalid || isGenerating) return;

    setIsGenerating(true);
    try {
      // TODO: 여기서 AI API 호출 로직 연결
      // - title
      // - selectedWords
      // - prompt
      // 를 기반으로 스토리 생성 요청
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="story-create-container">
      {/* Navigation Bar */}
      <div className="story-create-nav">
        <button
          type="button"
          onClick={handleBack}
          className="story-create-back-button"
        >
          <div className="story-create-back-icon">
            <ArrowLeft className="icon-16" />
          </div>
          <span className="story-create-back-text">Back to List</span>
        </button>

        <div className="story-create-nav-right">
          <span className="story-create-badge">AI Story Builder</span>
        </div>
      </div>

      <div className="story-create-layout">
        {/* Left Sidebar: 오답/학습 단어 선택 */}
        <aside className="create-vocab-sidebar">
          <div className="create-vocab-header">
            <div className="create-vocab-header-icon">
              <Hash className="icon-20" />
            </div>
            <div>
              <h2 className="create-vocab-title">Select Words</h2>
              <p className="create-vocab-subtitle">
                오답/학습 단어 중에서 스토리에 꼭 넣고 싶은 단어를 선택하세요.
              </p>
            </div>
          </div>

          {baseWords.length > 0 ? (
            <>
              <div className="create-vocab-summary">
                <ListChecks className="icon-16" />
                <span>
                  {selectedWords.length} / {baseWords.length}개 선택됨
                </span>
              </div>

              <div className="create-word-list">
                {baseWords.map((word) => {
                  const selected = selectedWords.includes(word);
                  return (
                    <button
                      key={word}
                      type="button"
                      className={
                        "create-word-card" +
                        (selected ? " create-word-card--selected" : "")
                      }
                      onClick={() => handleToggleWord(word)}
                    >
                      <span className="create-word-text">{word}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="create-vocab-empty">
              퀴즈 오답에서 진입하면<br />
              여기에서 사용할 단어를 선택할 수 있습니다.
            </div>
          )}
        </aside>

        {/* Right Panel: Story Create Form */}
        <section className="story-create-panel">
          <div className="story-create-panel-header">
            <div className="story-create-panel-icon">
              <Wand2 className="icon-24" />
            </div>
            <div>
              <h1 className="story-create-title">새 스토리 만들기</h1>
              <p className="story-create-subtitle">
                선택한 단어와 프롬프트를 기반으로 AI가 영어 스토리를 생성합니다.
              </p>
            </div>
          </div>

          <div className="story-create-form">
            <div className="story-create-field">
              <Input
                label="스토리 제목"
                placeholder="예: First Snow in My City"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="story-create-field">
              <div className="story-create-label-row">
                <label className="story-create-label">프롬프트 / 상황 설명</label>
                <span className="story-create-label-helper">
                  가능한 한 구체적으로 적어 줄수록 좋아요.
                </span>
              </div>
              <textarea
                className="story-create-textarea"
                placeholder="예: 겨울 방학 첫날, 친구들과 눈사람을 만드는 이야기로 만들어줘."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="story-create-generate-button"
              onClick={handleGenerate}
              disabled={isFormInvalid || isGenerating}
            >
              <Wand2 className="icon-16" />
              <span>
                {isGenerating ? "스토리 생성 중..." : "AI로 스토리 생성"}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoryCreatePage;
