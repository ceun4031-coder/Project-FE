// api/wordApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ----------------------
// Mock 데이터 (DDL에 맞게 level, exampleSentenceEn/Ko 사용)
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
  {
    wordId: 3,
    word: "Algorithm",
    meaning: "알고리즘",
    partOfSpeech: "Noun",
    domain: "Technology",
    category: "Technology",
    level: 4,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "This algorithm improves search results.",
    exampleSentenceKo: "이 알고리즘은 검색 결과를 개선한다.",
  },
  {
    wordId: 13,
    word: "Accomplishment",
    meaning: "성취, 업적",
    partOfSpeech: "Noun",
    domain: "People & Feelings",
    category: "People & Feelings",
    level: 4,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn:
      "Finishing the project felt like a major accomplishment.",
    exampleSentenceKo: "프로젝트를 끝낸 것은 큰 성취처럼 느껴졌다.",
  },
  {
    wordId: 14,
    word: "Environmentalism",
    meaning: "환경보호주의",
    partOfSpeech: "Noun",
    domain: "Technology",
    category: "Technology",
    level: 5,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn:
      "Environmentalism encourages people to protect natural resources.",
    exampleSentenceKo: "환경보호주의는 사람들에게 자연 자원을 보호하도록 장려한다.",
  },
  {
    wordId: 15,
    word: "Consideration",
    meaning: "고려, 배려",
    partOfSpeech: "Noun",
    domain: "Daily Life",
    category: "Daily Life",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn:
      "Thank you for your consideration during the process.",
    exampleSentenceKo: "진행 과정에서의 배려에 감사드립니다.",
  },
  {
    wordId: 16,
    word: "Collaboration",
    meaning: "협력, 공동 작업",
    partOfSpeech: "Noun",
    domain: "Business",
    category: "Business",
    level: 4,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "Collaboration is essential for achieving team goals.",
    exampleSentenceKo: "협력은 팀 목표를 달성하는 데 필수적이다.",
  },
  {
    wordId: 18,
    word: "Determination",
    meaning: "결단력, 투지",
    partOfSpeech: "Noun",
    domain: "People & Feelings",
    category: "People & Feelings",
    level: 4,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn:
      "Her determination helped her overcome many obstacles.",
    exampleSentenceKo: "그녀의 결단력이 많은 장애물을 극복하는 데 도움이 되었다.",
  },
  {
    wordId: 4,
    word: "Anxious",
    meaning: "불안한",
    partOfSpeech: "Adj",
    domain: "People & Feelings",
    category: "People & Feelings",
    level: 2,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "She felt anxious before the interview.",
    exampleSentenceKo: "그녀는 면접 전에 불안함을 느꼈다.",
  },
  {
    wordId: 5,
    word: "Commute",
    meaning: "통근하다",
    partOfSpeech: "Verb",
    domain: "Travel",
    category: "Travel",
    level: 2,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "I commute by subway every day.",
    exampleSentenceKo: "나는 매일 지하철로 통근한다.",
  },
  {
    wordId: 6,
    word: "Presentation",
    meaning: "발표",
    partOfSpeech: "Noun",
    domain: "School & Learning",
    category: "School & Learning",
    level: 3,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "Our group presentation is tomorrow.",
    exampleSentenceKo: "우리 조 발표는 내일이다.",
  },
  {
    wordId: 7,
    word: "Delicious",
    meaning: "맛있는",
    partOfSpeech: "Adj",
    domain: "Food & Health",
    category: "Food & Health",
    level: 1,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "The pasta was really delicious.",
    exampleSentenceKo: "파스타가 정말 맛있었다.",
  },
  {
    wordId: 8,
    word: "Barely",
    meaning: "간신히, 가까스로",
    partOfSpeech: "Adv",
    domain: "Daily Life",
    category: "Daily Life",
    level: 4,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "I barely caught the last bus.",
    exampleSentenceKo: "나는 간신히 막차를 탔다.",
  },
  {
    wordId: 9,
    word: "Injury",
    meaning: "부상",
    partOfSpeech: "Noun",
    domain: "Food & Health",
    category: "Food & Health",
    level: 3,
    isFavorite: true,
    isCompleted: false,
    exampleSentenceEn: "He suffered a serious injury.",
    exampleSentenceKo: "그는 심각한 부상을 입었다.",
  },
  {
    wordId: 10,
    word: "Overthink",
    meaning: "과하게 고민하다",
    partOfSpeech: "Verb",
    domain: "People & Feelings",
    category: "People & Feelings",
    level: 5,
    isFavorite: false,
    isCompleted: false,
    exampleSentenceEn: "Try not to overthink every decision.",
    exampleSentenceKo: "모든 결정을 지나치게 고민하지 않도록 해라.",
  },
  {
    wordId: 11,
    word: "Implement",
    meaning: "구현하다, 실행하다",
    partOfSpeech: "Verb",
    domain: "Technology",
    category: "Technology",
    level: 5,
    isFavorite: true,
    isCompleted: true,
    exampleSentenceEn: "We will implement this feature next sprint.",
    exampleSentenceKo: "우리는 다음 스프린트에 이 기능을 구현할 것이다.",
  },
  {
    wordId: 12,
    word: "Motivate",
    meaning: "동기를 부여하다",
    partOfSpeech: "Verb",
    domain: "School & Learning",
    category: "School & Learning",
    level: 6,
    isFavorite: false,
    isCompleted: true,
    exampleSentenceEn: "Good teachers know how to motivate students.",
    exampleSentenceKo: "좋은 선생님은 학생들에게 동기를 부여하는 방법을 안다.",
  },
];

