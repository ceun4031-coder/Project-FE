## 0. 공통: httpClient / 인증

### 0-1. 기본 설정

* Base URL: `.env` 의 `VITE_API_BASE_URL`

  * 없으면 기본값: `http://localhost:8080`
* 모든 요청: `withCredentials: true`
* 인증 헤더

```http
Authorization: Bearer {accessToken}
```

프론트는 `localStorage` 에서 `getAccessToken()` 으로 읽어서 자동으로 붙인다.

---

### 0-2. Access / Refresh 토큰 규칙

1. **로그인 응답** (`POST /api/auth/login`)

* 두 형태 모두 허용 (프론트가 둘 다 처리함)

```json
{ "accessToken": "string", "refreshToken": "string" }
```

또는

```json
{ "access": "string", "refresh": "string" }
```

2. **리프레시 응답** (`POST /api/auth/refresh`)

* 여기는 **반드시 아래 키 이름으로** 내려줘야 한다.

  * 프론트 코드가 `data.accessToken` / `data.refreshToken` 만 본다.

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

* `refreshToken` 은 옵션. 새로 발급 안 할 거면 안 보내도 됨.

3. **401 처리 플로우 (실서버 모드에서만)**

* 응답이 401이고:

  * 요청 URL 이 `/api/auth/login` 이면 → 바로 에러 반환 (리프레시 안 함)
  * 요청 URL 이 `/api/auth/refresh` 이거나 `_retry` 이미 true 이면

    * 토큰 삭제 후 `/auth/login` 으로 리다이렉트
* 그 외 401:

  * `localStorage` 에서 `refreshToken` 조회
  * 없으면: 토큰 삭제 + `/auth/login` 이동
  * 있으면: `POST /api/auth/refresh` 호출

    * 성공: `accessToken` 저장 + 대기 중이던 요청들 재시도
    * 실패(401 포함): 토큰 삭제 + `/auth/login` 이동

---

## 1. Auth API (`src/api/authApi.js`)

### 1-1. 이메일 찾기

#### [POST] /api/auth/find-email

Request

```json
{
  "userName": "홍길동",
  "userBirth": "1998-01-01"
}
```

Response

```json
{
  "email": "user@example.com"
}
```

---

### 1-2. 비밀번호 재설정 (임시 비밀번호 발송)

#### [POST] /api/auth/reset-password

Request

```json
{
  "userName": "홍길동",
  "email": "user@example.com"
}
```

Response

```json
{
  "message": "임시 비밀번호가 이메일로 발송되었습니다."
}
```

---

### 1-3. 로그인

#### [POST] /api/auth/login

Request

```json
{
  "email": "user@example.com",
  "password": "plain-password"
}
```

Response (둘 중 하나 허용)

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

또는

```json
{
  "access": "string",
  "refresh": "string"
}
```

프론트 흐름

1. `/api/auth/login` 호출 → 토큰 파싱 후 `localStorage` 저장
2. 바로 `GET /api/user/me` 호출해서 유저 정보 가져옴
3. `AuthContext` 에서 `user`, `accessToken`, `refreshToken` 을 상태로 씀

---

### 1-4. 이메일 중복 체크

#### [POST] /api/auth/check-email

Request

```json
{
  "email": "user@example.com"
}
```

Response

```json
{
  "exists": true,
  "message": "이미 사용 중인 이메일입니다."
}
```

또는

```json
{
  "exists": false,
  "message": "사용 가능한 이메일입니다."
}
```

---

### 1-5. 회원가입

#### [POST] /api/auth/signup

Request

```json
{
  "email": "user@example.com",
  "password": "plain-password",
  "nickname": "닉네임",
  "userName": "홍길동",
  "userBirth": "1998-01-01",
  "preference": "BUSINESS",   // nullable
  "goal": "취업 준비",        // nullable
  "dailyWordGoal": 20         // nullable (number)
}
```

Response (현재 프론트는 String/객체 둘 다 처리 가능하게 되어 있음)

권장:

```json
{
  "success": true,
  "message": "회원가입 완료"
}
```

혹은 단순 string:

```json
"회원가입 완료"
```

프론트는 최종적으로

```json
{ "success": true, "message": "..." }
```

형태로 재가공해서 사용.

---

### 1-6. 로그아웃

#### [POST] /api/auth/logout/{email}

* Path: `email` (로그인 유저의 이메일)
* Request Body: 없음
* Response: 아무 형식이나 가능 (프론트는 응답 내용 신경 안 씀)

프론트는 요청을 보내기 전에 이미

