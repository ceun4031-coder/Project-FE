import httpClient from "./httpClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ==========================================
// AI 스토리 생성 (POST /api/story)
// ==========================================
export const createAiStory = async (requestData) => {
  // requestData 구조: { title, prompt, keywords: [] }

  if (USE_MOCK) {
    console.log("[Mock] AI 스토리 생성 요청:", requestData);
    
    // AI가 생각하는 척 2초 지연 (Loading UI 테스트용)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      storyId: Date.now(),
      title: requestData.title,
      content: `
        It was a cold winter morning. The snow was falling silently outside the window.
        Use selected words: ${requestData.keywords.join(", ")}.
        
        Sarah put on her warm coat and stepped outside. "It's perfect," she whispered.
        The world was covered in white blanket. She decided to make a snowman with her friends.
        They laughed and played until the sun went down. It was truly a magical day.
      `,
      createdAt: new Date().toISOString()
    };
  }

  // 실제 서버 호출
  const res = await httpClient.post("/story/ai", requestData);
  return res.data;
};


// ==========================================
// AI 스토리 상세 조회 (GET /api/story/{storyId})
// ==========================================
export const getStoryDetail = async (storyId) => {
  if (USE_MOCK) {
    console.log(`[Mock] 스토리 상세 조회 ID: ${storyId}`);
    
    // 네트워크 지연 흉내 (0.5초)
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      storyId: storyId,
      title: "The Winter Adventure",
      date: "2023. 11. 27",      // UI에 필요한 날짜 형식
      readTime: "3 min read",    // UI에 필요한 읽기 시간
      content: `It was a cold winter morning. The snow was falling silently outside the window. Sarah put on her warm coat and stepped outside. "It's perfect," she whispered.
      
The world was covered in a white blanket. She decided to make a snowman with her friends. They laughed and played until the sun went down. It was truly a magical day.`,
      
      translation: "추운 겨울 아침이었습니다. 창밖에는 눈이 소리 없이 내리고 있었습니다. 사라는 따뜻한 코트를 입고 밖으로 나갔습니다. \"완벽해,\" 그녀가 속삭였습니다.\n\n세상은 하얀 담요로 덮여 있었습니다. 그녀는 친구들과 눈사람을 만들기로 결심했습니다. 그들은 해가 질 때까지 웃고 떠들며 놀았습니다. 정말 마법 같은 하루였습니다.",
      
      words: ["winter", "silent", "whisper", "blanket", "magical"] // 사이드바에 표시할 단어들
    };
  }

  // 실제 서버 연결 시
  const res = await httpClient.get(`/story/${storyId}`);
  return res.data;
};