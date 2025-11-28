# 📘 API 명세서 (Front-end Criteria)
이 문서는 프론트엔드(`React`) 기준에서 필요한 백엔드 API 규격을 정의합니다.

-----

## 0\. 🔑 공통 전제 (Prerequisites)

### 0-1. 환경 및 기본 설정

  - **Base URL**: `VITE_API_BASE_URL` (로컬 환경: `http://localhost:8080`)
  - **Authorization**: 모든 보호된 API 요청 시 헤더에 토큰 포함
    ```http
    Authorization: Bearer {accessToken}
    ```

### 0-2. 토큰 및 스토리지 관리 (FE Logic)

프론트엔드는 브라우저 `localStorage`를 사용하여 데이터를 관리합니다.

| Key | Value Description |
| :--- | :--- |
| `accessToken` | API 요청 시 사용하는 인증 토큰 |
| `refreshToken` | Access Token 만료 시 재발급용 토큰 |
| `userInfo` | 사용자 정보 객체 (최소 `{ email, nickname }` 포함) |

### 0-3. 에러 처리 및 토큰 만료 시나리오

1.  **일반 에러**: 단순 Toast/Alert 메시지로 처리 (구체적 Body 구조 의존 X).
2.  **401 Unauthorized (토큰 만료)**:
      - FE 내부 로직으로 `/api/auth/refresh` 호출 (Payload: `refreshToken`).
      - **성공 시**: 새 `accessToken` 저장 후, 실패했던 원래 요청 재시도.
      - **실패 시**: 로그아웃 처리 (스토리지 비우기) 후 `/auth/login` 페이지로 이동.

-----

## 1\. 🔐 Auth API (인증)

### 1-1. 회원가입

  - **Method**: `POST`
  - **URL**: `/api/auth/signup`

**Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | 로그인 ID |
| `password` | string | Yes | |
| `nickname` | string | Yes | |
| `userName` | string | Yes | 실명 |
| `userBirth` | string | Yes | `YYYY-MM-DD` |
| `preference` | string | No | 관심 분야 (예: `"DAILY_LIFE,TECHNOLOGY"`) |
| `goal` | string | No | 학습 목표 |
| `dailyWordGoal` | number | No | 일일 목표 단어 수 (Default: 20) |

**Response**

```json
{
  "success": true,
  "message": "Signup completed"
}
```

### 1-2. 로그인

  - **Method**: `POST`
  - **URL**: `/api/auth/login`

**Request Body**

```json
{
  "email": "test@test.com",
  "password": "1234"
}
```

**Response**

> **Note**: `user` 객체 필드가 없어도 `email`은 필수이나, 가능하면 전체 정보를 내려주는 것을 권장.

```json
{
  "accessToken": "JWT_ACCESS_TOKEN",
  "refreshToken": "JWT_REFRESH_TOKEN",
  "user": {
    "email": "test@test.com",
    "nickname": "hyuk",
    "userName": "최종혁",
    "userBirth": "2000-01-01",
    "preference": "DAILY_LIFE,TECHNOLOGY",
    "goal": "올해 토익 900",
    "dailyWordGoal": 20
  }
}
```

### 1-3. 토큰 재발급 (Refresh)

  - **Method**: `POST`
  - **URL**: `/api/auth/refresh`

**Request Body**

```json
{
  "refreshToken": "JWT_REFRESH_TOKEN"
}
```

**Response**

  - 유효하지 않은 토큰일 경우 `401` 반환.

<!-- end list -->

```json
{
  "accessToken": "NEW_ACCESS_TOKEN",
  "refreshToken": "NEW_REFRESH_TOKEN"
}
```

### 1-4. 로그아웃

  - **Method**: `POST`
  - **URL**: `/api/auth/logout/{email}`
  - **Logic**: 서버는 Refresh Token 무효화 / FE는 응답 무관하게 스토리지 클리어 및 이동.

### 1-5. 이메일 찾기

  - **Method**: `POST`
  - **URL**: `/api/auth/find-email`

**Request Body**

```json
{ "userName": "최종혁", "userBirth": "2000-01-01" }
```

**Response**

```json
{ "email": "test@test.com" }
```

### 1-6. 비밀번호 재설정 (임시 비밀번호)

  - **Method**: `POST`
  - **URL**: `/api/auth/reset-password`

**Request Body**

