import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ==========================================
// 1) AI 스토리 생성 (POST /api/ai/story)
//    - DeepSeek 호출
// ==========================================
export const generateAiStory = async ({ words, difficulty, style }) => {
  if (USE_MOCK) {
    console.log("[Mock] AI 스토리 생성 요청:", { words, difficulty, style });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      success: true,
      message: "스토리 생성 성공(목업)",
      storyEn:
        "Once upon a time, " +
        (words?.join(", ") || "some words") +
        " were used in a magical story.",
      storyKo:
        "옛날 옛적에 " +
        (words?.join(", ") || "몇 개의 단어들") +
        "이(가) 마법 같은 이야기 속에서 사용되었습니다.",
      usedWords: words || [],
    };
  }

  // 실제 서버 호출
  const res = await httpClient.post("/api/ai/story", {
    words,
    difficulty,
    style,
  });

  return res.data;
};

// ==========================================
// 2) 스토리 저장 (POST /api/story)
//    - WRONG_ANSWER_STORY + STORY_WORD_LIST 에 기록됨
// ==========================================
export const saveStory = async ({ title, storyEn, storyKo, wrongLogIds }) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 저장 요청:", {
      title,
      storyEn,
      storyKo,
      wrongLogIds,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      storyId: Date.now(),
      title,
      storyEn,
      storyKo,
      wrongLogIds: wrongLogIds || [],
      createdAt: new Date().toISOString(),
    };
  }

  const res = await httpClient.post("/api/story", {
    title,
    storyEn,
    storyKo,
    wrongLogIds,
  });

  return res.data;
};
