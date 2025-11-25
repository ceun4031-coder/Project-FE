// src/components/layout/Header.jsx
import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import Button from "../common/Button";
import StoryLexLogo from "../../assets/images/StoryLex-logo.svg";

import { getAccessToken } from "../../utils/storage";
import { logout } from "../../api/authApi";
import "./Header.css";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(!!getAccessToken());
    }, [location.pathname]); 

    const handleLogoClick = () => {
        navigate("/");
    };

    const handleLogoutClick = () => {
        logout();             
        setIsAuthenticated(false);
        navigate("/auth/login");
    };
    return (
        <header className="header">
            <div className="page-container">
                <div className="header-inner">
                    {/* 로고 */}
                    <div className="header-logo" onClick={handleLogoClick}>
                        <img
                            src={StoryLexLogo}
                            alt="StoryLex 로고"
                            className="header-logo-img"
                        />
                    </div>

                    {/* 내비게이션 */}
                    <nav className="header-nav">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/word">단어목록</NavLink>
                        <NavLink to="/dashboard">대시보드</NavLink>
                        <NavLink to="/">About3</NavLink>
                        <NavLink to="/">About4</NavLink>
                    </nav>

                    {/* 우측 액션 */}
                    <div className="header-actions">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    마이페이지
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleLogoutClick}
                                >
                                    로그아웃
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate("/auth/login")}
                                >
                                    로그인
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate("/auth/register")}
                                >
                                    회원가입
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
