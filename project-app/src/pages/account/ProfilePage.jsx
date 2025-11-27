// src/pages/profile/ProfilePage.jsx (경로 확인)
import React, { useState, useEffect } from "react";
import { getMyInfo, updateUserInfo, changePassword } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext"; // 1. Context 가져오기
import "./ProfilePage.css";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Calendar } from "lucide-react";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const ProfilePage = () => {
  // 2. 닉네임 변경 시 전역 상태(헤더 등)도 같이 업데이트하기 위해 가져옴
  const { updateProfileState } = useAuth(); 

  const [loading, setLoading] = useState(true);
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

  // A. 초기 데이터 로드 (목업 vs 실제)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // --- [MOCK MODE] ---
      if (USE_MOCK) {
        console.log("📢 [MOCK] 프로필 가짜 데이터 로드 중...");
        setTimeout(() => {
          const mockData = {
            email: "test@example.com",
            userName: "김테스트",
            nickname: "열공러",
            userBirth: "1999-01-01",
            preference: "Narrative",
            goal: "영어 마스터하기",
            dailyWordGoal: 30
          };
          setStaticInfo({ email: mockData.email, userName: mockData.userName });
          setProfileForm(mockData);
          setLoading(false);
        }, 500);
        return;
      }
      // -------------------

      // --- [REAL MODE] ---
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: name === "dailyWordGoal" ? (parseInt(value, 10) || 0) : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // B. 프로필 수정 요청
  const submitProfile = async (e) => {
    e.preventDefault();
    
    // --- [MOCK MODE] ---
    if (USE_MOCK) {
        console.log("📢 [MOCK] 프로필 수정 요청:", profileForm);
        alert("(가짜) 회원 정보가 수정되었습니다.");
        // 중요: 헤더의 닉네임도 바로 바뀌도록 Context 업데이트
        updateProfileState({ nickname: profileForm.nickname });
        return;
    }
    // -------------------

    try {
      await updateUserInfo(profileForm);
      alert("회원 정보가 수정되었습니다.");
      // 실제 서버 성공 시에도 Context 업데이트
      updateProfileState({ nickname: profileForm.nickname });
    } catch (error) {
      console.error("수정 실패:", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  // C. 비밀번호 변경 요청
  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // --- [MOCK MODE] ---
    if (USE_MOCK) {
        console.log("📢 [MOCK] 비밀번호 변경 요청");
        alert("(가짜) 비밀번호가 변경되었습니다.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        return;
    }
    // -------------------

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

  if (loading) return <div className="page-container mt-24">Loading...</div>;

  return (
    <div className="page-container mt-24">
      <header className="profile-header">
        <h1>내 정보 관리 {USE_MOCK && <span style={{fontSize:'12px', color:'red'}}>(TEST)</span>}</h1>
        <p>개인정보와 학습 목표를 설정하세요.</p>
      </header>

      <div className="profile-grid mt-24">
        {/* 기본 정보 & 목표 카드 */}
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
                <label className="form-label" htmlFor="nickname">닉네임</label>
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
                <label className="form-label" htmlFor="userBirth">생년월일</label>
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

            <div className="form-field">
              <label className="form-label" htmlFor="goal">나의 다짐 (Goal)</label>
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
                <label className="form-label" htmlFor="dailyWordGoal">일일 목표 단어 수</label>
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
                <label className="form-label" htmlFor="preference">선호 스타일</label>
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

        {/* 비밀번호 변경 카드 */}
        <section className="card password-card">
          <h2 className="card-title">비밀번호 변경</h2>
          <form onSubmit={submitPassword}>
            <div className="form-field">
              <label className="form-label" htmlFor="currentPassword">현재 비밀번호</label>
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
              <label className="form-label" htmlFor="newPassword">새 비밀번호</label>
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
              <label className="form-label" htmlFor="confirmPassword">새 비밀번호 확인</label>
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