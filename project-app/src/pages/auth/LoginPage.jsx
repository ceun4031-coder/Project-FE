import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

import TodayWordCard from "../../components/common/TodayWordCard";
import LoginIllustration from "../../assets/images/login.svg";


import "../../styles/pages/login.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    saveId: false,
  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <main className="page-container">
      <div className="login-card">

        {/* 왼쪽 비주얼 영역 */}
        <div className="login-visual">
          <div className="login-visual-inner">
            {/* 오늘의 단어 카드 */}
            <TodayWordCard />

            {/* 캐릭터 일러스트 */}
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

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>아이디</label>
              <Input
                type="email"
                name="email"
                placeholder="아이디를 입력하세요"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="login-field">
              <label>비밀번호</label>
              <PasswordInput
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  name="saveId"
                  checked={formData.saveId}
                  onChange={handleChange}
                />
                아이디 저장
              </label>

              <div className="login-links">
                <Link to="/auth/find">아이디 찾기</Link>
                <span>|</span>
                <Link to="/auth/find">비밀번호 찾기</Link>
              </div>
            </div>

            <Button variant="primary" size="md" full>
              로그인
            </Button>

            <Button
              variant="secondary"
              size="md"
              full
              style={{ marginTop: "14px" }}
              onClick={() => navigate("/auth/register")}
            >
              회원가입
            </Button>

            <div className="login-divider">OR</div>

            <button type="button" className="google-btn">
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
