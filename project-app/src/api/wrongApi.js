// src/api/wrongApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * WRONG_ANSWER_LOG 공통 normalize
 * - 백엔드에서 필드명이 조금씩 달라도 프론트에서 동일 형태로 사용하기 위함
 */
const normalizeWrongItem = (raw) => {
  if (!raw || typeof raw !== "object") {
    console.error("normalizeWrongItem: invalid data", raw);
    return null;
  }

  const used =
    raw.isUsedInStory === true ||
    raw.isUsedInStory === "Y" ||
    raw.isUsedInStory === "y";

  return {
    // PK
    wrongWordId: raw.wrongWordId ?? raw.wrongLogId ?? raw.id,

    // 단어 정보
    wordId: raw.wordId,
    word: raw.word,
    meaning: raw.meaning,

    // 난이도
    wordLevel:
      raw.wordLevel ??
      raw.level ??
      raw.difficultyLevel ??
      raw.difficulty ??
      null,

    // 마지막 오답 시각
    wrongAt: raw.wrongAt ?? raw.lastWrongAt ?? raw.wrong_at ?? null,

    // 누적 정답/오답
    totalWrong: raw.totalWrong ?? raw.wrongCount ?? raw.wrong ?? 0,
    totalCorrect: raw.totalCorrect ?? raw.correctCount ?? 0,

    // 스토리 사용 여부 → 항상 "Y" / "N"
    isUsedInStory: used ? "Y" : "N",
  };
};

/**
 * Wrong Answer Log API
 *
 * 백엔드 명세:
 *  - POST   /api/wrong/{wordId}               : 오답 기록 추가
 *  - DELETE /api/wrong/{wordId}               : 오답 기록 삭제
 *  - GET    /api/wrong                        : 내 오답 목록
 *  - GET    /api/wrong/unused                 : 스토리에 아직 사용되지 않은 오답 목록
 *  - POST   /api/wrong/mark-used/{wrongLogId} : 오답 기록 → 스토리에 사용됨 처리
 *
 * DDL (WRONG_ANSWER_LOG):
 *  - WRONG_WORD_ID (PK)
 *  - WORD_ID
 *  - USER_ID
 *  - WRONG_AT
 *  - IS_USED_IN_STORY ('Y' / 'N')
 */

/**
 * 오답 기록 추가
 * POST /api/wrong/{wordId}
 */
export const addWrongLog = async (wordId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 기록 추가:", wordId);

    return {
      wrongWordId: Date.now(),
      wordId,
      word: "mock-word",
      meaning: "목업 의미",
      wrongAt: new Date().toISOString(),
      isUsedInStory: "N",
    };
  }

  const res = await httpClient.post(`/api/wrong/${wordId}`);
  return res.data;
};

/**
 * 오답 기록 삭제
 * DELETE /api/wrong/{wordId}
 */
export const deleteWrongLog = async (wordId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 기록 삭제:", wordId);
    return { success: true };
  }

  const res = await httpClient.delete(`/api/wrong/${wordId}`);
  return res.data;
};

/**
 * 내 오답 목록 전체 조회
 * GET /api/wrong
 */
