import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import SetupPage from "./pages/auth/SetupPage";
import AccountFindPage from "./pages/auth/AccountFindPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import WordListPage from "./pages/words/WordListPage";
import WordDetailPage from "./pages/words/WordDetailPage";
import StoryListPage from "./pages/stories/StoryListPage";
import StoryDetailPage from "./pages/stories/StoryDetailPage";
import StoryCreatePage from "./pages/stories/StoryCreatePage";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import ProfilePage from "./pages/account/ProfilePage";
function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        {/* 비회원 홈 */}
        <Route path="/" element={
          <div className="page-container">{/* 홈 내용 */}
          </div>}
        />

        {/* Auth 페이지 */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/setup" element={<SetupPage />} />
        <Route path="/auth/find" element={<AccountFindPage />} />

        {/* Dashboard */}
         <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/words" element={<WordListPage />} />
          <Route path="/words/:id" element={<WordDetailPage />} />

          <Route path="/story/list" element={<StoryListPage />} />
          <Route path="/story/:id" element={<StoryDetailPage />} />
          <Route path="/story/create" element={<StoryCreatePage />} />

          <Route path="/account/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default AppRouter;
