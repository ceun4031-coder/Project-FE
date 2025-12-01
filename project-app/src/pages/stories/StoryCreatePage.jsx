import React, { useState } from 'react';
import {
  ArrowLeft,
  Book,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './StoryCreatePage.css';

const MAX_SELECTED_WORDS = 5;
const MAX_VISIBLE_MISTAKES = 15;

const StoryCreatePage = () => {
  const navigate = useNavigate();

  // 목업 오답 데이터 (20개)
  const [mistakePool] = useState([
    { id: 1, word: 'ambiguous',   meaning: '애매모호한' },
    { id: 2, word: 'mitigate',    meaning: '완화하다' },
    { id: 3, word: 'scrutinize',  meaning: '세밀히 조사하다' },
    { id: 4, word: 'fluctuate',   meaning: '변동하다' },
    { id: 5, word: 'paradigm',    meaning: '패러다임' },
    { id: 6, word: 'eloquent',    meaning: '웅변을 잘하는' },
    { id: 7, word: 'bias',        meaning: '편견' },
    { id: 8, word: 'resilient',   meaning: '회복력 있는' },
    { id: 9, word: 'contemplate', meaning: '곰곰이 생각하다' },
    { id: 10, word: 'cohesive',   meaning: '응집력 있는' },
    { id: 11, word: 'disrupt',    meaning: '방해하다' },
    { id: 12, word: 'immerse',    meaning: '몰입시키다' },
    { id: 13, word: 'plausible',  meaning: '그럴듯한' },
    { id: 14, word: 'prompt',     meaning: '재빠른, 자극하다' },
    { id: 15, word: 'precise',    meaning: '정확한' },
    { id: 16, word: 'tentative',  meaning: '시험적인' },
  ]);

  const [selectedWords, setSelectedWords] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [options, setOptions] = useState({
    difficulty: 'intermediate',
    style: 'narrative',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/stories'); // 리스트 라우트에 맞게 조정
    }
  };

  // 좌측 카드 / 직접 입력 공통: 단어 토글 선택
  const toggleSelectWord = (wordText, source = 'mistake') => {
    const normalized = wordText.trim();
    if (!normalized) return;

    const lower = normalized.toLowerCase();
    const exists = selectedWords.some(
      (w) => w.text.toLowerCase() === lower
    );

    // 이미 선택된 단어면 → 해제
    if (exists) {
      setSelectedWords((prev) =>
        prev.filter((w) => w.text.toLowerCase() !== lower)
      );
      return;
    }

    // 새로 선택
    if (selectedWords.length >= MAX_SELECTED_WORDS) {
      alert(`단어는 최대 ${MAX_SELECTED_WORDS}개까지만 선택할 수 있어요.`);
      return;
    }

    setSelectedWords((prev) => [...prev, { text: normalized, source }]);
  };

  const selectWord = (wordObj) => {
    toggleSelectWord(wordObj.word, 'mistake');
  };

  const removeWord = (textToRemove) => {
    setSelectedWords((prev) =>
      prev.filter((w) => w.text !== textToRemove)
    );
  };

  const handleCustomInput = (e) => {
    if (e.key === 'Enter' && customInput.trim()) {
      e.preventDefault();
      toggleSelectWord(customInput, 'custom');
      setCustomInput('');
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert('스토리 생성 완료! (Demo)');
    }, 2000);
  };

  const handleClearAll = () => {
    if (!selectedWords.length) return;
    setSelectedWords([]);
  };

  const handleOpenMistakePage = () => {
    // 실제 오답 노트 / 단어장 페이지 경로에 맞게 수정
    navigate('/words');
  };

  const isFull = selectedWords.length >= MAX_SELECTED_WORDS;

  // 좌측에 표시되는 오답 단어 (최근 N개)
  const visibleMistakes = mistakePool.slice(0, MAX_VISIBLE_MISTAKES);
  const hasMoreMistakes = mistakePool.length > MAX_VISIBLE_MISTAKES;

  return (
    <div className="page-container">
      <div className="story-page story-create-page">
        
        {/* 상단 네비게이션 */}
        <nav className="story-nav">
          <button type="button" onClick={handleBack} className="nav-back-btn">
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
          <span className="nav-badge">AI Story</span>
        </nav>

        {/* 메인 레이아웃 */}
        <div className="create-layout">
          
          {/* LEFT: 오답 노트 */}
          <aside className="mistake-sidebar">
            <div className="mistake-header">
              <h3>
                <Book size={18} className="text-primary-500" /> 오답 노트
              </h3>
              <span className="nav-badge" style={{ fontSize: '0.8rem' }}>
                {mistakePool.length}
              </span>
            </div>

            <p className="mistake-desc">
              최근 퀴즈에서 실수한 단어들입니다.
            </p>

            <div className="mistake-list">
              {visibleMistakes.map((item) => {
                const isSelected = selectedWords.some(
                  (w) => w.text.toLowerCase() === item.word.toLowerCase()
                );
                return (
                  <div
                    key={item.id}
                    className={`mistake-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => selectWord(item)}
                  >
                    <div className="card-top">
                      <span className="card-word">{item.word}</span>
                      {isSelected && (
                        <span className="selected-mark">선택됨</span>
                      )}
                    </div>
                    <div className="card-meaning">{item.meaning}</div>
                  </div>
                );
              })}
            </div>

            {hasMoreMistakes && (
              <div className="mistake-footer">
                <span className="mistake-more-text">
                  최근 오답 {MAX_VISIBLE_MISTAKES}개만 표시 중
                </span>
                <button
                  type="button"
                  className="mistake-more-btn"
                  onClick={handleOpenMistakePage}
                >
                  전체 보기
                </button>
              </div>
            )}
          </aside>

          {/* RIGHT: 스토리 빌더 */}
          <main className="builder-main">
              <header className="builder-header">
    <div className="builder-heading">
      <div className="builder-heading-row">
        <Sparkles className="builder-heading-icon" size={18} />
        <h3 className="builder-heading-title">AI 스토리</h3>
      </div>
      <p className="builder-heading-desc">
        선택한 단어로 연습용 영어 스토리를 만들어 드려요.
      </p>
    </div>

    <span
      className={`nav-badge nav-badge--small ${
        isFull ? 'nav-badge--alert' : ''
      }`}
    >
      {selectedWords.length} / {MAX_SELECTED_WORDS}
    </span>
  </header> {/* 선택된 단어 섹션 + 컨트롤 폼은 그대로 */}
  <section className="selected-words">
    <div className="selected-words-header">
      <div className="selected-words-text">
        <h4 className="selected-words-title">선택된 단어</h4>
        <p className="selected-words-caption">
          최대 {MAX_SELECTED_WORDS}개까지 선택할 수 있어요.
        </p>
      </div>
      {selectedWords.length > 0 && (
        <button
          type="button"
          className="chips-clear-btn"
          onClick={handleClearAll}
        >
          전체 해제
        </button>
      )}
    </div>

    <div className="chips-container">
      {selectedWords.length === 0 ? (
        <div className="chips-empty">
          좌측에서 단어를 선택하거나
          <br />
          아래 입력창에 직접 추가하세요.
        </div>
      ) : (
        <div className="chips-wrap">
          {selectedWords.map((item, idx) => (
            <span key={idx} className={`word-chip ${item.source}`}>
              {item.text}
              <button
                type="button"
                className="chip-remove"
                onClick={() => removeWord(item.text)}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  </section>

            {/* 컨트롤 폼 */}
            <div className="control-form">
              <div className="form-field">
                <label className="form-label">단어 직접 추가</label>
                <Input
                  type="text"
                  placeholder="단어 입력 후 Enter (예: sustainability)"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleCustomInput}
                  disabled={isFull}
                  iconRight={<Plus size={18} />}
                />
                {isFull && (
                  <p className="form-helper text-danger-500">
                    최대 {MAX_SELECTED_WORDS}개까지만 선택 가능합니다.
                  </p>
                )}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">난이도</label>
                  <select
                    className="input custom-select"
                    value={options.difficulty}
                    onChange={(e) =>
                      setOptions({ ...options, difficulty: e.target.value })
                    }
                  >
                    <option value="beginner">초급 (Beginner)</option>
                    <option value="intermediate">중급 (Intermediate)</option>
                    <option value="advanced">고급 (Advanced)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">글 스타일</label>
                  <select
                    className="input custom-select"
                    value={options.style}
                    onChange={(e) =>
                      setOptions({ ...options, style: e.target.value })
                    }
                  >
                    <option value="narrative">📖 소설/동화</option>
                    <option value="news">📰 뉴스 기사</option>
                    <option value="conversation">💬 일상 대화</option>
                    <option value="business">💼 비즈니스</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  full
                  size="lg"
                  disabled={selectedWords.length === 0 || isGenerating}
                  onClick={handleGenerate}
                >
                  {isGenerating
                    ? 'AI가 스토리를 만드는 중...'
                    : '스토리 생성하기'}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StoryCreatePage;
