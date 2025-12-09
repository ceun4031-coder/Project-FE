import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import "./LandingPage.css";
import mainBg from "@/assets/images/main-bg.png";
import main2 from "@/assets/images/main-2.svg";
import StoryLexLogo from "@/assets/images/StoryLex-logo.svg";

const LandingPage = () => {
  const navigate = useNavigate();

  const goLogin = () => navigate("/auth/login");

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll(".reveal");

      reveals.forEach((el) => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const elementBottom = el.getBoundingClientRect().bottom;

        if (elementTop < windowHeight - 80 && elementBottom > 80) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page-wrapper">
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-main-band reveal fade-up">
            <div className="landing-container">
              <div className="hero-layout">
                <div className="hero-content">
                  <span className="tag-pill">AI 기반 맞춤형 학습</span>
                  <h1 className="hero-title">
                    실수는 줄이고
                    <br />
                    <span className="text-purple">기억은 영원히.</span>
                  </h1>
                  <p className="hero-desc">
                    무작정 외우는 단어장은 이제 그만.
                    <br />
                    AI가 당신의 오답을 분석해 '나만의 스토리'를 만듭니다.
                  </p>
                  <button
                    type="button"
                    className="hero-primary-btn"
                    onClick={goLogin}
                  >
                    지금 시작하기
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
                <div className="hero-visual-wrapper">
                  <div className="blob-bg"></div>
                  <img src={mainBg} alt="Hero Visual" className="hero-img" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="how-section reveal fade-up">
          <div className="landing-container how-container">
            {/* 문제 제기 */}
            <div className="how-header">
              <h2>어떻게 작동하나요?</h2>
              <p>AI가 단어를 더 오래 기억하게 만드는 과정입니다.</p>
            </div>

            {/* 3단계 흐름 */}
            <div className="how-steps">
              <div className="how-step">
                <div className="how-icon purple">
                  <i className="fa-solid fa-pencil"></i>
                </div>
                <h3>문제 풀기</h3>
                <p>틀린 단어가 자동으로 기록됩니다.</p>
              </div>
              <div className="how-line"></div>
              <div className="how-step">
                <div className="how-icon gradient">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <h3>AI 분석 & 스토리 생성</h3>
                <p>
                  오답 패턴을 분석해 자연스러운 스토리를 만들어줍니다.
                </p>
              </div>
              <div className="how-line"></div>
              <div className="how-step">
                <div className="how-icon purple">
                  <i className="fa-solid fa-book-open"></i>
                </div>
                <h3>문맥 속 재학습</h3>
                <p>스토리 속 단어를 반복적으로 만나 장기기억으로 전환합니다.</p>
              </div>
            </div>
            {/* 결과 문구 */}
            <p className="how-footer">
              단어를 외우지 않아도 자연스럽게 이해되는 학습 흐름입니다.
            </p>
          </div>
        </section>
        {/* 기능 소개 섹션 */}
        <section className="landing-intro-section reveal fade-up">
          <div className="landing-container intro-center">
            <section className="landing-features">
              <div className="landing-container">
                <div className="feature-row">
                  {/* 왼쪽 텍스트 영역 */}
                  <div className="feature-left">
                    <h2 className="lf-title">
                      단어를 외우지 말고, 이해하세요.
                    </h2>
                    <p className="lf-sub">
                      AI가 당신의 학습 패턴을 분석해 더 오래 기억되는 학습
                      경험을 제공합니다.
                    </p>

                    <div className="lf-list">
                      <div className="lf-item">
                        <div className="lf-icon">
                          <i className="fa-solid fa-share-nodes"></i>
                        </div>
                        <div>
                          <h3>단어 클러스터</h3>
                          <p>
                            단어 간 의미적 관계를 시각적으로 연결해
                            보여줍니다.
                          </p>
                        </div>
                      </div>

                      <div className="lf-item">
                        <div className="lf-icon">
                          <i className="fa-solid fa-book-open"></i>
                        </div>
                        <div>
                          <h3>나만의 단어장 생성</h3>
                          <p>
                            AI가 학습 패턴을 기반으로 필요한 단어를 자동
                            큐레이션합니다.
                          </p>
                        </div>
                      </div>

                      <div className="lf-item">
                        <div className="lf-icon">
                          <i className="fa-solid fa-robot"></i>
                        </div>
                        <div>
                          <h3>AI 스토리 기반 재학습</h3>
                          <p>
                            오답 단어를 자연스러운 이야기 속에서 반복
                            학습합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 이미지 영역 */}
                  <div className="feature-right">
                    <img src={main2} alt="Feature Visual" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
        {/* Banner Section */}
        <section className="banner reveal fade-up">
          <div className="landing-container">
            <div className="banner-box">
             <h2 className="banner-title">
                  외워도 금방 잊는다면,<br />
                  이제는 방법을 바꿔야 할 때입니다.
                </h2>
                <p className="banner-sub">
                  AI 스토리 학습으로 오래 남는 단어 경험을 만들어보세요.
                </p>
              <button
                type="button"
                className="btn-white"
                onClick={goLogin}
              >
                AI 학습 시작하기
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-col" style={{ flex: 1.5 }}>
              <div className="footer-logo">
                <img src={StoryLexLogo} alt="StoryLex Logo" />
              </div>
              <p
                style={{
                  color: "var(--text-gray)",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  maxWidth: "300px",
                }}
              >
                AI 기술을 활용하여 가장 효율적인
                <br />
                외국어 학습 경험을 제공합니다.
              </p>
            </div>

            <div className="footer-col">
              <h4>서비스</h4>
              <a href="#features">기능 소개</a>
              <a href="#pricing">가격 정책</a>
              <a href="#enterprise">기업용 플랜</a>
            </div>

            <div className="footer-col">
              <h4>지원</h4>
              <a href="#faq">자주 묻는 질문</a>
              <a href="#cs">고객센터</a>
              <a href="#terms">이용약관</a>
            </div>

            
          </div>
          <div className="copyright">
            &copy; 2025 StoryLex Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;