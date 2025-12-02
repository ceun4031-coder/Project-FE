// src/api/storyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Story API 명세 정리
 *
 * # Wrong Answer Story API
 *  - POST /api/story
 *      Request: { title, storyEn, storyKo, wrongLogIds: [1,3,5] }
 *  - GET  /api/story
 *      내 스토리 목록
 *  - GET  /api/story/{storyId}
 *      스토리 상세
 *  - GET  /api/story/{storyId}/words
 *      스토리 사용 단어 조회
 */

/**
 * 내 스토리 목록 조회
 * GET /api/story
 *
 * 예상 서버 응답 예시:
 * [
 *   {
 *     "storyId": 1,
 *     "title": "First Snow in Seoul",
 *     "storyEn": "On the first snowy morning, ...",
 *     "storyKo": "첫 눈이 내리던 아침, ...",
 *     "createdAt": "2025-11-26T10:00:00"
 *   },
 *   ...
 * ]
 */
export const getStoryList = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 목록 조회");

    // StoryListPage에서 사용하는 필드에 맞춰 반환
    return [
      {
        storyId: 1,
        title: "First Snow in Seoul",
        storyEn:
          "On the first snowy morning, I finally used every word I had studied this week.",
        storyKo: "첫 눈이 내리던 아침, 나는 이번 주에 공부한 모든 단어를 사용해 보았다.",
        createdAt: "2025-11-26T09:00:00",
        keywords: ["snow", "memory", "whisper", "lantern"],
      },
      {
        storyId: 2,
        title: "The Coffee Shop",
        storyEn:
          "The aroma of roasted beans filled the air as I waited for my order.",
        storyKo: "주문을 기다리는 동안, 볶은 커피콩의 향기가 공기를 가득 채웠다.",
        createdAt: "2025-11-26T08:30:00",
        keywords: ["aroma", "roasted", "wait", "order"],
      },
    ];
  }

  const res = await httpClient.get("/api/story");
  return res.data;
};

/**
 * 스토리 상세 조회
 * GET /api/story/{storyId}
 *
 * 예상 서버 응답 예시:
 * {
 *   "storyId": 1,
 *   "title": "First Snow in Seoul",
 *   "storyEn": "On the first snowy morning, ...",
 *   "storyKo": "첫 눈이 내리던 아침, ...",
 *   "createdAt": "2025-11-26T10:00:00"
 * }
 */
export const getStoryDetail = async (storyId) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 상세 조회:", storyId);

    // 간단 목업: storyId 기준으로 내용 다르게
    if (Number(storyId) === 1) {
      return {
        storyId: 1,
        title: "First Snow in Seoul",
        storyEn:
          "On the first snowy morning, I finally used every word I had studied this week.\nIt felt like the city was wrapped in a soft white blanket.",
        storyKo:
          "첫 눈이 내리던 아침, 나는 이번 주에 공부한 모든 단어를 마침내 사용해 보았다.\n도시는 부드러운 하얀 이불에 덮인 것처럼 느껴졌다.",
        createdAt: "2025-11-26T09:00:00",
      };
    }

    return {
      storyId: Number(storyId),
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
 * 예상 서버 응답 예시:
 * [
 *   { "text": "winter", "pos": "n.", "meaning": "겨울" },
 *   { "text": "silent", "pos": "adj.", "meaning": "조용한" },
 *   ...
 * ]
 */
export const getStoryWords = async (storyId) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 사용 단어 조회:", storyId);

    // StoryDetailPage에서 기대하는 형태
    return [
      { text: "winter", pos: "n.", meaning: "겨울" },
      { text: "silent", pos: "adj.", meaning: "조용한, 고요한" },
      { text: "whisper", pos: "v.", meaning: "속삭이다" },
      { text: "blanket", pos: "n.", meaning: "담요, 덮개" },
      { text: "magical", pos: "adj.", meaning: "마법 같은, 황홀한" },
    ];
  }

  const res = await httpClient.get(`/api/story/${storyId}/words`);
  return res.data;
};
