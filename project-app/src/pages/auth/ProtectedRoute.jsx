// components/auth/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 실제 토큰 확인 (localStorage 키 이름은 프로젝트에 맞게 수정)
  const isLogin = !!localStorage.getItem('accessToken'); 

  if (!isLogin) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;