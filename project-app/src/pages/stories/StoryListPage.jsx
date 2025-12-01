// src/pages/story/StoryListPage.jsx
import { BookOpen, ChevronRight, Plus, Search } from "lucide-react";
import { useState, useMemo } from "react"; // useMemo 추가
import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Pagination from "../../components/common/Pagination";
import "./StoryListPage.css";

const MOCK_STORIES = [
    {
    id: 1,
    title: "First Snow in Seoul",
    excerpt:
      "On the first snowy morning, I finally used every word I had studied this week.",
    date: "2025-11-26",
    words: ["snow", "memory", "whisper", "lantern"],
  },
  {
    id: 2,
    title: "The Coffee Shop",
    excerpt:
      "The aroma of roasted beans filled the air as I waited for my order.",
    date: "2025-11-26",
    words: ["aroma", "roasted", "wait", "order"],
  },
  {
    id: 3,
    title: "Midnight Study",
    excerpt: "It was quiet, only the sound of turning pages could be heard.",
    date: "2025-11-25",
    words: ["quiet", "sound", "turn", "page", "focus"],
  },
  {
    id: 4,
    title: "Morning Subway",
    excerpt:
      "The subway was crowded, but the announcer's calm voice made the ride bearable.",
    date: "2025-11-24",
    words: ["crowded", "announcer", "calm", "ride"],
  },
  {
    id: 5,
    title: "Rainy Campus",
    excerpt:
      "Raindrops tapped on the library window as students rushed to finish their assignments.",
    date: "2025-11-24",
    words: ["raindrop", "library", "assignment", "rush"],
  },
  {
    id: 6,
    title: "Sunday Market",
    excerpt:
      "Vendors shouted friendly greetings while customers compared fresh fruits and vegetables.",
    date: "2025-11-23",
    words: ["vendor", "greeting", "compare", "fresh"],
  },
  {
    id: 7,
    title: "Late-night Coding",
    excerpt:
      "The only light in the room came from the monitor, and the keyboard never stopped clicking.",
    date: "2025-11-22",
    words: ["monitor", "keyboard", "click", "debug"],
  },
  {
    id: 8,
    title: "Airport Goodbye",
    excerpt:
      "We waved until we could no longer recognize each other's silhouettes in the crowd.",
    date: "2025-11-21",
    words: ["wave", "silhouette", "crowd", "distance"],
  },
  {
    id: 9,
    title: "Library Encounter",
    excerpt:
      "I found my favorite book already open on the table, as if someone had been waiting for me.",
    date: "2025-11-20",
    words: ["favorite", "open", "table", "waiting"],
  },
  {
    id: 10,
    title: "Riverside Jogging",
    excerpt:
      "The cold wind brushed past my cheeks as the city lights reflected on the river.",
    date: "2025-11-19",
    words: ["wind", "cheek", "reflect", "river"],
  },
  {
    id: 11,
    title: "Group Presentation",
    excerpt:
      "My hands trembled at first, but my voice grew steady as I continued to speak.",
    date: "2025-11-18",
    words: ["tremble", "steady", "presentation", "speak"],
  },
  {
    id: 12,
    title: "Lost Umbrella",
    excerpt:
      "I realized I had left my umbrella on the bus just as the rain began to pour down.",
    date: "2025-11-17",
    words: ["umbrella", "bus", "realize", "pour"],
  },
  {
    id: 13,
    title: "Evening Park",
    excerpt:
      "Children's laughter echoed through the park while the sun slowly disappeared.",
    date: "2025-11-16",
    words: ["laughter", "echo", "park", "sunset"],
  },
  {
    id: 14,
    title: "New Classroom",
    excerpt:
      "The classroom felt unfamiliar, but the smell of new textbooks gave me a sense of excitement.",
    date: "2025-11-15",
    words: ["unfamiliar", "textbook", "excitement", "desk"],
  },
];

const PAGE_SIZE = 6;

const StoryListPage = ({ stories = [] }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. 현재 페이지 인덱스 가져오기 (URL 쿼리스트링 기준)
  const currentPageIndex = Number(searchParams.get("page") || 0);

  const handleSelectStory = (story) => navigate(`/stories/${story.id}`);
  const handleCreateNew = () => navigate("/stories/create");

  // 2. 전체 데이터 준비 (정렬 포함) - useMemo로 불필요한 연산 방지
  const sourceStories = useMemo(() => {
    const targetList = stories.length > 0 ? stories : MOCK_STORIES;
    return [...targetList].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [stories]);

  // 3. 검색 필터링
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

  // 4. 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));
  const safeIndex = Math.min(Math.max(currentPageIndex, 0), totalPages - 1);
  
  // [핵심 수정] 항목이 늘어나지 않게 '시작'과 '끝'을 명확히 자릅니다.
  const startIdx = safeIndex * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  
  const pagedStories = useMemo(() => {
    // slice(start, end)는 start부터 end '직전'까지만 반환합니다.
    return filteredStories.slice(startIdx, endIdx); 
  }, [filteredStories, startIdx, endIdx]);

  const hasAnyStories = sourceStories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

  // 페이지 변경 핸들러
  const handlePageChange = (nextIndex) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", String(nextIndex));
      return params;
    });
    // 스크롤을 맨 위로 올려주는 UX 추가
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", "0"); // 검색 시 0페이지로 리셋
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

          <button className="create-story-btn" onClick={handleCreateNew}>
            <BookOpen size={18} />
            <span>새 스토리 만들기</span>
          </button>
        </section>

        <section className="story-grid">
          {hasAnyStories && !hasFilteredStories && (
            <div className="empty-msg">
              <p>검색 결과가 없습니다. 🍂</p>
            </div>
          )}

          {!hasAnyStories && (
            <article
              className="story-card add-card"
              onClick={handleCreateNew}
              role="button"
              tabIndex={0}
            >
              <div className="add-icon-wrapper">
                <Plus size={32} />
              </div>
              <h3 className="add-card-title">첫 번째 스토리 만들기</h3>
              <p className="add-card-desc">
                학습한 단어를 활용해 문장을 만들어보세요.
              </p>
            </article>
          )}

          {/* pagedStories만 렌더링하므로 6개를 초과하지 않음 */}
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