* 토큰 삭제
* `window.dispatchEvent(new Event("auth:logout"))` 호출

해서 UI 측 상태는 정리한다.

---

### 1-7. 현재 로그인 사용자 정보 조회

#### [GET] /api/user/me

Response 예시

```json
{
  "userId": 1,
  "email": "user@example.com",
  "userName": "홍길동",
  "nickname": "열공러",
  "userBirth": "1999-01-01",
  "preference": "DAILY_LIFE",   // enum string
  "goal": "영어 마스터하기",
  "dailyWordGoal": 30
}
```

이 엔드포인트는

* `authApi.login` 내부
* `userApi.getMyInfo` 내부

모두에서 사용한다.

---

## 2. User API (`src/api/userApi.js`)

### 2-1. 내 정보 조회

#### [GET] /api/user/me

* 위 1-7 과 동일

---

### 2-2. 회원 정보 수정

#### [PATCH] /api/user

Request 예시

```json
{
  "nickname": "새 닉네임",
  "userBirth": "1998-10-10",
  "preference": "BUSINESS",
  "goal": "토익 900",
  "dailyWordGoal": 40
}
```

Response

* 수정된 전체 유저 정보 (`GET /api/user/me` 응답과 동일 구조)

---

### 2-3. 비밀번호 변경

#### [PATCH] /api/user/password

Request 예시

```json
{
  "currentPassword": "old1234",
  "newPassword": "new1234"
}
```

Response 예시

```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다."
}
```

---

## 3. Word API (`src/api/wordApi.js`)

### 3-0. Word 공통 스키마 (권장)

```json
{
  "wordId": 1,
  "word": "Coffee",
  "meaning": "커피",
  "partOfSpeech": "Noun",
  "category": "Daily Life",
  "level": 1,
  "isFavorite": false,
  "isCompleted": false,
  "exampleSentenceEn": "I drink coffee every morning.",
  "exampleSentenceKo": "나는 매일 아침 커피를 마신다."
}
```

프론트는 `mapWordFromApi()` 로 위 구조를 기준으로 정규화해서 사용한다.

* `partOfSpeech` 는 DB 값이 달라도 프론트에서 `Noun/Verb/Adj/Adv` 로 통일함
* `level` / `wordLevel` 둘 다 받아줌 (권장: `level`)

---

### 3-1. 단어 목록 (페이지)

#### [GET] /api/words

Query

* `page`: number (0-based)
* `size`: number

Response

```json
{
  "content": [ { /* Word */ } ],
  "totalPages": 5,
  "totalElements": 100,
  "page": 0,
  "size": 20
}
```

---

### 3-2. 전체 단어 목록

#### [GET] /api/words/all

Response

```json
[
  { /* Word */ }
]
```

---

### 3-3. 오늘의 단어

#### [GET] /api/words/today

Response

```json
{ /* Word */ }
```

---

### 3-4. 단어 검색

#### [GET] /api/words/search

Query

* `keyword`: string
* `page`: number
* `size`: number

Response

* 3-1 과 동일한 Page 구조

---

### 3-5. 필터 검색

#### [GET] /api/words/filter

Query

* `category`: string

  * `"Daily Life"`, `"Business"` 등
  * `"All"` 또는 미전송이면 필터 없음
* `level`: string 또는 number

  * `"1" ~ "6"` 등
  * `"All"` 또는 미전송이면 필터 없음
* `partOfSpeech`: string

  * `"Noun" | "Verb" | "Adj" | "Adv" | "All"`
* `page`: number
* `size`: number

Response

* 3-1 과 동일 Page 구조

---

### 3-6. 단어 상세

#### [GET] /api/words/detail/{wordId}

Response

```json
{ /* Word */ }
```

---

### 3-7. 전체 단어 개수 테스트

#### [GET] /api/words/test-count

Response

```json
12345
```

숫자 단일값.

---

### 3-8. 즐겨찾기

#### [POST] /api/favorites/{wordId}

* Body: 없음
* Response:

  * 200 또는 201이면 성공
  * 이미 즐겨찾기 상태인 경우 400 + `"이미 즐겨찾기한 단어입니다."` 도 허용
    (프론트는 이 경우도 성공으로 취급)

#### [DELETE] /api/favorites/{wordId}

* Body: 없음
* Response:

  * 200 또는 204 → 성공
  * 400 이지만 “이미 해제된 상태” 도 성공 취급 가능

#### [GET] /api/favorites

Response

```json
[
  { /* Word */, "isFavorite": true }
]
```

---

### 3-9. 학습 완료 단어

