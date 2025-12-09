// src/pages/auth/hooks/useAccountFindPage.js
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { findEmail, resetPassword } from "@/api/authApi";

export function useAccountFindForm() {
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
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("tab", nextTab);
      return params;
    });
  };

  // 이메일 찾기
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
      // { userName, userBirth }
      const { email } = await findEmail({
        userName: name,
        userBirth: birth,
      });

      alert(`회원님의 이메일은 ${email} 입니다.`);
    } catch (error) {
      console.error("이메일 찾기 실패:", error);
      const message =
        error?.response?.data?.message ||
        "일치하는 정보를 찾을 수 없습니다.";
      alert(message);
    }
  };

  // 비밀번호 재설정 (임시 비밀번호 발급)
  const handleResetPassword = async () => {
    const name = resetName.trim();
    const email = resetEmail.trim();

    if (!name || !email) {
      alert("이름과 이메일을 입력해주세요.");
      return;
    }

    try {
      // { userName, email }
      const { message } = await resetPassword({
        userName: name,
        email,
      });

      alert(
        message ||
          "임시 비밀번호가 이메일로 발송되었습니다. 로그인 페이지로 이동합니다."
      );
      navigate("/auth/login");
    } catch (error) {
      console.error("비밀번호 재설정 실패:", error);
      const message =
        error?.response?.data?.message ||
        "정보가 일치하지 않거나 오류가 발생했습니다.";
      alert(message);
    }
  };

  const handleGoLogin = () => {
    navigate("/auth/login");
  };

  return {
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
  };
}
