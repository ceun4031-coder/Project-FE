// src/api/storyApi.js
import httpClient from "./httpClient";

// -----------------------------
// 정규화 유틸
// -----------------------------
const normalizeStory = (raw) => {
  if (!raw) return null;

  const storyId = raw.storyId ?? raw.id;

  return {
    storyId,
    title: raw.title ?? "",
    storyEn:
      raw.storyEn ??
      raw.english ??
      "This story has no English content yet.",
    storyKo:
      raw.storyKo ??
      raw.korean ??
      "이 스토리는 아직 한글 번역 내용이 없습니다.",
    createdAt: raw.createdAt ?? raw.createdDate ?? null,
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
  };
};

const normalizeStoryWord = (raw) => {
  if (!raw) return null;

  return {
    text: raw.text ?? raw.word ?? "",
    pos: raw.pos ?? raw.partOfSpeech ?? "",
    meaning: raw.meaning ?? raw.meaningKo ?? "",
  };
};

// -----------------------------
// 1) 내 스토리 목록 조회
//    GET /api/story
// -----------------------------
export const getStoryList = async () => {
  try {
    const res = await httpClient.get("/api/story");
    const data = res.data;

    // 단순 배열
    if (Array.isArray(data)) {
      return data.map(normalizeStory).filter(Boolean);
    }

    // 페이징 구조: { content: [...], ... }
    if (Array.isArray(data?.content)) {
      return data.content.map(normalizeStory).filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error("[storyApi] getStoryList error:", error.response?.data || error);
    throw error;
  }
};

// -----------------------------
// 2) 스토리 상세 조회
//    GET /api/story/{storyId}
// -----------------------------
export const getStoryDetail = async (storyId) => {
  try {
    const res = await httpClient.get(`/api/story/${storyId}`);
    return normalizeStory(res.data);
  } catch (error) {
    console.error(
      "[storyApi] getStoryDetail error:",
      storyId,
      error.response?.data || error
    );
    throw error;
  }
};

// -----------------------------
// 3) 스토리 사용 단어 조회
//    GET /api/story/{storyId}/words
// -----------------------------
export const getStoryWords = async (storyId) => {
  try {
    const res = await httpClient.get(`/api/story/${storyId}/words`);
    const data = res.data;

    if (!Array.isArray(data)) return [];
    return data.map(normalizeStoryWord).filter(Boolean);
  } catch (error) {
    console.error(
      "[storyApi] getStoryWords error:",
      storyId,
      error.response?.data || error
    );
    throw error;
  }
};

// -----------------------------
// 4) 스토리 저장
//    POST /api/story
//    Body: { title, storyEn, storyKo, wrongLogIds }
//    Response: 저장된 Story(혹은 id)
// -----------------------------
export const saveStory = async ({ title, storyEn, storyKo, wrongLogIds }) => {
  try {
    const payload = {
      title,
      storyEn,
      storyKo,
      wrongLogIds, // 백엔드 DTO 필드명과 동일해야 함
    };

    const res = await httpClient.post("/api/story", payload);

    // 백엔드가 저장된 엔티티를 그대로 돌려주는 경우
    return normalizeStory(res.data) ?? res.data;
  } catch (error) {
    console.error("[storyApi] saveStory error:", error.response?.data || error);
    throw error;
  }
};