#### [GET] /api/completed

Response

```json
[
  { /* Word */, "isCompleted": true }
]
```

#### [GET] /api/completed/{wordId}/status

Response

```json
{
  "wordId": 10,
  "completed": true
}
```

---

## 4. Study API (학습 로그) – 카드/퀴즈에서 사용

별도 JS 파일은 없고, `cardApi` 에서만 직접 호출한다.

### 4-1. 정답 처리

#### [POST] /api/study/{wordId}/correct

* Body: 없음
* Response: 형식 자유 (프론트는 응답 내용 사용 안 함)

---

### 4-2. 오답 처리

#### [POST] /api/study/{wordId}/wrong

* Body: 없음
* Response: 형식 자유 (프론트는 응답 내용 사용 안 함)

---

## 5. Wrong Answer API (`src/api/wrongApi.js`)

### 5-0. Wrong 공통 스키마 (권장)

```json
{
  "wrongWordId": 1,
  "wordId": 101,
  "word": "ambiguous",
  "meaning": "애매모호한",
  "wordLevel": 1,
  "wrongAt": "2025-12-10T10:00:00",
  "totalCorrect": 1,
  "totalWrong": 3,
  "isUsedInStory": "N"   // "Y" or "N"
}
```

프론트는 `normalizeWrongItem()` 으로 위 형태로 맞춰 사용한다.

---

### 5-1. 오답 기록 추가

#### [POST] /api/wrong/{wordId}

Response

```json
{ /* Wrong */ }
```

* `cardApi.submitCardResult` 에서 `"unknown"` 일 때 호출

---

### 5-2. 오답 기록 삭제 (wordId 기준)

#### [DELETE] /api/wrong/{wordId}

* Response: 형식 자유 (프론트는 상태코드/성공 여부만 사용)

---

### 5-3. 내 오답 목록 전체 조회

#### [GET] /api/wrong

* Query: 없음 (필터는 프론트에서 클라이언트 사이드로 처리)

Response

```json
[
  { /* Wrong */ }
]
```

프론트는

* 전체 배열 받아서

  * 날짜/사용 여부/횟수로 정렬/필터
  * 페이지네이션도 프론트에서 수행

---

### 5-4. 스토리 미사용 오답 목록

#### [GET] /api/wrong/unused

Response

```json
[
  {
    "wrongWordId": 1,
    "wordId": 101,
    "word": "ambiguous",
    "meaning": "애매모호한"
  }
]
```

스토리 생성(수동/AI)에서 “아직 스토리에서 안 쓴 오답 단어들” 목록용.

---

### 5-5. 오답 → 스토리 사용됨 처리

#### [POST] /api/wrong/mark-used/{wrongLogId}

* Path: `wrongLogId` = `wrongWordId`
* Response (권장)

```json
{ "success": true }
```

---

### 5-6. 최근 퀴즈 오답 (대시보드/홈)

이건 `wrongApi` 에 구현돼 있지만 실제 엔드포인트는 Quiz 쪽이다.

#### [GET] /api/quiz/recent-wrong

Response 예시

```json
[
  {
    "wrongWordId": 1,
    "wordId": 101,
    "word": "ambiguous",
    "meaning": "애매모호한",
    "wrongAt": "2025-12-10T10:00:00"
  }
]
```

프론트 최종 사용 형태

```json
{
  "wrongLogId": 1,
  "wordId": 101,
  "word": "ambiguous",
  "meaning": "애매모호한"
}
```

---

## 6. Flashcard API (`src/api/cardApi.js`)

### 6-1. 일반 카드

#### [GET] /api/flashcard

Query

* `count`: number (카드 개수)
* `level`: string (optional, 난이도 필터)
* `category`: string (optional, 분야 필터)

Response

```json
[
  {
    "wordId": 1001,
    "word": "abandon",
    "meaning": "버리다",
    "level": 3
  }
]
```

프론트 변환

```json
{
  "id": wordId,
  "wordId": wordId,
  "frontText": word,
  "backText": meaning,
  "level": level
}
```

---

### 6-2. 오답 카드

#### [GET] /api/flashcard/wrong

Query

* `count`: number (가져올 카드 수)

Response

* 6-1 과 동일 구조의 배열

프론트는

* `source === "wrong-note"` 일 때 `/api/flashcard/wrong` 호출
* 이후 특정 `wordIds` 필터는 프론트에서 처리 (요청단에서는 wordIds 안 보냄)

---

### 6-3. 카드 학습 결과 제출

