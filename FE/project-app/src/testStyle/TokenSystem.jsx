import "../styles/tokens.css";

export default function Demo() {
  return (
    <div >
      <h1 style={{ marginBottom: "16px" }}>🎨 디자인 토큰 시스템 데모</h1>
      <p style={{ marginBottom: "40px", color: "var(--neutral-600)" }}>
        아래는 tokens.css에 정의된 색상·간격·서피스·레이아웃·타이포 등을 시각적으로
        검증하기 위한 데모 페이지입니다. <br />
      </p>

      {/* ─────────────────────────────────── */}
      {/* COLOR TOKENS */}
      {/* ─────────────────────────────────── */}
      <section style={{ marginBottom: "60px" }}>
        <h2>1) Primary 색상 (브랜드 퍼플)</h2>
        <p>브랜드 성격을 나타내는 핵심 색상들입니다.</p>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
          {["600", "500", "400", "300", "200", "100"].map((v) => (
            <div
              key={v}
              style={{
                background: `var(--primary-${v})`,
                width: "120px",
                height: "70px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </section>

      {/* SECONDARY */}
      <section style={{ marginBottom: "60px" }}>
        <h2>2) Secondary 색상 (라벤더 보조 컬러)</h2>
        <p>포인트 UI, 배경 강조에 사용되는 부가 색상입니다.</p>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap" }}>
          {["500", "400", "300", "200", "100"].map((v) => (
            <div
              key={v}
              style={{
                background: `var(--secondary-${v})`,
                width: "120px",
                height: "70px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#333",
                fontWeight: 600,
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </section>

      {/* NEUTRAL TOKENS */}
      <section style={{ marginBottom: "60px" }}>
        <h2>3) Neutral / Text 색상</h2>
        <p>텍스트·배경·선 등 UI 전반에 사용되는 중성 톤입니다.</p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "16px" }}>
          {["900","800","700","600","500","300","200","100","50"].map((v) => (
            <div
              key={v}
              style={{
                background: `var(--neutral-${v})`,
                width: "120px",
                height: "70px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: v < 300 ? "#333" : "#fff",
                fontWeight: 600,
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </section>

      {/* SURFACE */}
      <section style={{ marginBottom: "60px" }}>
        <h2>4) Surface / 카드·모달 배경</h2>
        <p>카드·모달·분리된 영역 배경으로 사용됩니다.</p>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
          {["1", "2", "3"].map((v) => (
            <div
              key={v}
              style={{
                background: `var(--surface-${v})`,
                width: "160px",
                height: "80px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#333",
              }}
            >
              surface-{v}
            </div>
          ))}
        </div>
      </section>

      {/* BORDER TOKENS */}
      <section style={{ marginBottom: "60px" }}>
        <h2>5) Border Tokens</h2>
        <p>UI 구분선·테두리에서 사용되는 컬러입니다.</p>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
          {["border-strong", "border-subtle"].map((v) => (
            <div
              key={v}
              style={{
                background: "#fff",
                width: "220px",
                height: "60px",
                borderRadius: "8px",
                border: `4px solid var(--${v})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#333",
                fontWeight: 600,
              }}
            >
              --{v}
            </div>
          ))}
        </div>
      </section>

      {/* RADIUS */}
      <section style={{ marginBottom: "60px" }}>
        <h2>6) Radius Tokens</h2>
        <p>컴포넌트 모서리 라운드 기준입니다.</p>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
          {["sm","md","lg"].map((v) => (
            <div
              key={v}
              style={{
                background: "#fff",
                width: "120px",
                height: "60px",
                borderRadius: `var(--radius-${v})`,
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </section>

      {/* SHADOW */}
      <section style={{ marginBottom: "60px" }}>
        <h2>7) Shadow Tokens</h2>
        <p>버튼·카드 hover 시 사용되는 기본 그림자입니다.</p>

        <div style={{ display: "flex", marginTop: "16px" }}>
          <div
            style={{
              background: "#fff",
              width: "220px",
              height: "80px",
              borderRadius: "12px",
              boxShadow: "var(--shadow-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
            }}
          >
            --shadow-soft
          </div>
        </div>
      </section>

      {/* SPACING */}
      <section style={{ marginBottom: "60px" }}>
        <h2>8) Spacing Tokens (8px 스케일)</h2>
        <p>컴포넌트 간격·padding·margin에 사용되는 기준 간격입니다.</p>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
          {[1,2,3,4,5,6,8,10].map((v) => (
            <div
              key={v}
              style={{
                width: "120px",
                padding: "var(--space-" + v + ")",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              space-{v}<br />
              {`(${getPx(v)}px)`}
            </div>
          ))}
        </div>
      </section>

      {/* BREAKPOINTS */}
      <section style={{ marginBottom: "60px" }}>
        <h2>9) Breakpoints</h2>
        <p>반응형 기준이 되는 값입니다.</p>

        <pre
          style={{
            background: "#f7f7fc",
            padding: "20px",
            borderRadius: "8px",
            fontSize: "14px",
            border: "1px solid #ddd",
          }}
        >
{`
--bp-mobile: 375px
--bp-tablet: 768px
--bp-web: 1280px
--bp-web-wide: 1440px
`}
        </pre>
      </section>

      {/* CONTAINER WIDTH */}
      <section style={{ marginBottom: "80px" }}>
        <h2>10) Container Width 기준</h2>
        <p>페이지 레이아웃 폭 기준입니다.</p>

        <pre
          style={{
            background: "#f7f7fc",
            padding: "20px",
            borderRadius: "8px",
            fontSize: "14px",
            border: "1px solid #ddd",
          }}
        >
{`
--container-mobile-width: 100%
--container-tablet-width: 100%
--container-web-width: 1120px
--container-web-wide-width: 1200px
`}
        </pre>
      </section>
    </div>
  );
}

// spacing px 값 표시용
function getPx(v) {
  return {1:4,2:8,3:12,4:16,5:20,6:24,8:32,10:40}[v];
}
