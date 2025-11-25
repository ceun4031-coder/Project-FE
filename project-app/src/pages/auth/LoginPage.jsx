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

const SAVE_ID_KEY = "storylex_login_id";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    password: "",
    saveId: false,
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 아이디 저장 값 복원
  useEffect(() => {
    const savedId = localStorage.getItem(SAVE_ID_KEY);
    if (savedId) {
      setFormData((prev) => ({
        ...prev,
        id: savedId,
        saveId: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.id || !formData.password) {
      setError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await login({
        id: formData.id,
        password: formData.password,
      });

      // 아이디 저장 처리
      if (formData.saveId) {
        localStorage.setItem(SAVE_ID_KEY, formData.id);
      } else {
        localStorage.removeItem(SAVE_ID_KEY);
      }

      // 로그인 성공 후 이동
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해 주세요.";
      setError(message);
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
            {/* 아이디 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="login-id"
              >
                아이디
              </label>
              <Input
                id="login-id"
                type="text"
                name="id"
                placeholder="아이디를 입력하세요"
                value={formData.id}
                onChange={handleChange}
                autoComplete="username"
                fullWidth
              />
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
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="form-error login-error">
                {error}
              </p>
            )}

            {/* 아이디 저장 / 찾기 */}
            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  name="saveId"
                  checked={formData.saveId}
                  onChange={handleChange}
                />
                <span>아이디 저장</span>
              </label>

              <div className="login-links">
                <Link to="/api/auth/find" className="login-link">
                  아이디 찾기
                </Link>
                <span className="login-links-divider">|</span>
                <Link to="/api/auth/find" className="login-link">
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

            {/* 회원가입 버튼 */}
            <div className="signup-btn">
              <Button
                type="button"
                variant="secondary"
                size="md"
                full
                onClick={() => navigate("/api/auth/signup")}
                disabled={submitting}
              >
                회원가입
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
          </form>
        </div>
      </div>
    </main>
  );
}
