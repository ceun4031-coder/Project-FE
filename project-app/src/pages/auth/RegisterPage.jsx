import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

import TodayWordCard from "../../components/common/TodayWordCard";
import RegisterIllustration from "../../assets/images/login.svg";


import "../../styles/pages/register.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/auth/setup", { replace: true });
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

        {/* 오른쪽 폼 */}
        <div className="register-form-area">
          <h1 className="register-title">회원가입</h1>

          <form onSubmit={handleSubmit}>

            {/* 아이디 */}
            <div className="register-field">
              <label>아이디</label>
              <Input
                name="userId"
                placeholder="아이디를 입력하세요"
                value={formData.userId}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 이메일 */}
            <div className="register-field">
              <label>이메일</label>
              <Input
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 비밀번호 */}
            <div className="register-field">
              <label>비밀번호</label>
              <PasswordInput
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="register-field">
              <label>비밀번호 확인</label>
              <PasswordInput
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 닉네임 */}
            <div className="register-field">
              <label>닉네임</label>
              <Input
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <Button variant="primary" size="md" full>
              회원가입
            </Button>

            <Button
              variant="secondary"
              size="md"
              full
              style={{ marginTop: "14px" }}
              onClick={() => navigate("/auth/login")}
            >
              로그인 하러가기
            </Button>

            <div className="register-divider">OR</div>

            <button type="button" className="google-btn">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
              />
              구글 계정으로 가입하기
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
