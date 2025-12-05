// src/pages/wrongnote/WrongNotePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { getWrongList } from "../../api/wrongApi";
import Pagination from "../../components/common/Pagination";
import { WrongNoteItem } from "./components/WrongNoteItem";

import "./WrongNotePage.css";

const PAGE_SIZE = 10;

// 스토리 사용 여부 판별
const isUsedInStory = (item) =>
  item?.isUsedInStory === "Y" ||
  item?.isUsedInStory === "y" ||
  item?.isUsedInStory === true;

// 오답 횟수 헬퍼
const getWrongCount = (item) =>
  item?.totalWrong ?? item?.wrongCount ?? item?.wrong ?? 0;

// 마지막 오답 일시 헬퍼 (정렬용)
const getLastWrongTime = (item) => {
  const raw = item?.lastWrongAt || item?.wrongAt || item?.wrong_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function WrongNotePage() {
  const navigate = useNavigate();

  // 데이터 원본
  const [rawItems, setRawItems] = useState([]);

  // 필터 상태
  const [filters, setFilters] = useState({
    isUsedInStory: "", // "", "Y", "N"
    sortBy: "latest",  // latest | oldest | mostWrong
  });

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // wrongWordId[]
  const [page, setPage] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null); // "used" | "sort" | null
  const [activeAction, setActiveAction] = useState("none"); // quiz | card | story | none

  // =============================
  // 데이터 로딩
  // =============================
  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getWrongList(); // 항상 normalize된 형태
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

  // =============================
  // 필터 변경
  // =============================
  const handleChangeFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // =============================
  // 필터 + 정렬 적용
  // =============================
  const processedItems = useMemo(() => {
    const { isUsedInStory: usedFilter, sortBy } = filters;

    // 사용 여부 필터
    const filtered = rawItems.filter((item) => {
      const used = isUsedInStory(item);
      if (usedFilter === "Y") return used;
      if (usedFilter === "N") return !used;
      return true;
    });

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
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
        case "latest":
        default:
          return bDate - aDate;
      }
    });

    return sorted;
  }, [rawItems, filters]);

  // =============================
  // 페이지네이션
  // =============================
  const totalPages = useMemo(
    () => Math.ceil(processedItems.length / PAGE_SIZE) || 0,
    [processedItems.length]
  );

  const pagedItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return processedItems.slice(start, start + PAGE_SIZE);
  }, [processedItems, page]);

  // 현재 page가 마지막 페이지를 넘어가면 보정
  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  // =============================
  // 선택 처리
  // =============================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);
  const selectedCount = selectedIds.length;

  // =============================
  // 액션 (퀴즈 / 카드 / 스토리)
  // =============================
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
      `/learning/card?source=wrong-note&wrongWordIds=${encodeURIComponent(
        ids
      )}`
    );
  };

  const handleCreateStory = () => {
    if (selectedCount === 0) return;

    // 이미 스토리에 사용된 단어는 제외
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
    // 필요하면 추후 상세 모달/단어 상세로 연결
    console.log("row clicked:", item);
  };

  // ============================================================
  // JSX
  // ============================================================
  return (
    <div className="wrongnote-page">
      {/* 상단 헤더 + 필터 */}
      <header className="wrongnote-header">
        <div className="wrongnote-header__main">
          <h1>오답 노트</h1>
          <p className="wrongnote-header__subtitle">
            틀렸던 단어들을 모아서 다시 학습합니다.
          </p>
        </div>

        <div className="wrongnote-header__filters">
          {/* 스토리 사용 여부 필터 */}
          <div className="control-group">
            <label className="control-label">스토리</label>
            <div className="filter-group">
              <div className="dropdown-box">
                <button
                  type="button"
                  className="dropdown-btn no-select"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "used" ? null : "used")
                  }
                >
                  {filters.isUsedInStory === ""
                    ? "전체"
                    : filters.isUsedInStory === "Y"
                    ? "사용됨"
                    : "미사용"}
                  <ChevronDown size={14} className="arrow" />
                </button>

                {openDropdown === "used" && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        handleChangeFilter("isUsedInStory", "");
                        setOpenDropdown(null);
                      }}
                    >
                      전체
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        handleChangeFilter("isUsedInStory", "N");
                        setOpenDropdown(null);
                      }}
                    >
                      미사용
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        handleChangeFilter("isUsedInStory", "Y");
                        setOpenDropdown(null);
                      }}
                    >
                      사용됨
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 정렬 필터 */}
          <div className="control-group">
            <label className="control-label">정렬</label>
            <div className="filter-group">
              <div className="dropdown-box">
                <button
                  type="button"
                  className="dropdown-btn no-select"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "sort" ? null : "sort")
                  }
                >
                  {filters.sortBy === "latest"
                    ? "최신순"
                    : filters.sortBy === "oldest"
                    ? "오래된순"
                    : "많이 틀린순"}
                  <ChevronDown size={14} className="arrow" />
                </button>

                {openDropdown === "sort" && (
                  <div className="dropdown-menu">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        handleChangeFilter("sortBy", "latest");
                        setOpenDropdown(null);
                      }}
                    >
                      최신순
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        handleChangeFilter("sortBy", "oldest");
                        setOpenDropdown(null);
                      }}
                    >
                      오래된순
                    </div>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        handleChangeFilter("sortBy", "mostWrong");
                        setOpenDropdown(null);
                      }}
                    >
                      많이 틀린순
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 하단 액션 버튼 영역 */}
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
            className={`sl-btn ${
              activeAction === "quiz" ? "sl-btn-primary" : ""
            }`}
            onClick={() => {
              handleReviewAsQuiz();
              setActiveAction("quiz");
            }}
          >
            선택 단어 퀴즈
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            className={`sl-btn ${
              activeAction === "card" ? "sl-btn-primary" : ""
            }`}
            onClick={() => {
              handleReviewAsCard();
              setActiveAction("card");
            }}
          >
            선택 단어 카드
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            className={`sl-btn ${
              activeAction === "story" ? "sl-btn-primary" : ""
            }`}
            onClick={() => {
              handleCreateStory();
              setActiveAction("story");
            }}
          >
            선택 단어로 스토리 만들기
          </button>

          {selectedCount > 0 && (
            <button
              type="button"
              className="sl-btn"
              onClick={() => {
                clearSelection();
                setActiveAction("none");
              }}
            >
              선택 해제
            </button>
          )}
        </div>
      </section>

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
                    {/* 전체 선택 체크박스 (현재 페이지 기준) */}
                    <input
                      type="checkbox"
                      className="sl-checkbox"
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
          </>
        )}
      </section>

      {/* 페이지네이션 */}
      <div className="wrongnote-pagination">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
