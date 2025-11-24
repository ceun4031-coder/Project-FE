import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import "../../styles/login.css";
import Button from "../../components/common/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id: "", password: "", saveId: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <main className="login-container">
      {/* Left Illustration Section */}
      <div className="login-left">
        <img
          src="/mnt/data/8e4bccf7-df16-4ac7-9514-73029813853e.png"
          alt="login"
          className="login-illust"
        />
      </div>

      {/* Right Form Section */}
      <div className="login-right">
        <h1 className="login-title">로그인</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="login-options">
            <label className="checkbox">
              <input
                type="checkbox"
                name="saveId"
                checked={formData.saveId}
                onChange={handleChange}
              />
              아이디 저장
            </label>

            <div className="login-links">
              <a href="#">아이디 찾기</a> | <a href="#">비밀번호 찾기</a>
            </div>
          </div>

          <Button variant="primary" size="lg" full>
            로그인
          </Button>

          <Button
            variant="secondary"
            size="lg"
            full
            onClick={() => navigate("/auth/register")}
            style={{ marginTop: "12px" }}
          >
            회원가입
          </Button>

          <div className="divider"><span>OR</span></div>

          <button className="google-btn">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" />
            구글 계정으로 로그인
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