export const getWrongList = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 내 오답 목록 조회");

    const daysAgo = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString();
    };

    const mock = [
      {
        wrongWordId: 1,
        wordId: 101,
        word: "ambiguous",
        meaning: "애매모호한",
        wordLevel: 1,
        wrongAt: daysAgo(0),
        totalCorrect: 1,
        totalWrong: 3,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 2,
        wordId: 102,
        word: "mitigate",
        meaning: "완화하다",
        wordLevel: 2,
        wrongAt: daysAgo(1),
        totalCorrect: 0,
        totalWrong: 4,
        isUsedInStory: "Y",
      },
      {
        wrongWordId: 3,
        wordId: 103,
        word: "scrutinize",
        meaning: "세밀히 조사하다",
        wordLevel: 3,
        wrongAt: daysAgo(2),
        totalCorrect: 2,
        totalWrong: 5,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 4,
        wordId: 104,
        word: "fluctuate",
        meaning: "변동하다",
        wordLevel: 2,
        wrongAt: daysAgo(3),
        totalCorrect: 3,
        totalWrong: 3,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 5,
        wordId: 105,
        word: "coherent",
        meaning: "일관된",
        wordLevel: 1,
        wrongAt: daysAgo(4),
        totalCorrect: 5,
        totalWrong: 2,
        isUsedInStory: "Y",
      },
      {
        wrongWordId: 6,
        wordId: 106,
        word: "feasible",
        meaning: "실현 가능한",
        wordLevel: 2,
        wrongAt: daysAgo(5),
        totalCorrect: 1,
        totalWrong: 6,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 7,
        wordId: 107,
        word: "alleviate",
        meaning: "완화시키다",
        wordLevel: 2,
        wrongAt: daysAgo(6),
        totalCorrect: 0,
        totalWrong: 2,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 8,
        wordId: 108,
        word: "abstract",
        meaning: "추상적인",
        wordLevel: 1,
        wrongAt: daysAgo(7),
        totalCorrect: 4,
        totalWrong: 1,
        isUsedInStory: "Y",
      },
      {
        wrongWordId: 9,
        wordId: 109,
        word: "disrupt",
        meaning: "방해하다",
        wordLevel: 3,
        wrongAt: daysAgo(8),
        totalCorrect: 2,
        totalWrong: 7,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 10,
        wordId: 110,
        word: "plausible",
        meaning: "그럴듯한",
        wordLevel: 3,
        wrongAt: daysAgo(9),
        totalCorrect: 0,
        totalWrong: 1,
        isUsedInStory: "Y",
      },
      {
        wrongWordId: 11,
        wordId: 111,
        word: "tedious",
        meaning: "지루한",
        wordLevel: 1,
        wrongAt: daysAgo(10),
        totalCorrect: 3,
        totalWrong: 3,
        isUsedInStory: "N",
      },
      {
        wrongWordId: 12,
        wordId: 112,
        word: "inevitable",
        meaning: "피할 수 없는",
        wordLevel: 2,
        wrongAt: daysAgo(11),
        totalCorrect: 1,
        totalWrong: 5,
        isUsedInStory: "N",
      },
    ];

    return mock.map(normalizeWrongItem).filter(Boolean);
  }

  const res = await httpClient.get("/api/wrong");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map(normalizeWrongItem).filter(Boolean);
};

/**
 * 스토리에 아직 사용되지 않은 오답 목록
 * GET /api/wrong/unused
 *
 * StoryCreatePage에서 사용.
 */
export const getUnusedWrongLogs = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 미사용 오답 목록 조회");

    return [
      { wrongWordId: 1, wordId: 101, word: "ambiguous", meaning: "애매모호한" },
      { wrongWordId: 2, wordId: 102, word: "mitigate", meaning: "완화하다" },
      { wrongWordId: 3, wordId: 103, word: "scrutinize", meaning: "세밀히 조사하다" },
      { wrongWordId: 4, wordId: 104, word: "fluctuate", meaning: "변동하다" },
      { wrongWordId: 5, wordId: 105, word: "comprehensive", meaning: "포괄적인" },
      { wrongWordId: 6, wordId: 106, word: "deteriorate", meaning: "악화되다" },
      { wrongWordId: 7, wordId: 107, word: "equivalent", meaning: "동등한" },
      { wrongWordId: 8, wordId: 108, word: "hypothesis", meaning: "가설" },
      { wrongWordId: 9, wordId: 109, word: "inevitable", meaning: "피할 수 없는" },
      { wrongWordId: 10, wordId: 110, word: "lucrative", meaning: "수익성이 좋은" },
      { wrongWordId: 11, wordId: 111, word: "meticulous", meaning: "꼼꼼한" },
      { wrongWordId: 12, wordId: 112, word: "negligible", meaning: "무시해도 될 정도의" },
      { wrongWordId: 13, wordId: 113, word: "obsolete", meaning: "구식의" },
      { wrongWordId: 14, wordId: 114, word: "persistent", meaning: "끈질긴" },
      { wrongWordId: 15, wordId: 115, word: "redundant", meaning: "불필요한" },
      { wrongWordId: 16, wordId: 116, word: "skeptical", meaning: "회의적인" },
      { wrongWordId: 17, wordId: 117, word: "tangible", meaning: "유형의" },
      { wrongWordId: 18, wordId: 118, word: "unanimous", meaning: "만장일치의" },
      { wrongWordId: 19, wordId: 119, word: "versatile", meaning: "다재다능한" },
      { wrongWordId: 20, wordId: 120, word: "vulnerable", meaning: "취약한" },
    ];
  }

  const res = await httpClient.get("/api/wrong/unused");
  const arr = Array.isArray(res.data) ? res.data : [];

  // StoryCreatePage는 이 4개 필드만 사용
  return arr.map((raw) => ({
    wrongWordId: raw.wrongWordId ?? raw.wrongLogId ?? raw.id,
    wordId: raw.wordId,
    word: raw.word,
    meaning: raw.meaning,
  }));
};

/**
 * 오답 기록 → 스토리에 사용됨 처리
 * POST /api/wrong/mark-used/{wrongLogId}
 */
export const markWrongUsed = async (wrongLogId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 스토리 사용 처리:", wrongLogId);
    return { success: true };
  }

  const res = await httpClient.post(`/api/wrong/mark-used/${wrongLogId}`);
  return res.data;
};
