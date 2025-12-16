// src/pages/auth/hooks/useSignupForm.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmailDuplicate, checkNicknameDuplicate } from "../../../api/authApi";

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
  const [hasEmailChecked, setHasEmailChecked] = useState(false);
  const [checkedEmailValue, setCheckedEmailValue] = useState("");

  // 닉네임 중복 상태
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null); // true / false / null
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [hasNicknameChecked, setHasNicknameChecked] = useState(false);
  const [checkedNicknameValue, setCheckedNicknameValue] = useState("");

  // 단일 필드 검증 (형식/필수 위주)
  const validateField = (name, value, allValues = formData) => {
    const trimmed = typeof value === "string" ? value.trim() : value;

    switch (name) {
      case "email":
        if (!trimmed) return "이메일을 입력해 주세요.";
        if (!/^\S+@\S+\.\S+$/.test(trimmed)) return "이메일 형식이 올바르지 않습니다.";
        return "";

      case "password":
        if (!trimmed) return "비밀번호를 입력해 주세요.";
        if (trimmed.length < 4) return "비밀번호는 4자 이상이어야 합니다.";
        return "";

      case "passwordConfirm":
        if (!trimmed) return "비밀번호를 한 번 더 입력해 주세요.";
        if (trimmed !== allValues.password) return "비밀번호가 서로 일치하지 않습니다.";
        return "";

      case "nickname":
        if (!trimmed) return "닉네임을 입력해 주세요.";
        if (trimmed.length > 100) return "닉네임은 100자 이내로 입력해 주세요.";
        return "";

      case "userName":
        if (!trimmed) return "이름을 입력해 주세요.";
        if (trimmed.length > 50) return "이름은 50자 이내로 입력해 주세요.";
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

    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");

    // 이메일 변경 시 중복 체크 상태 초기화
    if (name === "email") {
      setEmailAvailable(null);
      setEmailCheckMessage("");
      setHasEmailChecked(false);
      setCheckedEmailValue("");
    }

    // 닉네임 변경 시 중복 체크 상태 초기화
    if (name === "nickname") {
      setNicknameAvailable(null);
      setNicknameCheckMessage("");
      setHasNicknameChecked(false);
      setCheckedNicknameValue("");
    }
  };

  // 포커스 아웃 시 필드 단위 검증
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!name) return;

    const allValues = { ...formData, [name]: value };
    const message = validateField(name, value, allValues);

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // 이메일 중복 확인 버튼 클릭
  const handleEmailCheck = async () => {
    const email = formData.email.trim();

    const baseError = validateField("email", email, formData);
    if (baseError) {
      setErrors((prev) => ({ ...prev, email: baseError }));
      setEmailAvailable(null);
      setEmailCheckMessage("");
      setHasEmailChecked(false);
      setCheckedEmailValue("");
      return;
    }

    setEmailChecking(true);
    setGlobalError("");
    setEmailCheckMessage("");
    setHasEmailChecked(false);

    try {
      const { exists, message } = (await checkEmailDuplicate(email)) || {};

      if (exists) {
        setErrors((prev) => ({ ...prev, email: message || "이미 사용 중인 이메일입니다." }));
        setEmailAvailable(false);
        setEmailCheckMessage("");
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
        setEmailAvailable(true);
        setEmailCheckMessage(message || "사용 가능한 이메일입니다.");
      }

      setHasEmailChecked(true);
      setCheckedEmailValue(email);
    } catch (err) {
      console.error("이메일 중복 확인 실패:", err);
      setGlobalError("이메일 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setEmailAvailable(null);
      setHasEmailChecked(false);
      setCheckedEmailValue("");
    } finally {
      setEmailChecking(false);
    }
  };

  // 닉네임 중복 확인 버튼 클릭
  const handleNicknameCheck = async () => {
    const nickname = formData.nickname.trim();

    const baseError = validateField("nickname", nickname, formData);
    if (baseError) {
      setErrors((prev) => ({ ...prev, nickname: baseError }));
      setNicknameAvailable(null);
      setNicknameCheckMessage("");
      setHasNicknameChecked(false);
      setCheckedNicknameValue("");
      return;
    }

    setNicknameChecking(true);
    setGlobalError("");
    setNicknameCheckMessage("");
    setHasNicknameChecked(false);

    try {
      const { exists, message } = (await checkNicknameDuplicate(nickname)) || {};

      if (exists) {
        setErrors((prev) => ({
          ...prev,
          nickname: message || "이미 사용 중인 닉네임입니다.",
        }));
        setNicknameAvailable(false);
        setNicknameCheckMessage("");
      } else {
        setErrors((prev) => ({ ...prev, nickname: "" }));
        setNicknameAvailable(true);
        setNicknameCheckMessage(message || "사용 가능한 닉네임입니다.");
      }

      setHasNicknameChecked(true);
      setCheckedNicknameValue(nickname);
    } catch (err) {
      console.error("닉네임 중복 확인 실패:", err);
      setGlobalError("닉네임 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setNicknameAvailable(null);
      setHasNicknameChecked(false);
      setCheckedNicknameValue("");
    } finally {
      setNicknameChecking(false);
    }
  };

  // 제출 전: 형식/필수만 검증 (중복은 submit에서 자동 수행)
  const validateAllBase = () => {
    const nextErrors = {
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      userName: "",
      userBirth: "",
    };

    Object.keys(nextErrors).forEach((name) => {
      nextErrors[name] = validateField(name, formData[name] ?? "", formData);
    });

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  // ✅ “다음 단계” 누를 때: 이메일/닉네임 중복 검사를 자동으로 수행
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (emailChecking || nicknameChecking) {
      setGlobalError("중복 확인이 끝난 후 다시 시도해 주세요.");
      return;
    }

    if (!validateAllBase()) return;

    const email = formData.email.trim();
    const nickname = formData.nickname.trim();

    // 현재 값에 대해 이미 성공 체크가 끝난 경우는 재호출 생략(원하면 always-call로 바꿔도 됨)
    const needEmailCheck = !(hasEmailChecked && checkedEmailValue === email && emailAvailable === true);
    const needNicknameCheck = !(
      hasNicknameChecked &&
      checkedNicknameValue === nickname &&
      nicknameAvailable === true
    );

    setEmailChecking(needEmailCheck);
    setNicknameChecking(needNicknameCheck);

    try {
      let emailRes = null;
      let nickRes = null;

      if (needEmailCheck || needNicknameCheck) {
        const [er, nr] = await Promise.all([
          needEmailCheck ? checkEmailDuplicate(email) : Promise.resolve(null),
          needNicknameCheck ? checkNicknameDuplicate(nickname) : Promise.resolve(null),
        ]);
        emailRes = er;
        nickRes = nr;
      }

      // 상태 갱신 (체크를 실제로 돌린 경우만)
      if (needEmailCheck) {
        const exists = !!emailRes?.exists;
        const message = emailRes?.message;

        setHasEmailChecked(true);
        setCheckedEmailValue(email);

        if (exists) {
          setEmailAvailable(false);
          setEmailCheckMessage("");
          setErrors((prev) => ({ ...prev, email: message || "이미 사용 중인 이메일입니다." }));
        } else {
          setEmailAvailable(true);
          setEmailCheckMessage(message || "사용 가능한 이메일입니다.");
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      }

      if (needNicknameCheck) {
        const exists = !!nickRes?.exists;
        const message = nickRes?.message;

        setHasNicknameChecked(true);
        setCheckedNicknameValue(nickname);

        if (exists) {
          setNicknameAvailable(false);
          setNicknameCheckMessage("");
          setErrors((prev) => ({
            ...prev,
            nickname: message || "이미 사용 중인 닉네임입니다.",
          }));
        } else {
          setNicknameAvailable(true);
          setNicknameCheckMessage(message || "사용 가능한 닉네임입니다.");
          setErrors((prev) => ({ ...prev, nickname: "" }));
        }
      }

      // 최종 통과 여부 판정
      const finalEmailOk =
        (needEmailCheck ? emailRes?.exists !== true : emailAvailable === true) &&
        !errors.email;

      const finalNicknameOk =
        (needNicknameCheck ? nickRes?.exists !== true : nicknameAvailable === true) &&
        !errors.nickname;

      // errors는 setState 비동기라, 여기서는 “중복 결과” 기준으로만 확정 판단
      const emailOk = needEmailCheck ? emailRes?.exists !== true : emailAvailable === true;
      const nicknameOk = needNicknameCheck ? nickRes?.exists !== true : nicknameAvailable === true;

      if (!emailOk || !nicknameOk) return;

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
    } catch (err) {
      console.error("중복 확인 실패:", err);
      setGlobalError("중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setEmailChecking(false);
      setNicknameChecking(false);
    }
  };

  return {
    formData,
    errors,
    globalError,

    emailChecking,
    emailAvailable,
    emailCheckMessage,
    hasEmailChecked,
    handleEmailCheck,

    nicknameChecking,
    nicknameAvailable,
    nicknameCheckMessage,
    hasNicknameChecked,
    handleNicknameCheck,

    handleSubmit,
    handleChange,
    handleBlur,
  };
}
