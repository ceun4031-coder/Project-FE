// src/pages/api/auth/LoginPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import TodayWordCard from "../../components/common/TodayWordCard";

import LoginIllustration from "../../assets/images/login.svg";

import { login } from "../../api/authApi";

// 이메일 저장용 키
const SAVE_EMAIL_KEY = "storylex_login_email";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    saveEmail: false,
  });

  // 필드 단위 에러
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // 서버에서 내려오는 전역 에러
  const [globalError, setGlobalError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // 이메일 저장 값 복원
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

    // 해당 필드 에러만 초기화
    if (name === "email" || name === "password") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // 전역 에러도 함께 초기화
    setGlobalError("");
  };

  // 필수값 + 이메일 형식 검증
  const validate = () => {
    const nextErrors = {
      email: "",
      password: "",
    };

    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    }

    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    // 클라이언트 검증
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({
        // 기존 id 대신 email로 로그인
        email: formData.email,
        password: formData.password,
      });

      // 이메일 저장 처리
      if (formData.saveEmail) {
        localStorage.setItem(SAVE_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(SAVE_EMAIL_KEY);
      }

      // 로그인 성공 후 이동
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해 주세요.";
      setGlobalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-container">
      <div className="login-card">
        {/* 왼쪽 비주얼 영역 */}
        <div className="login-visual">
          <div className="login-visual-inner">
            <TodayWordCard />

            <img
              src={LoginIllustration}
              alt="login illustration"
              className="login-visual-graphic"
            />
          </div>
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="login-form-area">
          <h1 className="login-title">로그인</h1>

          <form onSubmit={handleSubmit} className="login-form">
            {/* 이메일 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="login-email"
              >
                이메일
              </label>
              <Input
                id="login-email"
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                fullWidth
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* 비밀번호 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="login-password"
              >
                비밀번호
              </label>
              <PasswordInput
                id="login-password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                fullWidth
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* 서버 전역 에러 메시지 */}
            {globalError && (
              <p className="form-error login-error">
                {globalError}
              </p>
            )}

            {/* 이메일 저장 / 찾기 */}
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
                <Link to="/auth/find?tab=email" className="login-link">
                  이메일 찾기
                </Link>
                <span className="login-links-divider">|</span>
                <Link to="/auth/find?tab=pw" className="login-link">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div className="login-btn">
              <Button
                type="submit"
                variant="primary"
                size="md"
                full
                disabled={submitting}
              >
                {submitting ? "로그인 중..." : "로그인"}
              </Button>
            </div>

        

            {/* OR 구분 */}
            <div className="login-divider">OR</div>

            {/* 구글 로그인 버튼 */}
            <button
              type="button"
              className="google-btn"
              disabled={submitting}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
              />
              구글 계정으로 로그인
            </button>

                {/* 회원가입 */}
           <p className="signup-footer-text">
              아직 계정이 없으신가요?{" "}
              <Link to="/auth/signup" className="signup-link">
                회원가입
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
