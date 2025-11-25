// router.jsx
import { Routes, Route } from "react-router-dom";

import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import SetupPage from "./pages/auth/SetupPage";
import AccountFindPage from "./pages/auth/AccountFindPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import TodayWordCard from "./components/common/TodayWordCard";

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="page-container">
            {/* 홈 내용 */}
          </div>
        }
      />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/setup" element={<SetupPage />} />
      <Route path="/auth/register" element={<TodayWordCard />} />
      <Route path="/auth/find" element={<AccountFindPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default AppRouter;
