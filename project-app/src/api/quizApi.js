import axios from 'axios';

// 1. axios 인스턴스 생성 (기본 설정)
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // 실제 백엔드 서버 주소로 변경 필요
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5초 시간 제한
});

// ✅ 개발용: 백엔드 없이 UI 테스트할 때 true로 설정하세요.
const USE_MOCK_DATA = true; 

// ============================================================
// [API 1] 퀴즈 데이터 가져오기 (GET)
// ============================================================
export const fetchQuizzes = async (params) => {
  // params 구조: { source: 'quiz' | 'wrong-note', limit: 10, level: '1' }
  
  if (USE_MOCK_DATA) {
    return mockFetchQuizzes(params);
  }

  try {
    // 백엔드 요청: GET /api/quiz?mode=normal&count=10&level=1
    // 프론트엔드의 'source'를 백엔드의 'mode' 파라미터로 매핑
    const mode = params.source === 'wrong-note' ? 'wrong' : 'normal';
    
    const response = await apiClient.get('/quiz', {
      params: {
        mode: mode,
        count: params.limit,
        level: params.level
      }
    });
    return response.data;
  } catch (error) {
    console.error('Quiz Fetch Error:', error);
    throw error;
  }
};

// ============================================================
// [API 2] 퀴즈 결과 저장하기 (POST)
// ============================================================
export const submitQuizResult = async (resultData) => {
  // resultData 구조: { score: 8, total: 10, mode: 'normal' }

  if (USE_MOCK_DATA) {
    return mockSubmitResult(resultData);
  }

  try {
    const response = await apiClient.post('/quiz/result', resultData);
    return response.data;
  } catch (error) {
    console.error('Submit Result Error:', error);
    throw error;
  }
};

// ============================================================
// 🧪 MOCK DATA (테스트용)
// ============================================================
const mockFetchQuizzes = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isWrongMode = params.source === 'wrong-note';
      
      const mockData = isWrongMode
        ? [ // 오답 다시 풀기용 데이터 (주황색 테마)
            { id: 101, question: "[복습] 'Abstract'의 의미는?", options: ["구체적인", "추상적인", "단순한", "복잡한"], answer: 1 },
            { id: 102, question: "[복습] 'Yield'의 뜻은?", options: ["굴복하다", "방패", "공격하다", "머무르다"], answer: 0 },
            { id: 103, question: "[복습] 'Candid'의 동의어는?", options: ["Frank", "Secret", "Shy", "Rude"], answer: 0 },
            { id: 104, question: "[복습] 'Inevitable'의 뜻은?", options: ["피할 수 없는", "우연한", "행복한", "드문"], answer: 0 },
            { id: 105, question: "[복습] 'Benevolent'의 뜻은?", options: ["자비로운", "사악한", "이기적인", "게으른"], answer: 0 },
          ]
        : [ // 정규 학습용 데이터 (보라색 테마)
            { id: 1, question: "'Apple'의 뜻은 무엇인가요?", options: ["포도", "사과", "바나나", "오렌지"], answer: 1 },
            { id: 2, question: "'Happy'의 반대말은?", options: ["Sad", "Joyful", "Excited", "Glad"], answer: 0 },
            { id: 3, question: "'Library'는 무엇을 하는 곳인가요?", options: ["운동", "요리", "독서", "쇼핑"], answer: 2 },
            { id: 4, question: "'Run'의 과거형은?", options: ["Runned", "Running", "Ran", "Run"], answer: 2 },
            { id: 5, question: "'Water'의 뜻은?", options: ["불", "흙", "공기", "물"], answer: 3 },
          ];

      // 요청한 limit 개수만큼 잘라서 반환
      resolve(mockData.slice(0, Number(params.limit)));
    }, 600); // 0.6초 지연 효과
  });
};

const mockSubmitResult = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("📝 [Mock API] 결과 데이터 전송됨:", data);
      resolve({ success: true, message: "결과가 저장되었습니다." });
    }, 500);
  });
};