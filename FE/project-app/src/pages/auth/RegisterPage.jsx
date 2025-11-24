import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "../../styles/login.css";
import Button from "../../components/common/Button";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    navigate("/auth/login");
  };

  return (
    <main className="login-container">
      
      {/* Left Illustration - URL 이미지 사용 */}
      <div className="login-left">
        <img
          src="https://i.ibb.co/yN0m6W6/login-illust.png"
          alt="register"
          className="login-illust"
        />
      </div>

      <div className="login-right">
        <h1 className="login-title">회원가입</h1>

        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="form-group">
            <label>닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>

          <Button variant="primary" size="lg" full>
            회원가입
          </Button>

          <Button
            variant="secondary"
            size="lg"
            full
            onClick={() => navigate("/auth/login")}
            style={{ marginTop: "12px" }}
          >
            로그인 하러 가기
          </Button>

          <div className="divider"><span>OR</span></div>

          <button className="google-btn">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" />
            구글 계정으로 회원가입
          </button>

        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
