import Button from "../common/Button";
import "./Header.css";
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from "../../assets/logo.svg";

export default function Header() {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="page-container">
                <div className="header-inner">

                    {/* 로고 */}
                    <div className="header-logo" onClick={() => navigate('/')}>
                        <img 
                            src={Logo}
                            alt="StoryLex 로고"
                            style={{
                                height: "34px",
                                width: "auto",
                                display: "block"
                            }}
                        />
                    </div>

                    {/* 내비게이션 */}
                    <nav className="header-nav">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/word">단어목록</NavLink>
                        <NavLink to="/dashboard">대시보드</NavLink>
                        <NavLink to="/about">About3</NavLink>
                        <NavLink to="/contact">About4</NavLink>
                    </nav>

                    {/* 우측 액션 */}
                    <div className="header-actions">
                        <Button variant="primary" size="sm" onClick={() => navigate('/auth/login')}>
                            로그인
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/auth/register')}>
                            회원가입
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
