// src/components/common/SearchInput.jsx
import { useState, useRef } from "react";
import { Search, X } from "lucide-react";

/**
 * 검색 전용 인풋
 * - 왼쪽: 돋보기 아이콘 (클릭 시 onSearch 호출)
 * - 오른쪽: X 아이콘 (값 비우기)
 * - Enter 입력 시에도 onSearch(value) 호출
 */
export default function SearchInput({
  onSearch,
  placeholder = "검색어를 입력하세요",
  size = "md",            // 'sm' | 'md' | 'lg'
  fullWidth = true,
  className = "",
  ...rest
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const sizeClass =
    size === "sm" ? "input--sm" : size === "lg" ? "input--lg" : "input--md";
  const fullClass = fullWidth ? "input--full" : "";

  const inputClassName = [
    "input",
    sizeClass,
    "input--search",
    "input--with-left",
    fullClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleSearch = () => {
    if (onSearch) onSearch(value);
  };

  const handleClear = () => {
    setValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="input-wrapper">
      {/* 왼쪽 검색 아이콘 (클릭 가능) */}
      <button
        type="button"
        className="input-icon input-icon--left input-icon-button"
        onClick={handleSearch}
        aria-label="검색 실행"
      >
        <Search size={16} />
      </button>

      {/* 실제 인풋 */}
      <input
        ref={inputRef}
        type="text"
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        {...rest}
      />

      {/* 오른쪽 X 아이콘 (값 초기화) */}
      {value && (
        <button
          type="button"
          className="input-icon input-icon--right input-icon-button"
          onClick={handleClear}
          aria-label="검색어 지우기"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
