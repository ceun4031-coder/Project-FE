// src/pages/dashboard/DashboardPage.jsx

// 임시 대시보드 페이지
// - 라우터에서 path="/dashboard"에 연결해서 사용
// - 실제 기능/통계 붙이기 전까지 레이아웃/스타일만 확인하는 용도

export default function DashboardPage() {
  return (
    <main className="page-container py-8">
      {/* 상단 영역 */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">
          대시보드 (임시 화면)
        </h1>
        <p className="text-sm text-text-muted">
          아직 실제 데이터는 연결되지 않은 임시 대시보드입니다.
          <br />
          나중에 학습 통계, 최근 스토리, 즐겨찾기 단어 요약 등을 이 영역에 배치하면 됩니다.
        </p>
      </section>

      {/* 카드 레이아웃 예시 */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card space-y-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            오늘의 학습 진행도
          </h2>
          <p className="text-sm text-text-muted">
            오늘 학습한 단어/스토리 수, 퀴즈 진행 상황 등을 요약해서 보여줄 수 있습니다.
          </p>
          <div className="mt-2 h-2 rounded-full bg-neutral-200">
            <div className="h-full w-1/3 rounded-full bg-primary-500" />
          </div>
          <p className="mt-1 text-xs text-text-muted">예시: 3 / 10 완료</p>
        </div>

        <div className="card space-y-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            최근 학습한 단어
          </h2>
          <ul className="text-sm text-text-muted space-y-1">
            <li>• example – 예시</li>
            <li>• story – 이야기</li>
            <li>• vocabulary – 어휘</li>
          </ul>
          <p className="mt-1 text-[11px] text-text-muted">
            나중에 실제 API 연동 후, 최근 학습한 단어 목록을 이 위치에 표시하면 됩니다.
          </p>
        </div>

        <div className="card space-y-2 md:col-span-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            안내 메시지
          </h2>
          <p className="text-sm text-text-muted">
            이 화면은 임시 레이아웃입니다. 기능 개발 시 대략 다음과 같은 블록을 배치할 수 있습니다:
          </p>
          <ul className="text-sm text-text-muted list-disc pl-5 space-y-1">
            <li>오늘/이번 주 학습 통계</li>
            <li>추천 스토리 / 추천 단어</li>
            <li>최근 학습 이어하기 버튼</li>
            <li>즐겨찾기 / 오답 노트 바로가기</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
