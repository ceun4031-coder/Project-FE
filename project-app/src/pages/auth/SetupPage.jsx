// src/pages/api/auth/SetupPage.jsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import TodayWordCard from "../../components/common/TodayWordCard";
import Illustration from "../../assets/images/login.svg";

import "./SetupPage.css";
import { signup as signupApi } from "../../api/authApi";


export default function SetupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1단계에서 넘어온 기본 정보
  const basicInfo = location.state?.basicInfo;

  // 새로고침 / 직접 진입 방지
  useEffect(() => {
    if (!basicInfo) {
      navigate("/auth/signup", { replace: true });
    }
  }, [basicInfo, navigate]);

  const [level, setLevel] = useState(20); // 하루 목표 단어 수
  const [selected, setSelected] = useState([]); // 관심 분야
  const [goal, setGoal] = useState(""); // 학습 목표 텍스트
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fields = ["비즈니스", "IT/테크", "일상/회화", "영화/미드", "여행"];

  const toggleField = (field) => {
    if (selected.includes(field)) {
      setSelected(selected.filter((f) => f !== field));
    } else {
      setSelected([...selected, field]);
    }
  };

  const handleRegister = async (options = {}) => {
    if (!basicInfo) return;

    const {
      overridePreference = null,
      overrideGoal = null,
      overrideDailyWordGoal = null,
    } = options;

    setSubmitting(true);
    setError("");

    try {
      await signupApi({
        email: basicInfo.email,
        password: basicInfo.password,
        nickname: basicInfo.nickname,
        userName: basicInfo.userName,
        userBirth: basicInfo.userBirth,
        preference:
          overridePreference ??
          (selected.length ? selected.join(", ") : null),
        goal: overrideGoal ?? (goal || null),
        dailyWordGoal:
          overrideDailyWordGoal ?? (level ? Number(level) : 20),
      });

      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      setError(message);
      setSubmitting(false);
    }
  };

  const handleComplete = () => {
    // 사용자가 설정한 값 그대로 사용
    handleRegister();
  };

  const handleSkip = () => {
    // 관심 분야/목표 없이 기본값으로 가입
    handleRegister({
      overridePreference: null,
      overrideGoal: null,
      overrideDailyWordGoal: 20,
    });
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
                  className={`setup-tag ${
                    selected.includes(f) ? "active" : ""
                  }`}
                  onClick={() => toggleField(f)}
                  disabled={submitting}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 학습 목표 텍스트 (선택) */}
          <div className="setup-section">
            <label className="setup-label">학습 목표 (선택)</label>
            <Input
              type="text"
              name="goal"
              placeholder="예: 취업 준비, 해외 여행, 발표 준비 등"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              fullWidth
              disabled={submitting}
            />
          </div>

          {/* 하루 목표 단어 수 슬라이더 */}
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
                disabled={submitting}
              />

              <div className="slider-labels">
                <span>Easy (5)</span>
                <span>Challenge (50)</span>
              </div>
            </div>
          </div>

          {error && <p className="setup-error">{error}</p>}

          {/* 완료 버튼 → 최종 회원가입 + 로그인 페이지 이동 */}
          <Button
            variant="primary"
            size="md"
            full
            style={{ marginTop: "30px" }}
            onClick={handleComplete}
            disabled={submitting}
          >
            {submitting ? "가입 처리 중..." : "설정 완료하고 시작하기 →"}
          </Button>

          {/* 나중에 설정하기: 기본값으로 가입 */}
          <button
            type="button"
            className="setup-later"
            onClick={handleSkip}
            disabled={submitting}
          >
            나중에 설정하기
          </button>
        </div>
      </div>
    </main>
  );
}
