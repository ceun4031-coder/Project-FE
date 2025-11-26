// src/pages/AccountFindPage/AccountFindPage.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./AccountFindPage.css";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Logo from "../../assets/images/StoryLex-logo.svg";
import { findEmail, resetPassword } from "../../api/authApi";

export default function AccountFindPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 기준으로 탭 결정 (기본값 email)
  const tab = searchParams.get("tab") === "pw" ? "pw" : "email";

  // 이메일 찾기 입력값
  const [findName, setFindName] = useState("");
  const [findBirth, setFindBirth] = useState("");

  // 비밀번호 찾기 입력값
  const [resetName, setResetName] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const handleChangeTab = (nextTab) => {
    // 다른 쿼리파라미터 보존하려면 함수형으로 처리
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("tab", nextTab);
      return params;
    });
  };

  /**
   * 이메일 찾기
   */
  const handleFindEmail = async () => {
    const name = findName.trim();
    const birth = findBirth.trim();

    if (!name || !birth) {
      alert("이름과 생년월일을 입력해주세요.");
      return;
    }

    const birthRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthRegex.test(birth)) {
      alert("생년월일을 YYYY-MM-DD 형식으로 입력해주세요. (예: 2000-01-01)");
      return;
    }

    try {
      const { email } = await findEmail(name, birth);
      alert(`회원님의 이메일은 ${email} 입니다.`);
    } catch (error) {
      console.error(error);
      alert("일치하는 정보를 찾을 수 없습니다.");
    }
  };

  /**
   * 비밀번호 재설정
   */
  const handleResetPassword = async () => {
    const name = resetName.trim();
    const email = resetEmail.trim();

    if (!name || !email) {
      alert("이름과 이메일을 입력해주세요.");
      return;
    }

    try {
      const { message } = await resetPassword(name, email);
      alert(message || "임시 비밀번호가 이메일로 발송되었습니다.");
      navigate("/auth/login");
    } catch (error) {
      console.error(error);
      alert("정보가 일치하지 않거나 오류가 발생했습니다.");
    }
  };

  return (
    <main className="find-page">
      <div className="find-card-center">
        {/* 로고 */}
        <div className="find-logo-wrap">
          <img src={Logo} alt="StoryLex Logo" className="find-logo-large" />
        </div>

        <h2 className="find-title">계정 찾기</h2>
        <p className="find-subtitle">
          가입 시 등록한 정보로 계정을 확인합니다.
        </p>

        {/* 탭 */}
        <div className="find-tabs-center">
          <button
            className={tab === "email" ? "active" : ""}
            type="button"
            onClick={() => handleChangeTab("email")}
          >
            이메일 찾기
          </button>
          <button
            className={tab === "pw" ? "active" : ""}
            type="button"
            onClick={() => handleChangeTab("pw")}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 이메일 찾기 */}
        {tab === "email" && (
          <div className="find-content">
            <div className="find-field">
              <label>이름</label>
              <Input
                fullWidth
                placeholder="홍길동"
                value={findName}
                onChange={(e) => setFindName(e.target.value)}
              />
            </div>

            <div className="find-field">
              <label>생년월일</label>
              <Input
                fullWidth
                type="text"
                placeholder="예: 2000-01-01"
                value={findBirth}
                onChange={(e) => setFindBirth(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              size="md"
              full
              onClick={handleFindEmail}
            >
              이메일 찾기
            </Button>
          </div>
        )}

        {/* 비밀번호 찾기 */}
        {tab === "pw" && (
          <div className="find-content">
            <div className="find-field">
              <label>이름</label>
              <Input
                fullWidth
                placeholder="홍길동"
                value={resetName}
                onChange={(e) => setResetName(e.target.value)}
              />
            </div>

            <div className="find-field">
              <label>이메일</label>
              <Input
                fullWidth
                type="email"
                placeholder="example@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              size="md"
              full
              onClick={handleResetPassword}
            >
              임시 비밀번호 발급
            </Button>
          </div>
        )}

        <div className="find-back">
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="find-back-link"
          >
            ← 로그인 페이지로
          </button>
        </div>
      </div>
    </main>
  );
}
