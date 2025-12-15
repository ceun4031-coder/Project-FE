// src/pages/account/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { getMyInfo, updateUserInfo, changePassword } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import FilterDropdown from "../../components/common/FilterDropdown";
import { Calendar } from "lucide-react";
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

  /* 초기 데이터 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyInfo();
        setStaticInfo({
          email: data.email,
          userName: data.userName,
        });
        setProfileForm({
          nickname: data.nickname || "",
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
      [name]:
        name === "dailyWordGoal" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (_, value) => {
    setProfileForm((prev) => ({ ...prev, preference: value }));
    setOpenDropdown(null);
  };

const submitProfile = async (e) => {
  e.preventDefault();

  try {
    /* 1️⃣ 기본 정보 + 학습 설정 저장 */
    const updated = await updateUserInfo(profileForm);

    updateProfileState({
      nickname: updated?.nickname ?? profileForm.nickname,
      preference: updated?.preference ?? profileForm.preference,
      goal: updated?.goal ?? profileForm.goal,
      dailyWordGoal:
        updated?.dailyWordGoal ?? profileForm.dailyWordGoal,
      userBirth: updated?.userBirth ?? profileForm.userBirth,
    });

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

      // 비밀번호 입력값 초기화
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


  /* 비밀번호 변경 */
  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmPassword,
      });
      alert("비밀번호가 변경되었습니다.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      alert("현재 비밀번호를 확인해주세요.");
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

          {/* 하나의 form만 사용 */}
          <form onSubmit={submitProfile}>
            {/* ================= 기본 정보 ================= */}
            <div className="profile-section">

              <div className="form-field">
                <label className="form-label">이메일</label>
                <Input
                  type="text"
                  value={staticInfo.email}
                  readOnly
                  disabled
                  fullWidth
                />
              </div>

              <div className="form-field">
                <label className="form-label">이름</label>
                <Input
                  type="text"
                  value={staticInfo.userName}
                  readOnly
                  fullWidth
                />
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
                </div>

                <div className="form-field form-field--with-icon">
                  <label className="form-label" htmlFor="userBirth">
                    생년월일
                  </label>
                  <Input
                    id="userBirth"
                    type="date"
                    name="userBirth"
                    value={profileForm.userBirth}
                    onChange={handleProfileChange}
                    leftIcon={<Calendar size={18} />}
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* ================= 비밀번호 변경 ================= */}
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
                <Button type="submit" variant="primary" size="md">
                  변경사항 저장
                </Button>
              </div>
            </div>
          </form>
        </section>
        {/* 학습 설정 */}
        <section className="card learning-card">
          <h2 className="card-title">학습 설정</h2>

          <form onSubmit={submitProfile}>
            {/* 목표 + 관심 분야 */}
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
                    setOpenDropdown((prev) =>
                      prev === "preference" ? null : "preference"
                    )
                  }
                  onChange={handlePreferenceChange}
                />
              </div>
            </div>

            {/* 하루 목표 단어 수 */}
            <div className="form-field daily-goal-field">
              <div className="daily-goal-header">
                <span className="form-label">하루 목표 단어 수</span>
                <strong className="daily-goal-number">
                  {profileForm.dailyWordGoal}
                </strong>
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
                  "--percent":
                    ((profileForm.dailyWordGoal - 5) / (50 - 5)) * 100 + "%",
                }}
              />

              <div className="daily-goal-hint">
                <span>Easy (5)</span>
                <span>Challenge (50)</span>
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" variant="secondary">
                학습 설정 저장
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;