// src/pages/account/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { getMyInfo, updateUserInfo, changePassword } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import FilterDropdown from "../../components/common/FilterDropdown";
import { Calendar } from "lucide-react";
import "./ProfilePage.css";

// 관심 분야 옵션 (회원가입 SetupPage와 의미 맞춰서 사용)
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

  // 변경 불가 기본 정보
  const [staticInfo, setStaticInfo] = useState({
    email: "",
    userName: "",
  });

  // 프로필 / 학습 설정 폼
  const [profileForm, setProfileForm] = useState({
    nickname: "",
    userBirth: "",
    preference: "",
    goal: "",
    dailyWordGoal: 10,
  });

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 드롭다운 열림 상태 (관심 분야)
  const [openDropdown, setOpenDropdown] = useState(null);

  // A. 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      } catch (error) {
        console.error("내 정보 로드 실패:", error);
        alert("정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 프로필 / 학습 설정 입력 변경
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: name === "dailyWordGoal" ? parseInt(value, 10) || 0 : value,
    }));
  };

  // 비밀번호 입력 변경
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownToggle = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  // 관심 분야 변경
  const handlePreferenceChange = (_, value) => {
    setProfileForm((prev) => ({
      ...prev,
      preference: value,
    }));
    setOpenDropdown(null);
  };

 // B. 프로필 수정 요청
  const submitProfile = async (e) => {
    e.preventDefault();

    try {
      const updated = await updateUserInfo(profileForm);
      alert("회원 정보가 수정되었습니다.");

      // ✅ 전역 AuthContext 의 user 상태도 함께 갱신
      //    (updated 응답이 없으면 폼 값 기준으로 반영)
      updateProfileState({
        nickname: updated?.nickname ?? profileForm.nickname,
        preference: updated?.preference ?? profileForm.preference,
        goal: updated?.goal ?? profileForm.goal,
        dailyWordGoal:
          updated?.dailyWordGoal ?? profileForm.dailyWordGoal,
        userBirth: updated?.userBirth ?? profileForm.userBirth,
      });
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  // C. 비밀번호 변경
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
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      alert("비밀번호 변경 실패: 현재 비밀번호를 확인해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="page-container mt-24">
        Loading...
      </div>
    );
  }

  return (
    <div className="page-container mt-24">
      <header className="profile-header">
        <h1>내 정보 관리</h1>
        <p>기본 정보와 관심 분야, 학습 목표를 관리하세요.</p>
      </header>

      <div className="profile-grid mt-24">
        {/* 기본 정보 & 학습 설정 카드 */}
        <section className="card profile-card">
          <h2 className="card-title">기본 정보 & 학습 설정</h2>

          <form onSubmit={submitProfile}>
            {/* 기본 정보 섹션 */}
            <div className="profile-section">
              <h3 className="profile-section-title">기본 정보</h3>

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

            {/* 학습 설정 섹션 */}
            <div className="profile-section">
              <h3 className="profile-section-title">학습 설정</h3>

              <div className="form-field">
                <label className="form-label" htmlFor="goal">
                  나의 다짐 (Goal)
                </label>
                <Input
                  id="goal"
                  type="text"
                  name="goal"
                  placeholder="예: 올해 안에 토익 900점"
                  value={profileForm.goal}
                  onChange={handleProfileChange}
                  fullWidth
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="dailyWordGoal">
                    일일 목표 단어 수
                  </label>
                  <Input
                    id="dailyWordGoal"
                    type="number"
                    name="dailyWordGoal"
                    value={profileForm.dailyWordGoal}
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
                    onToggle={handleDropdownToggle}
                    onChange={handlePreferenceChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions mt-24">
              <Button type="submit" variant="primary" size="md">
                변경사항 저장
              </Button>
            </div>
          </form>
        </section>

        {/* 비밀번호 변경 카드 */}
        <section className="card password-card">
          <h2 className="card-title">비밀번호 변경</h2>
          <form onSubmit={submitPassword}>
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
                required
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
                placeholder="변경할 비밀번호 입력"
                required
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
                placeholder="한 번 더 입력"
                required
                fullWidth
              />
            </div>

            <div className="form-actions mt-24">
              <Button type="submit" variant="secondary" size="md">
                비밀번호 변경
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
