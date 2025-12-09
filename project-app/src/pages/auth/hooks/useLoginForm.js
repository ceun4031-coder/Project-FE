// src/pages/auth/hooks/useLoginForm.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const SAVE_EMAIL_KEY = "storylex_login_email";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext.login 사용

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    saveEmail: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 저장된 이메일 자동 세팅
  useEffect(() => {
    const savedEmail = localStorage.getItem(SAVE_EMAIL_KEY);
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        saveEmail: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "email" || name === "password") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setGlobalError("");
  };

  const validate = () => {
    const nextErrors = { email: "", password: "" };

    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some((msg) => !!msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      // AuthContext.login(email, password)
      await login(formData.email, formData.password);

      if (formData.saveEmail) {
        localStorage.setItem(SAVE_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(SAVE_EMAIL_KEY);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("로그인 실패:", err);

      let message =
        "로그인에 실패했습니다. (이메일/비밀번호 또는 서버 연결을 확인해 주세요.)";

      const data = err?.response?.data;
      if (typeof data === "string") {
        message = data;
      } else if (data?.message && typeof data.message === "string") {
        message = data.message;
      }

      setGlobalError(message);

      // 비밀번호만 초기화
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    globalError,
    submitting,
    handleChange,
    handleSubmit,
  };
}
