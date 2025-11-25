import { useState } from "react";
import { useSearchParams } from "react-router-dom"; 
import "./AccountFindPage.css";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Logo from "../../assets/images/StoryLex-logo.svg";

export default function AccountFindPage() {
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState(searchParams.get("tab") || "email");

  return (
    <main className="find-page">
      <div className="find-card-center">

        {/* 로고 영역 */}
        <div className="find-logo-wrap">
          <img src={Logo} alt="StoryLex Logo" className="find-logo-large" />
        </div>

        <h2 className="find-title">계정 찾기</h2>
        <p className="find-subtitle">가입 시 등록한 정보로 계정을 확인합니다.</p>

        {/* 탭 버튼 */}
        <div className="find-tabs-center">
          <button 
            className={tab === "email" ? "active" : ""} 
            onClick={() => setTab("email")}
          >
            이메일 찾기
          </button>
          <button 
            className={tab === "pw" ? "active" : ""} 
            onClick={() => setTab("pw")}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 1. 이메일 찾기 */}
        {tab === "email" && (
          <div className="find-content">
            <div className="find-field">
              <label>이름</label>
              <Input fullWidth placeholder="홍길동" />
            </div>

            <div className="find-field">
              <label>생년월일</label>
              <Input 
                fullWidth 
                type="text" 
                placeholder="예: 980101" 
              />
            </div>

            <Button variant="primary" size="md" full>
              이메일 찾기
            </Button>
          </div>
        )}

        {/* 2. 비밀번호 찾기 */}
        {tab === "pw" && (
          <div className="find-content">
            <div className="find-field">
              <label>이름</label> 
              <Input fullWidth placeholder="홍길동" />
            </div>

            <div className="find-field">
              <label>이메일</label>
              <Input fullWidth type="email" placeholder="example@email.com" />
            </div>

            <Button variant="primary" size="md" full>
              임시 비밀번호 발급
            </Button>
          </div>
        )}

        <div className="find-back">
          <a href="/api/auth/login">← 로그인 페이지로</a>
        </div>
      </div>
    </main>
  );
}