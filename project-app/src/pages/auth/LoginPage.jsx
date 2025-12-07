// src/pages/auth/LoginPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "./components/PasswordInput";
import TodayWordCard from "../words/components/TodayWordCard";
import LoginIllustration from "../../assets/images/login.svg";

import { useAuth } from "../../context/AuthContext";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"; // 표시용만 사용
const SAVE_EMAIL_KEY = "storylex_login_email";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext.login 사용 (내부에서 authApi.login 호출)

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

  // 저장된 이메일 자동 세팅
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

    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some((msg) => !!msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      // AuthContext.login이 (email, password) 시그니처
      await login(formData.email, formData.password);

      if (formData.saveEmail) {
        localStorage.setItem(SAVE_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(SAVE_EMAIL_KEY);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("로그인 실패:", err);

      let message =
        "로그인에 실패했습니다. (이메일/비밀번호 또는 서버 연결을 확인해 주세요.)";

      const data = err?.response?.data;
      if (typeof data === "string") {
        // 백엔드가 문자열만 반환하는 경우
        message = data;
      } else if (data?.message && typeof data.message === "string") {
        // 기본 Spring 에러 응답 또는 커스텀 응답
        message = data.message;
      }

      setGlobalError(message);

      // 비밀번호만 초기화
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
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
            <img
              src={LoginIllustration}
              alt="login"
              className="login-visual-graphic"
            />
          </div>
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="login-form-area">
          <h1 className="login-title">
            로그인
            {USE_MOCK && (
              <span
                style={{
                  fontSize: "12px",
                  color: "red",
                  marginLeft: "10px",
                }}
              >
                (TEST MODE)
              </span>
            )}
          </h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label className="form-label" htmlFor="login-email">
                이메일
              </label>
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
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="login-password">
                비밀번호
              </label>
              <PasswordInput
                id="login-password"
                name="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                fullWidth
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {globalError && (
              <p className="form-error login-error">{globalError}</p>
            )}

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

            <div className="login-divider">OR</div>

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
