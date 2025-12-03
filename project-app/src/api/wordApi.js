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
    domain: "Daily Life",
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
    domain: "Business",
    category: "Business",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "We need to negotiate a better price.",
    exampleSentenceKo: "우리는 더 나은 가격을 협상해야 한다.",
  },
  // ... 필요시 Mock 데이터 추가
];

const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

// 품사 값 통일: db / api 값 → 프론트 공통 포맷
const normalizePartOfSpeech = (raw) => {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();

  switch (v) {
    case "noun":
      return "Noun";
    case "verb":
      return "Verb";
    case "adjective":
      return "Adj";
    case "adverb":
      return "Adv";
    default:
      // 혹시 모르는 값: 첫 글자만 대문자로
      return v.charAt(0).toUpperCase() + v.slice(1);
  }
};

// -----------------------------------------------------
// 공통 매핑: 백엔드/Mock → 프론트 공통 형태
// FavoriteWordResponse / Word 엔티티 공통 대응
// -----------------------------------------------------
const mapWordFromApi = (w) => {
  // 이상한 값 들어오면 안전한 기본값
  if (!w || typeof w !== "object") {
    console.error("mapWordFromApi: invalid data", w);
    return {
      id: null,
      wordId: null,
      word: "",
      meaning: "",
      partOfSpeech: null,
      domain: null,
      category: null,
      level: null,
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

  const hasExampleSentence =
    typeof w.exampleSentence === "string" &&
    w.exampleSentence.trim().length > 0;

  const exampleSentence = hasExampleSentence
    ? w.exampleSentence
    : typeof w.exampleSentenceEn === "string"
    ? w.exampleSentenceEn
    : "";

  const id = w.id != null ? w.id : null;
  // Word 목록: wordId, Favorite 목록: id + wordId 둘 다 존재
  const wordId =
    w.wordId != null
      ? w.wordId
      : typeof w.id === "number"
      ? w.id
      : null;

  return {
    id,
    wordId,
    word: w.word || "",
    meaning: w.meaning || "",
    partOfSpeech: normalizePartOfSpeech(w.partOfSpeech),

    // domain 없으면 category로 대체
    domain:
      w.domain != null
        ? w.domain
        : w.category != null
        ? w.category
        : null,
    category: w.category != null ? w.category : null,

    level: levelValue,

    isFavorite: !!w.isFavorite,
    isCompleted: !!w.isCompleted,

    exampleSentence,
    exampleSentenceEn:
      typeof w.exampleSentenceEn === "string"
        ? w.exampleSentenceEn
        : exampleSentence || "",
    exampleSentenceKo:
      typeof w.exampleSentenceKo === "string" ? w.exampleSentenceKo : "",
  };
};

// =====================================================
// 1. 단어 목록 조회 (페이징)
//    GET /api/words?page=0&size=20
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
// 2. 오늘의 단어 (단일 객체)
//    GET /api/words/today
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
//    GET /api/words/search?keyword=app&page=0&size=20
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
// 4. 필터 검색
//    GET /api/words/filter?category=Daily&level=1&partOfSpeech=adj
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

    if (category) {
      filtered = filtered.filter((w) => w.category === category);
    }
    if (level != null && level !== "" && level !== "All") {
      filtered = filtered.filter(
        (w) => Number(w.level) === Number(level)
      );
    }
    if (partOfSpeech) {
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
// 5. 즐겨찾기 관련 APIs (사용자 조작 가능)
// =====================================================

// 즐겨찾기 추가: POST /api/favorites/{wordId}
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
    // 201 Created 또는 200 OK
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

// 즐겨찾기 삭제: DELETE /api/favorites/{wordId}
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
    // 정상 케이스: 204 No Content 또는 200 OK
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

// 즐겨찾기 목록: GET /api/favorites
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
// 6. 학습 완료 관련 APIs (조회 전용으로 사용)
//    → 프론트에서 학습 상태를 "변경"하는 기능은 사용하지 않음
// =====================================================

// 완료 단어 목록: GET /api/completed
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

// 상태 조회 (단일): GET /api/completed/{wordId}/status
// 화면에서 단어 하나의 학습 상태만 확인해야 할 때 사용 가능
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

// ❌ 학습 완료 토글 API는 더 이상 내보내지 않음
//    (사용자가 직접 학습 상태를 바꾸는 기능을 쓰지 않기 때문)
//    필요하면 서버 쪽 자동 로직(퀴즈 완료 등)에서만 처리.

// =====================================================
// 7. 단어 상세 조회
//    GET /api/words/detail/{wordId}
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
          domain: "Daily Life",
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
//    GET /api/words/test-count
// =====================================================
export const getWordCount = async () => {
  if (USE_MOCK) {
    return mockDelay(mockWordList.length);
  }

  const res = await httpClient.get("/api/words/test-count");
  return res.data;
};
