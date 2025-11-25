import { useState } from "react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import "./AccountFindPage.css";

export default function AccountFindPage() {
  const [tab, setTab] = useState("id"); // id 또는 pw

  return (
    <main className="page-container">
      <div className="account-card">

        {/* 왼쪽 비주얼 */}
        <div className="account-visual">
          <div className="account-visual-inner"></div>
        </div>

        {/* 오른쪽 폼 */}
        <div className="account-form-area">

          <h1 className="account-title">계정 찾기</h1>

          {/* 탭 */}
          <div className="account-tabs">
            <div
              className="account-tab-bg"
              style={{
                transform:
                  tab === "id"
                    ? "translateX(0)"
                    : "translateX(100%) translateX(12px)",
              }}
            ></div>

            <div
              className={`account-tab ${tab === "id" ? "active" : ""}`}
              onClick={() => setTab("id")}
            >
              아이디 찾기
            </div>

            <div
              className={`account-tab ${tab === "pw" ? "active" : ""}`}
              onClick={() => setTab("pw")}
            >
              비밀번호 찾기
            </div>
          </div>

          {/* 아이디 찾기 폼 */}
          {tab === "id" && (
            <div>
              <div className="account-field">
                <label>이름</label>
                <Input placeholder="홍길동" fullWidth />
              </div>

              <div className="account-field">
                <label>이메일</label>
                <Input type="email" placeholder="example@email.com" fullWidth />
              </div>

              <Button variant="primary" size="md" full>
                아이디 찾기
              </Button>
            </div>
          )}

          {/* 비밀번호 찾기 폼 */}
          {tab === "pw" && (
            <div>
              <div className="account-field">
                <label>아이디</label>
                <Input placeholder="user_id" fullWidth />
              </div>

              <div className="account-field">
                <label>이메일</label>
                <Input type="email" placeholder="example@email.com" fullWidth />
              </div>

              <Button variant="primary" size="md" full>
                비밀번호 재설정 링크 받기
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
