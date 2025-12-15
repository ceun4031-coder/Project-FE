// src/api/dashboardApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Dashboard API normalize/shape (실무 기준)
 * - 날짜: "YYYY-MM-DD" 문자열로 통일 (string compare)
 * - weekly: "이번 주 7칸" 고정 생성 후, 서버 데이터는 해당 주에만 매핑
 *   → 지난주/다음주 데이터가 섞여 와도 UI가 오염되지 않음
 *
 * weekStartsOn:
 * - 0: 일요일 시작 (예: 2024-05-19 ~)
 * - 1: 월요일 시작
 */
const WEEK_STARTS_ON = 0;

/* -----------------------
 * MOCK
 * ---------------------- */
const mockGetDailyGoal = () => ({
  nickname: "홍길동",
  dailyGoal: 50,
  todayProgress: 12,
  percentage: 24,
});

const mockGetDashboardStats = () => ({
  totalLearnedWords: 1250,
  wrongWords: 10,
  streakDays: 5,
});

/**
 * MOCK도 "이번 주 7칸" 기준으로 맞춰 반환 (UI 안정)
 */
const mockGetWeeklyStudy = (baseDate = new Date(), weekStartsOn = WEEK_STARTS_ON) => {
  const week = getWeekYMDs(baseDate, weekStartsOn);
  const learned = [15, 20, 10, 30, 25, 12, 18];
  const wrong = [2, 5, 0, 1, 4, 3, 2];

  return week.map((date, i) => ({
    date,
    learnedCount: learned[i] ?? 0,
    wrongCount: wrong[i] ?? 0,
  }));
};

const mockGetWrongTop5 = () => [
  { wordId: 1, word: "Coffee", meaning: "커피", count: 5 },
  { wordId: 2, word: "Resilience", meaning: "회복탄력성", count: 4 },
  { wordId: 3, word: "Ambiguous", meaning: "모호한", count: 3 },
  { wordId: 4, word: "Strategy", meaning: "전략", count: 3 },
  { wordId: 5, word: "Implement", meaning: "실행하다", count: 3 },
];

/* -----------------------
 * Date utils (문자열 비교 중심)
 * ---------------------- */
const pad2 = (n) => String(n).padStart(2, "0");

const toYMDLocal = (d) => {
  const yy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yy}-${mm}-${dd}`;
};

const normalizeYMD = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw.substring(0, 10);
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return toYMDLocal(raw);
  return "";
};

const startOfWeek = (baseDate, weekStartsOn = 0) => {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const day = d.getDay(); // 0..6
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
};

const getWeekYMDs = (baseDate = new Date(), weekStartsOn = 0) => {
  const start = startOfWeek(baseDate, weekStartsOn);
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toYMDLocal(d));
  }
  return out;
};

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
};

/* -----------------------
 * API
 * ---------------------- */

/**
 * 오늘의 목표
 * GET /api/dashboard/daily-goal
 */
export const getDailyGoal = async () => {
  if (USE_MOCK) return mockGetDailyGoal();

  const res = await httpClient.get("/api/dashboard/daily-goal");
  const d = res?.data ?? {};

  return {
    nickname: d.nickname ?? null,
    dailyGoal: toNum(d.dailyGoal, 0),
    todayProgress: toNum(d.todayProgress ?? d.completedToday, 0),
    percentage: toNum(d.percentage ?? d.progressRate, 0),
  };
};

/**
 * 전체 학습 통계
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async () => {
  if (USE_MOCK) return mockGetDashboardStats();

  const res = await httpClient.get("/api/dashboard/stats");
  const d = res?.data ?? {};

  return {
    totalLearnedWords: toNum(d.totalLearnedWords ?? d.completedWords, 0),
    wrongWords: toNum(d.wrongWords ?? d.wrongAnswers, 0),
    streakDays: toNum(d.streakDays ?? d.streak, 0),
  };
};

/**
 * 최근 7일(=이번 주) 학습량
 * GET /api/dashboard/weekly
 *
 * 반환 규칙:
 * - 항상 이번 주 7개 날짜(YYYY-MM-DD)를 반환
 * - 서버 응답은 날짜 normalize 후, 이번 주에 해당하는 것만 매핑
 * - 누락 날짜는 0으로 채움
 * - 같은 날짜 데이터가 여러 개면 합산(중복 데이터 방어)
 *
 * @param {object} [opts]
 * @param {Date}   [opts.baseDate=new Date()] 기준 날짜(테스트/디버깅용)
 * @param {0|1}    [opts.weekStartsOn=WEEK_STARTS_ON] 주 시작 요일(0=일, 1=월)
 */
export const getWeeklyStudy = async (opts = {}) => {
  const {
    baseDate = new Date(),
    weekStartsOn = WEEK_STARTS_ON,
  } = opts;

  const weekYMDs = getWeekYMDs(baseDate, weekStartsOn);
  const weekSet = new Set(weekYMDs);

  if (USE_MOCK) return mockGetWeeklyStudy(baseDate, weekStartsOn);

  const res = await httpClient.get("/api/dashboard/weekly");
  const data = res?.data;

  const raw = Array.isArray(data) ? data : data?.items || [];

  // 이번 주 데이터만 date(YYYY-MM-DD) 기준으로 모으기
  const byDate = new Map();
  for (const it of raw) {
    const rawDate = it?.date || it?.day || it?.baseDate || "";
    const ymd = normalizeYMD(rawDate);
    if (!ymd || !weekSet.has(ymd)) continue;

    const learnedCount = toNum(it.learnedCount ?? it.studyCount ?? it.count, 0);
    const wrongCount = toNum(it.wrongCount ?? it.incorrectCount, 0);

    const prev = byDate.get(ymd);
    if (prev) {
      byDate.set(ymd, {
        date: ymd,
        learnedCount: prev.learnedCount + learnedCount,
        wrongCount: prev.wrongCount + wrongCount,
      });
    } else {
      byDate.set(ymd, { date: ymd, learnedCount, wrongCount });
    }
  }

  // UI용 7칸 고정 반환
  return weekYMDs.map((date) => {
    const v = byDate.get(date);
    return {
      date,
      learnedCount: v?.learnedCount ?? 0,
      wrongCount: v?.wrongCount ?? 0,
    };
  });
};

/**
 * 오답 단어 TOP 5
 * GET /api/dashboard/wrong/top5?days={days}
 */
export const getWrongTop5 = async (days = 7) => {
  if (USE_MOCK) return mockGetWrongTop5();

  const res = await httpClient.get("/api/dashboard/wrong/top5", { params: { days } });
  const data = res?.data ?? [];

  const list = Array.isArray(data) ? data : data?.items || [];

  return list.map((item) => ({
    wordId: item.wordId ?? item.id ?? null,
    word: item.word ?? "",
    meaning: item.meaning ?? "",
    count: toNum(item.count ?? item.wrongCount, 0),
  }));
};
