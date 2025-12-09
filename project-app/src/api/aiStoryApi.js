// src/api/aiStoryApi.js
import httpClient from "./httpClient";

export const generateAiStory = async ({ words, difficulty, style }) => {
  // 기본 검증
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("generateAiStory: words 배열이 비어 있습니다.");
  }

  // form-encoded 요청으로 만들기
  const form = new URLSearchParams();

  words.forEach((w) => {
    const trimmed = String(w || "").trim();
    if (trimmed) {
      form.append("words", trimmed);
    }
  });

  const diff = (difficulty || "INTERMEDIATE").toUpperCase();
  const sty = (style || "NARRATIVE").toUpperCase();

  form.append("difficulty", diff);
  form.append("style", sty);

  console.log("[generateAiStory] 요청 form:", form.toString());

  try {
    const res = await httpClient.post("/api/ai/story", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    return res.data;
  } catch (err) {
    // 백엔드에서 내려준 에러 메시지 같이 출력
    console.error(
      "[generateAiStory] 서버 오류:",
      err.response?.status,
      err.response?.data
    );
    throw err;
  }
};