const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

// -----------------------------------------------------
// 공통 매핑: 백엔드/Mock → 프론트에서 쓰기 편한 형태
// level, exampleSentence 통일
// -----------------------------------------------------
const mapWordFromApi = (w) => ({
  wordId: w.wordId,
  word: w.word,
  meaning: w.meaning,
  partOfSpeech: w.partOfSpeech,
  domain: w.domain,
  category: w.category,
  level:
    typeof w.level === "number"
      ? w.level
      : typeof w.level === "number"
      ? w.level
      : null,
  isFavorite: !!w.isFavorite,
  isCompleted: !!w.isCompleted,
  exampleSentence:
    typeof w.exampleSentence === "string" && w.exampleSentence.length > 0
      ? w.exampleSentence
      : w.exampleSentenceEn || "",
  exampleSentenceEn: w.exampleSentenceEn || w.exampleSentence || "",
  exampleSentenceKo: w.exampleSentenceKo || "",
});

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

  const data = res.data;
  const content = (data.content || []).map(mapWordFromApi);

  return {
    ...data,
    content,
  };
};

// =====================================================
// 2. 오늘의 단어
//    GET /api/words/today
//    (백엔드가 단일 객체/배열 중 어느 쪽으로 줄지는 명세에 따라)
// =====================================================
export const getTodayWords = async () => {
  if (USE_MOCK) {
    const todayWords = mockWordList.slice(0, 3).map(mapWordFromApi);
    return mockDelay(todayWords);
  }

  const res = await httpClient.get("/api/words/today");
  return res.data;
};

// =====================================================
// 3. 단어 검색
//    GET /api/words/search?keyword=app
// =====================================================
export const searchWords = async (keyword, page = 0, size = 20) => {
  if (USE_MOCK) {
    const lowered = String(keyword || "").toLowerCase();
    const filtered = mockWordList.filter(
      (w) =>
        w.word.toLowerCase().includes(lowered) ||
        w.meaning.toLowerCase().includes(lowered)
    );

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

  // 필요하면 여기서도 mapWordFromApi 적용 가능
  return res.data;
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
    if (level) {
      filtered = filtered.filter(
        (w) => Number(w.level) === Number(level)
      );
    }
    if (partOfSpeech) {
      const lowered = partOfSpeech.toLowerCase();
      filtered = filtered.filter(
        (w) => w.partOfSpeech?.toLowerCase() === lowered
      );
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

  // 필요하면 여기서도 mapWordFromApi 적용 가능
  return res.data;
};

// =====================================================
// 5. 즐겨찾기 추가
//    POST /api/favorites/{wordId}
// =====================================================
export const addFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: true } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.post(`/api/favorites/${wordId}`);
  return res.data;
};

// =====================================================
// 6. 즐겨찾기 삭제
//    DELETE /api/favorites/{wordId}
// =====================================================
export const removeFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: false } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.delete(`/api/favorites/${wordId}`);
  return res.data;
};

// =====================================================
// 7. 즐겨찾기 전체 조회
//    GET /api/favorites
// =====================================================
export const getFavoriteList = async () => {
  if (USE_MOCK) {
    const favorites = mockWordList.filter((w) => w.isFavorite).map(mapWordFromApi);
    return mockDelay(favorites);
  }

  const res = await httpClient.get("/api/favorites");
  return res.data;
};

// =====================================================
// 8. 학습 완료 처리 / 취소 (Completed Word API)
//    POST /api/completed/{wordId}
//    DELETE /api/completed/{wordId}
// =====================================================
export const toggleProgress = async (wordId, isCompleted) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isCompleted: !w.isCompleted } : w
    );
    return mockDelay({});
  }

  // 아직 완료가 안 된 상태 -> 완료 처리
  if (!isCompleted) {
    const res = await httpClient.post(`/api/completed/${wordId}`);
    return res.data;
  }

  // 이미 완료된 상태 -> 완료 취소
  const res = await httpClient.delete(`/api/completed/${wordId}`);
  return res.data;
};

// 완료 단어 전체 조회
// GET /api/completed
export const getCompletedList = async () => {
  if (USE_MOCK) {
    const completed = mockWordList.filter((w) => w.isCompleted).map(mapWordFromApi);
    return mockDelay(completed);
  }

  const res = await httpClient.get("/api/completed");
  return res.data;
};

// 특정 단어 완료 여부
// GET /api/completed/{wordId}/status
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
// 9. 단어 상세 조회
//    GET /api/words/detail/{wordId}
// =====================================================
export const getWordDetail = async (wordId) => {
  if (USE_MOCK) {
    const target = mockWordList.find(
      (w) => w.wordId === Number(wordId)
    );

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
