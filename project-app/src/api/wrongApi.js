// src/api/wrongApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Wrong API (백엔드 수정 없이 사용)
 *
 * 목표:
 *  - 백엔드 필드명이 조금 흔들려도 프론트에서는 "고정된 구조"만 사용
 *  - story 생성/오답 노트/최근 오답에서 공통으로 재사용
 *
 * normalizeWrongItem(raw) -> {
 *   wrongWordId, wordId, word, meaning,
 *   wordLevel, wrongAt, totalWrong, totalCorrect,
 *   isUsedInStory: "Y" | "N"
 * }
 */

/* ============================================================================
 * Normalizer
 * ========================================================================== */

const normalizeWrongItem = (raw) => {
  if (!raw || typeof raw !== "object") return null;

  // word가 객체(Word 엔티티)로 내려오는 경우
  const wordObj =
    raw.word && typeof raw.word === "object" && raw.word !== null ? raw.word : null;

  // isUsedInStory 정규화
  const used =
    raw.isUsedInStory === true ||
    raw.isUsedInStory === "Y" ||
    raw.isUsedInStory === "y";

  // meaning: 예문으로 대체 금지(뜻 오염 방지)
  const meaning =
    raw.meaningKo ??
    raw.meaning_ko ??
    raw.meaning ??
    raw.korean ??
    wordObj?.meaningKo ??
    wordObj?.meaning_ko ??
    wordObj?.meaning ??
    wordObj?.korean ??
    "";

  // word 텍스트
  const word =
    typeof raw.word === "string"
      ? raw.word
      : wordObj?.word ?? wordObj?.text ?? "";

  const wrongWordId = raw.wrongWordId ?? raw.wrongLogId ?? raw.id ?? null;
  if (wrongWordId == null) return null;

  return {
    // PK (WRONG_ANSWER_LOG의 PK)
    wrongWordId: Number(wrongWordId),

    // Word PK
    wordId: raw.wordId ?? wordObj?.wordId ?? wordObj?.id ?? null,

    // 텍스트/의미
    word: String(word || "").trim(),
    meaning: String(meaning || "").trim(),

    // 난이도(필드명 방어)
    wordLevel:
      raw.wordLevel ??
      raw.level ??
      wordObj?.level ??
      wordObj?.wordLevel ??
      raw.difficultyLevel ??
      raw.difficulty ??
      null,

    // 마지막 오답 시각
    wrongAt: raw.wrongAt ?? raw.lastWrongAt ?? raw.wrong_at ?? null,

    // 누적 정답/오답
    totalWrong: raw.totalWrong ?? raw.wrongCount ?? raw.wrong ?? 0,
    totalCorrect: raw.totalCorrect ?? raw.correctCount ?? 0,

    // 스토리 사용 여부: 항상 "Y" / "N"
    isUsedInStory: used ? "Y" : "N",
  };
};

/* ============================================================================
 * MOCK (인메모리)
 * ========================================================================== */

let mockWrongList = [];
let mockInitialized = false;

const initMockWrongList = () => {
  if (mockInitialized) return;
  mockInitialized = true;

  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };

  const raw = [
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
  ];

  mockWrongList = raw.map(normalizeWrongItem).filter(Boolean);
};

/* ============================================================================
 * API Functions
 * ========================================================================== */

/**
 * 오답 기록 추가
 * POST /api/wrong/{wordId}
 */
export const addWrongLog = async (wordId) => {
  if (USE_MOCK) {
    initMockWrongList();

    const raw = {
      wrongWordId: Date.now(),
      wordId,
      word: `mock-word-${wordId}`,
      meaning: "목업 의미",
      wrongAt: new Date().toISOString(),
      totalWrong: 1,
      totalCorrect: 0,
      isUsedInStory: "N",
    };

    const newItem = normalizeWrongItem(raw);
    mockWrongList = [newItem, ...mockWrongList];
    return newItem;
  }

  const res = await httpClient.post(`/api/wrong/${wordId}`);
  return normalizeWrongItem(res.data) ?? res.data;
};

/**
 * 오답 기록 삭제
 * DELETE /api/wrong/{wordId} (wordId 기준)
 */
export const deleteWrongLog = async (wordId) => {
  if (USE_MOCK) {
    initMockWrongList();
    mockWrongList = mockWrongList.filter((i) => Number(i.wordId) !== Number(wordId));
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
    initMockWrongList();
    return [...mockWrongList];
  }

  const res = await httpClient.get("/api/wrong");
  const arr = Array.isArray(res.data) ? res.data : [];
  return arr.map(normalizeWrongItem).filter(Boolean);
};

/**
 * 스토리에 아직 사용되지 않은 오답 목록
 * GET /api/wrong/unused
 *
 * StoryCreatePage에서 쓰기 좋은 "flat DTO"로 반환:
 *  - { wrongWordId, wordId, word, meaning }
 */
export const getUnusedWrongLogs = async () => {
  if (USE_MOCK) {
    initMockWrongList();
    return mockWrongList
      .filter((item) => item.isUsedInStory === "N")
      .map((item) => ({
        wrongWordId: item.wrongWordId,
        wordId: item.wordId,
        word: item.word,
        meaning: item.meaning,
      }));
  }

  const res = await httpClient.get("/api/wrong/unused");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr
    .map(normalizeWrongItem)
    .filter(Boolean)
    .map((item) => ({
      wrongWordId: item.wrongWordId,
      wordId: item.wordId,
      word: item.word,
      meaning: item.meaning,
    }));
};

/**
 * 최근 퀴즈 오답
 * GET /api/quiz/recent-wrong
 *
 * 반환 형태(기존 호환):
 *  - { wrongLogId, wordId, word, meaning }
 */
export const getRecentWrongLogs = async () => {
  if (USE_MOCK) {
    initMockWrongList();

    const sorted = [...mockWrongList].sort((a, b) => {
      if (!a.wrongAt || !b.wrongAt) return 0;
      return new Date(b.wrongAt) - new Date(a.wrongAt);
    });

    return sorted.slice(0, 5).map((item) => ({
      wrongLogId: item.wrongWordId,
      wordId: item.wordId,
      word: item.word,
      meaning: item.meaning,
    }));
  }

  const res = await httpClient.get("/api/quiz/recent-wrong");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map((raw) => {
    const wordObj = raw.word && typeof raw.word === "object" ? raw.word : null;

    return {
      wrongLogId: raw.wrongLogId ?? raw.wrongWordId ?? raw.id,
      wordId: raw.wordId ?? wordObj?.wordId ?? wordObj?.id ?? null,
      word:
        typeof raw.word === "string" ? raw.word : wordObj?.word ?? wordObj?.text ?? "",
      meaning:
        raw.meaningKo ??
        raw.meaning_ko ??
        raw.meaning ??
        raw.korean ??
        wordObj?.meaningKo ??
        wordObj?.meaning ??
        "",
    };
  });
};

/**
 * 오답 기록 → 스토리에 사용됨 처리
 * POST /api/wrong/mark-used/{wrongLogId}
 */
export const markWrongUsed = async (wrongLogId) => {
  if (USE_MOCK) {
    initMockWrongList();

    mockWrongList = mockWrongList.map((item) =>
      Number(item.wrongWordId) === Number(wrongLogId)
        ? { ...item, isUsedInStory: "Y" }
        : item
    );

    return { success: true };
  }

  const res = await httpClient.post(`/api/wrong/mark-used/${wrongLogId}`);
  return res.data;
};