프론트 함수: `submitCardResult({ wordId, result })`
서버에서 받는 엔드포인트는 4번/5번과 동일.

* `result === "unknown"` (몰랐다)

  1. `POST /api/study/{wordId}/wrong`
  2. `POST /api/wrong/{wordId}` → 반환된 Wrong 하나를 `wrongAnswerLog` 로 사용

* `result === "known"` (알았다)

  * `POST /api/study/{wordId}/correct`

서버에서 따로 “카드 결과 전용 API” 는 없다.

---

## 7. Quiz API (`src/api/quizApi.js`)

### 7-1. 객관식 퀴즈 조회

#### [GET] /api/quiz

프론트 파라미터

```ts
{
  source: 'quiz' | 'wrong-note'; // 'wrong-note'면 오답 기반 모드
  limit?: number;                // 원하는 문제 수
  level?: string | null;         // 'all' or 난이도
  wordIds?: number[];            // 특정 단어들만 내고 싶을 때
  category?: string | null;      // 분야 (Daily Life, Business 등)
}
```

Query 매핑

* `mode`: `"normal"` | `"wrong"`
  (`source === 'wrong-note'` 이면 `"wrong"`, 아니면 `"normal"`)
* `count`: number (limit 이 숫자면 이 값 사용)
* `level`: string (소문자, `"all"` 이면 아예 안 보냄)
* `category`: string (`"All"` 이면 안 보냄)
* `wordIds`: `"1,2,3"` (쉼표로 join)

권장 Request 예시

```http
GET /api/quiz?mode=normal&count=10&level=1&category=Business&wordIds=1,2,3
```

Response 권장 스키마 (배열)

```json
[
  {
    "quizId": 1,
    "wordId": 21,
    "word": "coffee",
    "question": "'coffee'의 뜻은 무엇인가요?",
    "options": ["커피", "사과", "나무", "오렌지"],
    "answerIndex": 0,
    "meaningKo": "커피",
    "partOfSpeech": "Noun",
    "level": 1,
    "wrongWordId": null
  }
]
```

프론트 정규화 결과

```json
{
  "id": 1,
  "question": "'coffee'의 뜻은 무엇인가요?",
  "options": ["커피", "사과", "나무", "오렌지"],
  "answer": 0,                  // 0-based 정답 인덱스
  "word": "coffee",
  "meaning": "커피",
  "meaningKo": "커피",
  "partOfSpeech": "Noun",
  "level": 1,
  "wrongWordId": null
}
```

---

### 7-2. 퀴즈 결과 저장 (배치)

#### [POST] /api/quiz/result

Request

```json
{
  "mode": "normal",  // "normal" | "wrong"
  "answers": [
    { "wordId": 21, "correct": true },
    { "wordId": 22, "correct": false }
  ]
}
```

Response 권장

```json
{
  "success": true,
  "message": "퀴즈 결과 저장 완료",
  "wrongWordIds": [22, 30, 31]
}
```

---

### 7-3. 최근 퀴즈 오답

#### [GET] /api/quiz/recent-wrong

* 5-6 항목 참고 (Wrong API에서 사용)

---

## 8. Story / AI Story API

### 8-1. 내 스토리 목록 (`src/api/storyApi.js`)

#### [GET] /api/story

Response

```json
[
  {
    "storyId": 1,
    "title": "First Snow in Seoul",
    "storyEn": "On the first snowy morning, ...",
    "storyKo": "첫 눈이 내리던 아침, ...",
    "createdAt": "2025-11-26T09:00:00"
  }
]
```

---

### 8-2. 스토리 상세

#### [GET] /api/story/{storyId}

Response

```json
{
  "storyId": 1,
  "title": "First Snow in Seoul",
  "storyEn": "On the first snowy morning, ...",
  "storyKo": "첫 눈이 내리던 아침, ...",
  "createdAt": "2025-11-26T09:00:00"
}
```

---

### 8-3. 스토리에 사용된 단어 목록

#### [GET] /api/story/{storyId}/words

Response 권장

```json
[
  {
    "wordId": 101,
    "word": "ambiguous",
    "meaning": "애매모호한",
    "partOfSpeech": "adj.",
    "level": 2
  }
]
```

프론트는 내부에서 `{ text, pos, meaning }` 형태로 변환해서 사용한다.

---

### 8-4. 스토리 저장 (수동 스토리)

#### [POST] /api/story

Request

```json
{
  "title": "My Story",
  "storyEn": "Once upon a time ...",
  "storyKo": "옛날 옛적에 ...",
  "wrongLogIds": [111, 222, 333]   // optional
}
```

Response

