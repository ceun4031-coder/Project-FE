// src/components/common/InputTest.jsx
import { Search, Eye } from "lucide-react";
import "../styles/ui/input.css";
import SearchInput from './../components/common/SearchInput';
import PasswordInput from './../components/common/PasswordInput';

/**
 * Input 스타일을 한 번에 확인하기 위한 테스트용 컴포넌트입니다.
 * - 기본 / 사이즈 / 상태 / 검색 / 아이콘 / 폼 배치까지 한 화면에서 체크할 수 있습니다.
 * - input.css에 정의된 모든 클래스(.input-*)와 SearchInput / PasswordInput 컴포넌트가
 *   실제로 어떻게 보이는지 확인하는 목적입니다.
 */
/**
 * Input 스타일을 한 번에 확인하기 위한 테스트용 컴포넌트입니다.
 * - 기본 / 사이즈 / 상태 / 검색 / 아이콘 / 폼 배치까지 한 화면에서 체크할 수 있습니다.
 * - input.css에 정의된 모든 클래스(.input-*)와 SearchInput / PasswordInput 컴포넌트가
 *   실제로 어떻게 보이는지 확인하는 목적입니다.
 */
export default function InputTest() {
  return (
    <div className="min-h-screen bg-neutral-100 px-8 py-10">
      <div className="max-w-container-web mx-auto bg-surface-1 rounded-lg shadow-soft p-8 space-y-10">
        {/* 상단 설명 */}
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Input 스타일 테스트
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            이 컴포넌트는 <code>input.css</code>에 정의된 클래스들이 실제로 어떻게
            보이는지 확인하기 위한 테스트 화면입니다. 디자인 토큰 또는 상태 색상
            수정 시 이 페이지만 새로고침해도 전체 인풋 스타일 변화를 한 번에
            체크할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
            <li>기본 인풋 형태와 사이즈(<code>input--sm/md/lg</code>) 확인</li>
            <li>
              상태 스타일(<code>input--error / warning / success / info</code>,
              disabled, readonly) 검증
            </li>
            <li>
              검색 / 아이콘 인풋(<code>input--search / input--with-left/right</code>) +
              SearchInput / PasswordInput 동작 확인
            </li>
            <li>실제 폼 배치 시 간격·가독성·라인 높이 확인</li>
          </ul>
        </header>

        {/* 1. 기본 / 사이즈 비교 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            1. 기본 / 사이즈 비교
          </h2>
          <p className="text-sm text-text-muted">
            각 사이즈에서 높이, 폰트 크기, 내부 여백이 자연스럽게 보이는지
            확인합니다.
          </p>

          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Small (<code>input input--sm</code>)
              </label>
              <input
                type="text"
                className="input input--sm"
                placeholder="작은 사이즈 인풋"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Medium (기본, <code>input input--md</code>)
              </label>
              <input
                type="text"
                className="input input--md"
                placeholder="기본 사이즈 인풋"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Large + Full (<code>input input--lg input--full</code>)
              </label>
              <input
                type="text"
                className="input input--lg input--full"
                placeholder="큰 사이즈 + 가로 전체"
              />
            </div>
          </div>
        </section>

        {/* 2. 상태별 스타일 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            2. 상태별 스타일
          </h2>
          <p className="text-sm text-text-muted">
            에러, 경고, 성공, 정보, 비활성화, 읽기 전용 등 각 상태에 따라
            배경·테두리·포커스 링이 토큰 기준으로 맞게 표시되는지 확인합니다.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 기본 */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                기본 상태 (<code>input</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full"
                placeholder="일반 상태 인풋"
              />
            </div>

            {/* Error */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                에러 (<code>input input--error</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full input--error"
                placeholder="에러가 발생한 인풋"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                폼 검증 실패, 필수 입력 누락 등 치명적인 오류에 사용합니다.
              </p>
            </div>

            {/* Warning */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                경고 (<code>input input--warning</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full input--warning"
                placeholder="주의가 필요한 값"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                즉시 막을 정도는 아니지만 사용자에게 주의를 주고 싶을 때 사용합니다.
              </p>
            </div>

            {/* Success */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                성공 (<code>input input--success</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full input--success"
                placeholder="유효한 값입니다"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                유효성 검사를 통과했을 때 피드백용으로 사용할 수 있습니다.
              </p>
            </div>

            {/* Info */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                정보 (<code>input input--info</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full input--info"
                placeholder="안내용 하이라이트"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                특정 입력값에 대한 안내나 참고 정보를 강조할 때 사용합니다.
              </p>
            </div>

            {/* Disabled */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Disabled (<code>input disabled</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full"
                placeholder="비활성화된 인풋"
                disabled
              />
              <p className="mt-1 text-[11px] text-text-muted">
                클릭/포커스/호버가 모두 차단되어야 합니다.
              </p>
            </div>

            {/* Readonly */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Readonly (<code>input[readonly]</code> 또는{" "}
                <code>input--readonly</code>)
              </label>
              <input
                type="text"
                className="input input--md input--full input--readonly"
                value="읽기 전용 인풋 값"
                readOnly
              />
              <p className="mt-1 text-[11px] text-text-muted">
                값은 보여주되, 사용자가 직접 수정할 수 없을 때 사용합니다.
                (hover/포커스 시 스타일이 변하지 않는지 확인)
              </p>
            </div>
          </div>
        </section>

        {/* 3. 검색 / 아이콘 인풋 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            3. 검색 / 아이콘 인풋
          </h2>
          <p className="text-sm text-text-muted">
            CSS 클래스 조합과 SearchInput / PasswordInput 컴포넌트를 함께
            확인합니다.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {/* CSS 레벨: 검색 인풋 + 왼쪽 Search 아이콘 */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                CSS 예시 - 검색 인풋 (<code>input--search input--with-left</code>)
              </label>
              <div className="input-wrapper">
                <button
                  type="button"
                  className="input-icon input-icon--left input-icon-button"
                  onClick={() => console.log("검색 아이콘 클릭")}
                  aria-label="검색 아이콘"
                >
                  <Search size={16} />
                </button>
                <input
                  type="text"
                  className="input input--md input--search input--with-left input--full"
                  placeholder="검색어를 입력하세요"
                />
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                lucide-react의 <code>&lt;Search /&gt;</code> 아이콘을 사용한
                순수 CSS 예시입니다.
              </p>
            </div>

            {/* CSS 레벨: 오른쪽 Eye 아이콘 */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                CSS 예시 - 오른쪽 아이콘 (<code>input--with-right</code>)
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input input--md input--with-right input--full"
                  placeholder="비밀번호"
                />
                <button
                  type="button"
                  className="input-icon input-icon--right input-icon-button"
                  onClick={() => console.log("보기 아이콘 클릭")}
                  aria-label="비밀번호 보기 아이콘"
                >
                  <Eye size={16} />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                실제 동작은 PasswordInput 컴포넌트에서 구현하고, 여기서는 정렬과
                스타일만 확인합니다.
              </p>
            </div>

            {/* 컴포넌트 레벨: SearchInput */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-medium text-text-muted">
                컴포넌트 예시 - SearchInput (돋보기 + X 동작)
              </label>
              <SearchInput
                onSearch={(value) => {
                  console.log("SearchInput onSearch:", value);
                }}
              />
              <p className="text-[11px] text-text-muted">
                돋보기 아이콘 클릭 또는 Enter 입력 시{" "}
                <code>onSearch(value)</code>가 호출됩니다. 오른쪽 X 아이콘은
                검색어를 초기화합니다.
              </p>
            </div>

            {/* 컴포넌트 레벨: PasswordInput */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-medium text-text-muted">
                컴포넌트 예시 - PasswordInput (보기/숨기기 토글)
              </label>
              <PasswordInput placeholder="비밀번호" />
              <p className="text-[11px] text-text-muted">
                오른쪽 Eye / EyeOff 아이콘 클릭 시{" "}
                <code>type=&quot;password&quot; ↔ &quot;text&quot;</code>가
                토글됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* 4. 실제 폼 배치 예시 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            4. 실제 폼 배치 예시
          </h2>
          <p className="text-sm text-text-muted">
            라벨, 설명 텍스트와 함께 실제 폼에 배치했을 때 시각적인 리듬과
            간격이 자연스러운지 확인합니다.
          </p>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-900">
                이메일
              </label>
              <input
                type="email"
                className="input input--md input--full"
                placeholder="example@email.com"
              />
              <p className="text-xs text-text-muted">
                서비스 로그인 및 알림 수신에 사용됩니다.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-900">
                비밀번호
              </label>
              <PasswordInput placeholder="8자 이상 입력" />
              <p className="text-xs text-text-muted">
                숫자, 영문, 특수문자를 조합하면 더 안전합니다.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-900">
                닉네임 검색
              </label>
              <SearchInput placeholder="닉네임으로 검색" />
              <p className="text-xs text-text-muted">
                SearchInput을 실제 폼 필드로 사용했을 때 간격과 라인 높이를 함께
                확인합니다.
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}