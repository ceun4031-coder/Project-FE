import "../styles/index.css";
import Button from "../components/common/Button";

export default function IndexStyleDemo() {
  return (
    <div className="page-container">

      {/* 페이지 타이틀 */}
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>
        Global Style System Demo
      </h1>

      {/* 카드 예시 */}
      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>Card Component</h2>
        <p style={{ marginBottom: "12px" }}>
          이 카드는 <strong>tokens.css</strong>의 Surface, Radius, Shadow, Spacing 토큰을 사용합니다.
        </p>

        <Button variant="primary" size="md">
          Primary Button
        </Button>
      </div>

      {/* 여백 테스트 */}
      <div className="card mt-24">
        <h2>Spacing Utilities</h2>
        <p className="mt-12">
          <code>.mt-12</code> / <code>.mt-24</code> 같은 유틸리티 클래스를 테스트할 수 있습니다.
        </p>
      </div>

      {/* 버튼 Variant 전체 테스트 */}
      <div className="card mt-24">
        <h2 style={{ marginBottom: "16px" }}>Button Variants</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Button variant="primary" size="md">Primary</Button>
          <Button variant="secondary" size="md">Secondary</Button>
          <Button variant="outline" size="md">Outline</Button>
          <Button variant="ghost" size="md">Ghost</Button>
          <Button variant="primary" size="md" disabled>Disabled</Button>
        </div>
      </div>

      {/* 반응형 레이아웃 테스트 */}
      <div className="card mt-24">
        <h2 style={{ marginBottom: "16px" }}>Responsive Layout Test</h2>
        <p>
          화면 크기를 변경하여 <strong>.page-container</strong>의
          margin / width / padding 변화가 정상적으로 동작하는지 확인하세요.
        </p>
        <Button variant="primary" size="md" full className="mt-12">
          Full Width Button
        </Button>
      </div>

    </div>
  );
}
