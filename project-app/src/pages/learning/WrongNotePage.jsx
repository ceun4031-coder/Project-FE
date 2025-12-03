// src/pages/wrongnote/WrongNotePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWrongList } from "../../api/wrongApi";
import Pagination from "../../components/common/Pagination";
import { WrongNoteItem } from "./components/WrongNoteItem";
import "./WrongNotePage.css";

const PAGE_SIZE = 10;

// 공통 헬퍼: 스토리 사용 여부
const isUsedInStory = (item) =>
  item?.isUsedInStory === "Y" ||
  item?.isUsedInStory === "y" ||
  item?.isUsedInStory === true;

// 공통 헬퍼: 오답 횟수
const getWrongCount = (item) =>
  item?.totalWrong ?? item?.wrongCount ?? item?.wrong ?? 0;

// 공통 헬퍼: 마지막 오답 일시
const getLastWrongTime = (item) => {
  const raw = item?.lastWrongAt || item?.wrongAt || item?.wrong_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function WrongNotePage() {
  const navigate = useNavigate();

  // 전체 오답 원본 리스트
  const [rawItems, setRawItems] = useState([]);

  // 필터 상태 (스토리 사용 여부 + 정렬)
  const [filters, setFilters] = useState({
    isUsedInStory: "",
    sortBy: "latest", // latest | oldest | mostWrong
  });

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 선택된 wrongWordId 리스트
  const [selectedIds, setSelectedIds] = useState([]);

  // 0-based 페이지 인덱스 (0,1,2,…)
  const [page, setPage] = useState(0);

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
      console.error("오답 목록 조회 실패:", e);
      setError("오답 기록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // ====== 필터 변경 ======
  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // ====== 필터 + 정렬 로직 ======
  const processedItems = useMemo(() => {
    const { isUsedInStory: usedFilter, sortBy } = filters;

    // 1) 필터링 (스토리 사용 여부만)
    const filtered = rawItems.filter((item) => {
      const used = isUsedInStory(item);

      if (usedFilter === "Y") {
        return used;
      }
      if (usedFilter === "N") {
        return !used;
      }
      return true; // 전체
    });

    // 2) 정렬
    const sorted = [...filtered].sort((a, b) => {
      const aDate = getLastWrongTime(a);
      const bDate = getLastWrongTime(b);

      const aWrong = getWrongCount(a);
      const bWrong = getWrongCount(b);

      switch (sortBy) {
        case "oldest":
          // 오래된순
          return aDate - bDate;
        case "mostWrong":
          // 많이 틀린순 (동점이면 최신순)
          if (bWrong !== aWrong) return bWrong - aWrong;
          return bDate - aDate;
        case "latest":
        default:
          // 최신순
          return bDate - aDate;
      }
    });

    return sorted;
  }, [rawItems, filters]);

  // ====== 페이지네이션 계산 ======
  const totalPages = useMemo(
    () => Math.ceil(processedItems.length / PAGE_SIZE) || 0,
    [processedItems.length]
  );

  const pagedItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return processedItems.slice(start, start + PAGE_SIZE);
  }, [processedItems, page]);

  // page가 totalPages 범위를 넘어가면 조정
  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  // ====== 선택 관련 ======
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const selectedCount = selectedIds.length;

  // ====== 상단 액션 ======
  const handleReviewAsQuiz = () => {
    if (selectedCount === 0) return;
    const ids = selectedIds.join(",");
    navigate(
      `/learning/quiz?source=wrong-note&wrongWordIds=${encodeURIComponent(ids)}`
    );
  };

  const handleReviewAsCard = () => {
    if (selectedCount === 0) return;
    const ids = selectedIds.join(",");
    navigate(
      `/learning/card?source=wrong-note&wrongWordIds=${encodeURIComponent(ids)}`
    );
  };

  // 스토리에 사용되지 않은 단어만 사용
  const handleCreateStory = () => {
    if (selectedCount === 0) return;

    const candidateItems = rawItems.filter(
      (item) => selectedIds.includes(item.wrongWordId) && !isUsedInStory(item)
    );

    if (candidateItems.length === 0) {
      alert("스토리에 사용되지 않은 단어를 선택해 주세요.");
      return;
    }

    const ids = candidateItems.map((i) => i.wrongWordId).join(",");
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(ids)}`);
  };

  const handleRowClick = (item) => {
    // 필요하면 단어 상세 페이지로 연결
    // navigate(`/words/${item.wordId}`);
  };

  return (
    <div className="wrongnote-page">
      <header className="wrongnote-header">
        <div className="wrongnote-header__main">
          <h1>오답 노트</h1>
          <p className="wrongnote-header__subtitle">
            틀렸던 단어들을 모아서 다시 학습합니다.
          </p>
        </div>

        {/* 헤더 우측 필터 드롭다운 2개 */}
        <div className="wrongnote-header__filters">
          <label>
            <span>스토리 사용 여부</span>
            <select
              value={filters.isUsedInStory}
              onChange={(e) =>
                handleChangeFilter("isUsedInStory", e.target.value)
              }
            >
              <option value="">전체</option>
              <option value="N">스토리 미사용</option>
              <option value="Y">스토리 사용됨</option>
            </select>
          </label>

          <label>
            <span>정렬</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleChangeFilter("sortBy", e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="mostWrong">많이 틀린순</option>
            </select>
          </label>
        </div>
      </header>

      {/* 리스트 영역 */}
      <section className="wrongnote-list">
        {loading && (
          <div className="wrongnote-list__loading">로딩 중...</div>
        )}
        {error && <div className="wrongnote-list__error">{error}</div>}
        {!loading && !error && processedItems.length === 0 && (
          <div className="wrongnote-list__empty">오답 기록이 없습니다.</div>
        )}

        {!loading && !error && processedItems.length > 0 && (
          <>
            <table className="wrongnote-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        pagedItems.length > 0 &&
                        pagedItems.every((item) =>
                          selectedIds.includes(item.wrongWordId)
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
                            const pageIds = pagedItems.map(
                              (i) => i.wrongWordId
                            );
                            return prev.filter(
                              (id) => !pageIds.includes(id)
                            );
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
                  <th>스토리</th>
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
                    onClick={() => handleRowClick(item)}
                  />
                ))}
              </tbody>
            </table>

            <div className="wrongnote-pagination">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      {/* 하단 액션 바 */}
      <section className="wrongnote-actions">
        <div className="wrongnote-actions__left">
          <span className="wrongnote-selected-count">
            선택된 단어 {selectedCount}개
          </span>
        </div>
        <div className="wrongnote-actions__right">
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleReviewAsQuiz}
          >
            선택 단어 퀴즈
          </button>
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleReviewAsCard}
          >
            선택 단어 카드
          </button>
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleCreateStory}
          >
            선택 단어로 스토리 만들기
          </button>
          {selectedCount > 0 && (
            <button type="button" onClick={clearSelection}>
              선택 해제
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
