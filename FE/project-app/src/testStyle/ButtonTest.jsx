import Button from "../components/common/Button.jsx";

function ButtonDemo() {
  return (
    <div
    
      
    >
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>버튼 시스템 데모</h1>
      <p style={{ color: "var(--neutral-600)", marginBottom: "24px" }}>
        디자인 토큰과 공통 Button 컴포넌트를 기반으로 한 버튼 스타일 데모입니다.
        <br />
        각 버튼은 Variant(색상 역할)와 Size(크기 옵션), FullWidth(폭 옵션),
        Disabled 상태를 테스트할 수 있도록 구성되어 있습니다.
      </p>

      {/* ───────── Primary ───────── */}
      <section>
        <h2>Primary Buttons</h2>
        <p style={{ marginTop: "4px", color: "var(--neutral-600)" }}>
          서비스 내에서 가장 중요한 행동(CTA)에 사용합니다.  
          예: <strong>로그인 · 회원가입 · 제출 · 다음</strong>
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          <Button variant="primary" size="sm">Primary SM</Button>
          <Button variant="primary" size="md">Primary MD</Button>
          <Button variant="primary" size="lg">Primary LG</Button>
          <Button variant="primary" size="md" disabled>Primary Disabled</Button>
        </div>
      </section>

      {/* ───────── Secondary ───────── */}
      <section>
        <h2>Secondary Buttons</h2>
        <p style={{ marginTop: "4px", color: "var(--neutral-600)" }}>
          Primary보다 우선순위가 낮지만 여전히 중요한 행동에 사용합니다.  
          예: <strong>미리보기 · 다시 풀기 · 부가 기능 버튼</strong>
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          <Button variant="secondary" size="sm">Secondary SM</Button>
          <Button variant="secondary" size="md">Secondary MD</Button>
          <Button variant="secondary" size="lg">Secondary LG</Button>
          <Button variant="secondary" size="md" disabled>Secondary Disabled</Button>
        </div>
      </section>

      {/* ───────── Ghost ───────── */}
      <section>
        <h2>Ghost Buttons</h2>
        <p style={{ marginTop: "4px", color: "var(--neutral-600)" }}>
          배경 없이 가벼운 행동에 사용합니다.  
          UI 영향력이 크게 필요하지 않은 상황에서 적합합니다.  
          예: <strong>옵션 · 설정 · 비밀번호 찾기</strong>
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          <Button variant="ghost" size="sm">Ghost SM</Button>
          <Button variant="ghost" size="md">Ghost MD</Button>
          <Button variant="ghost" size="lg">Ghost LG</Button>
          <Button variant="ghost" size="md" disabled>Ghost Disabled</Button>
        </div>
      </section>

      {/* ───────── Outline ───────── */}
      <section>
        <h2>Outline Buttons</h2>
        <p style={{ marginTop: "4px", color: "var(--neutral-600)" }}>
          배경은 없고 선만 있는 형태로,  
          <strong>부가 선택지 · 취소 · 뒤로가기</strong> 등에 적합합니다.  
          (Primary와 충돌하지 않도록 약한 위계로 사용)
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          <Button variant="outline" size="sm">Outline SM</Button>
          <Button variant="outline" size="md">Outline MD</Button>
          <Button variant="outline" size="lg">Outline LG</Button>
          <Button variant="outline" size="md" disabled>Outline Disabled</Button>
        </div>
      </section>

      {/* ───────── Full Width ───────── */}
      <section>
        <h2>FullWidth Buttons</h2>
        <p style={{ marginTop: "4px", color: "var(--neutral-600)" }}>
          부모 요소의 너비를 가득 채우며,  
          모바일 로그인 / 회원가입 페이지와 같이  
          **버튼을 명확하게 강조할 때 사용**합니다.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <Button variant="primary" size="md" full>Primary FullWidth</Button>
          <Button variant="secondary" size="md" full>Secondary FullWidth</Button>
          <Button variant="outline" size="md" full>Outline FullWidth</Button>
          <Button variant="ghost" size="md" full>Ghost FullWidth</Button>
        </div>
      </section>
    </div>
  );
}

export default ButtonDemo;
