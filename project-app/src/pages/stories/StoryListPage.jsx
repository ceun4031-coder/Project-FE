// src/pages/stories/StoryListPage.jsx
import {
  BookOpen,
  ChevronRight,
  Plus,
  Search
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import "./StoryListPage.css";

// 기본 목업 스토리 1개 (stories props 안 들어오면 이 데이터 사용)
const MOCK_STORIES = [
  {
    id: 1,
    title: "First Snow in Seoul",
    excerpt:
      "On the first snowy morning, I finally used every word I had studied this week.",
    date: "2025-11-26",
    readTime: "5 min read",
    words: ["snow", "memory", "whisper", "lantern"],
    content: `...`,
    translation: `...`,
  },
  {
    id: 2,
    title: "First Snow in Seoul 2",
    excerpt:
      "On the first snowy morning, I finally used every word I had studied this week.",
    date: "2025-11-26",
    readTime: "5 min read",
    words: ["snow", "memory", "whisper", "lantern"],
    content: `...`,
    translation: `...`,
  },
  {
    id: 3,
    title: "First Snow in Seoul 3",
    excerpt:
      "On the first snowy morning, I finally used every word I had studied this week.",
    date: "2025-11-26",
    readTime: "5 min read",
    words: ["snow", "memory", "whisper", "lantern"],
    content: `...`,
    translation: `...`,
  },
];

const StoryListPage = ({ stories = [] }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSelectStory = (story) => {
    navigate("/story/detail", {
      state: { story },
    });
  };

  const handleCreateNew = () => {
    navigate("/story/create");
  };

  const sourceStories = stories.length > 0 ? stories : MOCK_STORIES;

  const filteredStories =
    searchValue.trim().length === 0
      ? sourceStories
      : sourceStories.filter((story) => {
          const q = searchValue.toLowerCase();
          return (
            story.title?.toLowerCase().includes(q) ||
            story.excerpt?.toLowerCase().includes(q)
          );
        });

  const hasAnyStories = sourceStories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

  return (
    <div className="page-container story-list-page">
      {/* Header Section */}
      <header className="story-list-header">
        <div className="story-list-header-left">
          <h1 className="story-list-title">AI 스토리</h1>
          <p className="story-list-subtitle">
            내가 학습한 단어로 만든 스토리 컬렉션입니다.
          </p>

          {/* 메인 CTA 버튼: 왼쪽 영역, 제목 아래 */}
          <button
            type="button"
            className="story-new-button"
            onClick={handleCreateNew}
          >
            <BookOpen className="icon-sm" />
            <span>스토리 생성</span>
          </button>
        </div>

        <div className="story-list-header-right">
          <Input
            type="text"
            size="sm"
            search
            placeholder="스토리 검색..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            leftIcon={<Search className="icon-sm" />}
            wrapperClassName="story-search-wrapper"
          />
        </div>
      </header>

      {/* Story Grid */}
      <section className="story-grid">
        {hasAnyStories &&
          hasFilteredStories &&
          filteredStories.map((story) => (
            <article
              key={story.id}
              className="card story-card"
              onClick={() => handleSelectStory(story)}
            >
              {/* 카드 헤더 */}
              <div className="story-card-header">
                <div className="story-card-header-main">
                  <div className="story-card-title-block">
                    <h3 className="story-card-title">{story.title}</h3>
                    {story.excerpt && (
                      <p className="story-card-excerpt">{story.excerpt}</p>
                    )}
                  </div>
                </div>
                {/* 상단 날짜 메타는 제거 */}
              </div>

              {/* 카드 본문 (구분선 + 태그) */}
              <div className="story-card-body">
                {story.words && story.words.length > 0 && (
                  <>
                    <div className="story-card-divider" />
                    <div className="story-card-tags">
                      {story.words.map((word, idx) => (
                        <span key={idx} className="story-card-tag">
                          #{word}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 카드 푸터: 좌측 달력+날짜, 우측 스토리 읽기 버튼 */}
              <div className="story-card-footer">
                <div className="story-card-footer-meta">
                  <span className="story-card-date">{story.date}</span>
                </div>

                <button
                  type="button"
                  className="story-card-readmore"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectStory(story);
                  }}
                >
                  스토리 읽기
                  <ChevronRight className="icon-sm" />
                </button>
              </div>
            </article>
          ))}

        {/* 2) 스토리는 있지만, 검색 결과만 없을 때 -> 검색 결과 없음 카드 */}
        {hasAnyStories && !hasFilteredStories && (
          <article className="card card--compact story-card-empty">
            <div className="story-card-empty-body">
              <p className="story-card-empty-title">검색 결과가 없습니다.</p>
              <p className="story-card-empty-text">
                다른 키워드로 검색해 보거나, 새로운 스토리를 작성해 보세요.
              </p>
            </div>
          </article>
        )}

        {/* 3) 스토리가 아예 하나도 없을 때 -> Create New 카드로 빈 상태 */}
        {!hasAnyStories && (
          <article
            className="card card--interactive card--compact story-card-add story-card-add--empty"
            onClick={handleCreateNew}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCreateNew();
              }
            }}
          >
            <div className="story-card-add-icon-wrapper">
              <Plus className="icon-lg story-card-add-icon" />
            </div>
            <div className="card-body story-card-add-body">
              <h3 className="card-title story-card-add-title">Create New</h3>
              <p className="card-subtitle story-card-add-text">
                Write a story with your words
              </p>
            </div>
          </article>
        )}
      </section>
    </div>
  );
};

export default StoryListPage;
