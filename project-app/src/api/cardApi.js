// src/api/cardApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_CARD_ITEMS = [
  { id: 1, wordId: 1001, frontText: "abandon", backText: "버리다", level: 1 },
  { id: 2, wordId: 1002, frontText: "reluctant", backText: "내키지 않는", level: 2 },
  { id: 3, wordId: 1003, frontText: "significant", backText: "중요한", level: 2 },
  { id: 4, wordId: 1004, frontText: "comprehensive", backText: "포괄적인", level: 3 },
];

const DEFAULT_LIMIT = 20;

// params: { source, wordIds, limit, level, category }
export async function fetchCardItems(params = {}) {
  const { source, wordIds, level, category } = params;

  const inputLimit = Number(params.limit);
  const resolvedLimit =
    Array.isArray(wordIds) && wordIds.length > 0
      ? wordIds.length
      : Number.isFinite(inputLimit) && inputLimit > 0
      ? inputLimit
      : DEFAULT_LIMIT;

  if (USE_MOCK) {
    await delay(200);
    // mock에서도 wordIds가 있으면 그 개수만큼(가능한 만큼) 맞춤
    const base = Array.isArray(wordIds) && wordIds.length > 0
      ? MOCK_CARD_ITEMS.filter((x) => new Set(wordIds.map(Number)).has(Number(x.wordId)))
      : MOCK_CARD_ITEMS;

    return base.slice(0, resolvedLimit);
  }

  // wordIds 필터
  const applyWordIdsFilter = (list) => {
    if (!Array.isArray(wordIds) || wordIds.length === 0) return list;
    const set = new Set(wordIds.map(Number));
    return list.filter((w) => set.has(Number(w.wordId)));
  };

  // 백엔드가 wordIds 지원하면 그대로 서버 필터가 되도록 같이 보내줌(미지원이면 무시됨)
  const wordIdsQuery =
    Array.isArray(wordIds) && wordIds.length > 0 ? wordIds.join(",") : undefined;

  // --------------------------
  // 1) 오답 카드 모드
  //    GET /api/flashcard/wrong?count=...
  // --------------------------
  if (source === "wrong-note") {
    try {
      const res = await httpClient.get("/api/flashcard/wrong", {
        params: {
          count: resolvedLimit,
          wordIds: wordIdsQuery,
        },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      let filtered = applyWordIdsFilter(list);

      // 랜덤 섞기(기존 동작 유지)
      filtered.sort(() => Math.random() - 0.5);

      return filtered.slice(0, resolvedLimit).map((w) => ({
        id: w.wordId,
        wordId: w.wordId,
        frontText: w.word,
        backText: w.meaning,
        level: w.level,
      }));
    } catch (e) {
      console.error(
        "[fetchCardItems] /api/flashcard/wrong 실패:",
        e.response?.status,
        e.response?.data || e.message
      );
      throw e;
    }
  }

  // --------------------------
  // 2) 일반 카드 모드
  //    GET /api/flashcard?count=...&level=...&category=...
  // --------------------------
  try {
    const res = await httpClient.get("/api/flashcard", {
      params: {
        count: resolvedLimit,
        level,      // undefined면 axios가 제거
        category,   // undefined면 제거
        wordIds: wordIdsQuery,
      },
    });

    const list = Array.isArray(res.data) ? res.data : [];
    let filtered = applyWordIdsFilter(list);

    filtered.sort(() => Math.random() - 0.5);

    return filtered.slice(0, resolvedLimit).map((w) => ({
      id: w.wordId,
      wordId: w.wordId,
      frontText: w.word,
      backText: w.meaning,
      level: w.level,
    }));
  } catch (e) {
    console.error(
      "[fetchCardItems] /api/flashcard 실패:",
      e.response?.status,
      e.response?.data || e.message
    );
    throw e;
  }
}

/**
 * 카드 학습 결과 제출 (알았다 / 몰랐다)
 * - result: 'known' | 'unknown'
 *
 * 서버 스펙:
 *  - known   -> POST /api/study/{wordId}/correct
 *  - unknown -> POST /api/study/{wordId}/wrong + POST /api/wrong/{wordId}
 */
export async function submitCardResult({ wordId, result }) {
  if (USE_MOCK) {
    await delay(120);

    const isUnknown = result === "unknown";
    const wrongAnswerLog = isUnknown
      ? {
          wrongWordId: Date.now(),
          wordId,
        }
      : null;

    return { wrongAnswerLog };
  }

  if (!wordId) {
    throw new Error("submitCardResult: wordId가 필요합니다.");
  }

  if (result === "unknown") {
    try {
      await httpClient.post(`/api/study/${wordId}/wrong`);
    } catch (e) {
      console.error("submitCardResult: study wrong 처리 실패", e.response?.data || e);
    }

    let wrongAnswerLog = null;
    try {
      const res = await httpClient.post(`/api/wrong/${wordId}`);
      wrongAnswerLog = res.data ?? null;
    } catch (e) {
      console.error("submitCardResult: wrong log 추가 실패", e.response?.data || e);
    }

    return { wrongAnswerLog };
  }

  try {
    await httpClient.post(`/api/study/${wordId}/correct`);
  } catch (e) {
    console.error("submitCardResult: study correct 처리 실패", e.response?.data || e);
  }

  return { wrongAnswerLog: null };
}
