// src/pages/auth/RegisterPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";
import TodayWordCard from './../../components/common/TodayWordCard';
import RegisterIllustration from "../../assets/images/login.svg";

import "../../styles/pages/register.css";
import { register as registerApi } from "../../api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
    preference: "",
    goal: "",
    dailyWordGoal: 20, // DAILY_WORD_GOAL 기본값 20
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
    dailyWordGoal: "",
  });

  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "dailyWordGoal" ? value.replace(/[^0-9]/g, "") : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setGlobalError("");
  };

  // 클라이언트 유효성 검사
  const validate = () => {
    const nextErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      userName: "",
      userBirth: "",
      dailyWordGoal: "",
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

    // 유저 이름
    if (!formData.userName) {
      nextErrors.userName = "이름을 입력해 주세요.";
    } else if (formData.userName.length > 50) {
      nextErrors.userName = "이름은 50자 이내로 입력해 주세요.";
    }

    // 생년월일 (단순 YYYY-MM-DD 형식 체크)
    if (!formData.userBirth) {
      nextErrors.userBirth = "생년월일을 입력해 주세요.";
    }

    // 하루 목표 단어 수 (선택이지만, 값이 있으면 유효성 체크)
    if (formData.dailyWordGoal) {
      const num = Number(formData.dailyWordGoal);
      if (Number.isNaN(num) || num <= 0) {
        nextErrors.dailyWordGoal = "하루 목표 단어 수는 1 이상의 숫자로 입력해 주세요.";
      }
    }

    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     navigate("/auth/setup", { replace: true });

    setGlobalError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      // DB 스키마에 맞춘 필드 전송 (DTO는 백엔드와 맞춰서 수정 필요)
      await registerApi({
        email: formData.email,                 // EMAIL
        password: formData.password,          // USER_PW
        nickname: formData.nickname,          // NICKNAME
        userName: formData.userName,          // USER_NAME
        userBirth: formData.userBirth,        // USER_BIRTH (예: "1990-01-01")
        preference: formData.preference || null, // PREFERENCE (선호 분야)
        goal: formData.goal || null,             // GOAL (학습 목표)
        dailyWordGoal: formData.dailyWordGoal
          ? Number(formData.dailyWordGoal)
          : undefined, // DAILY_WORD_GOAL (없으면 기본값 20 사용)
      });

      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "회원가입에 실패했습니다. 입력값을 다시 확인해 주세요.";
      setGlobalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-container">
      <div className="register-card">
        {/* 왼쪽 비주얼 */}
        <div className="register-visual">
          <div className="register-visual-inner">
            <TodayWordCard />

            <img
              src={RegisterIllustration}
              alt="register illustration"
              className="register-visual-graphic"
            />
          </div>
        </div>

        {/* 오른쪽 회원가입 폼 */}
        <div className="register-form-area">
          <h1 className="register-title">회원가입</h1>

          <form onSubmit={handleSubmit} className="register-form">
            {/* 이메일 */}
            <div className="register-field">
              <label className="register-label">이메일</label>
              <Input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                fullWidth
              />
              {errors.email && <p className="register-error">{errors.email}</p>}
            </div>

            {/* 비밀번호 */}
            <div className="register-field">
              <label className="register-label">비밀번호</label>
              <PasswordInput
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                fullWidth
              />
              {errors.password && (
                <p className="register-error">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="register-field">
              <label className="register-label">비밀번호 확인</label>
              <PasswordInput
                name="passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
                fullWidth
              />
              {errors.passwordConfirm && (
                <p className="register-error">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* 닉네임 */}
            <div className="register-field">
              <label className="register-label">닉네임</label>
              <Input
                type="text"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
                fullWidth
              />
              {errors.nickname && (
                <p className="register-error">{errors.nickname}</p>
              )}
            </div>

            {/* 이름 */}
            <div className="register-field">
              <label className="register-label">이름</label>
              <Input
                type="text"
                name="userName"
                placeholder="이름을 입력하세요"
                value={formData.userName}
                onChange={handleChange}
                autoComplete="name"
                fullWidth
              />
              {errors.userName && (
                <p className="register-error">{errors.userName}</p>
              )}
            </div>

            {/* 생년월일 */}
            <div className="register-field">
              <label className="register-label">생년월일</label>
              <Input
                type="date"
                name="userBirth"
                placeholder="생년월일을 입력하세요"
                value={formData.userBirth}
                onChange={handleChange}
                autoComplete="bday"
                fullWidth
              />
              {errors.userBirth && (
                <p className="register-error">{errors.userBirth}</p>
              )}
            </div>

            {/* 선호 분야 (옵션) */}
            <div className="register-field">
              <label className="register-label">선호 분야 (선택)</label>
              <Input
                type="text"
                name="preference"
                placeholder="예: 비즈니스 영어, 여행 영어 등"
                value={formData.preference}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 학습 목표 (옵션) */}
            <div className="register-field">
              <label className="register-label">학습 목표 (선택)</label>
              <Input
                type="text"
                name="goal"
                placeholder="예: 취업 준비, 해외 여행, 발표 준비 등"
                value={formData.goal}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 하루 목표 단어 수 (옵션, 숫자) */}
            <div className="register-field">
              <label className="register-label">하루 목표 단어 수 (선택)</label>
              <Input
                type="number"
                name="dailyWordGoal"
                placeholder="기본값 20"
                value={formData.dailyWordGoal}
                onChange={handleChange}
                fullWidth
              />
              {errors.dailyWordGoal && (
                <p className="register-error">{errors.dailyWordGoal}</p>
              )}
            </div>

            {/* 전역 에러 메시지 */}
            {globalError && (
              <p className="register-error register-error-global">
                {globalError}
              </p>
            )}

            {/* 회원가입 버튼 */}
            <div className="register-btn">
              <Button
                type="submit"
                variant="primary"
                size="md"
                full
                disabled={submitting}
              >
                {submitting ? "가입 처리 중..." : "회원가입"}
              </Button>
            </div>

            {/* OR 구분선 */}
            <div className="register-divider">OR</div>

            {/* 구글 로그인 (미연동 상태 가정) */}
            <button
              type="button"
              className="google-btn"
              disabled={submitting}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
              />
              구글 계정으로 가입하기
            </button>

            <p className="register-footer-text">
              이미 계정이 있으신가요?{" "}
              <Link to="/auth/login" className="register-link">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
