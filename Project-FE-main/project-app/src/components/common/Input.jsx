// src/components/common/Input.jsx
/**
 * 디자인 토큰 + input.css 기반 공통 인풋 컴포넌트
 *
 * - size: 'sm' | 'md' | 'lg'
 * - status: 'error' | 'warning' | 'success' | 'info'
 * - search: true/false (검색 스타일 온오프)
 * - leftIcon / rightIcon: 아이콘 컴포넌트(예: SVG)
 * - fullWidth: true면 100% 폭
 *
 * 이 컴포넌트는 "저수준" 공통 베이스로 두고,
 * SearchInput 같은 패턴 전용 컴포넌트에서 조합해서 사용합니다.
 */

export default function Input({
  size = "md",
  fullWidth = false,
  status,                // 'error' | 'warning' | 'success' | 'info'
  leftIcon,
  rightIcon,
  onLeftIconClick,
  onRightIconClick,
  search = false,
  className = "",
  wrapperClassName = "",
  readOnly = false,
  disabled = false,
  helperText,
  id,
  ...rest
}) {
  const sizeClass =
    size === "sm" ? "input--sm" : size === "lg" ? "input--lg" : "input--md";

  const statusClass =
    status === "error" ||
    status === "warning" ||
    status === "success" ||
    status === "info"
      ? `input--${status}`
      : "";

  const searchClass = search ? "input--search" : "";
  const leftClass = leftIcon ? "input--with-left" : "";
  const rightClass = rightIcon ? "input--with-right" : "";
  const fullClass = fullWidth ? "input--full" : "";
  const readonlyClass = readOnly ? "input--readonly" : "";

  const inputClassName = [
    "input",
    sizeClass,
    statusClass,
    searchClass,
    leftClass,
    rightClass,
    fullClass,
    readonlyClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={["input-wrapper", wrapperClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 왼쪽 아이콘: 클릭 핸들러 있으면 버튼, 없으면 span */}
      {leftIcon &&
        (onLeftIconClick ? (
          <button
            type="button"
            className="input-icon input-icon--left input-icon-button"
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </button>
        ) : (
          <span className="input-icon input-icon--left">{leftIcon}</span>
        ))}

      <input
        id={id}
        className={inputClassName}
        readOnly={readOnly}
        disabled={disabled}
        {...rest}
      />

      {/* 오른쪽 아이콘 */}
      {rightIcon &&
        (onRightIconClick ? (
          <button
            type="button"
            className="input-icon input-icon--right input-icon-button"
            onClick={onRightIconClick}
          >
            {rightIcon}
          </button>
        ) : (
          <span className="input-icon input-icon--right">{rightIcon}</span>
        ))}

      {helperText && (
        <p
          className="mt-1 text-xs"
          style={{ color: getHelperColor(status) }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

function getHelperColor(status) {
  if (status === "error") return "var(--color-error)";
  if (status === "warning") return "var(--color-warning)";
  if (status === "success") return "var(--color-success)";
  if (status === "info") return "var(--color-info)";
  return "var(--color-text-muted)";
}