```json
{
  "storyId": 10,
  "title": "My Story",
  "storyEn": "Once upon a time ...",
  "storyKo": "옛날 옛적에 ...",
  "createdAt": "2025-12-10T10:00:00"
}
```

* `wrongLogIds` 가 있으면, 서버에서 해당 오답 로그들을 `isUsedInStory = 'Y'` 처리해도 된다.

---

### 8-5. 스토리 삭제

#### [DELETE] /api/story/{storyId}

Response 권장

```json
{
  "success": true,
  "message": "스토리가 삭제되었습니다.",
  "storyId": 10
}
```

---

### 8-6. AI 스토리 생성 + 저장 (`src/api/aiStoryApi.js`)

#### [POST] /api/ai/story

Request

```json
{
  "wrongAnswerLogIds": [111, 222, 333]
}
```

* 배열이 비어 있으면 프론트에서 호출을 막으므로, 서버에서는 비어 있는 케이스 안 들어온다고 봐도 됨.

Response 권장

```json
{
  "success": true,
  "message": "스토리가 생성되었습니다.",
  "storyId": 10,
  "title": "A Rainy Day in Seoul",
  "storyEn": "Once upon a time ...",
  "storyKo": "옛날에 ...",
  "usedWords": [
    { "text": "ambiguous", "meaning": "애매모호한", "pos": "adj." }
  ]
}
```

---

## 9. Dashboard API (`src/api/dashboardApi.js`)

### 9-1. 오늘의 목표

#### [GET] /api/dashboard/daily-goal

Response 권장

```json
{
  "nickname": "홍길동",
  "dailyGoal": 30,
  "todayProgress": 12,
  "percentage": 40
}
```

* `percentage` = 달성률(%) (예: `todayProgress / dailyGoal * 100`)

---

### 9-2. 전체 학습 통계

#### [GET] /api/dashboard/stats

Response 권장

```json
{
  "totalLearnedWords": 1250,
  "wrongWords": 10,
  "streakDays": 5
}
```

---

### 9-3. 최근 7일 학습량

#### [GET] /api/dashboard/weekly

Response 권장

```json
[
  {
    "date": "2025-12-01",
    "learnedCount": 15,
    "wrongCount": 2
  }
]
```

* `date`: `"YYYY-MM-DD"`

---

### 9-4. 오답 TOP 5

#### [GET] /api/dashboard/wrong/top5

Query

* `days`: number (최근 N일 기준, 기본 7)

Response 권장

```json
[
  {
    "wordId": 1,
    "word": "Coffee",
    "meaning": "커피",
    "count": 5
  }
]
```

---

## 10. Word Cluster API (`src/api/wordClusterApi.js`)

### 10-0. Raw 스키마 (권장)

```json
[
  {
    "clusterWordId": 1,
    "centerWord": { "wordId": 10 },
    "relatedWord": {
      "wordId": 21,
      "word": "curious",
      "meaning": "호기심 많은",
      "level": 1
    },
    "score": 0.87,
    "type": "synonym"   // "synonym" | "antonym" | "similarity"
  }
]
```

프론트 내부 변환 결과

```json
{
  "similar": [ { /* dto */ } ],
  "opposite": [ { /* dto */ } ]
}
```

각 dto:

```json
{
  "id": 1,
  "centerWordId": 10,
  "wordId": 21,
  "text": "curious",
  "meaning": "호기심 많은",
  "level": 1,
  "score": 0.87,
  "type": "synonym",
  "inMyList": false
}
```

---

### 10-1. 특정 단어 클러스터 조회

#### [GET] /api/cluster

Query

* `wordId`: long

Response

* 위 Raw 스키마 배열

---

### 10-2. 클러스터 생성

#### [POST] /api/cluster/create

Query

* `wordId`: long

Request Body

* 없음

Response

* 바디 없어도 되지만, 생성 후 다시 `GET /api/cluster?wordId=...` 를 호출해서 최신 데이터 사용하므로, 200/201 만 제대로 주면 됨.

---

### 10-3. 내 클러스터 전체 조회

#### [GET] /api/cluster/all

Response

* 형식 자유 (프론트는 그대로 리스트로 사용, 별도 변환 없음)

---

### 10-4. 특정 중심 단어 클러스터 삭제

#### [DELETE] /api/cluster

Query

* `wordId`: long

Response

* 형식 자유 (프론트는 응답 내용 안 씀, 캐시만 지움)

---

### 10-5. 모든 클러스터 삭제

#### [DELETE] /api/cluster/all

Response

* 형식 자유

