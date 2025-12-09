// src/pages/auth/AccountFindPage.jsx
import "./AccountFindPage.css";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Logo from "@/assets/images/StoryLex-logo.svg";
import { useAccountFindForm } from "./hooks/useAccountFindForm";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function AccountFindPage() {
  const {
    tab,
    handleChangeTab,
    findName,
    findBirth,
    resetName,
    resetEmail,
    setFindName,
    setFindBirth,
    setResetName,
    setResetEmail,
    handleFindEmail,
    handleResetPassword,
    handleGoLogin,
  } = useAccountFindForm();

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

            <Button variant="primary" size="md" full onClick={handleFindEmail}>
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
            onClick={handleGoLogin}
            className="find-back-link"
          >
            ← 로그인 페이지로
          </button>
        </div>

        {USE_MOCK && (
          <p className="find-mock-hint">
            (현재 MOCK 모드에서는 테스트용 응답이 반환됩니다)
          </p>
        )}
      </div>
    </main>
  );
}
