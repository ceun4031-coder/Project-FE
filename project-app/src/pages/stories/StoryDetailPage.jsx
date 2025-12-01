import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Book, Quote } from "lucide-react";
import { getStoryDetail } from "../../api/storyApi";
import "./StoryDetailPage.css";

// 정규식 특수문자 이스케이프
const escapeRegExp = (str = "") =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialStory = location.state?.story ?? null;
  const [story, setStory] = useState(initialStory);
  const [loading, setLoading] = useState(!initialStory);

  // 현재 호버 중인 단어(소문자 기준)
  const [activeWord, setActiveWord] = useState(null);

  useEffect(() => {
    if (!id || initialStory) return;

    const fetchStory = async () => {
      try {
        setLoading(true);
        const data = await getStoryDetail(id);
        setStory(data);
      } catch (error) {
        console.error("스토리 로딩 실패:", error);
        alert("스토리를 불러올 수 없습니다.");
        navigate("/stories");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, initialStory, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/stories");
    }
  };

  // --- 하이라이트 로직 ---
  const keywords = story?.words
    ? story.words.map((w) => (typeof w === "string" ? w : w.text || w.word))
    : [];

  const highlightKeywords = (text) => {
    if (!keywords.length || !text) return text;

    const pattern = keywords
      .filter(Boolean)
      .map((k) => escapeRegExp(k))
      .join("|");

    if (!pattern) return text;

    const regex = new RegExp(`\\b(${pattern})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isKeyword = keywords.some(
        (k) => k && k.toLowerCase() === part.toLowerCase()
      );

      if (!isKeyword) return part;

      const normalized = part.toLowerCase();
      const isActive = activeWord && activeWord === normalized;
      const className = isActive
        ? "highlighted-word highlighted-word--active"
        : "highlighted-word";

      return (
        <span
          key={`${part}-${i}`}
          className={className}
          data-word={normalized}
        >
          {part}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="story-detail-loading">
        <p>스토리를 불러오는 중입니다... ⏳</p>
      </div>
    );
  }

  if (!story) return null;

  const {
    title,
    date,
    readTime,
    words = [],
    content = "",
    translation = "",
  } = story;

  const lines = content ? content.split("\n") : [];

  return (
    <div className="page-container">
      <div className="story-page story-detail-page">
        {/* 1. 상단 네비게이션 */}
        <nav className="story-nav">
          <button type="button" onClick={handleBack} className="nav-back-btn">
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        <div className="story-layout">
          {/* 2. 좌측 사이드바: 단어장 */}
          <aside className="story-sidebar vocab-sidebar">
            <div className="vocab-header">
              <h3>
                <Book size={18} className="text-primary-500" /> 학습 단어
              </h3>
              <span className="nav-badge" style={{ fontSize: "0.8rem" }}>
                {words.length}
              </span>
            </div>

            <p className="vocab-desc">
              이 스토리에 사용된 핵심 단어입니다.
              <br />
              문맥 속에서 의미를 확인해보세요.
            </p>

            <div className="vocab-list">
              {words.length > 0 ? (
                words.map((item, idx) => {
                  const isString = typeof item === "string";
                  const text = isString ? item : item.text || item.word || "";
                  const pos = !isString ? item.pos || item.type || "Word" : "Word";
                  const meaning = !isString ? item.meaning || item.kor || "" : "";

                  const normalized = text ? text.toLowerCase() : "";

                  return (
                    <div
                      key={idx}
                      className="mini-word-card"
                      onMouseEnter={() =>
                        normalized && setActiveWord(normalized)
                      }
                      onMouseLeave={() => setActiveWord(null)}
                    >
                      <div className="mini-word-header">
                        <span className="mini-word-text">{text}</span>
                        <span className="mini-word-pos">{pos}</span>
                      </div>
                      {meaning && (
                        <p className="mini-word-meaning">{meaning}</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="vocab-empty">등록된 단어가 없습니다.</p>
              )}
            </div>
          </aside>

          {/* 3. 우측 메인: 스토리 본문 */}
          <main className="story-main-card story-main">
            <Quote className="bg-quote-icon" />

            <header className="story-main-header">
              <h1 className="story-main-title">{title}</h1>
              <div className="story-meta-row">
                {date && (
                  <span className="meta-item">
                    <Calendar size={14} /> {date}
                  </span>
                )}
                {date && readTime && <span className="meta-divider">·</span>}
                {readTime && (
                  <span className="meta-item">
                    <Clock size={14} /> {readTime}
                  </span>
                )}
              </div>
            </header>

            <article className="story-article">
              <div className="story-english">
                {lines.map((line, i) => (
                  <p key={i} className="en-paragraph">
                    {highlightKeywords(line)}
                  </p>
                ))}
              </div>

              <hr className="story-divider" />

              <div className="story-korean">
                <div className="ko-label">한국어 번역</div>
                <p className="ko-paragraph">
                  {translation || "번역이 제공되지 않았습니다."}
                </p>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;
