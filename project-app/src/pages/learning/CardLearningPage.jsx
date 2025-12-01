import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLearningEngine } from './hooks/useLearningEngine';
import { Flashcard } from './components/Flashcard';
import './CardLearningPage.css';

export default function CardLearningPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get('source') || 'card';
  const clusterId = searchParams.get('clusterId') || undefined;
  const wordIdsParam = searchParams.get('wordIds');
  const wordIds = wordIdsParam ? wordIdsParam.split(',').map((x) => Number(x)) : undefined;
  const limit = Number(searchParams.get('limit') || 20);

  const {
    current,
    currentIndex,
    total,
    progress,
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

  const handleRetry = () => {
    navigate(0);
  };

  const handleGoQuiz = () => {
    navigate('/learning/quiz?source=quiz&limit=10');
  };

  if (loading) {
    return <div className="card-page card-page--loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="card-page card-page--error">카드 데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="card-page">
      <header className="card-header">
        <div>
          <h1>카드 학습</h1>
          <p className="card-header__subtitle">카드를 뒤집으며 단어를 학습합니다.</p>
        </div>
        <div className="card-header__meta">
          <span>
            {Math.min(currentIndex + 1, total)} / {total}
          </span>
          <ProgressBar value={progress} />
        </div>
      </header>

      <main className="card-body">
        {isFinished ? (
          <div className="card-result">
            <h2>학습 완료</h2>
            <p>알았다: {knownCount}개</p>
            <p>모르겠다: {unknownCount}개</p>
            <div className="card-result__actions">
              <button onClick={handleRetry}>다시 학습</button>
              <button onClick={handleGoQuiz}>객관식 퀴즈 풀기</button>
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
            <footer className="card-footer">
              <button type="button" onClick={markUnknown}>
                모르겠다
              </button>
              <button type="button" onClick={markKnown}>
                알겠다
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
