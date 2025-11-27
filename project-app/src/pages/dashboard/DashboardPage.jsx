// pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './../../context/AuthContext';
import httpClient from './../../api/httpClient';
import './DashboardPage.css'; 

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const DashboardPage = () => {
  const { user: realUser } = useAuth(); 
  
  // 화면에 보여줄 사용자 정보와 데이터
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // ----------------------------------------------------
    // CASE 1: 목업(테스트) 모드일 때 (무조건 화면 뜸)
    // ----------------------------------------------------
    if (USE_MOCK) {
      console.log("📢 [MOCK] 대시보드 가짜 데이터 로딩 중...");
      
      // 0.5초 뒤에 가짜 데이터 채우기
      setTimeout(() => {
        setCurrentUser({
          nickname: "테스트유저",
          email: "test@example.com"
        });
        setDashboardData({
          dailyWordGoal: 30, // 목표 단어 수
          learnedToday: 12   // 오늘 공부한 수
        });
      }, 500);
      return; 
    }

    // ----------------------------------------------------
    // CASE 2: 실제 서버 연결 모드
    // ----------------------------------------------------
    // AuthContext가 아직 로딩 중이거나 유저 정보를 못 가져왔으면 대기
    if (realUser) {
        setCurrentUser(realUser);
        
        httpClient.get('/api/dashboard')
        .then((res) => {
            console.log("대시보드 데이터 도착:", res.data);
            setDashboardData(res.data);
        })
        .catch((err) => {
            console.error("데이터 로딩 실패:", err);
            // 에러 나도 화면은 뜨게 0으로 세팅
            setDashboardData({ dailyWordGoal: 0, learnedToday: 0 });
        });
    }
  }, [realUser]); // realUser가 들어오면 실행

  // [로딩 화면] 목업 모드가 아니고, 데이터도 없으면 로딩 표시
  if (!currentUser && !dashboardData) {
      // 힌트: 개발자 도구 콘솔을 확인해보세요.
      return (
        <div className="page-container mt-24" style={{textAlign: 'center'}}>
            <p>데이터를 불러오는 중입니다...</p>
            {/* 왜 안 뜨는지 화면에 힌트 출력 (개발용) */}
            <p style={{fontSize: '12px', color: '#999'}}>
                (Tip: 계속 이 화면이라면 새로고침 하거나, USE_MOCK = true 인지 확인하세요)
            </p>
        </div>
      );
  }
  
  // 데이터 안전장치
  const goal = dashboardData?.dailyWordGoal || 1; 
  const learned = dashboardData?.learnedToday || 0;
  const progressPercent = Math.min((learned / goal) * 100, 100);

  return (
    <div className="page-container mt-24">
      <header className="dashboard-header">
        <h1 className="greeting">
          👋 반가워요, <span className="highlight">{currentUser?.nickname || "회원"}</span>님!
        </h1>
        <p className="sub-text">오늘도 목표를 향해 달려볼까요?</p>
      </header>

      <div className="dashboard-grid mt-24">
        {/* 목표 카드 */}
        <div className="card stat-card">
          <div className="card-header">
            <h3>🎯 오늘의 목표</h3>
            <span className="goal-text">{Math.round(progressPercent)}% 달성</span>
          </div>
          
          <div className="big-number-box">
            <span className="current">{learned}</span>
            <span className="total"> / {goal}</span>
          </div>

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