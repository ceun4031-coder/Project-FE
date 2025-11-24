import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

import "../../styles/pages/register.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다");
      return;
    }

    console.log("회원가입 데이터:", formData);
    navigate("/auth/login");
  };

  return (
    <main className="page-container">
      <div className="register-card">

        {/* 왼쪽 일러스트 영역 */}
        <div className="register-visual">
          <div className="register-visual-inner">
            {/* 이미지 비워 둠 */}
          </div>
        </div>

        {/* 오른쪽 회원가입 폼 */}
        <div className="register-form-area">
          <h1 className="register-title">회원가입</h1>

          <form onSubmit={handleSubmit}>

            {/* 이메일 */}
            <div className="register-field">
              <label>아이디(이메일)</label>
              <Input
                type="email"
                name="email"
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
                name="passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 닉네임 */}
            <div className="register-field">
              <label>닉네임</label>
              <Input
                type="text"
                name="nickname"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={handleChange}
                fullWidth
              />
            </div>

            {/* 회원가입 버튼 */}
            <div className="register-btn">
              <Button variant="primary" size="md" full>
                회원가입
              </Button>
            </div>

            {/* 로그인 버튼 */}
            <div className="login-move-btn">
              <Button
                variant="secondary"
                size="md"
                full
                onClick={() => navigate("/auth/login")}
              >
                로그인 하러가기
              </Button>
            </div>

            {/* OR 구분선 */}
            <div className="register-divider">OR</div>

            {/* 구글 로그인 */}
            <button type="button" className="google-btn">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" />
              구글 계정으로 가입하기
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
