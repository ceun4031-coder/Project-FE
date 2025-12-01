// src/components/common/Pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

const Pagination = ({ page, totalPages, onChange }) => {
  // page: 0-based index (0, 1, 2...)
  // totalPages: total count (1, 2, 3...)

  if (totalPages <= 1) return null;

  // 페이지 이동 핸들러
  const handlePrev = () => {
    if (page > 0) onChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) onChange(page + 1);
  };

  // 페이지 번호 생성 로직
  // (심플하게: 전체가 7페이지 이하면 다 보여주고, 아니면 현재 페이지 주변만 보여주는 방식도 가능하지만,
  // 여기서는 우선 깔끔하게 전체 리스트를 슬라이딩하거나, 심플하게 최대 5~7개만 보여주는 로직을 제안합니다.)
  // *이 예제는 가장 직관적인 '전체 렌더링' 방식에 '스크롤' 혹은 'flex-wrap' 대응이 된 CSS를 사용합니다.
  // 만약 페이지가 100개가 넘어간다면 '...' 로직이 필요하지만, 학습용 앱 규모상 아래 방식이 가장 깔끔합니다.
  
  const getPageNumbers = () => {
    const pages = [];
    // 간단한 버전: 모든 페이지 번호 생성 (필요시 slice로 개수 제한 가능)
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 표시할 페이지 범위 계산 (선택사항: 너무 길면 자르기)
  // 현재 페이지를 기준으로 앞뒤로 보여주기
  const showEllipsis = totalPages > 7;
  
  // 렌더링 헬퍼
  const renderPageButton = (i) => (
    <button
      key={i}
      className={`pagination-number ${i === page ? "active" : ""}`}
      onClick={() => onChange(i)}
    >
      {i + 1}
    </button>
  );

  return (
    <nav className="pagination-container" aria-label="Pagination">
      <button
        className="pagination-btn prev"
        onClick={handlePrev}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="pagination-numbers">
        {/* 페이지가 적을 때는 다 보여줌 */}
        {!showEllipsis && pageNumbers.map((i) => renderPageButton(i))}

        {/* 페이지가 많을 때 (간단한 로직: 처음, 끝, 현재 주변만 표시) */}
        {showEllipsis && (
          <>
            {renderPageButton(0)}
            {page > 2 && <span className="pagination-ellipsis">...</span>}
            
            {/* 현재 페이지 주변 */}
            {pageNumbers
              .slice(Math.max(1, page - 1), Math.min(totalPages - 1, page + 2))
              .map((i) => renderPageButton(i))}

            {page < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
            {renderPageButton(totalPages - 1)}
          </>
        )}
      </div>

      <button
        className="pagination-btn next"
        onClick={handleNext}
        disabled={page === totalPages - 1}
        aria-label="Next page"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;