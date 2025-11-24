import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

import "../../styles/pages/login.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    saveId: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 정보:", formData);
    navigate("/");
  };

  return (
    <main className="page-container">
      <div className="login-card">

        {/* 왼쪽 비주얼 영역 */}
        <div className="login-visual">
          <div className="login-visual-inner">
            {/* 이미지 대신 비워둠 */}
          </div>
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="login-form-area">
          <h1 className="login-title">로그인</h1>

          <form onSubmit={handleSubmit}>
            {/* 아이디 */}
            <div className="login-field">
              <label>아이디</label>
              <Input
                type="text"
                name="email"
                placeholder="아이디를 입력하세요"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 비밀번호 */}
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

            {/* 아이디 저장 / 찾기 */}
            <div className="login-options">
              <label style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  type="checkbox"
                  name="saveId"
                  checked={formData.saveId}
                  onChange={handleChange}
                />
                아이디 저장
              </label>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <Link to="/auth/find" style={{ color: "var(--primary-500)" }}>
                아이디 찾기
              </Link>
              <span style={{ color: "var(--neutral-500)" }}>|</span>
              <Link to="/auth/find" style={{ color: "var(--primary-500)" }}>
                비밀번호 찾기
              </Link>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <div className="login-btn">
              <Button variant="primary" size="md" full>
                로그인
              </Button>
            </div>

            {/* 회원가입 버튼 */}
            <div className="signup-btn">
              <Button
                variant="secondary"
                size="md"
                full
                onClick={() => navigate("/auth/register")}
              >
                회원가입
              </Button>
            </div>

            {/* OR 구분 */}
            <div className="login-divider">OR</div>

            {/* 구글 로그인 */}
            <button type="button" className="google-btn">
              {/* 구글 아이콘은 임시 텍스트로 대체 가능 */}
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
