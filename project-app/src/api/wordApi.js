// src/api/wordApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ----------------------
// Mock 데이터
// ----------------------
let mockWordList = [
  {
    wordId: 1,
    word: "Coffee",
    meaning: "커피",
    partOfSpeech: "Noun",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "I drink coffee every morning.",
    exampleSentenceKo: "나는 매일 아침 커피를 마신다.",
  },
  {
    wordId: 2,
    word: "Negotiate",
    meaning: "협상하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "We need to negotiate a better price.",
    exampleSentenceKo: "우리는 더 나은 가격을 협상해야 한다.",
  },
  {
    wordId: 3,
    word: "Beautiful",
    meaning: "아름다운",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "It is a beautiful day today.",
    exampleSentenceKo: "오늘은 아름다운 날이다.",
  },
  {
    wordId: 4,
    word: "Quickly",
    meaning: "빠르게",
    partOfSpeech: "Adverb",
    category: "Daily Life",
    level: 2,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "She quickly finished her homework.",
    exampleSentenceKo: "그녀는 숙제를 빠르게 끝냈다.",
  },
  {
    wordId: 5,
    word: "Strategy",
    meaning: "전략",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "We need a new strategy for marketing.",
    exampleSentenceKo: "우리는 마케팅을 위한 새로운 전략이 필요하다.",
  },
  {
    wordId: 6,
    word: "Implement",
    meaning: "실행하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 3,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "The company will implement the new policy.",
    exampleSentenceKo: "회사는 새로운 정책을 실행할 것이다.",
  },
  {
    wordId: 7,
    word: "Deadline",
    meaning: "마감 기한",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The project deadline is next Monday.",
    exampleSentenceKo: "프로젝트 마감 기한은 다음 주 월요일이다.",
  },
  {
    wordId: 8,
    word: "Conference",
    meaning: "회의, 회의회",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "He will attend an international conference.",
    exampleSentenceKo: "그는 국제 회의에 참석할 것이다.",
  },
  {
    wordId: 9,
    word: "Analyze",
    meaning: "분석하다",
    partOfSpeech: "Verb",
    category: "Business",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "We need to analyze the survey results.",
    exampleSentenceKo: "우리는 설문 결과를 분석해야 한다.",
  },
  {
    wordId: 10,
    word: "Curious",
    meaning: "궁금한, 호기심 많은",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "She is curious about many things.",
    exampleSentenceKo: "그녀는 많은 것에 대해 호기심이 많다.",
  },
  {
    wordId: 11,
    word: "Comfortable",
    meaning: "편안한",
    partOfSpeech: "Adjective",
    category: "Daily Life",
    level: 1,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "This chair is very comfortable.",
    exampleSentenceKo: "이 의자는 매우 편안하다.",
  },
  {
    wordId: 12,
    word: "Frequently",
    meaning: "자주, 빈번히",
    partOfSpeech: "Adverb",
    category: "Daily Life",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "He frequently visits the library.",
    exampleSentenceKo: "그는 도서관에 자주 방문한다.",
  },
  {
    wordId: 13,
    word: "Opportunity",
    meaning: "기회",
    partOfSpeech: "Noun",
    category: "Business",
    level: 2,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "This is a great opportunity for your career.",
    exampleSentenceKo: "이것은 당신의 커리어에 훌륭한 기회이다.",
  },
];

const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

/**
 * 품사 값 통일: DB / API 값 → 프론트 공통 포맷
 * - 소문자, 축약형 등 섞여 들어와도 UI에서는 Noun/Verb/Adj/Adv로 통일
 */
// src/api/wordApi.js
const normalizePartOfSpeech = (raw) => {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();

  if (v === "noun" || v === "n") return "Noun";

  if (
    v === "verb" ||
    v === "v" ||
    v === "linking verb" ||
    v === "modal verb"
  ) {
    return "Verb";
  }

  if (v === "adjective" || v === "adj" || v === "adj.") return "Adjective";
  if (v === "adverb" || v === "adv" || v === "adv.") return "Adverb";

  // 그 외는 Title Case로
  return v.replace(/\b\w/g, (c) => c.toUpperCase());
};


/**
 * 공통 매핑: 백엔드/Mock → 프론트 공통 형태
 * - Word / Favorite / Completed 응답을 한 번에 처리
 */
