import { Routes, Route } from "react-router-dom";

import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import SetupPage from "./pages/auth/SetupPage";
import AccountFindPage from "./pages/auth/AccountFindPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

function AppRouter() {
  return (
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
      <Route path="/dashboard" element={<DashboardPage />} />

    </Routes>
  );
}

export default AppRouter;
