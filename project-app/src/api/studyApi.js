// src/api/studyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * 프론트 표준값:
 * - correct: 학습 완료
 * - none: 학습 예정
 */
const normalizeStudyStatus = (raw) => {
  const s = String(raw ?? "none").trim().toLowerCase();
  if (["correct", "learned", "completed", "done"].includes(s)) return "correct";
  if (["none", "pending", "todo", ""].includes(s)) return "none";
  return s;
};

// MOCK
const mockStudyMap = new Map();
const ensureMock = (wordId) => {
  const id = Number(wordId);
  if (!mockStudyMap.has(id)) mockStudyMap.set(id, { wordId: id, status: "none" });
  return mockStudyMap.get(id);
};

/**
 * GET /api/completed/{wordId}/status
 * -> Boolean
 */
export const getStudyStatus = async (wordId) => {
  if (wordId == null) throw new Error("getStudyStatus: wordId가 필요합니다.");
  const id = Number(wordId);

  if (USE_MOCK) {
    const item = ensureMock(id);
    return { status: normalizeStudyStatus(item.status) };
  }

  try {
    const res = await httpClient.get(`/api/completed/${id}/status`);
    const isCompleted = !!res.data; // Boolean
    return { status: isCompleted ? "correct" : "none" };
  } catch (e) {
    console.error("getStudyStatus error:", e.response?.data || e);
    // 상태 조회 실패해도 UI는 "학습 예정"으로 안전하게
    return { status: "none" };
  }
};

/**
 * POST /api/completed/{wordId}
 * -> String 메시지
 */
export const recordStudyCorrect = async (wordId) => {
  if (wordId == null) throw new Error("recordStudyCorrect: wordId가 필요합니다.");
  const id = Number(wordId);

  if (USE_MOCK) {
    const item = ensureMock(id);
    item.status = "correct";
    return { wordId: id, status: "correct" };
  }

  await httpClient.post(`/api/completed/${id}`);
  return { wordId: id, status: "correct" };
};

/**
 * 오답은 /api/completed로 처리 불가 (별도 wrong 로그 API 필요)
 */
export const recordStudyWrong = async () => {
  throw new Error("recordStudyWrong: 백엔드에 오답 기록 API가 필요합니다.");
};
