// src/pages/dashboard/DashboardPage.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import {
  ArrowRight,
  Flame,
  BookOpen,
  CalendarCheck,
  Layers,
  Trophy,
} from "lucide-react";
import {
  getDailyGoal,
  getDashboardStats,
  getWeeklyStudy,
  getWrongTop5,
} from "../../api/dashboardApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import "./DashboardPage.css";

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "좋은 아침이에요,";
  if (hour < 18) return "활기찬 오후예요,";
  return "오늘 하루도 수고하셨어요,";
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length < 2) return null;

  const learnedVal = payload[0]?.value ?? 0;
  const wrongVal = payload[1]?.value ?? 0;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-date">{label}</p>
      <div className="tooltip-row">
        <span className="dot dot-learned" />
        <span>
          학습: <strong>{learnedVal}</strong>
        </span>
      </div>
      <div className="tooltip-row">
        <span className="dot dot-wrong" />
        <span>
          오답: <strong>{wrongVal}</strong>
        </span>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = getTimeBasedGreeting();
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 관심 분야 설정 여부
  const hasPreference =
    !!user?.preference && String(user.preference).trim().length > 0;

  // -----------------------------
  // 1) 오늘의 학습 목표
  // -----------------------------
  const {
    data: dailyGoalData,
    isLoading: isDailyLoading,
    isError: isDailyError,
    error: dailyError,
  } = useQuery({
    queryKey: ["dashboard", "dailyGoal"],
    queryFn: getDailyGoal,
    enabled: !!user,
  });

  // -----------------------------
  // 2) 대시보드 통계
  // -----------------------------
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    enabled: !!user,
  });

  // -----------------------------
  // 3) 주간 학습 데이터
  // -----------------------------
  const {
    data: weeklyStudyData,
    isLoading: isWeeklyLoading,
    isError: isWeeklyError,
    error: weeklyError,
  } = useQuery({
    queryKey: ["dashboard", "weeklyStudy"],
    queryFn: getWeeklyStudy,
    enabled: !!user,
  });

  // -----------------------------
  // 4) 자주 틀리는 단어 Top 5
  // -----------------------------
  const {
    data: wrongTop5Data,
    isLoading: isWrongLoading,
    isError: isWrongError,
    error: wrongError,
  } = useQuery({
    queryKey: ["dashboard", "wrongTop5"],
    queryFn: getWrongTop5,
    enabled: !!user,
  });

  // -----------------------------
  // 공통 로딩 / 에러 처리
  // -----------------------------
  const isLoading =
    isDailyLoading || isStatsLoading || isWeeklyLoading || isWrongLoading;

  const hasError =
    isDailyError || isStatsError || isWeeklyError || isWrongError;

  if (!user) {
    return (
      <Spinner fullHeight={true} message="로그인 정보를 확인하는 중입니다..." />
    );
  }

  if (isLoading || !dailyGoalData) {
    return (
      <Spinner
        fullHeight={true}
        message="대시보드를 불러오는 중입니다..."
      />
    );
  }

  if (hasError) {
    console.error("Dashboard load error:", {
      dailyError,
      statsError,
      weeklyError,
      wrongError,
    });
    return (
      <div className="page-container mt-24">
        <p>대시보드 데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // -----------------------------
  // 파생 데이터 계산
  // -----------------------------
  const goal = dailyGoalData.dailyGoal || 50;
  const learned = dailyGoalData.todayProgress || 0;
  const progressPercent = Math.min(dailyGoalData.percentage || 0, 100);
  const remaining = Math.max(goal - learned, 0);

  const totalWords = statsData?.totalLearnedWords ?? 0;
  const streak = statsData?.streakDays ?? 0;

  const weeklyDataSorted = [...(weeklyStudyData ?? [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const chartData = weeklyDataSorted.map((d) => ({
    date: formatDateLabel(d.date),
    learned: d.learnedCount,
    wrong: d.wrongCount,
  }));

// 요일별 출석 여부 (0: 일 ~ 6: 토)
const attendanceByWeekday = Array(7).fill(false);

weeklyDataSorted.forEach((day) => {
  const date = new Date(day.date);
  if (Number.isNaN(date.getTime())) return;

  const weekday = date.getDay(); // 0: 일 ~ 6: 토
  attendanceByWeekday[weekday] = day.learnedCount > 0;
});


  const totalLearned7 = weeklyDataSorted.reduce(
    (acc, cur) => acc + cur.learnedCount,
    0
  );

  const bestStudyDay =
    weeklyDataSorted.length > 0
      ? weeklyDataSorted.reduce(
          (best, cur) =>
            cur.learnedCount > (best?.learnedCount ?? -1) ? cur : best,
          null
        )
      : null;

  const bestStudyDayLabel = bestStudyDay
    ? formatDateLabel(bestStudyDay.date)
    : "-";
  const bestStudyDayCount = bestStudyDay?.learnedCount ?? 0;

  const wrongWordsList = wrongTop5Data ?? [];

  return (
    <div className="page-container mt-24 fade-in">
      <PageHeader title={greeting} highlight={`${user.nickname}님!`} />

      <div className="dashboard-layout">
        {/* 0. 관심 분야 설정 유도 배너 (관심 분야가 비어 있을 때만 표시) */}
        {!hasPreference && (
          <section className="dashboard-card preference-card">
            <div className="preference-main">
              <div className="preference-icon-wrap">
                <Layers size={20} />
              </div>
              <div className="preference-text">
                <p className="preference-title">관심 분야를 설정해 보세요</p>
                <p className="preference-desc">
                  관심 분야에 맞춰 단어를 추천해 드립니다. 지금 설정하면
                  단어장과 학습 추천이 더 정확해져요.
                </p>
              </div>
            </div>
            <div className="preference-actions">
              <Button
                variant="warning"
                size="sm"
                onClick={() => navigate("/account/profile")}
              >
                관심 분야 설정하기
                <ArrowRight
                  size={14}
                  className="btn__icon btn__icon--right"
                />
              </Button>
            </div>
          </section>
        )}

        {/* 1. 오늘의 학습 목표 */}
        <section className="dashboard-card status-card">
          <div className="status-header">
            <h3 className="section-title">오늘의 학습 목표</h3>
             <p className="section-subtitle">
      퀴즈에서 완료된 단어 기준으로 계산됩니다.
    </p>
          </div>

          <div className="status-body">
            <div className="status-progress-area">
              <div className="progress-header-row">
                <div className="progress-text-row">
                  <div className="big-number">
                    {learned}
                    <span className="slash">/</span>
                    <span className="goal-text">{goal} 단어</span>
                  </div>
              
                </div>

                <div className="status-percent-area">
                  <span className="percent-badge">
                    {Math.round(progressPercent)}% 달성
                  </span>
                </div>
              </div>

              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="status-metrics">
              <div className="metric-item">
                <div className="metric-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="metric-label">누적 학습</span>
                  <div className="metric-value">
                    {totalWords.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-icon warn">
                  <Flame size={20} />
                </div>
                <div>
                  <span className="metric-label">연속 학습</span>
                  <div className="metric-value highlight">{streak}일째</div>
                </div>
              </div>
            </div>
          </div>
        </section>

{/* 2. 이번 주 출석 현황 */}
<section className="dashboard-card action-card">
  <div className="action-top">
    <div>
      <h3 className="section-title">이번 주 출석 현황</h3>
    </div>
    <div className="mini-calendar">
      {weekDays.map((day, i) => (
        <div
          key={day + i}
          className={`calendar-day ${
            attendanceByWeekday[i] ? "checked" : ""
          }`}
        >
          {day}
        </div>
      ))}
    </div>
  </div>

  <div className="action-bottom">
    <Button
      variant="primary"
      size="md"
      full
      onClick={() => navigate("/learning/quiz?source=quiz")}
    >
      학습 시작하기
      <ArrowRight size={16} className="btn__icon btn__icon--right" />
    </Button>
  </div>
</section>


        {/* 3. 주간 학습 분석 */}
        <section className="dashboard-card chart-card">
          <div className="card-header">
            <div>
               <h3 className="section-title">주간 학습 활동량</h3>
      <p className="section-subtitle">
        이번 주 퀴즈·카드에서 학습한 횟수 기준입니다.
      </p>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="dot dot-learned" />
                학습
              </div>
              <div className="legend-item">
                <span className="dot dot-wrong" />
                오답
              </div>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--neutral-500)" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ opacity: 0.1 }}
                />
                <Bar
                  dataKey="learned"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`learned-${index}`}
                      fill="var(--primary-500)"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="wrong"
                  radius={[4, 4, 0, 0]}
                  fill="var(--warning-500)"
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-wrap--blue">
                <Layers size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">이번 주 학습</span>
                <span className="kpi-main-text">
                  <strong>{totalLearned7}</strong> 단어
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrap kpi-icon-wrap--yellow">
                <Trophy size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">최고 기록일</span>
                <span className="kpi-main-text">
                  <strong>{bestStudyDayCount}</strong>개
                  {bestStudyDayLabel !== "-" && (
                    <span className="kpi-sub-date">
                      {" "}
                      ({bestStudyDayLabel})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 자주 틀리는 단어 Top 5 */}
        <section className="dashboard-card wrong-card">
          <div className="card-header">
            <h3 className="section-title">자주 틀리는 단어</h3>
            <Button
              variant="text"
              size="sm"
              onClick={() =>
                navigate("/learning/quiz?source=wrong-note")
              }
              style={{ padding: 0, height: "auto" }}
            >
              복습하기
              <ArrowRight size={14} className="btn__icon btn__icon--right" />
            </Button>
          </div>

          <ul className="wrong-list">
            {wrongWordsList.length === 0 ? (
              <li className="empty-state">
                <CalendarCheck size={24} className="empty-icon" />
                틀린 단어가 없습니다!
              </li>
            ) : (
              wrongWordsList.map((item, index) => (
                <li key={item.wordId ?? index} className="wrong-item">
                  <span
                    className={`rank-badge ${index === 0 ? "top1" : ""}`}
                  >
                    {index + 1}
                  </span>
                  <div className="word-info">
                    <span className="word-en">{item.word}</span>
                    <span className="word-ko">{item.meaning}</span>
                  </div>
                  <span className="wrong-count">{item.count}회</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
