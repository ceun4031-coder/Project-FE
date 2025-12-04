// src/components/common/Spinner.jsx
import React from "react";
import "./Spinner.css";

export default function Spinner({
  fullHeight = true,
  message = "로딩 중...",
}) {
  const wrapperClass = fullHeight
    ? "loading-spinner loading-spinner--full"
    : "loading-spinner";

  return (
    <div className={wrapperClass}>
      <div className="loading-spinner__icon" />
      {message && <p className="loading-spinner__text">{message}</p>}
    </div>
  );
}
