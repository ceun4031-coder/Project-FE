# StoryLex (Frontend)

React + Vite 기반 영어 학습 웹 애플리케이션입니다.
퀴즈·플래시카드 학습 과정에서 발생한 오답 데이터를 중심으로 복습 흐름을 설계하였으며,
대시보드에서 학습 결과를 시각적으로 확인할 수 있도록 구성하였습니다.

## Overview

StoryLex는 단어를 단순히 “외우는 도구”가 아니라,
틀린 기록을 다시 학습으로 연결하고 학습 결과를 확인하는 구조를 목표로 설계한 프로젝트입니다.

학습 → 오답 누적 → 오답노트 → 재학습 / AI 스토리


모든 학습 흐름이 끊기지 않도록
프론트엔드 상태 관리 · 라우팅 · API 처리를 구조적으로 설계하였습니다.

---

## Key Features

### Dashboard

* 오늘 학습량 / 목표 달성률
* 연속 학습 스트릭
* 주간 학습 그래프 (정답 / 오답)
* Top 5 오답 단어

### Word List / Word Detail

* 필터 (품사 / 분야 / 난이도), 검색, 페이징
* 단어 상세 정보 (뜻, 예문, 학습 상태)
* 연관 단어 (유의어 / 반의어)

### Learning

* 퀴즈 (4지선다), 플래시카드 (아는지 / 모르는지)
* 일반 학습 / 오답 기반 학습 모드
* 결과 요약 및 오답 리스트 제공

### Wrong Note

* 정렬 (최신 / 오래된 / 많이 틀린)
* 복수 선택
* 선택 단어로 재학습 또는 AI 스토리 생성

### AI Story

* 오답 단어 기반 스토리 생성
* 스토리 목록 / 상세 / 번역 / 삭제

---

## Tech Stack

* **Core**: React 19, Vite 7
* **Routing**: React Router DOM 7
* **Server State**: TanStack Query v5
* **Global State**: Zustand v5
* **Network**: Axios
* **Chart**: Recharts
* **UI**: Lucide React, Font Awesome
* **Styling**: CSS Modules

---

## Frontend Architecture

### 1) App Entry & Providers

* **QueryClientProvider**

  * 서버 상태를 React Query로 통일
  * 캐싱 / 로딩 / 재요청 패턴 표준화

* **BrowserRouter**

  * SPA 라우팅 관리

* **AuthProvider**

  * 앱 최초 로딩 시 세션 복원 (`/api/user/me`)
  * 새로고침 후에도 로그인 상태 유지

---

### 2) Layout & Routing 설계

* Header / Footer 고정
* 라우트 변경 시 중앙 콘텐츠만 교체
* 공개 라우트 / 보호 라우트 분리
* **ProtectedRoute**에서 인증 여부를 일괄 체크
  → 각 페이지에서 인증 분기 코드 제거

#### Routes

* `/` → 랜딩
* `/auth/*` → 로그인 / 회원가입
* `/dashboard` → 대시보드
* `/words/*` → 단어장
* `/learning/*` → 학습
* `/stories/*` → AI 스토리
* `/account/*` → 프로필

---

### 3) 인증 / 세션 처리

* **JWT + Refresh Token 구조**

* **Axios 인터셉터 기반 처리**

  * 요청 시 인증 헤더 자동 주입
  * 401 발생 시 refresh → 원 요청 자동 재시도

* **동시성 제어**

  * refresh 중 중복 요청은 큐로 대기
  * refresh 폭주 및 race condition 방지

* 인증 상태는 **Zustand + localStorage**로 동기화

> 인증 로직을 한 곳에서 처리하고,
> 나머지 화면/기능 코드는 인증을 신경 쓰지 않도록 분리

---

### 4) State Management 역할 분리

* **TanStack Query (Server State)**

  * 단어, 학습 결과, 대시보드, 오답노트, 스토리 데이터
  * 캐싱 + invalidation으로 화면 간 데이터 일관성 유지

* **Zustand (Client State)**

  * 로그인 세션, 사용자 설정 등 앱 전역 상태

* **URL Query Sync**

  * 필터 / 모드 상태를 URL과 동기화
  * 새로고침 · 공유 시 상태 유지

---

### 5) API 응답 정규화 (Normalize Layer)

* 백엔드 응답 필드명이 일부 달라도
  UI 코드가 흔들리지 않도록 **normalize 계층 분리**
* 화면에서는 항상 동일한 데이터 구조 사용
  (예: 오답 로그, 단어 데이터 normalize 처리)

---

## Directory Structure (도메인 기준)

```txt
src
├── api/               # API 통신 (도메인별 분리)
├── components/
│   ├── common/        # 재사용 UI
│   └── layout/        # Header / Footer
├── pages/             # 라우팅 페이지 (도메인 단위)
│   ├── auth/
│   ├── dashboard/
│   ├── learning/
│   ├── stories/
│   └── words/
├── store/             # Zustand
├── styles/            # 전역 스타일
└── utils/             # 공통 유틸
```
---

## Development Convenience

### Mock Mode 지원

* `VITE_USE_MOCK=true`
* 백엔드 없이도 인증·학습 플로우 개발 가능
* 프론트엔드 개발 속도와 독립성 확보 목적

---

## Getting Started

### 1) Clone

```bash
git clone [repository-url]
cd [project-folder]
```

### 2) Install

```bash
npm ci
```

### 3) Run (Dev)

```bash
npm run dev
```

### 4) Build

```bash
npm run build
```

### 5) Preview

```bash
npm run preview
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
```

---

## Summary

StoryLex 프론트엔드는 **인증 · 라우팅 · 서버 상태 · 전역 상태를 중앙에서 관리**하고,
각 페이지는 **자신의 기능에만 집중**하도록 설계한 프로젝트입니다.
실제 서비스 흐름을 기준으로 구조를 나누고, 유지보수와 확장을 고려해 구현했습니다.
