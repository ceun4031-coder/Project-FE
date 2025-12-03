import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Layers,
  RotateCcw,
  Settings2,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  ChevronRight,
  Library,
  ChevronDown
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import "./LearningHomePage.css";

function LearningHomePage() {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(10);
  const [level, setLevel] = useState("All");
  const [domain, setDomain] = useState("All");
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) =>
  setOpenDropdown((prev) => (prev === name ? null : name));

  const LEVEL_OPTIONS = [
  { label: "전체", value: "All" },
  { label: "초급", value: "1" },
  { label: "중급", value: "2" },
  { label: "고급", value: "3" }
];
// 분야 필터 (domain)
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

  const handleStepChange = (delta) => {
    setQuestionCount((prev) => {
      const next = prev + delta;
      if (next < 5) return 5;
      if (next > 50) return 50;
      return next;
    });
  };

  const buildParams = (source) => {
    const params = new URLSearchParams({
      source,
      limit: String(questionCount),
      level
    });
    return params.toString();
  };

  return (
    <div className="page-container">
      <main className="learning-home-page" aria-label="학습하기">
        <PageHeader
          title="학습하기"
          description="오늘의 목표를 달성하고 실력을 키워보세요."
        />

        {/* 1. 통합 설정 바 */}
        <section className="learning-settings-bar" aria-label="학습 옵션 설정">
          <div className="learning-settings-main">
            <div className="setting-label">
              <Settings2 size={20} aria-hidden="true" />
              <span>학습 옵션 설정</span>
            </div>

            <div className="setting-controls">
              <div className="control-group">
                <label htmlFor="question-count" className="control-label">
                  문항 수
                </label>
                <div className="stepper-input" role="group" aria-label="문항 수 조절">
                  <button
                    type="button"
                    onClick={() => handleStepChange(-5)}
                    disabled={questionCount <= 5}
                    aria-label="문항 수 5개 줄이기"
                  >
                    –
                  </button>
                  <span id="question-count" className="value" aria-live="polite">
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

              <div className="divider" aria-hidden="true" />

              <div className="control-group">
                <label htmlFor="difficulty" className="control-label">
                  난이도
                </label>
                <div className="filter-group">
                  <div className="dropdown-box">
                    <button
                      type="button"
                      className="dropdown-btn no-select"
                      onClick={() => toggleDropdown("level")}
                    >
                      {LEVEL_OPTIONS.find((opt) => opt.value === level)?.label}
                      <ChevronDown size={14} className="arrow" />
                    </button>
                    {openDropdown === "level" && (
                      <div className="dropdown-menu">
                        {LEVEL_OPTIONS.map((opt) => (
                          <div
                            key={opt.value}
                            className="dropdown-item"
                            onClick={() => { setLevel(opt.value); setOpenDropdown(null); }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="control-group">
                <label htmlFor="domain" className="control-label">분야</label>
                <div className="filter-group">
                  <div className="dropdown-box">
                    <button
                      type="button"
                      className="dropdown-btn no-select"
                      onClick={() => toggleDropdown("domain")}
                    >
                      {DOMAIN_OPTIONS.find((opt) => opt.value === domain)?.label}
                      <ChevronDown size={14} className="arrow" />
                    </button>

                    {openDropdown === "domain" && (
                      <div className="dropdown-menu">
                        {DOMAIN_OPTIONS.map((opt) => (
                          <div
                            key={opt.value}
                            className="dropdown-item"
                            onClick={() => { setDomain(opt.value); setOpenDropdown(null); }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                onClick={() => navigate(`/learning/quiz?${buildParams("quiz")}`)}
              >
                <div className="card-content">
                  <div className="card-badge">추천</div>
                  <h4>실전 퀴즈 풀기</h4>
                  <p>객관식 문제로 단어 실력을<br />정확하게 테스트하세요.</p>
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
                onClick={() => navigate(`/learning/card?${buildParams("card")}`)}
              >
                <div className="card-icon-small">
                  <Layers size={22} aria-hidden="true" />
                </div>
                <div className="card-text-row">
                  <h4>플래시 카드</h4>
                  <p>카드를 뒤집으며 빠르게 암기</p>
                </div>
                <ChevronRight size={18} className="card-chevron" aria-hidden="true" />
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
              {/* 메인 액션 (수정됨: wrong-notes -> wrong-note) */}
              <button
                type="button"
                className="action-card primary"
                onClick={() => navigate(`/learning/quiz?${buildParams("wrong-note")}`)} 
              >
                <div className="card-content">
                  <div className="card-badge">집중 복습</div>
                  <h4>오답 다시 풀기</h4>
                  <p>내가 틀린 문제만 모아서<br />다시 도전해보세요.</p>
                </div>
                <div className="card-visual">
                  <RotateCcw size={64} strokeWidth={1.2} aria-hidden="true" />
                </div>
                <div className="hover-arrow" aria-hidden="true">
                  <ArrowRight size={24} />
                </div>
              </button>

              {/* 서브 액션 (수정됨: wrong-notes -> wrong-note) */}
              <button
                type="button"
                className="action-card secondary"
                onClick={() => navigate(`/learning/card?${buildParams("wrong-note")}`)}
              >
                <div className="card-icon-small">
                  <Layers size={22} aria-hidden="true" />
                </div>
                <div className="card-text-row">
                  <h4>오답 플래시 카드</h4>
                  <p>취약한 단어를 집중적으로 암기</p>
                </div>
                <ChevronRight size={18} className="card-chevron" aria-hidden="true" />
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
                <ArrowRight size={18} className="manage-arrow" aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LearningHomePage;