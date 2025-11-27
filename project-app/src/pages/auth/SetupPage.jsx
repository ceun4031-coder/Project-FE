// src/pages/api/auth/SetupPage.jsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import TodayWordCard from "../../components/common/TodayWordCard";
import Illustration from "../../assets/images/login.svg";

import "./SetupPage.css";
import { signup as signupApi } from "../../api/authApi";

// 📌 MOCK 모드 상수 정의
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MIN_LEVEL = 5;
const MAX_LEVEL = 50;

const FIELD_OPTIONS = [
  { label: "일상생활", value: "DAILY_LIFE" },
  { label: "사람/감정", value: "PEOPLE_FEELINGS" },
  { label: "직장/비즈니스", value: "BUSINESS" },
  { label: "학교/학습", value: "SCHOOL_LEARNING" },
  { label: "여행/교통", value: "TRAVEL" },
  { label: "음식/건강", value: "FOOD_HEALTH" },
  { label: "기술/IT", value: "TECHNOLOGY" },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 📌 MOCK 모드일 경우, 이전 페이지에서 데이터가 안 넘어왔더라도 테스트용 더미 데이터를 사용
  const basicInfo = location.state?.basicInfo || (USE_MOCK ? {
    email: "mock@test.com",
    password: "password123!",
    nickname: "MockUser",
    userName: "홍길동",
    userBirth: "2000-01-01"
  } : null);

  const [level, setLevel] = useState(20);
  const [selected, setSelected] = useState([]);
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // basicInfo가 없으면 회원가입 페이지로 리다이렉트 (MOCK 모드면 위에서 더미 데이터를 넣었으므로 통과됨)
    if (!basicInfo) {
      navigate("/auth/signup", { replace: true });
    }
  }, [basicInfo, navigate]);

  const toggleField = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
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

    // 📌 [MOCK 처리] API 호출 대신 콘솔 로그 찍고 성공 처리
    if (USE_MOCK) {
      const mockPayload = {
        email: basicInfo.email,
        password: basicInfo.password,
        nickname: basicInfo.nickname,
        userName: basicInfo.userName,
        userBirth: basicInfo.userBirth,
        preference: overridePreference ?? (selected.length ? selected.join(",") : null),
        goal: overrideGoal ?? (goal || null),
        dailyWordGoal: overrideDailyWordGoal ?? (level ? Number(level) : 20),
      };

      console.log("🔥 [Mock] 회원가입 최종 요청 데이터:", mockPayload);

      setTimeout(() => {
        alert("목업 모드: 회원가입이 완료되었습니다. (로그인 페이지로 이동)");
        setSubmitting(false);
        navigate("/auth/login", { replace: true });
      }, 1000); // 1초 지연 효과
      
      return; // 실제 API 호출 방지
    }
    try {
      await signupApi({
        email: basicInfo.email,
        password: basicInfo.password,
        nickname: basicInfo.nickname,
        userName: basicInfo.userName,
        userBirth: basicInfo.userBirth,
        preference:
          overridePreference ??
          (selected.length ? selected.join(",") : null),
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
    handleRegister();
  };

  const handleSkip = () => {
    handleRegister({
      overridePreference: null,
      overrideGoal: null,
      overrideDailyWordGoal: 20,
    });
  };

  return (
    <main className="page-container">
      <div className="setup-card">
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

        <div className="setup-form-area">
          <h1 className="setup-title">거의 다 되었습니다!</h1>
          <p className="setup-subtitle">
            학습목표를 설정하고 영어 학습을 시작해보세요.
          </p>

          <div className="setup-section">
            <label className="setup-label">관심 분야를 선택해주세요</label>

            <div className="setup-tags">
              {FIELD_OPTIONS.map((field) => (
                <button
                  type="button"
                  key={field.value}
                  className={`setup-tag ${
                    selected.includes(field.value) ? "active" : ""
                  }`}
                  onClick={() => toggleField(field.value)}
                  disabled={submitting}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>

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

          <div className="setup-section">
            <label className="setup-label">하루 목표 단어 수</label>

            <div className="setup-slider-box">
              <span className="slider-value">{level}</span>

              <input
                type="range"
                min={MIN_LEVEL}
                max={MAX_LEVEL}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="input-range setup-slider"
                style={{
                  "--range-progress": `${
                    ((Number(level) - MIN_LEVEL) * 100) /
                    (MAX_LEVEL - MIN_LEVEL)
                  }%`,
                }}
                disabled={submitting}
              />

              <div className="slider-labels">
                <span>Easy (5)</span>
                <span>Challenge (50)</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="md"
            full
            style={{ marginTop: "20px" }}
            onClick={handleComplete}
            disabled={submitting}
          >
            {submitting ? "가입 처리 중..." : "설정 완료하고 시작하기 →"}
          </Button>

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