const mapWordFromApi = (w) => {
  if (!w || typeof w !== "object") {
    console.error("mapWordFromApi: invalid data", w);
    return {
      id: null,
      wordId: null,
      word: "",
      meaning: "",
      partOfSpeech: null,
      category: null,
      level: 1,
      isFavorite: false,
      isCompleted: false,
      exampleSentence: "",
      exampleSentenceEn: "",
      exampleSentenceKo: "",
    };
  }

  // level / wordLevel 둘 다 대응
  let levelValue = null;
  if (typeof w.level === "number") {
    levelValue = w.level;
  } else if (w.level != null) {
    const n = Number(w.level);
    levelValue = Number.isNaN(n) ? null : n;
  } else if (typeof w.wordLevel === "number") {
    levelValue = w.wordLevel;
  } else if (w.wordLevel != null) {
    const n = Number(w.wordLevel);
    levelValue = Number.isNaN(n) ? null : n;
  }
  if (levelValue == null) levelValue = 1;

  const hasExampleSentence =
    typeof w.exampleSentence === "string" &&
    w.exampleSentence.trim().length > 0;

  const exampleSentence = hasExampleSentence
    ? w.exampleSentence
    : typeof w.exampleSentenceEn === "string"
    ? w.exampleSentenceEn
    : typeof w.exampleEn === "string"
    ? w.exampleEn
    : "";

  const id = w.id != null ? w.id : null;

  const wordId =
    w.wordId != null
      ? w.wordId
      : typeof w.id === "number"
      ? w.id
      : null;

  const rawPos = w.partOfSpeech ?? w.pos ?? null;

  const isFavorite =
    w.isFavorite != null ? w.isFavorite : w.favorite ?? false;

  let isCompleted = w.isCompleted;
  if (
    typeof isCompleted === "undefined" &&
    typeof w.learningStatus === "string"
  ) {
    isCompleted = w.learningStatus === "COMPLETED";
  }

  return {
    id,
    wordId,
    word: w.word || "",
    meaning: w.meaning || "",
    partOfSpeech: normalizePartOfSpeech(rawPos),
    category: w.category != null ? w.category : null,
    level: levelValue,
    isFavorite: !!isFavorite,
    isCompleted: !!isCompleted,
    exampleSentence,
    exampleSentenceEn:
      typeof w.exampleSentenceEn === "string"
        ? w.exampleSentenceEn
        : typeof w.exampleEn === "string"
        ? w.exampleEn
        : exampleSentence || "",
    exampleSentenceKo:
      typeof w.exampleSentenceKo === "string"
        ? w.exampleSentenceKo
        : typeof w.exampleKo === "string"
        ? w.exampleKo
        : "",
  };
};

// =====================================================
// 1. 단어 목록 조회 (페이징)
// =====================================================
export const getWordList = async (page = 0, size = 100) => {
  if (USE_MOCK) {
    const start = page * size;
    const end = start + size;
    const slice = mockWordList.slice(start, end);
    const content = slice.map(mapWordFromApi);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(mockWordList.length / size)),
      totalElements: mockWordList.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/api/words", {
    params: { page, size },
  });

  const data = res.data || {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const content = rawContent.map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 1-1. 전체 단어 목록 (단어장용 /api/words/all)
// =====================================================
export const getAllWords = async () => {
  if (USE_MOCK) {
    // 목업에서는 전부 한 번에 반환
    const mapped = mockWordList.map(mapWordFromApi);
    return mockDelay(mapped);
  }

  const res = await httpClient.get("/api/words/all");
  const arr = Array.isArray(res.data) ? res.data : [];
  return arr.map(mapWordFromApi);
};

// =====================================================
// 2. 오늘의 단어
// =====================================================
export const getTodayWord = async () => {
  if (USE_MOCK) {
    const first = mockWordList[0];
    return mockDelay(mapWordFromApi(first));
  }

  const res = await httpClient.get("/api/words/today");
  return mapWordFromApi(res.data);
};

// =====================================================
// 3. 단어 검색
// =====================================================
export const searchWords = async (keyword, page = 0, size = 20) => {
  if (USE_MOCK) {
    const lowered = String(keyword || "").toLowerCase();
    const filtered = mockWordList.filter((w) => {
      const wordText = (w.word || "").toLowerCase();
      const meaningText = (w.meaning || "").toLowerCase();
      return (
        (lowered && wordText.includes(lowered)) ||
        (lowered && meaningText.includes(lowered))
      );
    });

    const start = page * size;
    const end = start + size;
    const slice = filtered.slice(start, end);
    const content = slice.map(mapWordFromApi);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      totalElements: filtered.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/api/words/search", {
    params: { keyword, page, size },
  });

  const data = res.data || {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const content = rawContent.map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 4. 필터 검색 (백엔드용, 필요시)
// =====================================================
export const filterWords = async ({
  category,
  level,
  partOfSpeech,
  page = 0,
  size = 20,
}) => {
  if (USE_MOCK) {
    let filtered = [...mockWordList];

    if (category && category !== "All") {
      filtered = filtered.filter((w) => w.category === category);
    }
    if (level != null && level !== "" && level !== "All") {
      filtered = filtered.filter(
        (w) => Number(w.level) === Number(level)
      );
    }
    if (partOfSpeech && partOfSpeech !== "All") {
      const lowered = String(partOfSpeech).toLowerCase();
      filtered = filtered.filter((w) => {
        if (!w.partOfSpeech) return false;
        return String(w.partOfSpeech).toLowerCase() === lowered;
      });
    }

    const start = page * size;
    const end = start + size;
    const slice = filtered.slice(start, end);
    const content = slice.map(mapWordFromApi);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      totalElements: filtered.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/api/words/filter", {
    params: { category, level, partOfSpeech, page, size },
  });

  const data = res.data || {};
  const rawContent = Array.isArray(data.content) ? data.content : [];
  const content = rawContent.map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 5. 즐겨찾기 관련
// =====================================================
export const addFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: true } : w
    );
    return mockDelay(true);
  }

  if (wordId == null) {
    throw new Error("addFavorite: wordId가 없습니다.");
  }

  try {
    const res = await httpClient.post(`/api/favorites/${wordId}`, {});
    return res.status === 201 || res.status === 200;
  } catch (e) {
    const resp = e?.response;
    if (
      resp &&
      resp.status === 400 &&
      resp.data &&
      resp.data.message === "이미 즐겨찾기한 단어입니다."
    ) {
      console.info("이미 즐겨찾기된 단어, 성공으로 간주:", wordId);
      return true;
    }

    console.error("addFavorite error", e);
    return false;
  }
};

