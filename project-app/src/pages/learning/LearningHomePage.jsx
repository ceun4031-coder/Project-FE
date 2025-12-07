// src/pages/learning/LearningHomePage.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Layers,
  RotateCcw,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  ChevronRight,
  Library,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import FilterDropdown from "../../components/common/FilterDropdown";
import { useLearningSettingsStore } from "./hooks/useLearningSettingsStore";
import "./LearningHomePage.css";

const LEVEL_OPTIONS = [
  { label: "전체", value: "All" },
  { label: "초급", value: "1" },
  { label: "중급", value: "2" },
  { label: "고급", value: "3" },
];

const DOMAIN_OPTIONS = [
  { label: "전체 분야", value: "All" },
  { label: "일상생활", value: "Daily Life" },
  { label: "사람/감정", value: "People & Feelings" },
  { label: "직장/비즈니스", value: "Business" },
  { label: "학교/학습", value: "School & Learning" },
  { label: "여행/교통", value: "Travel" },
  { label: "음식/건강", value: "Food & Health" },
  { label: "기술/IT", value: "Technology" },
];

const DEFAULT_QUESTION_COUNT = 10;

function LearningHomePage() {
  const navigate = useNavigate();

  // ✅ 전역 학습 설정 store 사용
  const {
    questionCount,
    level,
    domain,
    setQuestionCount,
    setLevel,
    setDomain,
    resetAll,
  } = useLearningSettingsStore();

  // 로컬 UI 상태(드롭다운 열림 여부)는 이 페이지 안에서만 필요하므로 그대로 useState 사용
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

 const handleStepChange = (delta) => {
  const next = questionCount + delta; // 현재 값에서 +5 / -5
  const clamped = Math.max(5, Math.min(30, next)); // 5~30 사이로 제한
  setQuestionCount(clamped);
};

  const buildParams = (source) => {
    const params = new URLSearchParams({
      source,
      limit: String(questionCount),
      level,
      domain,
    });
    return params.toString();
  };

  const isFilterActive = useMemo(
    () =>
      questionCount !== DEFAULT_QUESTION_COUNT ||
      level !== "All" ||
      domain !== "All",
    [questionCount, level, domain]
  );

  const handleFilterReset = () => {
    resetAll();
    setOpenDropdown(null);
  };

  return (
    <div className="page-container">
      <main className="learning-home-page" aria-label="학습하기">
        <header className="learning-header">
          <PageHeader
            title="오늘의"
            highlight="학습하기"
            description="오늘의 목표를 달성하고 실력을 키워보세요."
          />
        </header>

        {/* 1. 통합 설정 바 */}
        <section className="learning-settings-bar" aria-label="학습 옵션 설정">
          <div className="learning-settings-main">
            <div className="setting-controls">
              {/* 문항 수 */}
              <div className="control-group">
                <div className="filter-group">
                  <span className="filter-label">문항 수</span>
                  <div
                    className="stepper-input"
                    role="group"
                    aria-label="문항 수 조절"
                  >
                    <button
                      type="button"
                      onClick={() => handleStepChange(-5)}
                      disabled={questionCount <= 5}
                      aria-label="문항 수 5개 줄이기"
                    >
                      –
                    </button>
                    <span
                      id="question-count"
                      className="value"
                      aria-live="polite"
                    >
                      {questionCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepChange(5)}
                      disabled={questionCount >= 30}
                      aria-label="문항 수 5개 늘리기"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider" aria-hidden="true" />

              {/* 난이도 필터 */}
              <div className="control-group">
                <FilterDropdown
                  id="level"
                  label="난이도"
                  options={LEVEL_OPTIONS}
                  value={level}
                  isOpen={openDropdown === "level"}
                  onToggle={toggleDropdown}
                  onChange={(_, value) => {
                    setLevel(value);
                    setOpenDropdown(null);
                  }}
                />
              </div>

              {/* 분야 필터 */}
              <div className="control-group">
                <FilterDropdown
                  id="domain"
                  label="분야"
                  options={DOMAIN_OPTIONS}
                  value={domain}
                  isOpen={openDropdown === "domain"}
                  onToggle={toggleDropdown}
                  onChange={(_, value) => {
                    setDomain(value);
                    setOpenDropdown(null);
                  }}
                />
              </div>

              {/* 필터 + 문항수 초기화 */}
              {isFilterActive && (
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={handleFilterReset}
                  title="옵션 초기화"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 2. 메인 대시보드 */}
        <div className="dashboard-grid">
          {/* [LEFT] 정규 학습 존 */}
          <section className="zone-column growth-zone" aria-label="정규 학습">
            <header className="zone-header">
              <div className="zone-icon-bg">
                <BrainCircuit size={24} aria-hidden="true" />
              </div>
              <div className="zone-text">
                <h3>정규 학습</h3>
                <p>새로운 단어를 익히고 퀴즈로 확인하세요.</p>
              </div>
            </header>

            <div className="zone-cards">
              {/* 메인 액션 */}
              <button
                type="button"
                className="action-card primary"
                onClick={() =>
                  navigate(`/learning/quiz?${buildParams("quiz")}`)
                }
              >
                <div className="card-content">
                  <div className="card-badge">추천</div>
                  <h4>실전 퀴즈 풀기</h4>
                  <p>
                    객관식 문제로 단어 실력을
                    <br />
                    정확하게 테스트하세요.
                  </p>
                </div>
                <div className="card-visual">
                  <BookOpen size={64} strokeWidth={1.2} aria-hidden="true" />
                </div>
                <div className="hover-arrow" aria-hidden="true">
                  <ArrowRight size={24} />
                </div>
              </button>

              {/* 서브 액션 */}
              <button
                type="button"
                className="action-card secondary"
                onClick={() =>
                  navigate(`/learning/card?${buildParams("card")}`)
                }
              >
                <div className="card-icon-small">
                  <Layers size={22} aria-hidden="true" />
                </div>
                <div className="card-text-row">
                  <h4>플래시 카드</h4>
                  <p>카드를 뒤집으며 빠르게 암기</p>
                </div>
                <ChevronRight
                  size={18}
                  className="card-chevron"
                  aria-hidden="true"
                />
              </button>
            </div>
          </section>

          {/* [RIGHT] 오답 클리닉 존 */}
          <section className="zone-column clinic-zone" aria-label="오답 정복">
            <header className="zone-header">
              <div className="zone-icon-bg">
                <CheckCircle2 size={24} aria-hidden="true" />
              </div>
              <div className="zone-text">
                <h3>오답 학습</h3>
                <p>틀린 문제를 복습하고 약점을 보완하세요.</p>
              </div>
            </header>

            <div className="zone-cards">
              {/* 메인 액션 */}
              <button
                type="button"
                className="action-card primary"
                onClick={() =>
                  navigate(`/learning/quiz?${buildParams("wrong-note")}`)
                }
              >
                <div className="card-content">
                  <div className="card-badge">집중 복습</div>
                  <h4>오답 다시 풀기</h4>
                  <p>
                    내가 틀린 문제만 모아서
                    <br />
                    다시 도전해보세요.
                  </p>
                </div>
                <div className="card-visual">
                  <RotateCcw size={64} strokeWidth={1.2} aria-hidden="true" />
                </div>
                <div className="hover-arrow" aria-hidden="true">
                  <ArrowRight size={24} />
                </div>
              </button>

              {/* 서브 액션 */}
              <button
                type="button"
                className="action-card secondary"
                onClick={() =>
                  navigate(`/learning/card?${buildParams("wrong-note")}`)
                }
              >
                <div className="card-icon-small">
                  <Layers size={22} aria-hidden="true" />
                </div>
                <div className="card-text-row">
                  <h4>오답 플래시 카드</h4>
                  <p>취약한 단어를 집중적으로 암기</p>
                </div>
                <ChevronRight
                  size={18}
                  className="card-chevron"
                  aria-hidden="true"
                />
              </button>

              {/* 오답 노트 관리 링크 */}
              <button
                type="button"
                className="action-card manage-link"
                onClick={() => navigate("/learning/wrong-notes")}
              >
                <div className="manage-content">
                  <div className="manage-icon">
                    <Library size={18} aria-hidden="true" />
                  </div>
                  <span>전체 오답 노트 관리하기</span>
                </div>
                <ArrowRight
                  size={18}
                  className="manage-arrow"
                  aria-hidden="true"
                />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LearningHomePage;
