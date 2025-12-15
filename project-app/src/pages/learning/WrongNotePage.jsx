// src/pages/wrongnote/WrongNotePage.jsx
import { BookOpen, FileQuestion, Layers, RotateCcw } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import FilterDropdown from "../../components/common/FilterDropdown";
import Pagination from "../../components/common/Pagination";
import { WrongNoteItem } from "./components/WrongNoteItem";
// hook 분리
import { useWrongNoteController } from "./hooks/useWrongNoteController";

import "./WrongNotePage.css";

const SORT_FILTER_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "오래된순", value: "oldest" },
  { label: "많이 틀린순", value: "mostWrong" },
];

export default function WrongNotePage() {
  const {
    isLoading,
    isError,
    refetch,

    tab,
    isStoryTab,
    filters,
    openDropdown,
    page,
    setPage,
    selectedIdSet,
    selectedCount,

    tabCounts,
    pagedItems,
    totalPages,
    isSortActive,
    canStudy,
    canCreateStory,
    storyLimitReached,
    hintText,
    emptyTextByTab,

    showEmptyNoData,
    showControls,
    showTable,
    showEmptyFiltered,

    toggleSelectId,
    toggleSelectPage,
    clearSelection,
    handleTabChange,
    handleDropdownToggle,
    handleDropdownChange,
    handleResetSort,
    handleReviewAsQuiz,
    handleReviewAsCard,
    handleCreateStory,
    goBack,
  } = useWrongNoteController();

  return (
    <div className="page-container wrongnote-page">
      <header className="wrongnote-header">
        <h1>오답 노트</h1>
        <p className="wrongnote-header__subtitle">
          틀렸던 단어들을 모아서 다시 학습합니다.
        </p>
      </header>

      {isLoading && <div className="wrongnote-list__loading">로딩 중...</div>}

      {isError && !isLoading && (
        <div className="wrongnote-list__error">
          <p>오답 기록을 불러오는 중 오류가 발생했습니다.</p>
          <button className="retry-btn" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && showEmptyNoData && (
        <EmptyState
          icon={FileQuestion}
          title="오답 기록이 없습니다."
          description="퀴즈나 학습을 진행하면, 틀린 단어들이 여기에 모입니다."
          actionLabel="이전 페이지로 돌아가기"
          onAction={goBack}
          variant="page"
        />
      )}

      {showControls && (
        <section className="wrongnote-list">
          {/* Topbar: Tabs + Sort */}
          <div className="wrongnote-topbar">
            <div className="wrongnote-tablist" role="tablist" aria-label="오답 보기 탭">
              <button
                type="button"
                className={`wrongnote-tab ${tab === "study" ? "is-active" : ""}`}
                onClick={() => handleTabChange("study")}
                role="tab"
                aria-selected={tab === "study"}
              >
                오답학습 <span className="tab-count">{tabCounts.total}</span>
              </button>

              <button
                type="button"
                className={`wrongnote-tab ${tab === "story" ? "is-active" : ""}`}
                onClick={() => handleTabChange("story")}
                role="tab"
                aria-selected={tab === "story"}
              >
                오답 스토리 생성 <span className="tab-count">{tabCounts.storyable}</span>
              </button>
            </div>

            <div className="wrongnote-toolbar">
              <FilterDropdown
                id="sort"
                options={SORT_FILTER_OPTIONS}
                value={filters.sortBy}
                isOpen={openDropdown === "sort"}
                onToggle={handleDropdownToggle}
                onChange={handleDropdownChange}
              />

              {isSortActive && (
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={handleResetSort}
                  title="정렬 초기화"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="wrongnote-actions">
            <div className="wrongnote-actions__left">
              <div className="wn-selected-row">
                <span className="wrongnote-selected-count">선택 {selectedCount}개</span>

                <button
                  type="button"
                  className="wn-clear-btn"
                  onClick={clearSelection}
                  disabled={selectedCount === 0}
                  title="선택 해제"
                  aria-label="선택 전체 해제"
                >
                  전체 해제
                </button>
              </div>

              <span className="wn-hint">
                {hintText}
                {storyLimitReached && (
                  <span style={{ marginLeft: 6, color: "#b91c1c", fontWeight: 800 }}>
                    (최대 5개)
                  </span>
                )}
              </span>
            </div>

            <div className="wrongnote-actions__right">
              {isStoryTab ? (
                <button
                  type="button"
                  disabled={!canCreateStory}
                  className="sl-btn sl-btn-story sl-btn-primary"
                  onClick={handleCreateStory}
                  title={!selectedCount ? "단어를 선택하세요." : undefined}
                >
                  <BookOpen size={16} />
                  <span>스토리 생성</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!canStudy}
                    className="sl-btn sl-btn-primary"
                    onClick={handleReviewAsQuiz}
                    title={!canStudy ? "단어를 선택하세요." : undefined}
                  >
                    <FileQuestion size={16} />
                    <span>퀴즈</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canStudy}
                    className="sl-btn"
                    onClick={handleReviewAsCard}
                    title={!canStudy ? "단어를 선택하세요." : undefined}
                  >
                    <Layers size={16} />
                    <span>카드</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {showEmptyFiltered && (
            <div className="wrongnote-list__empty">
              <EmptyState
                icon={FileQuestion}
                title={emptyTextByTab.title}
                description={emptyTextByTab.desc}
                actionLabel={emptyTextByTab.actionLabel}
                onAction={emptyTextByTab.onAction}
                variant="page"
              />
            </div>
          )}

          {showTable && (
            <>
              <table className="wrongnote-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="sl-checkbox"
                        checked={
                          pagedItems.length > 0 &&
                          pagedItems.every((item) => selectedIdSet.has(item.wrongWordId))
                        }
                        onChange={(e) => toggleSelectPage(e.target.checked)}
                        title={isStoryTab ? "현재 페이지 전체 선택(스토리는 최대 5개 cap)" : undefined}
                        aria-label="현재 페이지 전체 선택"
                      />
                    </th>
                    <th>단어</th>
                    <th>뜻</th>
                    <th>난이도</th>
                    <th>오답 횟수</th>
                    <th>마지막 오답</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedItems.map((item) => (
                    <WrongNoteItem
                      key={item.wrongWordId}
                      item={item}
                      selected={selectedIdSet.has(item.wrongWordId)}
                      onToggle={() => toggleSelectId(item.wrongWordId)}
                      onClick={() => {}}
                    />
                  ))}
                </tbody>
              </table>

              {totalPages > 0 && (
                <div className="wrongnote-pagination">
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}