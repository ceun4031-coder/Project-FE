// src/api/quizApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// --------------------------------------------------------
// 내부 유틸: 백엔드 응답을 프론트에서 쓰기 좋은 형태로 정규화
// 프론트가 기대하는 형태: { id, question, options: string[], answer: number }
// --------------------------------------------------------
const normalizeQuizItem = (raw, index) => {
  if (!raw) return null;

  // 이미 기대 형태인 경우
  if (
    typeof raw.id !== "undefined" &&
    typeof raw.question === "string" &&
    Array.isArray(raw.options) &&
    typeof raw.answer === "number"
  ) {
    return raw;
  }

  // 백엔드가 이런 형태로 줄 수도 있다고 가정:
  // { quizId, questionText, choices, answerIndex }
  // { wordId, word, options, answerIndex } 등
  const id = raw.quizId ?? raw.id ?? raw.wordId ?? index ?? 0;

  const question =
    raw.questionText ??
    raw.question ??
    raw.word ?? // word만 오는 경우에도 처리
    raw.prompt ??
    "질문 내용이 없습니다.";

  const options = raw.options ?? raw.choices ?? [];

  const answer =
    typeof raw.answerIndex === "number"
      ? raw.answerIndex
      : typeof raw.correctIndex === "number"
      ? raw.correctIndex
      : typeof raw.answer === "number"
      ? raw.answer
      : 0;

  return { id, question, options, answer };
};

const normalizeQuizListResponse = (data) => {
  if (!data) return [];

  // 1) 배열로 바로 오는 경우
  if (Array.isArray(data)) {
    return data.map(normalizeQuizItem).filter(Boolean);
  }

  // 2) { questions: [...] } 형태
  if (Array.isArray(data.questions)) {
    return data.questions.map(normalizeQuizItem).filter(Boolean);
  }

  // 필요하면 여기서 { items: [...] } 등 추가 대응 가능
  return [];
};

// ============================================================
// [API 1] 퀴즈 데이터 가져오기 (GET /api/quiz)
//    프론트 파라미터: { source: 'quiz' | 'wrong-note', limit: number, level: string }
// ============================================================
export const fetchQuizzes = async (params) => {
  // params: { source, limit, level }
  if (USE_MOCK) {
    return mockFetchQuizzes(params);
  }

  try {
    const mode = params.source === "wrong-note" ? "wrong" : "normal";

    const res = await httpClient.get("/api/quiz", {
      params: {
        mode,               // normal | wrong
        count: params.limit, // 백엔드 명세: /api/quiz?mode=normal&count=10&level=1
        level: params.level,
      },
    });

    const list = normalizeQuizListResponse(res.data);

    // 백엔드가 count를 무시하고 더 많이 줘도 프론트에서 제한
    const limit = typeof params.limit === "number"
      ? params.limit
      : Number(params.limit);

    return Number.isFinite(limit) && limit > 0
      ? list.slice(0, limit)
      : list;
  } catch (error) {
    console.error("Quiz Fetch Error:", error);
    throw error;
  }
};

// ============================================================
// [API 2] 퀴즈 결과 저장하기 (POST /api/quiz/result)
//    resultData: { score, total, mode, timestamp }
// ============================================================
export const submitQuizResult = async (resultData) => {
  if (USE_MOCK) {
    return mockSubmitResult(resultData);
  }

  try {
    const res = await httpClient.post("/api/quiz/result", resultData);
    return res.data;
  } catch (error) {
    console.error("Submit Result Error:", error);
    throw error;
  }
};

// ============================================================
// 🧪 MOCK DATA (VITE_USE_MOCK === "true" 일 때만 사용)
// ============================================================
const mockFetchQuizzes = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isWrongMode = params.source === "wrong-note";

      const mockData = isWrongMode
        ? [
            // 오답 다시 풀기용 데이터 (주황색 테마)
            {
              id: 101,
              question: "[복습] 'Abstract'의 의미는?",
              options: ["구체적인", "추상적인", "단순한", "복잡한"],
              answer: 1,
            },
            {
              id: 102,
              question: "[복습] 'Yield'의 뜻은?",
              options: ["굴복하다", "방패", "공격하다", "머무르다"],
              answer: 0,
            },
            {
              id: 103,
              question: "[복습] 'Candid'의 동의어는?",
              options: ["Frank", "Secret", "Shy", "Rude"],
              answer: 0,
            },
            {
              id: 104,
              question: "[복습] 'Inevitable'의 뜻은?",
              options: ["피할 수 없는", "우연한", "행복한", "드문"],
              answer: 0,
            },
            {
              id: 105,
              question: "[복습] 'Benevolent'의 뜻은?",
              options: ["자비로운", "사악한", "이기적인", "게으른"],
              answer: 0,
            },
          ]
        : [
            // 정규 학습용 데이터 (보라색 테마)
            {
              id: 1,
              question: "'Apple'의 뜻은 무엇인가요?",
              options: ["포도", "사과", "바나나", "오렌지"],
              answer: 1,
            },
            {
              id: 2,
              question: "'Happy'의 반대말은?",
              options: ["Sad", "Joyful", "Excited", "Glad"],
              answer: 0,
            },
            {
              id: 3,
              question: "'Library'는 무엇을 하는 곳인가요?",
              options: ["운동", "요리", "독서", "쇼핑"],
              answer: 2,
            },
            {
              id: 4,
              question: "'Run'의 과거형은?",
              options: ["Runned", "Running", "Ran", "Run"],
              answer: 2,
            },
            {
              id: 5,
              question: "'Water'의 뜻은?",
              options: ["불", "흙", "공기", "물"],
              answer: 3,
            },
          ];

      const limit = Number(params.limit) || mockData.length;
      resolve(mockData.slice(0, limit));
    }, 600);
  });
};

const mockSubmitResult = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("📝 [Mock API] 결과 데이터 전송됨:", data);
      resolve({ success: true, message: "결과가 저장되었습니다. (MOCK)" });
    }, 500);
  });
};
