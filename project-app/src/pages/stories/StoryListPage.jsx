// src/pages/story/StoryListPage.jsx
import { ChevronRight, Search, FileQuestion } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import "./StoryListPage.css";
import { getStoryList } from "../../api/storyApi";

const PAGE_SIZE = 6;

const StoryListPage = ({ stories = [] }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [serverStories, setServerStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 현재 페이지 인덱스 (URL 쿼리스트링 기준, 0-based)
  const currentPageIndex = Number(searchParams.get("page") || 0);

  const handleSelectStory = (story) => navigate(`/stories/${story.id}`);

  const handleGoLearning = () => {
    navigate("/learning");
  };

  // 서버에서 스토리 목록 로딩
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await getStoryList();
        // 응답 데이터 매핑
        const mapped = (res || []).map((item) => ({
          id: item.storyId,
          title: item.title,
          excerpt: item.storyEn?.slice(0, 120) || "",
          date: item.createdAt?.slice(0, 10) || "",
          words: item.keywords || [],
        }));
        setServerStories(mapped);
      } catch (e) {
        console.error("스토리 목록 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // 전체 데이터 준비 (서버 데이터 우선, 없으면 props 사용)
  const sourceStories = useMemo(() => {
    const base = serverStories.length > 0 ? serverStories : stories;
    return [...base].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [serverStories, stories]);

  // 검색 필터링
  const filteredStories = useMemo(() => {
    if (searchValue.trim().length === 0) return sourceStories;

    const q = searchValue.toLowerCase();
    return sourceStories.filter((story) => {
      return (
        story.title?.toLowerCase().includes(q) ||
        story.excerpt?.toLowerCase().includes(q) ||
        (story.words || []).some((w) => w.toLowerCase().includes(q))
      );
    });
  }, [sourceStories, searchValue]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));
  const safeIndex = Math.min(Math.max(currentPageIndex, 0), totalPages - 1);

  const startIdx = safeIndex * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;

  const pagedStories = useMemo(
    () => filteredStories.slice(startIdx, endIdx),
    [filteredStories, startIdx, endIdx]
  );

  const hasAnyStories = sourceStories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

  // 페이지 변경
  const handlePageChange = (nextIndex) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", String(nextIndex));
      return params;
    });
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", "0");
      return params;
    });
  };

  return (
    <div className="page-container">
      <div className="story-list-page">
        <PageHeader
          title="AI"
          highlight="스토리"
          description="내가 학습한 단어로 만든 나만의 이야기입니다."
        />

        <section className="story-controls">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              className="search-input"
              placeholder="스토리 검색..."
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        </section>

        <section className="story-grid">
          {loading && (
            <div className="empty-msg">
              <p>스토리를 불러오는 중입니다... ⏳</p>
            </div>
          )}

          {/* 데이터는 있지만 검색 결과가 없을 때 */}
          {hasAnyStories && !hasFilteredStories && !loading && (
            <div className="empty-msg">
              <p>검색 결과가 없습니다. 🍂</p>
            </div>
          )}

        {/* 데이터가 아예 없을 때: 학습하기 유도 */}
{!hasAnyStories && !loading && (
  <div className="status-msg empty-search">
    <div className="empty-icon-wrapper">
      <FileQuestion size={64} strokeWidth={1.5} />
    </div>
    <p className="empty-title">AI 스토리가 아직 없습니다.</p>
    <p className="empty-desc">
      학습하기에서 퀴즈를 풀고, 나온 오답 단어들로 AI 스토리를 만들어 보세요.
    </p>
    <button
      type="button"
      className="reset-text-btn"
      onClick={handleGoLearning}
    >
      학습하러 가기
    </button>
  </div>
)}


          {/* 목록 렌더링 */}
          {hasFilteredStories &&
            pagedStories.map((story) => (
              <article
                key={story.id}
                className="story-card"
                onClick={() => handleSelectStory(story)}
                role="button"
                tabIndex={0}
              >
                <div className="story-card-top">
                  <h3 className="story-title">{story.title}</h3>
                  <p className="story-excerpt">{story.excerpt}</p>
                </div>

                {story.words && story.words.length > 0 && (
                  <div className="story-tags">
                    {story.words.slice(0, 4).map((word, idx) => (
                      <span key={idx} className="story-tag">
                        #{word}
                      </span>
                    ))}
                    {story.words.length > 4 && (
                      <span className="story-tag">...</span>
                    )}
                  </div>
                )}

                <div className="story-card-bottom">
                  <span className="story-date">{story.date}</span>
                  <div className="read-more">
                    Read Story <ChevronRight size={14} />
                  </div>
                </div>
              </article>
            ))}
        </section>

        {hasFilteredStories && (
          <Pagination
            page={safeIndex}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default StoryListPage;
