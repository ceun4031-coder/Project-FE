// src/pages/story/StoryDetailPage.jsx
import { deleteStory, getStoryDetail, getStoryWords } from "@/api/storyApi";
import { ArrowLeft, Book, Calendar, Clock, Quote, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./StoryDetailPage.css";
import { toKoreanPOS } from "@/utils/posUtils";

// 정규식 특수문자 이스케이프
const escapeRegExp = (str = "") =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 읽기 시간(분) 추정
const estimateReadTime = (text = "") => {
  if (!text.trim()) return "";
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 150));
  return `${minutes} min read`;
};

// 단어 객체/값을 안전한 문자열로 변환
const toSafeWord = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;

  const raw = item.text ?? item.word ?? "";
  if (typeof raw === "string") return raw;

  try {
    return String(raw);
  } catch {
    return "";
  }
};

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialStory = location.state?.story ?? null;

  const [story, setStory] = useState(initialStory);
  const [storyLoading, setStoryLoading] = useState(!initialStory);

  // 단어 로딩은 story 로딩과 분리 (생성 직후: story는 보여주고 단어만 갱신)
  const [wordsLoading, setWordsLoading] = useState(false);

  // 현재 호버 중인 단어(소문자 기준)
  const [activeWord, setActiveWord] = useState(null);

  // 생성 직후 initialStory.words가 string[]일 수 있음
  const [words, setWords] = useState(
    Array.isArray(initialStory?.words) ? initialStory.words : []
  );

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchAll = async () => {
      try {
        // initialStory가 있으면 화면은 먼저 그리고 백그라운드 갱신만
        if (!initialStory) setStoryLoading(true);
        setWordsLoading(true);

        const [detail, wordList] = await Promise.all([
          getStoryDetail(id),
          getStoryWords(id),
        ]);

        if (cancelled) return;

        if (detail) setStory(detail);
        setWords(Array.isArray(wordList) ? wordList : []);
      } catch (error) {
        if (cancelled) return;
        console.error("스토리 로딩 실패:", error);
        alert("스토리를 불러올 수 없습니다.");
        navigate("/stories");
      } finally {
        if (cancelled) return;
        setStoryLoading(false);
        setWordsLoading(false);
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
    // initialStory를 deps에 넣지 않음: 있어도 항상 words를 새로 받아야 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/stories");
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 스토리를 삭제할까요?")) return;

    try {
      await deleteStory(id);
      alert("스토리가 삭제되었습니다.");
      navigate("/stories");
    } catch (error) {
      console.error(error);
      alert("스토리 삭제에 실패했습니다.");
    }
  };

  // keywords: words 배열에서 안전하게 문자열만 추출
  const keywords = useMemo(() => {
    return Array.isArray(words)
      ? words
          .map(toSafeWord)
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter((s) => s.length > 0)
      : [];
  }, [words]);

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
      if (!part) return part;

      const isKeyword = keywords.some(
        (k) => k && k.toLowerCase() === part.toLowerCase()
      );
      if (!isKeyword) return part;

      const normalized = part.toLowerCase();
      const isActive = activeWord && activeWord === normalized;

      return (
        <span
          key={`${part}-${i}`}
          className={
            isActive
              ? "highlighted-word highlighted-word--active"
              : "highlighted-word"
          }
          data-word={normalized}
        >
          {part}
        </span>
      );
    });
  };

  // story 자체가 없고 로딩 중이면 전체 로딩
  if (storyLoading && !story) {
    return (
      <div className="story-detail-loading">
        <p>스토리를 불러오는 중입니다... ⏳</p>
      </div>
    );
  }

  if (!story) return null;

  const { title, storyEn, storyKo, createdAt } = story;

  const content = storyEn || "";
  const translation = storyKo || "";
  const date = createdAt ? createdAt.slice(0, 10) : "";
  const readTime = estimateReadTime(content);
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
                {Array.isArray(words) ? words.length : 0}
              </span>
            </div>

            <p className="vocab-desc">
              이 스토리에 사용된 핵심 단어입니다.
              <br />
              문맥 속에서 의미를 확인해보세요.
            </p>

            <div className="vocab-list">
              {wordsLoading && (
                <p className="vocab-empty">단어 정보를 불러오는 중...</p>
              )}

              {!wordsLoading && Array.isArray(words) && words.length > 0 ? (
                words.map((item, idx) => {
                  const isString = typeof item === "string";

                  const rawText = isString ? item : item?.text ?? item?.word ?? "";
                  const text =
                    typeof rawText === "string"
                      ? rawText
                      : rawText != null
                      ? String(rawText)
                      : "";

                  // ✅ string이면 pos/meaning 없음 (생성 직후 임시 상태)
                  // ✅ getStoryWords()로 받아온 객체면 pos/meaning 표시됨
                  const pos = !isString
                    ? toKoreanPOS(item?.pos || item?.type || item?.partOfSpeech || "")
                    : "";
                  const meaning = !isString ? item?.meaning || item?.kor || "" : "";

                  const normalized = text ? text.toLowerCase() : "";

                  return (
                    <div
                      key={idx}
                      className="mini-word-card"
                      onMouseEnter={() => normalized && setActiveWord(normalized)}
                      onMouseLeave={() => setActiveWord(null)}
                    >
                      <div className="mini-word-header">
                        <span className="mini-word-text">{text}</span>
                        {pos && <span className="mini-word-pos">{pos}</span>}
                      </div>
                      {meaning && <p className="mini-word-meaning">{meaning}</p>}
                    </div>
                  );
                })
              ) : !wordsLoading ? (
                <p className="vocab-empty">등록된 단어가 없습니다.</p>
              ) : null}
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

            <div className="story-main-footer">
              <button
                type="button"
                className="story-delete-btn"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                삭제
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;
