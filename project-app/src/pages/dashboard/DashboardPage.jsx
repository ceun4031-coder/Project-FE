import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getDailyGoal,
  getDashboardStats,
  getWeeklyStudy,
} from "../../api/dashboardApi";
import "./DashboardPage.css";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// 주간 데이터 최대값 계산 (차트 높이 비율용)
const getMaxWeeklyCount = (weeklyData) => {
  if (!weeklyData || weeklyData.length === 0) return 1;
  return Math.max(
    ...weeklyData.map((d) =>
      Math.max(d.learnedCount || 0, d.wrongCount || 0)
    )
  );
};

// 날짜 포맷 (예: 12/01)
const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const DashboardPage = () => {
  const { user: realUser } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [dailyGoalData, setDailyGoalData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // === MOCK DATA 로직 ===
    if (USE_MOCK) {
      setTimeout(() => {
        setCurrentUser({ nickname: "러너", email: "test@example.com" });
        setDailyGoalData({
          dailyGoal: 30,
          todayProgress: 12,
          percentage: 40,
        });
        setStatsData({
          totalLearnedWords: 1240,
          favoriteWords: 45,
          wrongWords: 8,
          streakDays: 5,
        });
        setWeeklyData([
          { date: "2025-11-26", learnedCount: 15, wrongCount: 2 },
          { date: "2025-11-27", learnedCount: 20, wrongCount: 5 },
          { date: "2025-11-28", learnedCount: 10, wrongCount: 0 },
          { date: "2025-11-29", learnedCount: 30, wrongCount: 1 },
          { date: "2025-11-30", learnedCount: 25, wrongCount: 4 },
          { date: "2025-12-01", learnedCount: 12, wrongCount: 3 },
          { date: "2025-12-02", learnedCount: 18, wrongCount: 2 },
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    // === REAL API 로직 ===
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
      })
      .catch((err) => {
        console.error("Dashboard Load Error:", err);
        setErrorMsg("데이터를 불러오지 못했습니다.");
        setDailyGoalData({ dailyGoal: 1, todayProgress: 0, percentage: 0 });
        setStatsData({ totalLearnedWords: 0, streakDays: 0, wrongWords: 0 });
        setWeeklyData([]);
      })
      .finally(() => setLoading(false));
  }, [realUser]);

  if (loading || !currentUser || !dailyGoalData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>오늘의 학습 데이터를 분석 중입니다...</p>
      </div>
    );
  }

  // 데이터 안전 추출
  const goal = dailyGoalData.dailyGoal || 1;
  const learned = dailyGoalData.todayProgress || 0;
  const progressPercent = Math.min((learned / goal) * 100, 100);

  const totalWords = statsData?.totalLearnedWords ?? 0;
  const streak = statsData?.streakDays ?? 0;
  const wrongWordsTotal = statsData?.wrongWords ?? 0;

  const maxWeeklyCount = getMaxWeeklyCount(weeklyData);

  // 핸들러
  const handleStartLearning = () => {
    navigate("/learning/quiz?source=quiz");
  };

  const handleReviewWrong = () => {
    navigate("/learning/quiz?source=wrong-note");
  };

  const handleCreateStory = () => {
    navigate("/stories/create");
  };

  return (
    <div className="page-container mt-24 fade-in">
      {/* 1. 헤더 */}
      <header className="dashboard-header">
        <div>
          <p className="sub-greeting">오늘도 꾸준히 성장해봐요 🌱</p>
          <h1 className="main-greeting">
            안녕하세요,{" "}
            <span className="highlight-text">{currentUser.nickname}</span>님!
          </h1>
        </div>
      </header>

      {/* 기존 '빠른 실행' 섹션 제거됨 */}

      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {/* 2. 주요 스탯 (카드 그리드) */}
      <div className="dashboard-grid top-grid">
        {/* 오늘의 목표 */}
        <section className="card goal-card">
          <div className="card-top">
            <h3>오늘의 목표</h3>
            <span className="goal-badge">
              {Math.round(progressPercent)}% 달성
            </span>
          </div>
          <div className="goal-content">
            <div className="goal-numbers">
              <span className="current">{learned}</span>
              <span className="divider">/</span>
              <span className="total">{goal} 단어</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="card-desc">
              {progressPercent >= 100
                ? "🎉 목표를 달성했어요!"
                : "조금만 더 힘내세요!"}
            </p>
          </div>
        </section>

        {/* 연속 학습 (여기에 버튼 통합) */}
        <section className="card streak-card">
          <div className="card-top">
            <h3>연속 학습</h3>
          </div>
          <div className="streak-content">
            <span className="streak-days">{streak}일째</span>
            
            {/* 버튼 그룹 컨테이너 */}
            <div className="streak-actions">
              <button
                type="button"
                className="action-btn-primary"
                onClick={handleStartLearning}
              >
                학습 시작하기
              </button>

              {wrongWordsTotal > 0 && (
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={handleReviewWrong}
                >
                  오답 복습 ({wrongWordsTotal})
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 누적 단어 */}
        <section className="card total-card">
          <div className="card-top">
            <h3>누적 학습 단어</h3>
          </div>
          <div className="total-content">
            <span className="total-count">
              {totalWords.toLocaleString("ko-KR")}
            </span>
           
          </div>
        </section>
      </div>

      {/* 3. 차트 & AI 배너 */}
      <div className="dashboard-grid bottom-grid">
        {/* 주간 학습 차트 */}
        <section className="card weekly-chart-card">
          <div className="card-top">
            <h3>이번 주 학습 리포트</h3>
            <div className="legend">
              <span className="legend-item learned">학습</span>
              <span className="legend-item wrong">오답</span>
            </div>
          </div>

          <div className="chart-container">
            {weeklyData.length === 0 ? (
              <div className="empty-chart">
                아직 학습 기록이 없어요.
              </div>
            ) : (
              <div className="bars-wrapper">
                {weeklyData.map((data, idx) => {
                  const learnedRatio =
                    (data.learnedCount / maxWeeklyCount) * 100;
                  const wrongRatio =
                    (data.wrongCount / maxWeeklyCount) * 100;

                  const learnedHeight =
                    data.learnedCount === 0 ? 0 : Math.max(learnedRatio, 6);
                  const wrongHeight =
                    data.wrongCount === 0 ? 0 : Math.max(wrongRatio, 6);

                  return (
                    <div key={idx} className="daily-bar-group">
                      <div className="bars-area">
                        <div
                          className="bar bar-learned"
                          style={{ height: `${learnedHeight}%` }}
                          title={`학습: ${data.learnedCount}`}
                        />
                        <div
                          className="bar bar-wrong"
                          style={{ height: `${wrongHeight}%` }}
                          title={`오답: ${data.wrongCount}`}
                        />
                      </div>
                      <span className="day-label">
                        {formatDateLabel(data.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* AI 스토리 배너 */}
        <section className="card ai-banner-card">
          <div className="ai-content">
            <h3>나만의 AI 스토리 📖</h3>
            <p>
              오늘 배운 단어로
              <br />
              이야기를 만들어 보세요.
            </p>
            <button className="btn-text" type="button" onClick={handleCreateStory}>
              스토리 만들기 →
            </button>
          </div>
          <div className="ai-deco">✏️</div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;