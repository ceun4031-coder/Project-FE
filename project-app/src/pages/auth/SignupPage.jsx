// src/pages/auth/SignupPage.jsx
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

import RegisterIllustration from "../../assets/images/login.svg";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "./components/PasswordInput";
import TodayWordCard from "../words/components/TodayWordCard";
// src/pages/auth/SignupPage.jsx
import BirthdateSelector from "./components/BirthdateSelector";


import "./SignupPage.css";
import { useSignupForm } from "./hooks/useSignupForm";

export default function SignupPage() {
  const {
    formData,
    errors,
    globalError,
    emailChecking,
    emailAvailable,
    emailCheckMessage,
    handleSubmit,
    handleChange,
    handleBlur,
    handleEmailCheck,
  } = useSignupForm();

  return (
    <main className="page-container">
      <div className="signup-card">
        <div className="signup-visual">
          <div className="signup-visual-inner">
            <TodayWordCard />
            <img
              src={RegisterIllustration}
              alt="signup illustration"
              className="signup-visual-graphic"
            />
          </div>
        </div>
        <div className="signup-form-area">
          <h1 className="signup-title">회원가입</h1>

          <form onSubmit={handleSubmit} className="signup-form">
            {/* 이메일 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="signup-email"
              >
                이메일
              </label>

              <div className="signup-email-row">
                <div className="signup-email-input">
                  <Input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}        // ✅ 추가
                    autoComplete="email"
                    fullWidth
                  />
                </div>

                <div className="signup-email-btn-wrap">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleEmailCheck}
                    disabled={
                      emailChecking ||
                      !formData.email ||
                      !!errors.email
                    }
                  >
                    {emailChecking ? "확인 중..." : "중복 확인"}
                  </Button>
                </div>
              </div>

              {errors.email && <p className="form-error">{errors.email}</p>}

              {!errors.email &&
                !emailChecking &&
                emailAvailable === true && (
                  <p className="form-success">
                    {emailCheckMessage || "사용 가능한 이메일입니다."}
                  </p>
                )}
            </div>

            {/* 비밀번호 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="signup-password"
              >
                비밀번호
              </label>
              <PasswordInput
                id="signup-password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}        // ✅ 추가
                autoComplete="new-password"
                fullWidth
              />
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="signup-password-confirm"
              >
                비밀번호 확인
              </label>
              <PasswordInput
                id="signup-password-confirm"
                name="passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onBlur={handleBlur}        // ✅ 추가
                autoComplete="new-password"
                fullWidth
              />
              {errors.passwordConfirm && (
                <p className="form-error">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* 닉네임 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="signup-nickname"
              >
                닉네임
              </label>
              <Input
                id="signup-nickname"
                type="text"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
                onBlur={handleBlur}        // ✅ 추가
                fullWidth
              />
              {errors.nickname && (
                <p className="form-error">{errors.nickname}</p>
              )}
            </div>

            {/* 이름 */}
            <div className="form-field">
              <label
                className="form-label form-label--required"
                htmlFor="signup-username"
              >
                이름
              </label>
              <Input
                id="signup-username"
                type="text"
                name="userName"
                placeholder="이름을 입력하세요"
                value={formData.userName}
                onChange={handleChange}
                onBlur={handleBlur}        // ✅ 추가
                autoComplete="name"
                fullWidth
              />
              {errors.userName && (
                <p className="form-error">{errors.userName}</p>
              )}
            </div>

      {/* 생년월일 */}
<div className="form-field">
  <label
    className="form-label form-label--required"
  >
    생년월일
  </label>

  <BirthdateSelector
    name="userBirth"
    value={formData.userBirth}
    onChange={handleChange}
    error={errors.userBirth}
  />
</div>

            {globalError && (
              <p className="form-error signup-error-global">{globalError}</p>
            )}

            <div className="signup-btn">
              <Button
                type="submit"
                variant="primary"
                size="md"
                full
                disabled={emailChecking}
              >
                {emailChecking ? "이메일 확인 중..." : "다음 단계로 →"}
              </Button>
            </div>

            <div className="signup-divider">OR</div>

            <button type="button" className="google-btn">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
              />
              구글 계정으로 가입하기
            </button>

            <p className="signup-footer-text">
              이미 계정이 있으신가요?{" "}
              <Link to="/auth/login" className="signup-link">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
