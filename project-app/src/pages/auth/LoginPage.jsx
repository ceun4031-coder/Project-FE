// src/pages/api/auth/LoginPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import TodayWordCard from "../../components/common/TodayWordCard";
import LoginIllustration from "../../assets/images/login.svg";

import { useAuth } from "../../context/AuthContext";

// [변경 2] 테스트용 목업 스위치 (true면 API 없이 무조건 로그인 성공)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const SAVE_EMAIL_KEY = "storylex_login_email";

export default function LoginPage() {
  const navigate = useNavigate();
  
  // [변경 3] Context에서 로그인 함수 가져오기
  const { login } = useAuth(); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    saveEmail: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVE_EMAIL_KEY);
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        saveEmail: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "email" || name === "password") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setGlobalError("");
  };

  const validate = () => {
    const nextErrors = { email: "", password: "" };
    
    // 목업 모드일 때는 유효성 검사 좀 대충 해도 됨 (테스트 편의성)
    if (!USE_MOCK) {
        if (!formData.email) nextErrors.email = "이메일을 입력해 주세요.";
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!formData.password) nextErrors.password = "비밀번호를 입력해 주세요.";

    setErrors(nextErrors);
    return !Object.values(nextErrors).some((msg) => !!msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;

    setSubmitting(true);

    // -------------------------------------------------------
    // [핵심] 목업 모드 vs 실제 모드 분기 처리
    // -------------------------------------------------------
    if (USE_MOCK) {
      console.log("📢 [MOCK MODE] 가짜 로그인 시도 중...");
      
      setTimeout(() => {
        // 1. 가짜 토큰 저장 (브라우저를 속임)
        localStorage.setItem("accessToken", "mock_access_token");
        localStorage.setItem("refreshToken", "mock_refresh_token");
        
        // 2. 이메일 저장 로직 (UI 기능 확인용)
        if (formData.saveEmail) {
            localStorage.setItem(SAVE_EMAIL_KEY, formData.email);
        } else {
            localStorage.removeItem(SAVE_EMAIL_KEY);
        }

        console.log("✅ [MOCK MODE] 로그인 성공! 대시보드로 이동합니다.");
        setSubmitting(false);
        navigate("/dashboard");
        
        // 주의: 목업 모드로 넘어가면 AuthContext가 사용자 정보를 못 가져와서
        // 대시보드 닉네임이 안 뜰 수 있습니다. (새로고침하면 풀림)
        // 하지만 '화면 이동' 테스트는 가능합니다.
      }, 1000); // 1초 뒤 성공

      return; // 여기서 함수 종료
    }
    // -------------------------------------------------------

    // 실제 API 로그인 시도
    try {
      // AuthContext의 login 함수 사용 (내부에서 토큰 저장 다 해줌)
      await login(formData.email, formData.password);

      if (formData.saveEmail) {
        localStorage.setItem(SAVE_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(SAVE_EMAIL_KEY);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        "로그인에 실패했습니다. (서버 연결 확인 필요)";
      setGlobalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-container no-select">
      <div className="login-card">
        {/* 왼쪽 비주얼 영역 */}
        <div className="login-visual">
          <div className="login-visual-inner">
            <TodayWordCard />
            <img src={LoginIllustration} alt="login" className="login-visual-graphic" />
          </div>
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="login-form-area">
          <h1 className="login-title">
            로그인 
            {/* 테스트 중임을 표시 */}
            {USE_MOCK && <span style={{fontSize: '12px', color: 'red', marginLeft: '10px'}}>(TEST MODE)</span>}
          </h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label className="form-label" htmlFor="login-email">이메일</label>
              <Input
                id="login-email"
                type="email"
                name="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                fullWidth
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="login-password">비밀번호</label>
              <PasswordInput
                id="login-password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                fullWidth
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {globalError && <p className="form-error login-error">{globalError}</p>}

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  name="saveEmail"
                  checked={formData.saveEmail}
                  onChange={handleChange}
                />
                <span>이메일 저장</span>
              </label>

              <div className="login-links">
                <Link to="/auth/find?tab=email" className="login-link">이메일 찾기</Link>
                <span className="login-links-divider">|</span>
                <Link to="/auth/find?tab=pw" className="login-link">비밀번호 찾기</Link>
              </div>
            </div>

            <div className="login-btn">
              <Button type="submit" variant="primary" size="md" full disabled={submitting}>
                {submitting ? "로그인 중..." : "로그인"}
              </Button>
            </div>

            <div className="login-divider">OR</div>
             {/* 소셜 로그인은 일단 버튼만 둠 */}
            <button type="button" className="google-btn" disabled={submitting}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" />
              구글 계정으로 로그인
            </button>

            <p className="signup-footer-text">
              아직 계정이 없으신가요?{" "}
              <Link to="/auth/signup" className="signup-link">회원가입</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}