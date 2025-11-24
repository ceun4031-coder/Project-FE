import { NavLink, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import "../../styles/Header.css";
import Logo from "../../assets/images/StoryLex-logo.svg";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <div className="header-left">
        {/* 로고 */}
        <NavLink to="/" className="header-logo">
          <img src={Logo} alt="StoryLex Logo" />
        </NavLink>

        {/* 메뉴 */}
        <nav className="header-nav">
          <NavLink to="/words" className="nav-item">
            단어목록
          </NavLink>
          <NavLink to="/community" className="nav-item">
            커뮤니티
          </NavLink>
          <NavLink to="/board" className="nav-item">
            게시판
          </NavLink>
          <NavLink to="/about" className="nav-item">
            About
          </NavLink>
        </nav>
      </div>

      {/* 오른쪽 버튼 영역 */}
      <div className="header-right">
        <Button
          variant="secondary"
          size="sm"
          style={{ marginRight: "8px" }}
          onClick={() => navigate("/auth/login")}
        >
          로그인
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/auth/register")}
        >
          회원가입
        </Button>
      </div>
    </header>
  );
}
