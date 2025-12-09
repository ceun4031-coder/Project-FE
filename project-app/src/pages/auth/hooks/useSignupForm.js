// src/pages/auth/hooks/useSignupForm.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailDuplicate } from "../../../api/authApi";

export function useSignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    userName: "",
    userBirth: "",
  });

  const [globalError, setGlobalError] = useState("");

  // 이메일 중복 상태
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // true / false / null
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [hasEmailChecked, setHasEmailChecked] = useState(false); // 버튼 눌렀는지 여부

  // 단일 필드 검증 (형식/필수 위주)
  const validateField = (name, value, allValues = formData) => {
    const trimmed = typeof value === "string" ? value.trim() : value;

    switch (name) {
      case "email":
        if (!trimmed) return "이메일을 입력해 주세요.";
        if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
          return "이메일 형식이 올바르지 않습니다.";
        }
        return "";

      case "password":
        if (!trimmed) return "비밀번호를 입력해 주세요.";
        if (trimmed.length < 4) {
          return "비밀번호는 4자 이상이어야 합니다.";
        }
        return "";

      case "passwordConfirm":
        if (!trimmed) return "비밀번호를 한 번 더 입력해 주세요.";
        if (trimmed !== allValues.password) {
          return "비밀번호가 서로 일치하지 않습니다.";
        }
        return "";

      case "nickname":
        if (!trimmed) return "닉네임을 입력해 주세요.";
        if (trimmed.length > 100) {
          return "닉네임은 100자 이내로 입력해 주세요.";
        }
        return "";

      case "userName":
        if (!trimmed) return "이름을 입력해 주세요.";
        if (trimmed.length > 50) {
          return "이름은 50자 이내로 입력해 주세요.";
        }
        return "";

      case "userBirth":
        if (!trimmed) return "생년월일을 입력해 주세요.";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 해당 필드 에러 제거
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setGlobalError("");

    // 이메일이 바뀌면 중복 체크 상태 초기화
    if (name === "email") {
      setEmailAvailable(null);
      setEmailCheckMessage("");
      setHasEmailChecked(false);
    }
  };

  // 포커스 아웃 시 필드 단위 검증
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!name) return;

    // blur 시점의 값 포함해서 검증
    const allValues = { ...formData, [name]: value };
    const message = validateField(name, value, allValues);

    setErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  // 이메일 중복 확인 버튼 클릭 시
  const handleEmailCheck = async () => {
    const email = formData.email.trim();

    // 기본 형식 검증 먼저
    const baseError = validateField("email", email, formData);
    if (baseError) {
      setErrors((prev) => ({
        ...prev,
        email: baseError,
      }));
      setEmailAvailable(null);
      setEmailCheckMessage("");
      setHasEmailChecked(false);
      return;
    }

    setEmailChecking(true);
    setGlobalError("");
    setEmailCheckMessage("");
    setHasEmailChecked(false);

    try {
      // Backend 명세: { exists: boolean, message: string }
      const { exists, message } = (await checkEmailDuplicate(email)) || {};

      if (exists) {
        setErrors((prev) => ({
          ...prev,
          email: message || "이미 사용 중인 이메일입니다.",
        }));
        setEmailAvailable(false);
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "",
        }));
        setEmailAvailable(true);
        setEmailCheckMessage(message || "사용 가능한 이메일입니다.");
      }

      setHasEmailChecked(true);
    } catch (err) {
      console.error("이메일 중복 확인 실패:", err);
      setGlobalError(
        "이메일 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
      setEmailAvailable(null);
      setHasEmailChecked(false);
    } finally {
      setEmailChecking(false);
    }
  };

  // 전체 검증 (제출 시)
  const validateAll = () => {
    const nextErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      userName: "",
      userBirth: "",
    };

    // 필드별 기본 규칙
    Object.keys(nextErrors).forEach((name) => {
      const key = name; // string
      const value = formData[key] ?? "";
      nextErrors[key] = validateField(key, value, formData);
    });

    // 이메일 중복 확인 여부 / 결과
    if (!nextErrors.email) {
      if (!hasEmailChecked) {
        nextErrors.email = "이메일 중복 확인을 완료해 주세요.";
      } else if (emailAvailable === false) {
        nextErrors.email = "이미 사용 중인 이메일입니다.";
      }
    }

    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError("");

    if (emailChecking) {
      setGlobalError("이메일 중복 확인이 끝난 후 다시 시도해 주세요.");
      return;
    }

    if (!validateAll()) return;

    navigate("/auth/setup", {
      state: {
        basicInfo: {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          userName: formData.userName,
          userBirth: formData.userBirth,
        },
      },
    });
  };

  return {
    formData,
    errors,
    globalError,
    emailChecking,
    emailAvailable,
    emailCheckMessage,
    handleSubmit,
    handleChange,
    handleBlur,
    handleEmailCheck,
  };
}
