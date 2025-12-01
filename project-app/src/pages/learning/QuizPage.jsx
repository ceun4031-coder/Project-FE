import React, { useState } from 'react';
import { useSearchParams as useRealSearchParams, useNavigate as useRealNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

// ==========================================
// [REAL IMPORTS] 실제 환경용 파일들
// 실제 컴포넌트가 없다면 이 부분에서 에러가 날 수 있으니, 
// 파일 경로가 맞는지 확인해 주세요.
// ==========================================
import { useLearningEngine as useRealLearningEngine } from './hooks/useLearningEngine';
import { QuizQuestion as RealQuizQuestion } from './components/QuizQuestion';
import { ProgressBar as RealProgressBar } from './components/ProgressBar';
import './QuizPage.css';

// ------------------------------------------------------------
// ⚙️ ENV FLAG: 목업 모드 사용 여부 결정
// .env 파일에 VITE_USE_MOCK=true 가 있으면 목업 모드로 동작
// ------------------------------------------------------------
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ==========================================
// [MOCK DEFINITIONS] 가짜 데이터 및 컴포넌트
// USE_MOCK이 true일 때만 사용됩니다.
// ==========================================

// 가짜 데이터
const DUMMY_QUESTIONS = [
  {
    id: 1,
    question: "[MOCK] What is the definition of 'Serendipity'?",
    choices: [
      { id: 'a', text: "A sudden misfortune" },
      { id: 'b', text: "Finding something good without looking for it" },
      { id: 'c', text: "A type of coffee" },
      { id: 'd', text: "Programming logic" }
    ],
    correctId: 'b'
  },
  {
    id: 2,
    question: "[MOCK] Which hook is used for side effects in React?",
    choices: [
      { id: 'a', text: "useState" },
      { id: 'b', text: "useEffect" },
      { id: 'c', text: "useContext" },
      { id: 'd', text: "useReducer" }
    ],
    correctId: 'b'
  }
];

// 가짜 Router Hooks
const useMockSearchParams = () => [new URLSearchParams("source=test&limit=5")]; // 테스트 시 source=wrong-note 로 바꿔보세요
const useMockNavigate = () => (path) => console.log(`[MockNav] Navigating to: ${path}`);

// ✨ [수정됨] 가짜 ProgressBar: color prop 추가
const MockProgressBar = ({ current, total, color }) => {
  const percentage = Math.min((current / total) * 100, 100);
  const barColor = color || '#4f46e5'; // 전달받은 색상이 없으면 기본 파란색

  return (
    <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', margin: '12px 0' }}>
      <div style={{ 
        width: `${percentage}%`, 
        height: '100%', 
        background: barColor, // 동적 색상 적용
        borderRadius: '4px', 
        transition: 'width 0.3s' 
      }} />
    </div>
  );
};

// 가짜 QuizQuestion
const MockQuizQuestion = ({ question, selectedChoiceId, isAnswered, isCorrect, onSelect }) => {
  return (
    <div className="quiz-options-grid" style={{ display: 'grid', gap: '10px' }}>
      {question.choices.map((choice) => {
        let borderColor = '#e5e7eb';
        let bgColor = '#fff';
        if (isAnswered) {
          if (choice.id === question.correctId) { borderColor = '#22c55e'; bgColor = '#dcfce7'; }
          else if (choice.id === selectedChoiceId) { borderColor = '#ef4444'; bgColor = '#fee2e2'; }
        } else if (selectedChoiceId === choice.id) {
          borderColor = '#4f46e5';
        }
        return (
          <button
            key={choice.id}
            onClick={() => !isAnswered && onSelect(choice.id)}
            style={{ padding: '16px', border: `2px solid ${borderColor}`, background: bgColor, borderRadius: '12px', textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer' }}
          >
            {choice.text}
          </button>
        );
      })}
    </div>
  );
};

// 가짜 useLearningEngine Hook
const useMockLearningEngine = ({ limit }) => {
  const [index, setIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongAnswerLogs, setWrongAnswerLogs] = useState([]);

  const currentQuestion = DUMMY_QUESTIONS[index];
  const isCorrect = isAnswered && selectedChoiceId === currentQuestion.correctId;

  const answerQuestion = (choiceId) => {
    setSelectedChoiceId(choiceId);
    setIsAnswered(true);
    if (choiceId === currentQuestion.correctId) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswerLogs(prev => [...prev, { wrongWordId: currentQuestion.id }]);
    }
  };

  const goNext = () => {
    if (index < DUMMY_QUESTIONS.length - 1) {
      setIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedChoiceId(null);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex(prev => prev - 1);
      setIsAnswered(false);
      setSelectedChoiceId(null);
    }
  };

  const finishQuiz = () => setIsFinished(true);

  return {
    items: DUMMY_QUESTIONS,
    currentIndex: index,
    current: currentQuestion,
    total: DUMMY_QUESTIONS.length,
    loading: false,
    error: null,
    isFinished,
    goNext,
    goPrev,
    finishQuiz,
    selectedChoiceId,
    isAnswered,
    isCorrect,
    score,
    wrongAnswerLogs,
    answerQuestion,
  };
};


// ==========================================
// [SELECTOR] Real vs Mock 결정
// ==========================================
const useSearchParams = USE_MOCK ? useMockSearchParams : useRealSearchParams;
const useNavigate = USE_MOCK ? useMockNavigate : useRealNavigate;
const useLearningEngine = USE_MOCK ? useMockLearningEngine : useRealLearningEngine;
const QuizQuestion = USE_MOCK ? MockQuizQuestion : RealQuizQuestion;
const ProgressBar = USE_MOCK ? MockProgressBar : RealProgressBar;


// ==========================================
// [MAIN COMPONENT] QuizPage
// ==========================================
export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get('source') || 'quiz';
  const clusterId = searchParams.get('clusterId') || undefined;
  const wordIdsParam = searchParams.get('wordIds');
  const wordIds = wordIdsParam ? wordIdsParam.split(',').map((x) => Number(x)) : undefined;
  const limit = Number(searchParams.get('limit') || 10);

  // ✨ [수정됨] 오답 노트 모드인지 확인 및 색상 결정
  const isWrongNoteMode = source === 'wrong-note' || source === 'wrong_note';
  const progressColor = isWrongNoteMode ? '#f59e0b' : '#4f46e5'; 
  // #f59e0b: 오렌지(경고), #4f46e5: 인디고(기본)

  const {
    currentIndex,
    current,
    total,
    loading,
    error,
    isFinished,
    goNext,
    goPrev,
    finishQuiz,
    selectedChoiceId,
    isAnswered,
    isCorrect,
    score,
    wrongAnswerLogs,
    answerQuestion,
  } = useLearningEngine({
    mode: 'mcq',
    source,
    wordIds,
    clusterId,
    limit,
  });

  const handleNext = () => {
    if (currentIndex === total - 1) {
      finishQuiz();
    } else {
      goNext();
    }
  };

  const handleRetry = () => {
      // Mock 모드일 때 window.reload, 실제일 때 navigate(0) 사용 등 분기 가능하지만
      // navigate(0)은 react-router v6에서 지원 안 할 수 있으므로 window.location.reload()가 안전할 수 있음
      window.location.reload(); 
  };
  const handleGoWrongNote = () => navigate('/learning/wrong-notes');
  const handleCreateStoryFromWrong = () => {
    const wrongIds = wrongAnswerLogs.map((l) => l.wrongWordId).join(',');
    navigate(`/stories/create?wrongWordIds=${encodeURIComponent(wrongIds)}`);
  };

  if (loading) return <div className="quiz-page--loading">로딩 중...</div>;
  if (error) return <div className="quiz-page--error">오류가 발생했습니다.</div>;

  return (
    <div className="page-container">
      <div className="quiz-page-wrapper">

        {/* 1. 상단 정보 카드 */}
        <section className="quiz-header-card">
          <div className="score-group">
            <div className="score-icon-box">
              <Trophy size={20} strokeWidth={2.5} />
            </div>
            <div className="score-text-wrapper">
              <span className="label-mini">Current Score</span>
              <span className="score-value">{score}</span>
            </div>
          </div>

          <div className="progress-group">
            <span className="label-mini">Question</span>
            <span className="progress-value">
              {Math.min(currentIndex + 1, total)} <span>/ {total}</span>
            </span>
          </div>
        </section>

        {/* 2. 진행바 (ProgressBar) */}
        <div style={{ marginBottom: '24px' }}>
          {/* ✨ [수정됨] color prop 전달 */}
          <ProgressBar 
            current={currentIndex + 1} 
            total={total} 
            color={progressColor} 
          />
        </div>

        {/* 3. 메인 문제 카드 */}
        <main className="quiz-main-card">
          {isFinished ? (
            // 결과 화면
            <div className="result-view">
              <h2>Quiz Completed!</h2>
              {USE_MOCK && <p style={{color: 'red', fontSize: '12px'}}>* MOCK MODE RESULT *</p>}
              <p className="label-mini" style={{ marginBottom: '24px' }}>최종 점수</p>
              <div className="score">
                {score} <span style={{ fontSize: '1.5rem', color: 'var(--neutral-400)' }}>/ {total}</span>
              </div>

              <div className="result-actions">
                <button className="btn-primary" onClick={handleRetry}>다시 풀기</button>
                <button className="btn-primary" style={{ background: 'var(--warning-500)' }} onClick={handleGoWrongNote}>오답 노트</button>
              </div>
              {wrongAnswerLogs.length > 0 && (
                <button
                  className="nav-btn"
                  style={{ marginTop: '20px', textDecoration: 'underline' }}
                  onClick={handleCreateStoryFromWrong}
                >
                  이 오답들로 스토리 생성하기
                </button>
              )}
            </div>
          ) : (
            // 문제 풀이 화면
            <>
              <div className="question-section">
                <span className="question-label">DEFINITION</span>
                <h2 className="question-text">
                  {current.question}
                </h2>

                <div className="quiz-options-container">
                  <QuizQuestion
                    question={current}
                    selectedChoiceId={selectedChoiceId}
                    isAnswered={isAnswered}
                    isCorrect={isCorrect}
                    onSelect={answerQuestion}
                  />
                </div>
              </div>

              <footer className="quiz-footer-actions">
                <button
                  className="nav-btn"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                >
                  Prev
                </button>
                <button
                  className="nav-btn"
                  onClick={handleNext}
                  disabled={!isAnswered && total > 0}
                  style={{ color: 'var(--primary-600)' }}
                >
                  {currentIndex === total - 1 ? 'Finish' : 'Next'}
                </button>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}