// src/pages/wrongnote/WrongNotePage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWrongList } from "../../api/wrongApi";
import Pagination from "../../components/common/Pagination";
import { WrongNoteItem } from "./components/WrongNoteItem";
import "./WrongNotePage.css";

const PAGE_SIZE = 10;

// ===== 공통 헬퍼 =====
const isUsedInStory = (item) =>
  item?.isUsedInStory === "Y" ||
  item?.isUsedInStory === "y" ||
  item?.isUsedInStory === true;

const getWrongCount = (item) =>
  item?.totalWrong ?? item?.wrongCount ?? item?.wrong ?? 0;

const getLastWrongTime = (item) => {
  const raw = item?.lastWrongAt || item?.wrongAt || item?.wrong_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function WrongNotePage() {
  const navigate = useNavigate();

  // 원본 데이터
  const [rawItems, setRawItems] = useState([]);

  // 기존 필터
  const [filters, setFilters] = useState({
    isUsedInStory: "",
    sortBy: "latest",
  });

  // 스토리 헤더 필터
  const [storyFilter, setStoryFilter] = useState("all");
  const [showStoryMenu, setShowStoryMenu] = useState(false);

  // 액션 드롭다운
  const [showActions, setShowActions] = useState(false);

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 선택된 row 목록
  const [selectedIds, setSelectedIds] = useState([]);

  // 페이지
  const [page, setPage] = useState(0);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const closeAll = () => {
      setShowStoryMenu(false);
      setShowActions(false);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  // ====== 데이터 로딩 ======
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWrongList();
      setRawItems(Array.isArray(data) ? data : []);
      setSelectedIds([]);
      setPage(0);
    } catch (e) {
      console.error("오답 조회 실패:", e);
      setError("오답 기록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // ====== 필터 + 정렬 ======
  const processedItems = useMemo(() => {
    const { isUsedInStory: usedFilter, sortBy } = filters;
    let list = rawItems;

    list = list.filter((item) => {
      const used = isUsedInStory(item);
      if (usedFilter === "Y") return used;
      if (usedFilter === "N") return !used;
      return true;
    });

    list = [...list].sort((a, b) => {
      const aDate = getLastWrongTime(a);
      const bDate = getLastWrongTime(b);
      const aWrong = getWrongCount(a);
      const bWrong = getWrongCount(b);

      switch (sortBy) {
        case "oldest":
          return aDate - bDate;
        case "mostWrong":
          if (bWrong !== aWrong) return bWrong - aWrong;
          return bDate - aDate;
        default:
          return bDate - aDate; // latest
      }
    });

    return list;
  }, [rawItems, filters]);

  // ====== 스토리 사용 여부 헤더 필터 ======
  const storyFilteredItems = useMemo(() => {
    return processedItems.filter((item) => {
      if (storyFilter === "used") return isUsedInStory(item);
      if (storyFilter === "unused") return !isUsedInStory(item);
      return true;
    });
  }, [processedItems, storyFilter]);

  // ====== 페이지 ======
  const totalPages = useMemo(
    () => Math.ceil(storyFilteredItems.length / PAGE_SIZE) || 0,
    [storyFilteredItems.length]
  );

  const pagedItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return storyFilteredItems.slice(start, start + PAGE_SIZE);
  }, [storyFilteredItems, page]);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  // ====== 선택 ======
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);
  const selectedCount = selectedIds.length;

  // ====== 액션 ======
  const handleReviewAsQuiz = () => {
    if (selectedCount === 0) return;
    navigate(`/learning/quiz?source=wrong-note&wrongWordIds=${selectedIds.join(",")}`);
  };

  const handleReviewAsCard = () => {
    if (selectedCount === 0) return;
    navigate(`/learning/card?source=wrong-note&wrongWordIds=${selectedIds.join(",")}`);
  };

  const handleCreateStory = () => {
    if (selectedCount === 0) return;

    const selectedItems = rawItems.filter((i) =>
      selectedIds.includes(i.wrongWordId)
    );

    const hasUsed = selectedItems.some((i) => isUsedInStory(i));

    if (hasUsed) {
      alert("스토리에 사용된 단어가 포함되어 있어 생성할 수 없습니다.\n사용되지 않은 단어만 선택해주세요.");
      return;
    }

    const ids = selectedItems.map((i) => i.wrongWordId).join(",");
    navigate(`/stories/create?wrongWordIds=${ids}`);
  };

  return (
    <div className="wrongnote-page">

      {/* 타이틀 */}
      <header className="wrongnote-header">
        <div className="wrongnote-header__main">
          <h1>오답 노트</h1>
          <p className="wrongnote-header__subtitle">
            틀렸던 단어들을 모아서 다시 학습합니다.
          </p>
        </div>
      </header>

      {/* 리스트 */}
      <section className="wrongnote-list">
        
        {/* 상단 액션 (드롭다운 버전) */}
        <div className="wrongnote-actions-dropdown">

          <div className="wrongnote-actions__left">
            <span className="wrongnote-selected-count">
              선택된 단어 {selectedCount}개
            </span>
          </div>

          <div
            className="wrongnote-actions-dropdown-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="action-dropdown-btn"
              disabled={selectedCount === 0}
              onClick={() => setShowActions((prev) => !prev)}
            >
              선택한 단어로...▾
            </button>

            {showActions && (
              <div className="action-dropdown-menu">
                <div onClick={handleReviewAsQuiz}>단어 퀴즈</div>
                <div onClick={handleReviewAsCard}>단어 카드</div>
                <div onClick={handleCreateStory}>스토리 만들기</div>
                <div onClick={clearSelection}>선택 해제</div>
              </div>
            )}
          </div>

        </div>

        {loading && <div className="wrongnote-list__loading">로딩 중...</div>}
        {error && <div className="wrongnote-list__error">{error}</div>}
        {!loading && !error && storyFilteredItems.length === 0 && (
          <div className="wrongnote-list__empty">오답 기록이 없습니다.</div>
        )}

        {!loading && !error && storyFilteredItems.length > 0 && (
          <>
            <table className="wrongnote-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        pagedItems.length > 0 &&
                        pagedItems.every((i) =>
                          selectedIds.includes(i.wrongWordId)
                        )
                      }
                      onChange={(e) => {
                        const { checked } = e.target;
                        setSelectedIds((prev) => {
                          if (checked) {
                            const idsToAdd = pagedItems
                              .map((i) => i.wrongWordId)
                              .filter((id) => !prev.includes(id));
                            return [...prev, ...idsToAdd];
                          } else {
                            const pageIds = pagedItems.map((i) => i.wrongWordId);
                            return prev.filter((id) => !pageIds.includes(id));
                          }
                        });
                      }}
                    />
                  </th>

                  <th>단어</th>
                  <th>뜻</th>
                  <th>난이도</th>
                  <th>마지막 오답</th>
                  <th>오답 횟수</th>

                  {/* 스토리 헤더 필터 */}
                  <th
                    className="story-filter-header"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStoryMenu((prev) => !prev);
                    }}
                  >
                    스토리 ▾
                    {showStoryMenu && (
                      <div
                        className="story-filter-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div onClick={() => { setStoryFilter("all"); setShowStoryMenu(false); }}>
                          전체
                        </div>
                        <div onClick={() => { setStoryFilter("used"); setShowStoryMenu(false); }}>
                          사용됨
                        </div>
                        <div onClick={() => { setStoryFilter("unused"); setShowStoryMenu(false); }}>
                          미사용
                        </div>
                      </div>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {pagedItems.map((item) => (
                  <WrongNoteItem
                    key={item.wrongWordId}
                    item={item}
                    selected={selectedIds.includes(item.wrongWordId)}
                    onToggleSelect={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.wrongWordId);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <div className="wrongnote-pagination">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

    </div>
  );
}
