// src/api/dashboardApi.js
import httpClient from "./httpClient";

/**
 * 오늘의 목표(하루 목표 단어 수, 오늘 학습량, 달성률)
 * GET /api/dashboard/daily-goal
 * 
 * 예상 Response 예시:
 * {
 *   "dailyGoal": 30,
 *   "todayProgress": 12,
 *   "percentage": 40
 * }
 */
export const getDailyGoal = () => {
  return httpClient.get("/api/dashboard/daily-goal");
};

/**
 * 전체 학습 통계
 * GET /api/dashboard/stats
 * 
 * 예상 Response 예시:
 * {
 *   "totalLearnedWords": 120,
 *   "favoriteWords": 15,
 *   "wrongWords": 20,
 *   "streakDays": 5
 * }
 */
export const getDashboardStats = () => {
  return httpClient.get("/api/dashboard/stats");
};

/**
 * 최근 7일 학습량
 * GET /api/dashboard/weekly
 * 
 * 예상 Response 예시:
 * {
 *   "items": [
 *     { "date": "2025-11-26", "count": 10 },
 *     { "date": "2025-11-27", "count": 5 },
 *     ...
 *   ]
 * }
 */
export const getWeeklyStudy = () => {
  return httpClient.get("/api/dashboard/weekly");
};
