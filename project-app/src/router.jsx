import { Route, Routes } from "react-router-dom";
import AccountFindPage from "./pages/auth/AccountFindPage";
import LoginPage from "./pages/auth/LoginPage";
import SetupPage from "./pages/auth/SetupPage";
import SignupPage from "./pages/auth/SignupPage";
// 대시보드
import ProfilePage from "./pages/account/ProfilePage";
import DashboardPage from "./pages/dashboard/DashboardPage";

import StoryCreatePage from "./pages/stories/StoryCreatePage";
import StoryDetailPage from "./pages/stories/StoryDetailPage";
import StoryListPage from "./pages/stories/StoryListPage";

import WordDetailPage from "./pages/words/WordDetailPage";
import WordListPage from "./pages/words/WordListPage";

import CardLearningPage from "./pages/learning/CardLearningPage";
import QuizPage from "./pages/learning/QuizPage";
import WrongNotePage from "./pages/learning/WrongNotePage";

import ProtectedRoute from "./components/common/ProtectedRoute";
import LearningHomePage from './pages/learning/LearningHomePage';
import LandingPage from "./pages/home/LandingPage";
function AppRouter() {
  return (
    <Routes>
      {/* 비회원 홈 */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth 페이지 */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/auth/setup" element={<SetupPage />} />
      <Route path="/auth/find" element={<AccountFindPage />} />

      {/* 보호된 라우트 */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/words" element={<WordListPage />} />
        <Route path="/words/:id" element={<WordDetailPage />} />
        {/* ai 스토리 */}
        <Route path="/stories" element={<StoryListPage />} />
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/stories/create" element={<StoryCreatePage />} />
        <Route path="/account/profile" element={<ProfilePage />} />

   {/* 학습하기 홈 (방식 선택 페이지) */}
        <Route path="/learning" element={<LearningHomePage />} />

        {/* 실제 학습 페이지 */}
        <Route path="/learning/quiz" element={<QuizPage />} />
        <Route path="/learning/card" element={<CardLearningPage />} />
        <Route path="/learning/wrong-notes" element={<WrongNotePage />} />
        
      </Route>
    </Routes>
  );
}

export default AppRouter;