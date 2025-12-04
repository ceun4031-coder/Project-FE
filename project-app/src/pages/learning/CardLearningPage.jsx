// src/pages/learning/CardLearningPage.jsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Circle } from 'lucide-react'; // 아이콘 임포트
import { useLearningEngine } from './hooks/useLearningEngine';
import { Flashcard } from './components/Flashcard';
import './CardLearningPage.css';
import { useEffect, useState } from "react";

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

  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    if (isFinished) {
      // 다음 tick에 width 적용 → 애니메이션 시작
      setTimeout(() => setAnimateBars(true), 50);
    } else {
      setAnimateBars(false);
    }
  }, [isFinished]);

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

  // ------------ 여기부터 JSX ------------
  return (
    <div className={pageClassName}>
      {/* 학습 중일 때만 card-wrap 안에 카드 표시 */}
      {!isFinished ? (
        <div className="card-wrap">
          <header className="card-header">
            <h1 className="cl-title">
              {isWrongMode ? '오답 카드 학습' : '카드 학습'}
              <span className={`cl-badge ${isWrongMode ? 'badge-orange' : 'badge-purple'}`}>
                {isWrongMode ? '복습' : '학습'}
              </span>
            </h1>

            <p className="cl-subtitle">
              {isWrongMode
                ? '틀렸던 단어들만 골라 카드를 뒤집으며 복습합니다.'
                : '카드를 뒤집으며 단어를 학습합니다.'}
            </p>

            <div className="cl-progress-area">
              <span className="cl-progress-count">
                {Math.min(currentIndex + 1, total)} / {total}
              </span>
              <ProgressBar value={progressPercent} />
            </div>
          </header>

          <main className="card-body">
            <Flashcard
              front={current?.frontText}
              back={current?.backText}
              isFlipped={isFlipped}
              onToggle={toggleFlip}
            />

            {/* O, X 아이콘 버튼 */}
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
          </main>
        </div>
      ) : (
        // ✅ 결과 화면: card-wrap 밖에서, 네모로 다시 감싸지지 않음
        <div className="card-result page-result">
          <h2>{isWrongMode ? '오답 복습 완료' : '학습 완료'}</h2>

          <div className="stats-card">
            {/* 알았다 */}
            <div className="stat-row">
              <span className="stat-label">알았다</span>
              <span className="stat-value stat-known">{knownCount}개</span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill stat-known"
                style={{
                  width: animateBars ? `${(knownCount / total) * 100}%` : '0%',
                }}
              />
            </div>

            {/* 모르겠다 */}
            <div className="stat-row">
              <span className="stat-label">모르겠다</span>
              <span className="stat-value stat-unknown">{unknownCount}개</span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill stat-unknown"
                style={{
                  width: animateBars ? `${(unknownCount / total) * 100}%` : '0%',
                }}
              />
            </div>

            {/* 총 학습 단어 */}
            <div className="stat-row simple">
              <span className="stat-label">총 학습 단어</span>
              <span className="stat-value">{total}개</span>
            </div>
          </div>

          {/* 결과 버튼 */}
          <div className="result-buttons">
            <button className="result-btn secondary" onClick={handleGoHome}>
              학습하기 홈으로
            </button>

            <button className="result-btn primary" onClick={handleGoQuiz}>
              {isWrongMode ? '오답 퀴즈 풀기' : '객관식 퀴즈 풀기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 진행 바 컴포넌트
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