```json
{ "userName": "최종혁", "email": "test@test.com" }
```

**Response**

```json
{ "message": "임시 비밀번호가 이메일로 발송되었습니다." }
```

-----

## 2\. 👤 User API (사용자 정보)

### 2-1. 내 정보 조회

  - **Method**: `GET`
  - **URL**: `/api/user/me`
  - **Header**: `Authorization` 필수

**Response**

```json
{
  "email": "test@test.com",
  "userName": "최종혁",
  "nickname": "hyuk",
  "userBirth": "2000-01-01",
  "preference": "DAILY_LIFE,TECHNOLOGY",
  "goal": "올해 토익 900",
  "dailyWordGoal": 20
}
```

### 2-2. 회원 정보 수정

  - **Method**: `PATCH`
  - **URL**: `/api/user`
  - **Header**: `Authorization` 필수

**Request Body** (수정할 필드만 전송)

```json
{
  "nickname": "새닉네임",
  "dailyWordGoal": 30
}
```

**Response**

```json
{ "success": true }
```

### 2-3. 비밀번호 변경

  - **Method**: `PATCH`
  - **URL**: `/api/user/password`
  - **Header**: `Authorization` 필수

**Request Body**

```json
{
  "currentPassword": "OLD_PASSWORD",
  "newPassword": "NEW_PASSWORD"
}
```

-----

## 3\. 📊 Dashboard API

### 3-1. 대시보드 데이터 조회

  - **Method**: `GET`
  - **URL**: `/api/dashboard`
  - **Header**: `Authorization` 필수

**Response**

  - `percentage` 미제공 시 FE 계산: `(todayProgress / dailyGoal) * 100`

<!-- end list -->

```json
{
  "dailyGoal": 20,       // 일일 목표 단어 수
  "todayProgress": 15,   // 오늘 학습한 단어 수
  "percentage": 75       // 달성률 (0~100)
}
```

-----

## 4\. 📖 Word API (단어 서비스)

### 4-1. 단어 목록 조회

  - **Method**: `GET`
  - **URL**: `/words`
  - **Params**:
      - `page`: **0부터 시작** (백엔드 내부 변환 필요 시 유의)
      - `size`: 100 (고정)

**Request Example**
`GET /words?page=1&size=100`

**Response**

```json
{
  "content": [
    {
      "wordId": 1,
      "word": "Coffee",
      "meaning": "커피",
      "partOfSpeech": "Noun",
      "domain": "Daily Life",
      "level": 1,
      "isFavorite": false,
      "isCompleted": false,
      "exampleSentence": "I drink coffee every morning."
    }
  ],
  "totalPages": 1,
  "totalElements": 12,
  "page": 0,
  "size": 100
}
```

#### 📌 필터링 규칙 (Fields)

| Field | Allowed Values (Filter) |
| :--- | :--- |
| `partOfSpeech` | `Noun`, `Verb`, `Adj`, `Adv` |
| `domain` | `Daily Life`, `People & Feelings`, `Business`, `School & Learning`, `Travel`, `Food & Health`, `Technology` |
| `level` | `1` \~ `6` |

### 4-2. 단어 상세 조회

  - **Method**: `GET`
  - **URL**: `/words/{wordId}`

**Response**
목록 조회 아이템과 동일한 JSON 구조 반환.

### 4-3. 즐겨찾기 관리

  - **추가**: `POST /favorite/{wordId}` (Body 없음)
  - **삭제**: `DELETE /favorite/{wordId}`
  - **응답**: Body 없이 `200 OK`만 보장하면 됨.

### 4-4. 학습 상태 토글

  - **Method**: `POST`
  - **URL**: `/progress/{wordId}`
  - **Body**: 없음 (Body 없이 호출 시 상태 반전 `true` ↔ `false`)

**Response (Optional)**

```json
{ "wordId": 3, "isCompleted": true }
```

-----

## 5\. ✅ API 권한 요약

| 구분 | Endpoint | 비고 |
| :--- | :--- | :--- |
| **Public** | `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh` | 토큰 불필요 |
| **Public** | `/api/auth/find-email`, `/api/auth/reset-password` | 토큰 불필요 |
| **Protected** | `/api/auth/logout/{email}` | **토큰 필수** |
| **Protected** | `/api/user/**`, `/api/dashboard`, `/words/**`, `/favorite/**`, `/progress/**` | **토큰 필수** |
