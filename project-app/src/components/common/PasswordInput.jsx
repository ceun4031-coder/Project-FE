// src/components/common/PasswordInput.jsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * 비밀번호 인풋
 * - 오른쪽: 보기/숨기기 토글 아이콘
 * - type=password ↔ type=text 토글
 */
export default function PasswordInput({
  placeholder = "비밀번호",
  size = "md",          // 'sm' | 'md' | 'lg'
  fullWidth = true,
  className = "",
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  const sizeClass =
    size === "sm" ? "input--sm" : size === "lg" ? "input--lg" : "input--md";
  const fullClass = fullWidth ? "input--full" : "";

  const inputClassName = [
    "input",
    sizeClass,
    "input--with-right",
    fullClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const toggleVisible = () => setVisible((prev) => !prev);

  return (
    <div className="input-wrapper">
      <input
        type={visible ? "text" : "password"}
        className={inputClassName}
        placeholder={placeholder}
        {...rest}
      />
      <button
        type="button"
        className="input-icon input-icon--right input-icon-button"
        onClick={toggleVisible}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
