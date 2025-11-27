import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // useParams 추가
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
  Clock,
  Hash,
  Quote,
} from "lucide-react";
import { getStoryDetail } from "../../api/storyApi"; // API 함수 임포트
import "./StoryDetailPage.css";

const StoryDetailPage = () => {
  const { id } = useParams(); // URL의 :id 가져오기
  const navigate = useNavigate();
  const location = useLocation();

  // 상태 관리
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        // 1. 만약 목록에서 넘어온 데이터가 있다면 그걸 먼저 씀 (최적화)
        if (location.state?.story) {
           setStory(location.state.story);
        } 
        // 2. 없다면(새로고침/직접접속) API 호출
        else {
           const data = await getStoryDetail(id);
           setStory(data);
        }
      } catch (error) {
        console.error("스토리 로딩 실패:", error);
        alert("스토리를 불러올 수 없습니다.");
        navigate("/story/list"); // 에러 시 목록으로 튕기기
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, location.state, navigate]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // 스토리 목록 페이지 경로가 /stories 라면 수정 필요
      navigate("/stories"); 
    }
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="story-detail-container" style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <p>Loading Story... ⏳</p>
      </div>
    );
  }

  // 데이터 없음 (에러) 화면
  if (!story) {
    return (
      <div className="story-detail-empty">
        <div className="story-detail-empty-inner">
          <p>스토리 정보를 찾을 수 없습니다.</p>
          <button
            type="button"
            className="story-detail-empty-button"
            onClick={() => navigate("/stories")}
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
          <span className="back-button-text">목록으로</span>
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
            {story.words && story.words.map((word, idx) => (
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
              {/* 줄바꿈 처리를 위해 split map 사용 */}
              {story.content.split('\n').map((line, i) => (
                 <p key={i} className="story-content-text" style={{ minHeight: line ? 'auto' : '1rem'}}>{line}</p>
              ))}
            </div>

            {/* Korean Translation */}
            <div className="translation-card">
              <div className="translation-label">KOREAN</div>
              <p className="translation-text">
                {story.translation}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoryDetailPage;