// src/pages/learning/CardLearningPage.jsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Circle } from 'lucide-react'; // 아이콘 임포트
import { useLearningEngine } from './hooks/useLearningEngine';
import { Flashcard } from './components/Flashcard';
import './CardLearningPage.css';

export default function CardLearningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get('source') || 'card';
  const clusterId = searchParams.get('clusterId') || undefined;
  const wordIdsParam = searchParams.get('wordIds');
  const wordIds = wordIdsParam
    ? wordIdsParam.split(',').map((x) => Number(x))
    : undefined;
  const limit = Number(searchParams.get('limit') || 20);

  const {
    current,
    currentIndex,
    total,
    loading,
    error,
    isFinished,
    isFlipped,
    knownCount,
    unknownCount,
    toggleFlip,
    markKnown,
    markUnknown,
  } = useLearningEngine({
    mode: 'card',
    source,
    wordIds,
    clusterId,
    limit,
  });

  // 변경: 다시 학습 -> 학습 홈으로 이동
  const handleGoHome = () => {
    navigate('/learning');
  };

  const handleGoQuiz = () => {
    const quizSource = source === 'wrong-note' ? 'wrong-note' : 'quiz';
    navigate(`/learning/quiz?source=${quizSource}&limit=10`);
  };

  const isWrongMode = source === 'wrong-note';

  // 진행도 계산
  const progressPercent =
    total > 0 ? ((Math.min(currentIndex + 1, total) / total) * 100) : 0;

  const pageClassName = `card-page ${isWrongMode ? 'card-page--wrong' : ''}`;

  if (loading) {
    return <div className="card-page card-page--loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="card-page card-page--error">
        카드 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <header className="card-header">
        <div>
          <h1>{isWrongMode ? '오답 카드 학습' : '카드 학습'}</h1>
          <p className="card-header__subtitle">
            {isWrongMode
              ? '틀렸던 단어들만 골라 카드를 뒤집으며 복습합니다.'
              : '카드를 뒤집으며 단어를 학습합니다.'}
          </p>
        </div>
        <div className="card-header__meta">
          <span>
            {Math.min(currentIndex + 1, total)} / {total}
          </span>
          <ProgressBar value={progressPercent} />
        </div>
      </header>

      <main className="card-body">
        {isFinished ? (
          <div className="card-result card">
            <h2>{isWrongMode ? '오답 복습 완료' : '학습 완료'}</h2>
            <p>알았다: {knownCount}개</p>
            <p>모르겠다: {unknownCount}개</p>
            <div className="card-result__actions">
              {/* 변경: 다시 학습 -> 학습하기 홈으로 */}
              <button className="btn-secondary" onClick={handleGoHome}>
                학습하기 홈으로
              </button>
              <button className="btn-primary" onClick={handleGoQuiz}>
                {isWrongMode ? '오답 퀴즈 풀기' : '객관식 퀴즈 풀기'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <Flashcard
              front={current?.frontText}
              back={current?.backText}
              isFlipped={isFlipped}
              onToggle={toggleFlip}
            />
            
            {/* 변경: 텍스트 버튼 -> O, X 아이콘 버튼 */}
            <footer className="card-footer actions-ox">
              <button 
                type="button" 
                className="btn-unknown" 
                onClick={markUnknown}
                aria-label="모르겠다"
              >
                <X size={32} />
              </button>
              <button 
                type="button" 
                className="btn-known" 
                onClick={markKnown}
                aria-label="알겠다"
              >
                <Circle size={28} strokeWidth={3} />
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function ProgressBar({ value }) {
  const safe = typeof value === 'number'
    ? Math.min(Math.max(value, 0), 100)
    : 0;

  return (
    <div className="card-progress">
      <div
        className="card-progress__fill"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}