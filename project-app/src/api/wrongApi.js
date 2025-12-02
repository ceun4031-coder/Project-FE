// src/api/wrongApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Wrong Answer Log API
 *
 * 백엔드 명세:
 *  - POST   /api/wrong/{wordId}              : 오답 기록 추가
 *  - DELETE /api/wrong/{wordId}              : 오답 기록 삭제
 *  - GET    /api/wrong                       : 내 오답 목록
 *  - GET    /api/wrong/unused                : 스토리에 아직 사용되지 않은 오답 목록
 *  - POST   /api/wrong/mark-used/{wrongLogId}: 오답 기록 → 스토리에 사용됨 처리
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
 *
 * @param {number} wordId
 * @returns {Promise<any>}
 */
export const addWrongLog = async (wordId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 기록 추가:", wordId);

    // 간단한 목업 응답
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
 *
 * @param {number} wordId
 * @returns {Promise<any>}
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
 *
 * 예상 응답 예시:
 * [
 *   {
 *     wrongWordId: 1,
 *     wordId: 10,
 *     word: "ambiguous",
 *     meaning: "애매모호한",
 *     wrongAt: "2025-12-02T10:00:00",
 *     isUsedInStory: "N"
 *   },
 *   ...
 * ]
 *
 * @returns {Promise<Array>}
 */
// src/api/wrongApi.js

export const getWrongList = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 내 오답 목록 조회");

    // n일 전 ISO 문자열
    const daysAgo = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString();
    };

    return [
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
  }

  const res = await httpClient.get("/api/wrong");
  return res.data;
};

/**
 * 스토리에 아직 사용되지 않은 오답 목록
 * GET /api/wrong/unused
 *
 * StoryCreatePage 에서 사용.
 * 예상 응답 예시:
 * [
 *   {
 *     wrongWordId: 1,
 *     wordId: 101,
 *     word: "ambiguous",
 *     meaning: "애매모호한",
 *     wrongAt: "2025-12-02T10:00:00",
 *     isUsedInStory: "N"
 *   },
 *   ...
 * ]
 *
 * @returns {Promise<Array>}
 */
export const getUnusedWrongLogs = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 미사용 오답 목록 조회");

    // StoryCreatePage 에서 기대하는 형태에 맞춤
    return [
      { wrongWordId: 1, wordId: 101, word: "ambiguous", meaning: "애매모호한" },
      { wrongWordId: 2, wordId: 102, word: "mitigate", meaning: "완화하다" },
      { wrongWordId: 3, wordId: 103, word: "scrutinize", meaning: "세밀히 조사하다" },
      { wrongWordId: 4, wordId: 104, word: "fluctuate", meaning: "변동하다" },
    ];
  }

  const res = await httpClient.get("/api/wrong/unused");
  return res.data;
};

/**
 * 오답 기록 → 스토리에 사용됨 처리
 * POST /api/wrong/mark-used/{wrongLogId}
 *
 * @param {number} wrongLogId
 * @returns {Promise<any>}
 */
export const markWrongUsed = async (wrongLogId) => {
  if (USE_MOCK) {
    console.log("[Mock] 오답 스토리 사용 처리:", wrongLogId);
    return { success: true };
  }

  const res = await httpClient.post(`/api/wrong/mark-used/${wrongLogId}`);
  return res.data;
};
