// src/api/storyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Story API
 *
 * - POST /api/story
 *     Request : { title, storyEn, storyKo, wrongLogIds: number[] }
 *     Response: { storyId, title, storyEn, storyKo, createdAt }
 *
 * - GET  /api/story
 *     내 스토리 목록
 *
 * - GET  /api/story/{storyId}
 *     스토리 상세
 *
 * - GET  /api/story/{storyId}/words
 *     스토리 사용 단어 목록
 */

// =========================
// MOCK 상태 (USE_MOCK === true)
// =========================
let mockStories = [
  {
    storyId: 1,
    title: "First Snow in Seoul",
    storyEn:
      "On the first snowy morning, I finally used every word I had studied this week.",
    storyKo:
      "첫 눈이 내리던 아침, 나는 이번 주에 공부한 모든 단어를 사용해 보았다.",
    createdAt: "2025-11-26T09:00:00",
    keywords: ["snow", "memory", "whisper", "lantern"],
  },
  {
    storyId: 2,
    title: "The Coffee Shop",
    storyEn:
      "The aroma of roasted beans filled the air as I waited for my order.",
    storyKo:
      "주문을 기다리는 동안, 볶은 커피콩의 향기가 공기를 가득 채웠다.",
    createdAt: "2025-11-26T08:30:00",
    keywords: ["aroma", "roasted", "wait", "order"],
  },
];

/**
 * 내 스토리 목록 조회
 * GET /api/story
 */
export const getStoryList = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 목록 조회");
    // StoryListPage에서 사용하는 필드에 맞춰 반환
    return [...mockStories];
  }

  const res = await httpClient.get("/api/story");
  return res.data;
};

/**
 * 스토리 상세 조회
 * GET /api/story/{storyId}
 */
export const getStoryDetail = async (storyId) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 상세 조회:", storyId);

    const idNum = Number(storyId);
    const found = mockStories.find((s) => s.storyId === idNum);

    if (found) {
      return {
        storyId: found.storyId,
        title: found.title,
        storyEn:
          found.storyEn ||
          "This is a mock story generated for testing. Feel free to replace it with a real one.",
        storyKo:
          found.storyKo ||
          "이것은 테스트를 위해 생성된 목업 스토리입니다. 실제 데이터로 교체하세요.",
        createdAt: found.createdAt,
      };
    }

    // 없는 ID에 대해서는 기본 목업
    return {
      storyId: idNum,
      title: "Mock Story",
      storyEn:
        "This is a mock story generated for testing. Feel free to replace it with a real one.",
      storyKo: "이것은 테스트를 위해 생성된 목업 스토리입니다. 실제 데이터로 교체하세요.",
      createdAt: new Date().toISOString(),
    };
  }

  const res = await httpClient.get(`/api/story/${storyId}`);
  return res.data;
};

/**
 * 스토리 사용 단어 조회
 * GET /api/story/{storyId}/words
 *
 * StoryDetailPage에서 하이라이트/단어 리스트 용도로 사용.
 */
export const getStoryWords = async (storyId) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 사용 단어 조회:", storyId);

    // 테스트용 고정 데이터 (필요하면 storyId에 따라 분기)
    return [
      { text: "ambiguous", pos: "adj.", meaning: "애매모호한" },
      { text: "mitigate", pos: "v.", meaning: "완화하다" },
      { text: "scrutinize", pos: "v.", meaning: "세밀히 조사하다" },
      { text: "fluctuate", pos: "v.", meaning: "변동하다" },
      { text: "coherent", pos: "adj.", meaning: "일관된" },
    ];
  }

  const res = await httpClient.get(`/api/story/${storyId}/words`);
  return res.data;
};

/**
 * 스토리 생성(저장)
 * POST /api/story
 *
 * Request:  { title, storyEn, storyKo, wrongLogIds?: number[] }
 * Response: { storyId, title, storyEn, storyKo, createdAt }
 */
export const saveStory = async ({ title, storyEn, storyKo, wrongLogIds }) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 저장 요청:", {
      title,
      storyEn,
      storyKo,
      wrongLogIds,
    });

    const now = new Date().toISOString();
    const newStoryId = Date.now();

    const newStory = {
      storyId: newStoryId,
      title: title || "Mock Story",
      storyEn: storyEn || "",
      storyKo: storyKo || "",
      createdAt: now,
      keywords: [], // 필요하면 words에서 추출해서 넣어도 됨
    };

    // 목록에 추가해서 StoryListPage에서도 바로 보이게
    mockStories = [newStory, ...mockStories];

    return newStory;
  }

  const res = await httpClient.post("/api/story", {
    title,
    storyEn,
    storyKo,
    wrongLogIds,
  });
  return res.data;
};