export const removeFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: false } : w
    );
    return mockDelay(true);
  }

  if (wordId == null) {
    throw new Error("removeFavorite: wordId가 없습니다.");
  }

  try {
    const res = await httpClient.delete(`/api/favorites/${wordId}`);
    return res.status === 204 || res.status === 200;
  } catch (e) {
    const resp = e && e.response;

    if (resp && resp.status === 400) {
      console.info(
        "removeFavorite: 400 이지만 이미 해제된 상태로 간주합니다.",
        wordId,
        resp.data
      );
      return true;
    }

    console.error("removeFavorite error", e);
    return false;
  }
};

export const getFavoriteList = async () => {
  if (USE_MOCK) {
    const favorites = mockWordList
      .filter((w) => w.isFavorite)
      .map(mapWordFromApi);
    return mockDelay(favorites);
  }

  const res = await httpClient.get("/api/favorites");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map((raw) => {
    const mapped = mapWordFromApi(raw);
    return {
      ...mapped,
      isFavorite: true,
    };
  });
};

// =====================================================
// 6. 학습 완료 관련
// =====================================================
export const getCompletedList = async () => {
  if (USE_MOCK) {
    const completed = mockWordList
      .filter((w) => w.isCompleted)
      .map(mapWordFromApi);
    return mockDelay(completed);
  }

  const res = await httpClient.get("/api/completed");
  const arr = Array.isArray(res.data) ? res.data : [];

  return arr.map((raw) => {
    const mapped = mapWordFromApi(raw);
    return {
      ...mapped,
      isCompleted: true,
    };
  });
};

export const getCompletedStatus = async (wordId) => {
  if (USE_MOCK) {
    const target = mockWordList.find((w) => w.wordId === Number(wordId));
    return mockDelay({
      wordId,
      completed: target ? !!target.isCompleted : false,
    });
  }

  const res = await httpClient.get(`/api/completed/${wordId}/status`);
  return res.data;
};

// =====================================================
// 7. 단어 상세 조회
// =====================================================
export const getWordDetail = async (wordId) => {
  if (USE_MOCK) {
    const target = mockWordList.find((w) => w.wordId === Number(wordId));

    if (!target) {
      return mockDelay(
        mapWordFromApi({
          wordId,
          word: "Unknown",
          meaning: "등록되지 않은 단어입니다.",
          partOfSpeech: "Noun",
          category: "Daily Life",
          level: 1,
          isFavorite: false,
          isCompleted: false,
          exampleSentenceEn: "",
          exampleSentenceKo: "",
        })
      );
    }
    return mockDelay(mapWordFromApi(target));
  }

  const res = await httpClient.get(`/api/words/detail/${wordId}`);
  return mapWordFromApi(res.data);
};

// =====================================================
// 8. 테스트: 전체 단어 개수
// =====================================================
export const getWordCount = async () => {
  if (USE_MOCK) {
    return mockDelay(mockWordList.length);
  }

  const res = await httpClient.get("/api/words/test-count");
  return res.data;
};

// =====================================================
// 9. 연관 단어(클러스터)에서 단어장에 추가 (Mock 전용) 
// =====================================================
export const addWordFromCluster = async ({ text, level = 1 }) => {
  if (USE_MOCK) {
    const exists = mockWordList.find(
      (w) => String(w.word).toLowerCase() === String(text).toLowerCase()
    );
    if (exists) {
      return mockDelay(mapWordFromApi(exists));
    }

    const lastId = mockWordList[mockWordList.length - 1]?.wordId || 0;
    const newId = lastId + 1;

    const newWord = {
      wordId: newId,
      word: text,
      meaning: `${text} (mock)`,
      partOfSpeech: "Noun",
      category: "Daily Life",
      level,
      isFavorite: false,
      isCompleted: false,
      exampleSentenceEn: "",
      exampleSentenceKo: "",
    };

    mockWordList = [...mockWordList, newWord];

    return mockDelay(mapWordFromApi(newWord));
  }

  const res = await httpClient.post("/api/words/from-cluster", { text, level });
  return mapWordFromApi(res.data);
};