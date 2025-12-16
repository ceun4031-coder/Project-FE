// src/api/storyApi.js
import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// =========================
// MOCK 상태 (USE_MOCK === true)
// =========================
let mockStories = [
  {
    storyId: 1,
    title: "First Snow in Seoul",
    titleKo: "서울의 첫눈",
    storyEn:
      "On the first snowy morning, I finally used every word I had studied this week.",
    storyKo:
      "첫 눈이 내리던 아침, 나는 이번 주에 공부한 모든 단어를 사용해 보았다.",
    createdAt: "2025-11-26T09:00:00",
  },
  {
    storyId: 2,
    title: "The Coffee Shop",
    titleKo: "커피숍에서",

    storyEn:
      "The aroma of roasted beans filled the air as I waited for my order.",
    storyKo:
      "주문을 기다리는 동안, 볶은 커피콩의 향기가 공기를 가득 채웠다.",
    createdAt: "2025-11-26T08:30:00",
  },
];

// -------------------------
// 공통: 스토리 응답 정규화
// - 제목이 한글/영어/둘다 섞여 와도 title/titleKo 분리 가능한 만큼 분리
// - 화면에서 기본으로 쓸 title(대표 타이틀)도 안정적으로 세팅
// -------------------------
const normalizeStory = (raw) => {
  if (!raw) return null;

  const storyId =
    raw.storyId ?? raw.story_id ?? raw.id ?? raw.storyID ?? raw.storyId;

  const storyEn = raw.storyEn ?? raw.story_en ?? raw.contentEn ?? raw.en ?? "";
  const storyKo = raw.storyKo ?? raw.story_ko ?? raw.contentKo ?? raw.ko ?? "";

  const createdAt =
    raw.createdAt ?? raw.created_at ?? raw.created ?? raw.createdDate ?? "";

  // title 분리 케이스(백엔드가 제공하는 경우)
  let title = (raw.title ?? raw.title_en ?? raw.enTitle ?? "").trim();
  let titleKo = (raw.titleKo ?? raw.title_ko ?? raw.koTitle ?? "").trim();

  // title 단일 필드 케이스
  const rawTitle = (raw.title ?? raw.storyTitle ?? "").trim();

  // title 하나에 둘 다 들어오는 경우(줄바꿈) → 분리 시도
  if ((!title && !titleKo) && rawTitle && rawTitle.includes("\n")) {
    const parts = rawTitle
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    // 보통 [영문, 한글] 또는 [한글, 영문] 형태로 옴
    if (parts.length >= 2) {
      // 언어 판별을 완벽히 못하니 "둘 다 제공"만 목표로 두고
      // 1줄/2줄을 각각 title/titleKo로 배치(표시는 StoryDetailPage에서 처리)
      title = parts[0];
      titleKo = parts[1];
    }
  }

  // 분리된게 없고 rawTitle만 있으면 대표 타이틀로 사용
  const titlePrimary = title || titleKo || rawTitle || "Untitled";

  return {
    ...raw,
    storyId: Number(storyId) || storyId,
    title: titlePrimary,     // 리스트/기존 컴포넌트 호환용 대표 타이틀
    titleKo: titleKo || "",
    storyEn,
    storyKo,
    createdAt,
  };
};

/** 🔹 공통: 스토리 단어 응답 정규화 */
const normalizeStoryWord = (raw) => {
  if (!raw) return null;

  // 문자열인 경우: 텍스트만 있고 meaning/pos는 없음
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return null;
    return { text, pos: "", meaning: "" };
  }

  // 단어 텍스트 추출(백엔드/목업 혼합 케이스 방어)
  let text = "";
  if (typeof raw.text === "string") text = raw.text;
  else if (typeof raw.word === "string") text = raw.word;
  else if (raw.word && typeof raw.word === "object") {
    if (typeof raw.word.word === "string") text = raw.word.word;
    else if (typeof raw.word.text === "string") text = raw.word.text;
  }

  text = (text || "").trim();

  // 품사(여러 필드명 방어)
  const pos =
    raw.pos ||
    raw.partOfSpeech ||
    raw.part_of_speech ||
    raw.word?.partOfSpeech ||
    raw.word?.pos ||
    raw.type ||
    "";

  // 의미(한글)(여러 필드명 방어)
  const meaning =
    raw.meaningKo ||
    raw.meaning_ko ||
    raw.meaning ||
    raw.kor ||
    raw.korean ||
    raw.word?.meaningKo ||
    raw.word?.meaning ||
    raw.word?.kor ||
    raw.word?.korean ||
    "";

  if (!text) return null;

  return {
    ...raw,
    text,
    pos,
    meaning,
  };
};

