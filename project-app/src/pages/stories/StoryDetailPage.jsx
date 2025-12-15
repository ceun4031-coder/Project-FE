import { deleteStory, getStoryDetail, getStoryWords } from "@/api/storyApi";
import { ArrowLeft, Book, Calendar, Clock, Quote, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StoryDetailPage.css";
import { toKoreanPOS } from "@/utils/posUtils";

/* ---------------- utils ---------------- */

const escapeRegExp = (str = "") =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const estimateReadTime = (text = "") => {
  if (!text.trim()) return "";
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 150));
  return `${minutes} min read`;
};

const toSafeWord = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  const raw = item.text ?? item.word ?? "";
  return typeof raw === "string" ? raw : "";
};

/* ---------------- page ---------------- */

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);

  const [words, setWords] = useState([]);
  const [wordsLoading, setWordsLoading] = useState(true);

  const [activeWord, setActiveWord] = useState(null);

  /* -------- 데이터 로딩 -------- */
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchAll = async () => {
      try {
        setStoryLoading(true);
        setWordsLoading(true);

        const [detail, wordList] = await Promise.all([
          getStoryDetail(id),
          getStoryWords(id),
        ]);

        if (cancelled) return;

        setStory(detail);
        setWords(Array.isArray(wordList) ? wordList : []);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          alert("스토리를 불러올 수 없습니다.");
          navigate("/stories");
        }
      } finally {
        if (!cancelled) {
          setStoryLoading(false);
          setWordsLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  /* -------- handlers -------- */

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
    } catch {
      alert("스토리 삭제에 실패했습니다.");
    }
  };

  /* -------- derived -------- */

  const keywords = useMemo(() => {
    return Array.isArray(words)
      ? words.map(toSafeWord).map((w) => w.trim()).filter(Boolean)
      : [];
  }, [words]);

  const highlightKeywords = (text) => {
    if (!keywords.length || !text) return text;

    const regex = new RegExp(
      `\\b(${keywords.map(escapeRegExp).join("|")})\\b`,
      "gi"
    );

    return text.split(regex).map((part, i) => {
      const isKeyword = keywords.some(
        (k) => k.toLowerCase() === part.toLowerCase()
      );

      if (!isKeyword) return part;

      const normalized = part.toLowerCase();
      const isActive = activeWord === normalized;

      return (
        <span
          key={`${part}-${i}`}
          className={
            isActive
              ? "highlighted-word highlighted-word--active"
              : "highlighted-word"
          }
        >
          {part}
        </span>
      );
    });
  };

  /* -------- loading -------- */

  if (storyLoading) {
    return (
      <div className="story-detail-loading">
        <p>스토리를 불러오는 중입니다... ⏳</p>
      </div>
    );
  }

  if (!story) return null;

  /* -------- story fields -------- */

  const { title, titleKo, storyEn, storyKo, createdAt } = story;

  const content = storyEn || "";
  const lines = content.split("\n");
  const date = createdAt?.slice(0, 10);
  const readTime = estimateReadTime(content);

  /* -------- render -------- */

  return (
    <div className="page-container">
      <div className="story-page story-detail-page">
        <nav className="story-nav">
          <button onClick={handleBack} className="nav-back-btn">
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        <div className="story-layout">
          {/* 좌측 단어 */}
          <aside className="vocab-sidebar">
            <div className="vocab-header">
              <h3>
                <Book size={18} /> 학습 단어
              </h3>
              <span className="nav-badge">{words.length}</span>
            </div>

            <div className="vocab-list">
              {wordsLoading ? (
                <p className="vocab-empty">불러오는 중...</p>
              ) : (
                words.map((item, i) => {
                  const text =
                    typeof item === "string"
                      ? item
                      : item?.text ?? item?.word ?? "";

                  const pos =
                    typeof item === "object"
                      ? toKoreanPOS(item.pos || "")
                      : "";

                  const meaning =
                    typeof item === "object" ? item.meaning || "" : "";

                  return (
                    <div
                      key={i}
                      className="mini-word-card"
                      onMouseEnter={() =>
                        setActiveWord(text.toLowerCase())
                      }
                      onMouseLeave={() => setActiveWord(null)}
                    >
                      <div className="mini-word-header">
                        <span className="mini-word-text">{text}</span>
                        {pos && (
                          <span className="mini-word-pos">{pos}</span>
                        )}
                      </div>

                      {meaning && (
                        <p className="mini-word-meaning">{meaning}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* 본문 */}
          <main className="story-main">
            <Quote className="bg-quote-icon" />

            <header className="story-main-header">
              <h1 className="story-main-title">{title}</h1>

              <div className="story-meta-row">
                {date && (
                  <span className="meta-item">
                    <Calendar size={14} /> {date}
                  </span>
                )}
                {readTime && (
                  <span className="meta-item">
                    <Clock size={14} /> {readTime}
                  </span>
                )}
              </div>
            </header>

            <article className="story-article">
              <div className="story-english">
                {lines.map((l, i) => (
                  <p key={i} className="en-paragraph">
                    {highlightKeywords(l)}
                  </p>
                ))}
              </div>

              <hr className="story-divider" />

              <div className="story-korean">
                <div className="ko-label">한국어 번역</div>
                {titleKo && (
                  <p className="ko-title">{titleKo}</p>
                )}
                <p className="ko-paragraph">{storyKo}</p>
              </div>
            </article>

            <div className="story-main-footer">
              <button
                className="story-delete-btn"
                onClick={handleDelete}
              >
                <Trash2 size={16} /> 삭제
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;
