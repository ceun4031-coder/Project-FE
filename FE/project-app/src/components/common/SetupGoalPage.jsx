import "../../styles/login.css";
import "../../styles/setup.css";
import Button from "../../components/common/Button";

const SetupGoalPage = () => {
  const topics = [
    "비즈니스",
    "IT/테크",
    "일상/회화",
    "영화/미드",
    "여행",
  ];

  return (
    <main className="login-container">
      
      {/* Left Gradient with NO image */}
      <div className="login-left no-image"></div>

      {/* Right Form Section */}
      <div className="login-right">
        <h1 className="setup-title">거의 다 되었습니다!</h1>
        <p className="setup-sub">
          학습 목표를 설정하고 OOO을 시작해보세요.
        </p>

        {/* 관심 분야 선택 */}
        <h3 className="setup-section-title">관심 분야를 선택해주세요</h3>

        <div className="topic-grid">
          {topics.map((t, i) => (
            <button key={i} className="topic-chip">
              {t}
            </button>
          ))}
        </div>

        {/* 하루 목표 단어 수 */}
        <div className="goal-box">
          <div className="goal-header">
            <span>하루 목표 단어 수</span>
            <span className="goal-value">20</span>
          </div>

          <input
            type="range"
            min="5"
            max="50"
            defaultValue="20"
            className="goal-slider"
          />

          <div className="goal-levels">
            <span>Easy(5)</span>
            <span>Challenge(50)</span>
          </div>
        </div>

        {/* CTA 버튼 */}
        <Button variant="primary" size="lg" full style={{ marginTop: "32px" }}>
          설정 완료하고 시작하기 →
        </Button>

        <div className="setup-later">나중에 설정하기</div>
      </div>
    </main>
  );
};

export default SetupGoalPage;
