// src/pages/stories/StoryDetailPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
  Clock,
  Hash,
  Quote,
} from "lucide-react";
import "./StoryDetailPage.css";

const StoryDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const story = location.state?.story;

  const handleBack = () => {
    // 뒤로 가기 또는 리스트로 이동
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/story/list");
    }
  };

  if (!story) {
    // 잘못 직접 진입했을 때 대비
    return (
      <div className="story-detail-empty">
        <div className="story-detail-empty-inner">
          <p>잘못된 접근입니다. 스토리 목록에서 다시 선택해 주세요.</p>
          <button
            type="button"
            className="story-detail-empty-button"
            onClick={() => navigate("/story/list")}
          >
            스토리 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-detail-container">
      {/* Navigation Bar */}
      <div className="story-detail-nav">
        <button type="button" onClick={handleBack} className="back-button">
          <div className="back-button-icon">
            <ArrowLeft className="icon-16" />
          </div>
          <span className="back-button-text">스토리 목록으로</span>
        </button>

        <div className="story-detail-nav-right">
          <span className="badge-original">Original Story</span>
        </div>
      </div>

      <div className="story-detail-layout">
        {/* Left Sidebar: Vocabulary List */}
        <aside className="vocab-sidebar">
          <div className="vocab-header">
            <div className="vocab-header-icon">
              <Hash className="icon-20" />
            </div>
            <div>
              <h2 className="vocab-title">Vocabulary</h2>
              <p className="vocab-subtitle">Words used in this story</p>
            </div>
          </div>

          <div className="word-list">
            {story.words.map((word, idx) => (
              <div key={idx} className="word-card">
                <div className="word-card-inner">
                  <span className="word-card-text">{word}</span>
                  <ChevronRight className="word-card-chevron icon-16" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Panel: Story Reader */}
        <section className="story-panel">
          <Quote className="story-panel-quote icon-96" />

          <div className="story-header">
            <h1 className="story-title">{story.title}</h1>
            <div className="story-meta">
              <span className="story-meta-item">
                <Calendar className="icon-16" />
                {story.date}
              </span>
              <span className="story-meta-dot" />
              <span className="story-meta-item">
                <Clock className="icon-16" />
                {story.readTime}
              </span>
            </div>
          </div>

          <div className="story-body">
            {/* English Content */}
            <div className="story-content">
              <p className="story-content-text">{story.content}</p>
            </div>

            {/* Korean Translation */}
            <div className="translation-card">
              <div className="translation-label">KOREAN</div>
              <p className="translation-text">{story.translation}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoryDetailPage;
