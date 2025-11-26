import React, { useState, useEffect } from "react";
import { getMyInfo, updateUserInfo, changePassword } from "../../api/userApi";
import "./ProfilePage.css";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Calendar } from "lucide-react";

const ProfilePage = () => {
  const [staticInfo, setStaticInfo] = useState({ email: "", userName: "" });

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
      } catch (error) {
        console.error("내 정보 로드 실패:", error);
      }
    };
    fetchData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]:
        name === "dailyWordGoal" ? (parseInt(value, 10) || 0) : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserInfo(profileForm);
      alert("회원 정보가 수정되었습니다.");
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

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

  return (
    <div className="page-container mt-24">
      <header className="profile-header">
        <h1>내 정보 관리</h1>
        <p>개인정보와 학습 목표를 설정하세요.</p>
      </header>

      <div className="profile-grid mt-24">
        <section className="card profile-card">
          <h2 className="card-title">기본 정보 & 목표</h2>
          <form onSubmit={submitProfile}>
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
              </div>

              <div className="form-field" style={{ position: "relative" }}>
                <label className="form-label" htmlFor="userBirth">
                  생년월일
                </label>
                <Input
                  id="userBirth"
                  type="date"
                  name="userBirth"
                  placeholder="년-월-일"
                  value={profileForm.userBirth}
                  onChange={handleProfileChange}
                  leftIcon={<Calendar size={18} />}
                  fullWidth
                />
              </div>
            </div>

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
                <label className="form-label" htmlFor="preference">
                  선호 스타일
                </label>
                <select
                  id="preference"
                  className="input"
                  name="preference"
                  value={profileForm.preference}
                  onChange={handleProfileChange}
                >
                  <option value="">선택하세요</option>
                  <option value="Narrative">이야기 (Narrative)</option>
                  <option value="Dialogue">대화 (Dialogue)</option>
                  <option value="Academic">학술 (Academic)</option>
                </select>
              </div>
            </div>

            <div className="form-actions mt-24">
              <Button type="submit" variant="primary" size="md">
                변경사항 저장
              </Button>
            </div>
          </form>
        </section>

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
