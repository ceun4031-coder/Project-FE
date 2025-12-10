// src/api/aiStoryApi.js
import httpClient from "./httpClient";

/**
 * AI 스토리 생성 + 저장 요청
 * POST /api/ai/story
 *
 * 백엔드 AIStoryRequest:
 *   {
 *     wrongAnswerLogIds: [Long, Long, ...]
 *   }
 */
export const generateAiStory = async ({ wrongAnswerLogIds }) => {
  if (!Array.isArray(wrongAnswerLogIds) || wrongAnswerLogIds.length === 0) {
    throw new Error("generateAiStory: wrongAnswerLogIds 배열이 비어 있습니다.");
  }

  const payload = {
    wrongAnswerLogIds,
  };

  console.log("[generateAiStory] 요청 payload:", payload);

  try {
    const res = await httpClient.post("/api/ai/story", payload);
    // 기대 응답: { success, message, title, storyEn, storyKo, usedWords, storyId }
    return res.data;
  } catch (err) {
    console.error(
      "[generateAiStory] 서버 오류:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};
