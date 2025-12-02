import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getDailyGoal,
  getDashboardStats,
  getWeeklyStudy,
} from "../../api/dashboardApi";
import "./DashboardPage.css";

// ... (상단 상수 및 함수 코드는 기존과 동일) ...
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "좋은 아침이에요,";
  if (hour < 18) return "활기찬 오후예요,";
  return "오늘 하루도 수고하셨어요,";
};

const DashboardPage = () => {
  // ... (상태 관리 및 useEffect 로직은 기존과 동일) ...
  const { user: realUser } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [dailyGoalData, setDailyGoalData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [wrongWordsList, setWrongWordsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("반가워요,");

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    // ... (Mock 및 API 호출 로직 유지) ...
    if (USE_MOCK) {
      setTimeout(() => {
        setCurrentUser({ nickname: "홍길동", email: "test@example.com" });
        setDailyGoalData({ dailyGoal: 50, todayProgress: 12, percentage: 24 });
        setStatsData({ totalLearnedWords: 1250, streakDays: 5, wrongWords: 10 });
        setWeeklyData([
          { date: "2025-11-26", learnedCount: 15, wrongCount: 2 },
          { date: "2025-11-27", learnedCount: 20, wrongCount: 5 },
          { date: "2025-11-28", learnedCount: 10, wrongCount: 0 },
          { date: "2025-11-29", learnedCount: 30, wrongCount: 1 },
          { date: "2025-11-30", learnedCount: 25, wrongCount: 4 },
          { date: "2025-12-01", learnedCount: 12, wrongCount: 3 },
          { date: "2025-12-02", learnedCount: 18, wrongCount: 2 },
        ]);
        setWrongWordsList([
          { id: 1, word: "Coffee", meaning: "커피", count: 5 },
          { id: 2, word: "Resilience", meaning: "회복탄력성", count: 4 },
          { id: 3, word: "Ambiguous", meaning: "모호한", count: 3 },
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    if (!realUser) return;
    setCurrentUser(realUser);
    setLoading(true);

    Promise.all([getDailyGoal(), getDashboardStats(), getWeeklyStudy()])
      .then(([dailyRes, statsRes, weeklyRes]) => {
        setDailyGoalData(dailyRes?.data || null);
        setStatsData(statsRes?.data || null);
        const rawWeekly = weeklyRes?.data?.items || weeklyRes?.data || [];
        const normalized = Array.isArray(rawWeekly)
          ? rawWeekly.map((d) => ({
              date: d.date || d.day || d.baseDate,
              learnedCount: d.learnedCount ?? d.studyCount ?? 0,
              wrongCount: d.wrongCount ?? d.incorrectCount ?? 0,
            }))
          : [];
        setWeeklyData(normalized);
        setWrongWordsList([
           { id: 1, word: "Vocabulary", meaning: "어휘", count: 3 },
           { id: 2, word: "React", meaning: "반응하다", count: 2 },
        ]); 
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [realUser]);

  if (loading || !currentUser || !dailyGoalData) {
    return <div className="dashboard-loading"><div className="spinner" /></div>;
  }

  const goal = dailyGoalData.dailyGoal || 50;
  const learned = dailyGoalData.todayProgress || 0;
  const progressPercent = dailyGoalData.percentage || 0;
  const totalWords = statsData?.totalLearnedWords ?? 0;
  const streak = statsData?.streakDays ?? 0;
  const wrongTotalCount = statsData?.wrongWords ?? 0;
  const maxVal = Math.max(...weeklyData.map(d => Math.max(d.learnedCount, d.wrongCount)), 10);
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const attendance = [true, true, true, false, true, true, false];

  return (
    <div className="page-container mt-24 fade-in">
      <header className="dashboard-header center-header">
        <h1 className="greeting-title">
          {greeting} <span className="highlight-text">{currentUser.nickname}님!</span>
        </h1>
      </header>

      <div className="dashboard-layout">
        
        {/* === Left Column === */}
        <div className="column-left">
          
          {/* A. Status Overview */}
          {/* [변경] card -> dashboard-card */}
          <section className="dashboard-card status-overview-card">
            <div className="status-section progress-section">
              <div className="section-header">
                <h3>오늘의 학습현황</h3>
                <span className="percent-badge">{Math.round(progressPercent)}% 달성</span>
              </div>
              <div className="progress-info">
                <span className="current-num">{learned}</span>
                <span className="total-num"> / {goal} 단어</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="vertical-divider"></div>

            <div className="status-section center-align">
              <span className="label">누적 학습 단어</span>
              <span className="value-text">{totalWords.toLocaleString()}</span>
            </div>

            <div className="vertical-divider"></div>

            <div className="status-section center-align">
              <span className="label">연속 학습</span>
              <div className="streak-container">
                <span className="streak-icon">🔥</span>
                <span className="value-text streak-value">{streak}일째</span>
              </div>
            </div>
          </section>

          {/* B. Chart */}
          {/* [변경] card -> dashboard-card */}
          <section className="dashboard-card chart-card">
            <div className="card-header-row">
              <h3>학습분석</h3>
              <div className="chart-legend">
                <div className="legend-item"><span className="dot learned"></span>학습</div>
                <div className="legend-item"><span className="dot wrong"></span>오답</div>
              </div>
            </div>

            <div className="chart-body">
              <div className="bars-container">
                {weeklyData.map((d, idx) => {
                  const hLearned = (d.learnedCount / maxVal) * 100;
                  const hWrong = (d.wrongCount / maxVal) * 100;
                  return (
                    <div key={idx} className="daily-group">
                      <div className="bar-wrapper">
                        <div className="v-bar bar-blue" style={{ height: `${hLearned}%` }}></div>
                        <div className="v-bar bar-red" style={{ height: `${hWrong}%` }}></div>
                      </div>
                      <span className="date-label">{formatDateLabel(d.date)}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="chart-summary">
                 <div className="summary-row">
                    <span>최근 7일 오답</span>
                    <strong>{wrongTotalCount}</strong>
                 </div>
                 <div className="summary-row">
                    <span>최근 7일 학습</span>
                    <strong>{weeklyData.reduce((acc, cur) => acc + cur.learnedCount, 0)}</strong>
                 </div>
              </div>
            </div>
          </section>
        </div>

        {/* === Right Column === */}
        <div className="column-right">
          
          {/* C. Action */}
          {/* [변경] card -> dashboard-card, action-card -> dashboard-action-card */}
          <section className="dashboard-card dashboard-action-card">
            <div className="action-text">
              <h3>학습하기</h3>
              <p>오늘의 학습을 시작하세요.</p>
            </div>
            
            <div className="mini-calendar">
              {weekDays.map((day, i) => (
                <div key={i} className={`calendar-day ${attendance[i] ? 'checked' : ''}`}>
                  <span className="day-char">{day}</span>
                </div>
              ))}
            </div>

            <button className="start-btn" onClick={() => navigate("/learning/quiz?source=quiz")}>
              학습 시작하기 →
            </button>
          </section>

          {/* D. Ranking */}
          {/* [변경] card -> dashboard-card */}
          <section className="dashboard-card wrong-ranking-card">
            <h3>오답 단어 Top 5</h3>
            <ul className="ranking-list">
              {wrongWordsList.length === 0 ? (
                 <li className="empty-li">오답 데이터가 없습니다.</li>
              ) : (
                wrongWordsList.map((item, index) => (
                  <li key={index} className="ranking-item">
                    <div className="word-info">
                      <span className="word-en">{item.word}</span>
                      <span className="word-ko">{item.meaning}</span>
                    </div>
                    <span className="word-count">{item.count}회</span>
                  </li>
                ))
              )}
            </ul>
            <div className="divider-line"></div>
            <button className="wrong-review-btn" onClick={() => navigate("/learning/quiz?source=wrong-note")}>
              오답 복습({wrongTotalCount}) →
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;