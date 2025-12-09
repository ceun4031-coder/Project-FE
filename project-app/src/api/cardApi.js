// src/api/cardApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_CARD_ITEMS = [
  { id: 1, wordId: 1001, frontText: "abandon", backText: "버리다" },
  { id: 2, wordId: 1002, frontText: "reluctant", backText: "내키지 않는" },
  { id: 3, wordId: 1003, frontText: "significant", backText: "중요한" },
  { id: 4, wordId: 1004, frontText: "comprehensive", backText: "포괄적인" },
];

// params: { source, wordIds, limit, level, category }
export async function fetchCardItems({
  source,
  wordIds,
  limit = 20,
  level,
  category,
}) {
  if (USE_MOCK) {
    await delay(200);
    return MOCK_CARD_ITEMS.slice(0, limit);
  }

  // 공통: wordIds 필터 함수
  const applyWordIdsFilter = (list) => {
    if (!Array.isArray(wordIds) || wordIds.length === 0) return list;

    const set = new Set(wordIds.map(Number));
    return list.filter((w) => set.has(Number(w.wordId)));
  };

  // --------------------------
  // 1) 오답 카드 모드
  //    GET /api/flashcard/wrong?count=20
  // --------------------------
  if (source === "wrong-note") {
    try {
      const res = await httpClient.get("/api/flashcard/wrong", {
        params: { count: limit },
      });

      const list = Array.isArray(res.data) ? res.data : [];
      let filtered = applyWordIdsFilter(list);

      filtered.sort(() => Math.random() - 0.5);

      return filtered.slice(0, limit).map((w) => ({
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
  //    GET /api/flashcard?count=20&level=...&category=...
  // --------------------------
  try {
    const res = await httpClient.get("/api/flashcard", {
      params: {
        count: limit,
        level,    // undefined면 Axios가 자동으로 빼준다
        category, // 마찬가지
      },
    });

    const list = Array.isArray(res.data) ? res.data : [];

    let filtered = applyWordIdsFilter(list);
    filtered.sort(() => Math.random() - 0.5);

    return filtered.slice(0, limit).map((w) => ({
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
  // --- 목업 모드 ---
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

  // --------------------------
  // 1) 몰랐다(unknown)
  //    - 학습 로그에 오답 기록: POST /api/study/{wordId}/wrong
  //    - 오답 노트에 추가:      POST /api/wrong/{wordId}
  // --------------------------
  if (result === "unknown") {
    // 학습 로그 오답 처리
    try {
      await httpClient.post(`/api/study/${wordId}/wrong`);
    } catch (e) {
      console.error(
        "submitCardResult: study wrong 처리 실패",
        e.response?.data || e
      );
    }

    // 오답 노트 기록
    let wrongAnswerLog = null;
    try {
      const res = await httpClient.post(`/api/wrong/${wordId}`);
      wrongAnswerLog = res.data ?? null;
    } catch (e) {
      console.error(
        "submitCardResult: wrong log 추가 실패",
        e.response?.data || e
      );
    }

    return { wrongAnswerLog };
  }

  // --------------------------
  // 2) 알았다(known)
  //    - 학습 로그 정답 처리: POST /api/study/{wordId}/correct
  // --------------------------
  try {
    await httpClient.post(`/api/study/${wordId}/correct`);
  } catch (e) {
    console.error(
      "submitCardResult: study correct 처리 실패",
      e.response?.data || e
    );
  }

  return { wrongAnswerLog: null };
}
