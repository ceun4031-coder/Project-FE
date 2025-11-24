import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import TodayWordCard from "../../components/common/TodayWordCard";
import Illustration from "../../assets/images/login.svg";

import "../../styles/pages/setup.css";

export default function SetupPage() {
  const navigate = useNavigate();

  const [level, setLevel] = useState(20);
  const [selected, setSelected] = useState([]);

  const fields = ["비즈니스", "IT/테크", "일상/회화", "영화/미드", "여행"];

  const toggleField = (field) => {
    if (selected.includes(field)) {
      setSelected(selected.filter((f) => f !== field));
    } else {
      setSelected([...selected, field]);
    }
  };

  return (
    <main className="page-container">
      <div className="setup-card">

        {/* 왼쪽 비주얼 영역 */}
        <div className="setup-visual">
          <div className="setup-visual-inner">
            <TodayWordCard />

            <img
              src={Illustration}
              alt="setup illustration"
              className="setup-visual-graphic"
            />
          </div>
        </div>

        {/* 오른쪽 설정 입력 영역 */}
        <div className="setup-form-area">
          <h1 className="setup-title">거의 다 되었습니다!</h1>
          <p className="setup-subtitle">
            학습목표를 설정하고 영어 학습을 시작해보세요.
          </p>

          {/* 관심 분야 */}
          <div className="setup-section">
            <label className="setup-label">관심 분야를 선택해주세요</label>

            <div className="setup-tags">
              {fields.map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`setup-tag ${selected.includes(f) ? "active" : ""}`}
                  onClick={() => toggleField(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 슬라이더 */}
          <div className="setup-section">
            <label className="setup-label">하루 목표 단어 수</label>

            <div className="setup-slider-box">
              <span className="slider-value">{level}</span>

              <input
                type="range"
                min="5"
                max="50"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="setup-slider"
              />

              <div className="slider-labels">
                <span>Easy (5)</span>
                <span>Challenge (50)</span>
              </div>
            </div>
          </div>

          {/* 완료 버튼 → 홈("/") 이동 */}
          <Button
            variant="primary"
            size="md"
            full
            style={{ marginTop: "30px" }}
            onClick={() => navigate("/")}
          >
            설정 완료하고 시작하기 →
          </Button>

          <p className="setup-later">나중에 설정하기</p>
        </div>
      </div>
    </main>
  );
}
