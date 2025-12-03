// components/ProgressBar.jsx 예시
import React from 'react';
import './ProgressBar.css'; // 만약 CSS 파일을 따로 쓴다면

export const ProgressBar = ({ current, total, color }) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="progress-track">
      <div 
        className="progress-fill" 
        style={{ 
          width: `${percentage}%`,
          backgroundColor: color || 'var(--primary-600)' // ✨ 인라인 스타일로 색상 덮어쓰기
        }} 
      />
    </div>
  );
};