/**
 * 내 스토리 목록 조회
 * GET /api/story
 */
export const getStoryList = async () => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 목록 조회");
    return mockStories.map(normalizeStory).filter(Boolean);
  }

  const res = await httpClient.get("/api/story");
  const data = res.data;

  if (!Array.isArray(data)) return [];
  return data.map(normalizeStory).filter(Boolean);
};

/**
 * 스토리 상세 조회
 * GET /api/story/{storyId}
 */
export const getStoryDetail = async (storyId) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 상세 조회:", storyId);

    const idNum = Number(storyId);
    const found = mockStories.find((s) => Number(s.storyId) === idNum);

    if (found) return normalizeStory(found);

    return normalizeStory({
      storyId: idNum,
      title: "Mock Story",
      titleKo: "목업 스토리",
      storyEn:
        "This is a mock story generated for testing. Feel free to replace it with a real one.",
      storyKo:
        "이것은 테스트를 위해 생성된 목업 스토리입니다. 실제 데이터로 교체하세요.",
      createdAt: new Date().toISOString(),
    });
  }

  const res = await httpClient.get(`/api/story/${storyId}`);
  return normalizeStory(res.data);
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
    return [
      { text: "ambiguous", pos: "Adj", meaning: "애매모호한" },
      { text: "mitigate", pos: "Verb", meaning: "완화하다" },
      { text: "scrutinize", pos: "Verb", meaning: "세밀히 조사하다" },
      { text: "fluctuate", pos: "Verb", meaning: "변동하다" },
      { text: "coherent", pos: "Adj", meaning: "일관된" },
    ].map(normalizeStoryWord).filter(Boolean);
  }

  const res = await httpClient.get(`/api/story/${storyId}/words`);
  const data = res.data;

  if (!Array.isArray(data)) return [];

  return data.map(normalizeStoryWord).filter(Boolean);
};

/**
 * 스토리 생성(저장)
 * POST /api/story
 *
 * ✅ title이 한글/영문/둘다로 흔들리는 문제를 줄이려면
 *    백엔드가 title/titleKo를 지원하도록 바꾸는 게 정석.
 *
 * Request(권장): { title?, titleKo?, title?, storyEn, storyKo, wrongLogIds? }
 * Response:      { storyId, title/title/titleKo, storyEn, storyKo, createdAt }
 */
export const saveStory = async ({
  title,
  titleKo,
  storyEn,
  storyKo,
  wrongLogIds,
}) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 저장 요청:", {
      title,
      titleKo,
      storyEn,
      storyKo,
      wrongLogIds,
    });

    const now = new Date().toISOString();
    const newStoryId = Date.now();

    const primaryTitle = (title || titleKo || title || "Mock Story").trim();

    const newStory = normalizeStory({
      storyId: newStoryId,
      title: primaryTitle,
      titleKo: (titleKo || "").trim(),
      storyEn: storyEn || "",
      storyKo: storyKo || "",
      createdAt: now,
    });

    mockStories = [newStory, ...mockStories];
    return newStory;
  }

  // 서버가 title/titleKo를 지원하면 함께 보내고,
  // 지원 안 하면(엄격 DTO) 백엔드에서 ignoreUnknownProperties 설정 필요.
  const payload = {
    title: (title || titleKo || title || "").trim(),
    storyEn,
    storyKo,
    wrongLogIds,
    ...(title ? { title: title.trim() } : {}),
    ...(titleKo ? { titleKo: titleKo.trim() } : {}),
  };

  const res = await httpClient.post("/api/story", payload);
  return normalizeStory(res.data);
};

/**
 * 스토리 삭제 API
 * DELETE /api/story/{storyId}
 */
export const deleteStory = async (storyId) => {
  if (USE_MOCK) {
    console.log("[Mock] 스토리 삭제 요청:", storyId);

    mockStories = mockStories.filter((s) => Number(s.storyId) !== Number(storyId));

    return {
      success: true,
      message: "스토리가 삭제되었습니다. (mock)",
      storyId,
    };
  }

  const res = await httpClient.delete(`/api/story/${storyId}`);
  return res.data;
};