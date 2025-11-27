// api/wordApi.js
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
    exampleSentence: "I drink coffee every morning.",
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
    exampleSentence: "We need to negotiate a better price.",
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
    exampleSentence: "This algorithm improves search results.",
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
    exampleSentence: "She felt anxious before the interview.",
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
    exampleSentence: "I commute by subway every day.",
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
    exampleSentence: "Our group presentation is tomorrow.",
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
    exampleSentence: "The pasta was really delicious.",
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
    exampleSentence: "I barely caught the last bus.",
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
    exampleSentence: "He suffered a serious injury.",
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
    exampleSentence: "Try not to overthink every decision.",
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
    exampleSentence: "We will implement this feature next sprint.",
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
    exampleSentence: "Good teachers know how to motivate students.",
  },
];

const mockDelay = (result, ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));

// ----------------------
// 1. 단어 목록 조회
// ----------------------
export const getWordList = async (page = 1, size = 100) => {
  if (USE_MOCK) {
    const start = (page - 1) * size;
    const end = start + size;
    const content = mockWordList.slice(start, end);

    return mockDelay({
      content,
      totalPages: Math.max(1, Math.ceil(mockWordList.length / size)),
      totalElements: mockWordList.length,
      page,
      size,
    });
  }

  const res = await httpClient.get("/words", {
    params: { page, size },
  });

  return res.data;
};

// ----------------------
// 2. 즐겨찾기 추가
// ----------------------
export const addFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: true } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.post(`/favorite/${wordId}`);
  return res.data;
};

// ----------------------
// 3. 즐겨찾기 삭제
// ----------------------
export const removeFavorite = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isFavorite: false } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.delete(`/favorite/${wordId}`);
  return res.data;
};

// ----------------------
// 4. 학습 상태 토글
// ----------------------
export const toggleProgress = async (wordId) => {
  if (USE_MOCK) {
    mockWordList = mockWordList.map((w) =>
      w.wordId === wordId ? { ...w, isCompleted: !w.isCompleted } : w
    );
    return mockDelay({});
  }

  const res = await httpClient.post(`/progress/${wordId}`);
  return res.data;
};

// ----------------------
// 5. 단어 상세 조회
// ----------------------
export const getWordDetail = async (wordId) => {
  if (USE_MOCK) {
    const target = mockWordList.find(
      (w) => w.wordId === Number(wordId)
    );

    if (!target) {
      // 없으면 대충 fallback 하나 반환
      return mockDelay({
        wordId,
        word: "Unknown",
        meaning: "등록되지 않은 단어입니다.",
        partOfSpeech: "Noun",
        domain: "Daily Life",
        category: "Daily Life",
        level: 1,
        isFavorite: false,
        isCompleted: false,
        exampleSentence: "",
      });
    }

    return mockDelay(target);
  }

  const res = await httpClient.get(`/words/${wordId}`);
  return res.data;
};
