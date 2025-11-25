// src/pages/auth/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import PasswordInput from "../../components/common/PasswordInput";
import TodayWordCard from "../../components/common/TodayWordCard";
import RegisterIllustration from "../../assets/images/login.svg";

import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
  });

  const [globalError, setGlobalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setGlobalError("");
  };

  // 1단계: 기본 정보만 유효성 검사
  const validate = () => {
    const nextErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      userName: "",
      userBirth: "",
    };

    // 이메일
    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    // 비밀번호
    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호를 한 번 더 입력해 주세요.";
    } else if (formData.password !== formData.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호가 서로 일치하지 않습니다.";
    }

    // 닉네임
    if (!formData.nickname) {
      nextErrors.nickname = "닉네임을 입력해 주세요.";
    } else if (formData.nickname.length > 100) {
      nextErrors.nickname = "닉네임은 100자 이내로 입력해 주세요.";
    }

    // 이름
    if (!formData.userName) {
      nextErrors.userName = "이름을 입력해 주세요.";
    } else if (formData.userName.length > 50) {
      nextErrors.userName = "이름은 50자 이내로 입력해 주세요.";
    }

    // 생년월일
    if (!formData.userBirth) {
      nextErrors.userBirth = "생년월일을 입력해 주세요.";
    }

    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;

    // 유효성 통과 → setup 페이지로 기본 정보 전달
    navigate("/auth/setup", {
      state: {
        basicInfo: {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          userName: formData.userName,
          userBirth: formData.userBirth,
        },
      },
    });
  };

  return (
    <main className="page-container">
      <div className="signup-card">
        {/* 왼쪽 비주얼 */}
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

        {/* 오른쪽 회원가입 폼 */}
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
              <Input
                id="signup-email"
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
                htmlFor="signup-birth"
              >
                생년월일
              </label>

              <Input
                id="signup-birth"
                type="date"
                name="userBirth"
                placeholder="년-월-일"
                value={formData.userBirth}
                onChange={handleChange}
                autoComplete="bday"
                fullWidth
                leftIcon={<Calendar size={18} />}
              />

              {errors.userBirth && (
                <p className="form-error">{errors.userBirth}</p>
              )}
            </div>


            {/* 전역 에러 메시지 */}
            {globalError && (
              <p className="form-error signup-error-global">{globalError}</p>
            )}

            {/* 다음 버튼 */}
            <div className="signup-btn">
              <Button type="submit" variant="primary" size="md" full>
                다음 단계로 →
              </Button>
            </div>

            {/* OR 구분선 */}
            <div className="signup-divider">OR</div>

            {/* 구글 회원가입 버튼 */}
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