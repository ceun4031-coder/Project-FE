// pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import './DashboardPage.css'; // 아래 CSS 참고

const DashboardPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // API 연동 전 가짜 데이터
    setUser({
      nickname: "회원",
      dailyWordGoal: 20,
      learnedToday: 14,
    });
  }, []);

  if (!user) return <div className="page-container mt-24">Loading...</div>;

  // 진행률 계산
  const progressPercent = Math.min((user.learnedToday / user.dailyWordGoal) * 100, 100);

  return (
    <div className="page-container mt-24">
      <header className="dashboard-header">
        <h1 className="greeting">👋 반가워요, <span className="highlight">{user.nickname}</span>님!</h1>
        <p className="sub-text">오늘도 목표를 향해 달려볼까요?</p>
      </header>

      <div className="dashboard-grid mt-24">
        {/* 목표 카드 (index.css의 .card 활용) */}
        <div className="card stat-card">
          <div className="card-header">
            <h3>🎯 오늘의 목표</h3>
            <span className="goal-text">{progressPercent}% 달성</span>
          </div>
          
          <div className="big-number-box">
            <span className="current">{user.learnedToday}</span>
            <span className="total"> / {user.dailyWordGoal}</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="progress-bg">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 안내 카드 */}
        <div className="card info-card">
          <h3>💡 학습 팁</h3>
          <p className="desc-text mt-12">
            단어장에서 <strong>'즐겨찾기'</strong>한 단어들은<br/>
            필터 탭을 눌러 따로 모아볼 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;