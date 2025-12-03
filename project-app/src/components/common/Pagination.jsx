// src/components/common/Pagination.jsx
import React, { useMemo } from "react";
import {ChevronLeft,ChevronRight,} from "lucide-react";
import "./Pagination.css";

const DOTS = "dots";

const getPaginationRange = ({
  currentPage,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}) => {
  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(
    currentPage - siblingCount,
    boundaryCount + 2
  );
  const rightSibling = Math.min(
    currentPage + siblingCount,
    totalPages - boundaryCount - 1
  );

  const showLeftDots = leftSibling > boundaryCount + 2;
  const showRightDots = rightSibling < totalPages - boundaryCount - 1;

  const range = [];

  for (let i = 1; i <= boundaryCount; i += 1) range.push(i);

  if (showLeftDots) {
    range.push(DOTS);
  } else {
    for (let i = boundaryCount + 1; i < leftSibling; i += 1) {
      range.push(i);
    }
  }

  for (let i = leftSibling; i <= rightSibling; i += 1) {
    range.push(i);
  }

  if (showRightDots) {
    range.push(DOTS);
  } else {
    for (let i = rightSibling + 1; i <= totalPages - boundaryCount; i += 1) {
      range.push(i);
    }
  }

  for (let i = totalPages - boundaryCount + 1; i <= totalPages; i += 1) {
    range.push(i);
  }

  return range;
};

const Pagination = ({
  page, // 0-based
  totalPages,
  onChange,
  siblingCount = 1,
  boundaryCount = 1,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const currentPage = page + 1;

  const paginationRange = useMemo(
    () =>
      getPaginationRange({
        currentPage,
        totalPages,
        siblingCount,
        boundaryCount,
      }),
    [currentPage, totalPages, siblingCount, boundaryCount]
  );

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleChange = (nextPage1Based) => {
    if (
      nextPage1Based < 1 ||
      nextPage1Based > totalPages ||
      nextPage1Based === currentPage
    )
      return;

    onChange(nextPage1Based - 1);
  };

  return (
    <nav
      className="pagination-container"
      aria-label="Pagination"
      role="navigation"
    >
      {/* 이전 페이지 (<) */}
      <button
        type="button"
        className="pagination-btn"
        onClick={() => handleChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {/* 숫자 + … */}
      <div className="pagination-numbers">
        {paginationRange.map((item, idx) => {
          if (item === DOTS) {
            return (
              <span key={`dots-${idx}`} className="pagination-ellipsis">
                …
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              className={`pagination-number ${isActive ? "active" : ""}`}
              onClick={() => handleChange(item)}
              aria-current={isActive ? "page" : undefined}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* 다음 페이지 (>) */}
      <button
        type="button"
        className="pagination-btn"
        onClick={() => handleChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
