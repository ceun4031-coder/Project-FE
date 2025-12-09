// src/pages/auth/hooks/useSignupForm.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailDuplicate } from "../../../api/authApi"; // alias 쓰면 "@/api/authApi"

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
  const [emailAvailable, setEmailAvailable] = useState(null); // null | true | false

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
    setGlobalError("");

    if (name === "email") {
      // 이메일 수정하면 중복 결과 초기화
      setEmailAvailable(null);
    }
  };

  // 이메일 입력값 변경 시 디바운스로 자동 중복 체크
  useEffect(() => {
    const email = formData.email.trim();

    // 비어 있거나 형식이 잘못된 경우 → 중복 체크 안 함
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailChecking(false);
      setEmailAvailable(null);
      return;
    }

    let canceled = false;

    setEmailChecking(true);
    setEmailAvailable(null);

    const timer = setTimeout(async () => {
      try {
        const { duplicated } = await checkEmailDuplicate(email);
        if (canceled) return;

        if (duplicated) {
          setErrors((prev) => ({
            ...prev,
            email: "이미 사용 중인 이메일입니다.",
          }));
          setEmailAvailable(false);
        } else {
          setEmailAvailable(true);
        }
      } catch (err) {
        if (canceled) return;
        console.error("이메일 중복 확인 실패:", err);
        setGlobalError(
          "이메일 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        );
        setEmailAvailable(null);
      } finally {
        if (!canceled) {
          setEmailChecking(false);
        }
      }
    }, 400); // 입력 멈춘 후 400ms 뒤에 중복 체크

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [formData.email]);

  const validate = () => {
    const nextErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      userName: "",
      userBirth: "",
    };

    // 이메일
    if (!formData.email) {
      nextErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    } else if (emailAvailable === false) {
      // 중복으로 판정된 경우
      nextErrors.email = "이미 사용 중인 이메일입니다.";
    }

    // 비밀번호
    if (!formData.password) {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    } else if (formData.password.length < 4) {
      nextErrors.password = "비밀번호는 4자 이상이어야 합니다.";
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호를 한 번 더 입력해 주세요.";
    } else if (formData.password !== formData.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호가 서로 일치하지 않습니다.";
    }

    // 닉네임
    if (!formData.nickname) {
      nextErrors.nickname = "닉네임을 입력해 주세요.";
    } else if (formData.nickname.length > 100) {
      nextErrors.nickname = "닉네임은 100자 이내로 입력해 주세요.";
    }

    // 이름
    if (!formData.userName) {
      nextErrors.userName = "이름을 입력해 주세요.";
    } else if (formData.userName.length > 50) {
      nextErrors.userName = "이름은 50자 이내로 입력해 주세요.";
    }

    // 생년월일
    if (!formData.userBirth) {
      nextErrors.userBirth = "생년월일을 입력해 주세요.";
    }

    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((msg) => !!msg);
    return !hasError;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGlobalError("");

    // 아직 이메일 중복 체크 중이면 제출 막기
    if (emailChecking) {
      setGlobalError("이메일 중복 확인이 끝난 후 다시 시도해 주세요.");
      return;
    }

    if (!validate()) return;

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
    handleSubmit,
    handleChange,
  };
}
