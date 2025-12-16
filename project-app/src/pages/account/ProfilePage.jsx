// src/pages/account/ProfilePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { getMyInfo, updateUserInfo, changePassword } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import FilterDropdown from "../../components/common/FilterDropdown";

import BirthdateSelector from "@/components/common/BirthdateSelector";
import { checkNicknameDuplicate } from "../../api/authApi";
import "./ProfilePage.css";

const INTEREST_OPTIONS = [
  { label: "선택 안 함", value: "" },
  { label: "일상생활", value: "DAILY_LIFE" },
  { label: "사람/감정", value: "PEOPLE_FEELINGS" },
  { label: "직장/비즈니스", value: "BUSINESS" },
  { label: "학교/학습", value: "SCHOOL_LEARNING" },
  { label: "여행/교통", value: "TRAVEL" },
  { label: "음식/건강", value: "FOOD_HEALTH" },
  { label: "기술/IT", value: "TECHNOLOGY" },
];

const ProfilePage = () => {
  const { updateProfileState } = useAuth();
  const [loading, setLoading] = useState(true);

  const [staticInfo, setStaticInfo] = useState({
    email: "",
    userName: "",
  });

  const [profileForm, setProfileForm] = useState({
    nickname: "",
    userBirth: "",
    preference: "",
    goal: "",
    dailyWordGoal: 10,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  // ✅ 닉네임 중복 안내 상태(회원가입처럼 메시지 표시)
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null); // true/false/null
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [hasNicknameChecked, setHasNicknameChecked] = useState(false);

  const initialNicknameRef = useRef("");
  const lastCheckedNicknameRef = useRef("");

  /* 초기 데이터 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyInfo();

        setStaticInfo({
          email: data.email,
          userName: data.userName,
        });

        const nick = data.nickname || "";
        initialNicknameRef.current = nick;

        setProfileForm({
          nickname: nick,
          userBirth: data.userBirth || "",
          preference: data.preference || "",
          goal: data.goal || "",
          dailyWordGoal: data.dailyWordGoal || 10,
        });
      } catch {
        alert("정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* 공통 변경 */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: name === "dailyWordGoal" ? parseInt(value, 10) || 0 : value,
    }));

    // ✅ 닉네임 바뀌면 안내 상태 초기화
    if (name === "nickname") {
      setNicknameAvailable(null);
      setNicknameCheckMessage("");
      setHasNicknameChecked(false);
      lastCheckedNicknameRef.current = "";
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (_, value) => {
    setProfileForm((prev) => ({ ...prev, preference: value }));
    setOpenDropdown(null);
  };

  // ✅ 저장 버튼 누를 때만 닉네임 중복 확인 + 안내 문구 세팅
  const ensureNicknameOkOnSave = async () => {
    const nickname = (profileForm.nickname || "").trim();
    const initial = (initialNicknameRef.current || "").trim();

    // 기본 검증
    if (!nickname) {
      setHasNicknameChecked(true);
      setNicknameAvailable(false);
      setNicknameCheckMessage("닉네임을 입력해 주세요.");
      return false;
    }
    if (nickname.length > 100) {
      setHasNicknameChecked(true);
      setNicknameAvailable(false);
      setNicknameCheckMessage("닉네임은 100자 이내로 입력해 주세요.");
      return false;
    }

    // 변경 없으면 체크 불필요(안내도 굳이 띄우지 않음)
    if (nickname === initial) {
      setHasNicknameChecked(false);
      setNicknameAvailable(null);
      setNicknameCheckMessage("");
      return true;
    }

    // 같은 닉네임으로 이미 성공 확인한 경우 재호출 방지
    if (
      hasNicknameChecked === true &&
      nicknameAvailable === true &&
      lastCheckedNicknameRef.current === nickname
    ) {
      return true;
    }

    setNicknameChecking(true);
    setHasNicknameChecked(false);
    setNicknameCheckMessage("");

    try {
      const { exists, message } = (await checkNicknameDuplicate(nickname)) || {};
      lastCheckedNicknameRef.current = nickname;
      setHasNicknameChecked(true);

      if (exists) {
        setNicknameAvailable(false);
        setNicknameCheckMessage(message || "이미 사용 중인 닉네임입니다.");
        return false;
      }

      setNicknameAvailable(true);
      setNicknameCheckMessage(message || "사용 가능한 닉네임입니다.");
      return true;
    } catch (e) {
      setHasNicknameChecked(true);
      setNicknameAvailable(false);
      setNicknameCheckMessage("닉네임 중복 확인 중 오류가 발생했습니다.");
      return false;
    } finally {
      setNicknameChecking(false);
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();

    // ✅ 닉네임 중복이면 여기서 종료 + 안내 문구만 표시
    const nicknameOk = await ensureNicknameOkOnSave();
    if (!nicknameOk) return;

    try {
      /* 1️⃣ 기본 정보 + 학습 설정 저장 */
      const updated = await updateUserInfo(profileForm);

      updateProfileState({
        nickname: updated?.nickname ?? profileForm.nickname,
        preference: updated?.preference ?? profileForm.preference,
        goal: updated?.goal ?? profileForm.goal,
        dailyWordGoal: updated?.dailyWordGoal ?? profileForm.dailyWordGoal,
        userBirth: updated?.userBirth ?? profileForm.userBirth,
      });

      // ✅ 성공 저장 후 initialNickname 갱신(다음 저장에서 불필요한 중복확인 방지)
      const savedNickname = (updated?.nickname ?? profileForm.nickname ?? "").trim();
      initialNicknameRef.current = savedNickname;

      /* 2️⃣ 비밀번호 입력이 있으면 비밀번호 변경 */
      const hasPasswordInput =
        passwordForm.currentPassword ||
        passwordForm.newPassword ||
        passwordForm.confirmPassword;

      if (hasPasswordInput) {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          alert("새 비밀번호가 일치하지 않습니다.");
          return;
        }

        await changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmNewPassword: passwordForm.confirmPassword,
        });

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      alert("변경사항이 저장되었습니다.");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="page-container mt-24">Loading…</div>;

  return (
    <div className="page-container mt-24">
      <header className="profile-header">
        <h1>내 정보 관리</h1>
        <p>기본 정보와 학습 설정을 관리하세요.</p>
      </header>

      <div className="profile-grid mt-24">
        {/* 기본 정보 & 비밀번호 설정 */}
        <section className="card profile-card">
          <h2 className="card-title">개인 정보 설정</h2>

          <form onSubmit={submitProfile}>
            <div className="profile-section">
              <div className="form-field">
                <label className="form-label">이메일</label>
                <Input type="text" value={staticInfo.email} readOnly disabled fullWidth />
              </div>

              <div className="form-field">
                <label className="form-label">이름</label>
                <Input type="text" value={staticInfo.userName} readOnly fullWidth />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="nickname">
                    닉네임
                  </label>
                  <Input
                    id="nickname"
                    type="text"
                    name="nickname"
                    value={profileForm.nickname}
                    onChange={handleProfileChange}
                    fullWidth
                  />

                  {/* ✅ 회원가입처럼 안내 문구 */}
                  {nicknameChecking && (
                    <p className="form-success">닉네임 확인 중...</p>
                  )}

                  {!nicknameChecking &&
                    hasNicknameChecked &&
                    nicknameAvailable === true && (
                      <p className="form-success">
                        {nicknameCheckMessage || "사용 가능한 닉네임입니다."}
                      </p>
                    )}

                  {!nicknameChecking &&
                    hasNicknameChecked &&
                    nicknameAvailable === false && (
                      <p className="form-error">
                        {nicknameCheckMessage || "이미 사용 중인 닉네임입니다."}
                      </p>
                    )}
                </div>

                <div className="form-field form-field--with-icon">
                  <label className="form-label" htmlFor="userBirth">
                    생년월일
                  </label>

                  <BirthdateSelector
                    name="userBirth"
                    value={profileForm.userBirth}
                    onChange={handleProfileChange}
                    error={null}
                  />
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="form-field">
                <label className="form-label" htmlFor="currentPassword">
                  현재 비밀번호
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newPassword">
                  새 비밀번호
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="confirmPassword">
                  새 비밀번호 확인
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                />
              </div>

              <div className="form-actions mt-24">
                <Button type="submit" variant="primary" size="md" disabled={nicknameChecking}>
                  {nicknameChecking ? "닉네임 확인 중..." : "변경사항 저장"}
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* 학습 설정 */}
        <section className="card learning-card">
          <h2 className="card-title">학습 설정</h2>

          <form onSubmit={submitProfile}>
            <div className="form-row form-row--align-top">
              <div className="form-field">
                <label className="form-label">나의 학습 목표</label>
                <Input
                  name="goal"
                  placeholder="예: 매일 20단어 암기"
                  value={profileForm.goal}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </div>

              <div className="form-field">
                <FilterDropdown
                  id="preference"
                  label="관심 분야"
                  options={INTEREST_OPTIONS}
                  value={profileForm.preference}
                  isOpen={openDropdown === "preference"}
                  onToggle={() =>
                    setOpenDropdown((prev) => (prev === "preference" ? null : "preference"))
                  }
                  onChange={handlePreferenceChange}
                />
              </div>
            </div>

            <div className="form-field daily-goal-field">
              <div className="daily-goal-header">
                <span className="form-label">하루 목표 단어 수 : </span>
                <strong className="daily-goal-number">{profileForm.dailyWordGoal}</strong>
              </div>

              <input
                type="range"
                name="dailyWordGoal"
                min={5}
                max={50}
                step={5}
                value={profileForm.dailyWordGoal}
                onChange={handleProfileChange}
                className="daily-goal-slider"
                style={{
                  "--percent": ((profileForm.dailyWordGoal - 5) / (50 - 5)) * 100 + "%",
                }}
              />

              <div className="daily-goal-hint">
                <span>Easy (5)</span>
                <span>Challenge (50)</span>
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={nicknameChecking}>
                {nicknameChecking ? "닉네임 확인 중..." : "학습 설정 저장"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
