// src/components/common/Button.jsx
import "./Button.css";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        full && "btn--full"
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
