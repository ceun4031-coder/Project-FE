import { useState } from "react";
import { Link } from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

import TodayWordCard from "../../components/common/TodayWordCard";
import Illustration from "../../assets/images/login.svg";


import "../../styles/pages/accountFind.css";

export default function AccountFindPage() {
  const [tab, setTab] = useState("id");

  return (
    <main className="page-container">
      <div className="find-card">

        {/* 왼쪽 비주얼 */}
        <div className="find-visual">
          <div className="find-visual-inner">
            <TodayWordCard />

            <img
              src={Illustration}
              alt="illustration"
              className="find-visual-graphic"
            />
          </div>
        </div>

        {/* 오른쪽 내용 */}
        <div className="find-form-area">
          <h1 className="find-title">계정 찾기</h1>

          {/* 탭 */}
          <div className="find-tabs">
            <div
              className={`find-tab ${tab === "id" ? "active" : ""}`}
              onClick={() => setTab("id")}
            >
              아이디 찾기
            </div>
            <div
              className={`find-tab ${tab === "pw" ? "active" : ""}`}
              onClick={() => setTab("pw")}
            >
              비밀번호 찾기
            </div>

            {/* 슬라이드 배경 */}
            <div
              className="find-tab-bg"
              style={{
                transform:
                  tab === "id"
                    ? "translateX(0)"
                    : "translateX(100%)",
              }}
            />
          </div>

          {/* ---------- 아이디 찾기 ---------- */}
          {tab === "id" && (
            <div className="find-fields">
              <div className="find-field">
                <label>이름</label>
                <Input placeholder="홍길동" fullWidth />
              </div>

              <div className="find-field">
                <label>이메일</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  fullWidth
                />
              </div>

              <Button variant="primary" size="md" full>
                아이디 찾기
              </Button>
            </div>
          )}

          {/* ---------- 비밀번호 찾기 ---------- */}
          {tab === "pw" && (
            <div className="find-fields">
              <div className="find-field">
                <label>아이디</label>
                <Input placeholder="아이디 입력" fullWidth />
              </div>

              <div className="find-field">
                <label>이메일</label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  fullWidth
                />
              </div>

              <Button variant="primary" size="md" full>
                비밀번호 재설정 메일 보내기
              </Button>
            </div>
          )}

          <div className="find-back">
            <Link to="/auth/login">로그인으로 돌아가기</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
