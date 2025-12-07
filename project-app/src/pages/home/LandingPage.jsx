import React, { useEffect } from 'react';
import './LandingPage.module.css'; // 위에서 작성한 CSS 파일 import

const LandingPage = () => {
  // 스크롤 애니메이션 로직
  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll(".reveal");
      
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add("active");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 로딩 시에도 한 번 실행

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page-wrapper">

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-main-band reveal">
            <div className="landing-container">
              <div className="hero-layout">
                <div className="hero-content">
                  <span className="tag-pill">AI 기반 맞춤형 학습</span>
                  <h1 className="hero-title">
                    실수는 줄이고<br />
                    <span className="text-purple">기억은 영원히.</span>
                  </h1>
                  <p className="hero-desc">
                    무작정 외우는 단어장은 이제 그만.<br />
                    AI가 당신의 오답을 분석해 '나만의 스토리'를 만듭니다.
                  </p>
                  <a href="#start" className="hero-primary-btn">
                    지금 시작하기
                    <i className="fa-solid fa-arrow-right"></i>
                  </a>
                  <p className="hero-subtext">
                    첫 달 무료 · 언제든지 해지 가능 · 학습 데이터는 그대로 유지
                  </p>
                </div>

                <div className="hero-visual-wrapper">
                  <div className="blob-bg"></div>
                  {/* 실제 이미지 경로로 수정해주세요 */}
                 
                </div>
              </div>
            </div>
          </div>

          {/* Sub Grid Cards */}
          <div className="landing-container">
            <div className="hero-subgrid">
              <div className="card card-stat reveal">
                <div className="stat-num">
                  98<span style={{ fontSize: '1.5rem' }}>%</span>
                </div>
                <div className="stat-label">장기 기억 전환율</div>
              </div>

              <div className="card card-feature reveal">
                <div className="icon-box">
                  <i className="fa-solid fa-network-wired"></i>
                </div>
                <div className="card-title">단어 클러스터</div>
                <p className="card-text">
                  유의어, 반의어를 뇌 구조와 비슷하게 연결하여 시각화합니다.
                </p>
              </div>

              <div className="card card-cta reveal">
                <h3 className="card-title" style={{ color: 'white' }}>
                  나만의<br />단어장<br />만들기
                </h3>
                <div className="arrow-btn">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="section-process">
          <div className="landing-container">
            <div className="section-header reveal">
              <h2>어떻게 작동하나요?</h2>
              <p>복잡한 설정 없이, 학습하고 복습하면 끝입니다.</p>
            </div>

            <div className="process-steps">
              <div className="step-item reveal">
                <div className="step-icon">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <h3>01. 문제 풀기</h3>
                <p>
                  평소처럼 단어 퀴즈를 풉니다.<br />
                  틀린 문제는 AI가 자동으로 수집합니다.
                </p>
              </div>
              <div className="step-item reveal">
                <div className="step-icon"><i className="fa-solid fa-robot"></i></div>
                <h3>02. 스토리 생성</h3>
                <p>
                  수집된 오답 데이터를 분석해<br />
                  단어가 포함된 흥미로운 글을 만듭니다.
                </p>
              </div>
              <div className="step-item reveal">
                <div className="step-icon"><i className="fa-solid fa-brain"></i></div>
                <h3>03. 문맥 재학습</h3>
                <p>
                  스토리를 읽으며 단어의 쓰임새를 익히고<br />
                  장기 기억으로 전환합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="banner reveal">
          <div className="landing-container">
            <div className="banner-box">
              <h2>당신의 영어 실력,<br />데이터로 증명해드릴게요.</h2>
              <p>지금 가입하면 첫 달 프리미엄 기능을 무료로 체험할 수 있습니다.</p>
              <a href="#free" className="btn-white">무료로 시작하기</a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-col" style={{ flex: 1.5 }}>
              <div className="logo" style={{ marginBottom: '20px' }}>
                <i className="fa-solid fa-layer-group"></i> WordCluster
              </div>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
                AI 기술을 활용하여 가장 효율적인<br />
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
            <div className="footer-col">
              <h4>문의</h4>
              <a href="mailto:support@wordcluster.ai">support@wordcluster.ai</a>
              <a href="tel:02-1234-5678">02-1234-5678</a>
            </div>
          </div>
          <div className="copyright">
            &copy; 2024 WordCluster Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;