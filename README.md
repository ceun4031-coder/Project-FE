# 📘 프론트 연동용 백엔드 API 명세

(2025-12-11 기준 최신 / 프론트 실제 사용 스펙 기준)

> 이 문서는 **현재 프론트엔드 코드가 실제로 사용 중인 API 스펙**입니다.  
> 아래 스펙과 다르면 로그인/퀴즈/학습하기/오답노트/스토리/대시보드/단어장 화면이 정상 작동하지 않습니다.  
> 백엔드에서 URL, HTTP Method, 파라미터 이름, 응답 JSON 구조를 변경할 때는
> 반드시 이 문서를 기준으로 프론트와 먼저 합의해 주세요.

## 🔥 우선순위 1순위로 맞춰야 하는 부분

1. **모든 `@PathVariable` 에 이름 명시**
   - 예: `@PathVariable("wordId") Long wordId`
2. **`POST /api/auth/refresh` 응답 키**
   - 반드시 `accessToken`, `refreshToken` 이름 사용 (프론트 고정)
3. **`GET /api/quiz` 파라미터 이름**
   - `mode`, `count`, `level`, `category`, `wordIds` 그대로 사용
4. **정답/오답 처리 연동**
   - 정답: `POST /api/study/{wordId}/correct` → study_log 반영
   - 오답: `POST /api/study/{wordId}/wrong` + `POST /api/wrong/{wordId}`

---

## ✅ 0. 서비스 개념 / 도메인 흐름 정리

1. **“전체 단어” 브라우징 메뉴 없음**

   - 상단 메뉴에 “전체 단어” 같은 글로벌 브라우저는 없다.
   - `단어장` 메뉴는 **회원별 학습 데이터 기반 개인 단어장** 화면이다.
     - 추천/관심분야 기반 단어 세트
     - 내가 틀린 단어(오답)
     - 즐겨찾기
     - 학습 완료 단어
     - 검색/필터 결과  
       → 전부 **“내 학습 이력 기반 뷰”**이지, 사전 전체 브라우저가 아니다.

2. **관심분야(`preference`)와 학습 흐름**

   - `preference` 값은 `GET /api/user/me` 응답에 포함된다.
   - `preference` 가 없는 경우
     - 대시보드 / 학습 / 단어장 등 **처음 진입 시** 프론트에서 배너/모달로 “관심분야 설정”을 유도한다.
   - 실제 학습은
     - 사용자가 어떤 카테고리(`Daily Life`, `Business`, …)든 자유롭게 선택 가능하다.
     - 선택한 카테고리와 무관하게, 학습 과정에서 발생한 **정답/오답 결과는 모두**
       - `POST /api/study/{wordId}/correct`
       - `POST /api/study/{wordId}/wrong`
       - 그리고 `/api/wrong`, `/api/completed`  
         로 기록되어 **내 단어장 데이터**를 구성한다.

3. **연관단어(클러스터) – 프론트 구현 vs 현재 서버 상태**

   - **프론트 구현 상태**
     - Word Cluster API 응답의 `type` 값을 기준으로 처리하도록 구현되어 있다.
       - `type === "synonym"` → 유의어 영역에 표시
       - `type === "antonym"` → 반의어 영역에 표시  
         (UI/로직은 구현되어 있어, 데이터만 내려오면 바로 노출 가능)
     - 각 연관단어에 대해
       - “내 단어장에 추가”(예: 즐겨찾기 등) 할 수 있도록 호출부도 구현해 둔 상태이다.
       - 백엔드에서 해당 단어를 단어장 데이터(`favorites` 등)에 반영해 주면 바로 동작 가능하다.

   - **현재 실서버 연동 결과(문제 상황)**
     - `GET /api/cluster?wordId=...` 호출 시
       - `synonym` 타입 데이터만 내려오고,
       - `antonym` 타입 데이터는 내려오지 않아 **반의어 영역은 항상 비어 있는 상태**이다.
     - 연관단어에서 “내 단어장에 추가”를 시도할 경우
       - 이를 처리하는 별도 API/로직이 서버 쪽에 설계/구현되어 있지 않아,
       - **실서버 기준으로는 단어장에 실제 저장이 되지 않는 상태**이다.

   - **요약**
     - 프론트는 **유의어/반의어 표시 + 연관단어에서 단어장 추가까지 처리 가능한 상태**로 구현되어 있다.
     - 현재 반의어 미표시 및 연관단어 → 단어장 미반영 문제는  
       **백엔드 API/데이터 미구현으로 인해 발생하는 상태**이다.

---

## 🔐 1. 공통: httpClient / 인증 규칙

### 1-1. 기본 설정

* Base URL

  * `.env` 의 `VITE_API_BASE_URL`
  * 없으면 기본값: `http://localhost:8080`
* 모든 요청: `withCredentials: true`
* 인증 헤더

```http
Authorization: Bearer {accessToken}
```

프론트는 `localStorage` 에 저장된 값을 `getAccessToken()` 으로 읽어 자동으로 붙인다.

---

### 1-2. Access / Refresh 토큰 규칙

1. **로그인 응답** (`POST /api/auth/login`)

   * 아래 **둘 다 허용** (프론트가 둘 다 처리)

   ```json
   { "accessToken": "string", "refreshToken": "string" }
   ```

   또는

   ```json
   { "access": "string", "refresh": "string" }
   ```

2. **리프레시 응답** (`POST /api/auth/refresh`)

   * 이 엔드포인트는 **반드시 아래 키 이름으로** 내려줘야 한다.
   * 프론트 코드가 `data.accessToken`, `data.refreshToken` 만 본다.

   ```json
   {
     "accessToken": "string",
     "refreshToken": "string"   // 선택 (미발급 시 생략 가능)
   }
   ```

3. **401 처리 플로우 (실서버 모드에서만 동작)**

   * 응답이 401일 때

     * 요청 URL 이 `/api/auth/login` 이면
       → 바로 에러 반환 (리프레시 시도 안 함)
     * 요청 URL 이 `/api/auth/refresh` 이거나, 요청 config 에 `_retry` 가 이미 `true` 인 경우
       → 토큰 삭제 후 `/auth/login` 으로 리다이렉트

   * 그 외 모든 401

     1. `localStorage` 에서 `refreshToken` 조회
     2. 없으면 → 토큰 삭제 + `/auth/login` 이동
     3. 있으면 → `POST /api/auth/refresh` 호출

        * 성공
          → `accessToken` 갱신, 대기 중이던 요청들 재시도
        * 실패(401 포함)
          → 토큰 삭제 + `/auth/login` 이동

---

## 🧩 2. 공통 필수 구현 포인트 (백엔드 주의사항)

### 2-1. 모든 `@PathVariable` 에 이름 명시

```java
// ❌ 지양
@GetMapping("/study/{wordId}")
public ResponseEntity<?> foo(@PathVariable Long wordId) { ... }

// ✅ 권장
@GetMapping("/study/{wordId}")
public ResponseEntity<?> foo(@PathVariable("wordId") Long wordId) { ... }
```

적용 대상(예시):

* StudyLogController
* WrongAnswerLogController
* StoryController
* WordController (detail)
* Favorite / Completed 관련 컨트롤러
* QuizController
* 그 외 `{id}`, `{wordId}`, `{storyId}`, `{email}` 등 PathVariable 사용하는 모든 엔드포인트

---

### 2-2. QuizController 파라미터 매핑 규칙

프론트는 `GET /api/quiz` 를 다음 형태로 호출한다.

* 프론트 파라미터 타입 (참고용)

```ts
{
  source: 'quiz' | 'wrong-note'; // 'wrong-note'면 오답 기반 모드
  limit?: number;                // 원하는 문제 수
  level?: string | null;         // 'all' or 난이도
  wordIds?: number[];            // 특정 단어만 내고 싶을 때
  category?: string | null;      // 분야 (Daily Life, Business 등)
}
```

* 쿼리 매핑

| 이름         | 타입         | 설명                                                              |
| ---------- | ---------- | --------------------------------------------------------------- |
| `mode`     | string     | `"normal"` 또는 `"wrong"` (`source === 'wrong-note'` → `"wrong"`) |
| `count`    | number     | 실제 문제 수. `limit` 이 넘어오면 `count` 로 매핑 가능                         |
| `level`    | string     | 난이도. `"all"` 이면 미전송                                             |
| `category` | string     | `"Daily Life"`, `"Business"` 등, `"All"` 이면 미전송                  |
| `wordIds`  | `1,2,3` 형태 | 쉼표로 join 된 문자열 또는 `List<Long>` 로 받는 방식 모두 가능                    |

* 백엔드 메서드 예시

```java
@GetMapping
public ResponseEntity<List<QuizQuestionResponse>> getQuiz(
        @RequestParam(name = "mode", defaultValue = "normal") String mode,
        @RequestParam(name = "count", required = false) Integer count,
        @RequestParam(name = "limit", required = false) Integer limit,
        @RequestParam(name = "level", required = false) String level,
        @RequestParam(name = "category", required = false) String category,
        @RequestParam(name = "wordIds", required = false) List<Long> wordIds
) {
    int finalCount = (count != null) ? count : (limit != null ? limit : 10);
    return ResponseEntity.ok(
            quizService.getQuiz(mode, finalCount, level, category, wordIds)
    );
}
```

---

### 2-3. Study / Wrong / Completed 연동 로직

1. **정답 처리** – `POST /api/study/{wordId}/correct`

   * `study_log` 에 정답 횟수 +1
   * 필요 시 (정답 누적 기준으로) **학습 완료** 처리 가능
   * 단, 프론트에서 별도로 `/api/completed` 를 쓰므로:

     * `completed_word` 테이블 구조와 어떻게 연동할지는 백엔드 정책에 맞추되,
     * `/api/completed` 응답 형식만 지켜주면 된다.

2. **오답 처리** – `POST /api/study/{wordId}/wrong`

   * `study_log` 에 오답 횟수 +1
   * 카드/퀴즈 화면에서

     * `result === "unknown"` 일 때

       1. `POST /api/study/{wordId}/wrong`
       2. `POST /api/wrong/{wordId}` 호출
   * 즉, **오답 발생 시 Wrong API 와 반드시 연동**되어야 한다.

3. **오답노트(`wrong_log`) 처리 규칙**

   * `POST /api/wrong/{wordId}`

     * 같은 단어를 여러 번 틀려도 **중복 INSERT 금지**
     * 기존 로그가 존재하면

       * `totalWrong` 만 +1
       * `totalCorrect` 는 StudyLog 기준으로 갱신 또는 그대로 유지

   * `POST /api/wrong/mark-used/{wrongLogId}`

     * 해당 로그의 `isUsedInStory = 'Y'` 로 변경
     * 이후 `/api/wrong/unused` 등에서 필터링에 사용

4. **개인 단어장 데이터 구성**

   * 사용자가 어떤 카테고리로 학습하든

     * `study_log`, `wrong_log`, `favorites`, `completed` 등에 누적
   * `단어장` 화면에서는

     * 즐겨찾기: `/api/favorites`
     * 학습 완료: `/api/completed`
     * 오답: `/api/wrong`
     * 검색/필터: `/api/words/search`, `/api/words/filter`
       를 조합해서 **“내가 학습한 단어 + 관심 단어”** 뷰를 만든다.

---

## 👤 3. Auth API (`src/api/authApi.js`)

### 3-1. 이메일 찾기

* `POST /api/auth/find-email`

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

### 3-2. 비밀번호 재설정 (임시 비밀번호 발송)

* `POST /api/auth/reset-password`

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

### 3-3. 로그인

* `POST /api/auth/login`

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
3. `AuthContext` 에서 `user`, `accessToken`, `refreshToken` 을 상태로 사용

---

### 3-4. 이메일 중복 체크

* `POST /api/auth/check-email`

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

### 3-5. 회원가입

* `POST /api/auth/signup`

Request

```json
{
  "email": "user@example.com",
  "password": "plain-password",
  "nickname": "닉네임",
  "userName": "홍길동",
  "userBirth": "1998-01-01",
  "preference": "BUSINESS",   // nullable
  "goal": "취업 준비",         // nullable
  "dailyWordGoal": 20         // nullable (number)
}
```

Response (권장)

```json
{
  "success": true,
  "message": "회원가입 완료"
}
```

또는 단순 string

```json
"회원가입 완료"
```

프론트는 최종적으로

```json
{ "success": true, "message": "..." }
```

형태로 재가공해서 사용.

---

### 3-6. 로그아웃

* `POST /api/auth/logout/{email}`

Path

* `email` (로그인 유저 이메일)

Request Body

* 없음

Response

* 형식 자유 (프론트는 응답 내용 사용 안 함)

프론트는 요청 전 이미

* 토큰 삭제
* `window.dispatchEvent(new Event("auth:logout"))` 호출

로 UI 상태 정리.

---

## 👤 4. User API (`src/api/userApi.js`)

### 4-1. 내 정보 조회

* `GET /api/user/me`

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

* 이 엔드포인트는

  * `authApi.login` 내부
  * `userApi.getMyInfo` 내부
    모두에서 사용.

---

### 4-2. 회원 정보 수정

* `PATCH /api/user`

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

### 4-3. 비밀번호 변경

* `PATCH /api/user/password`

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

## 📚 5. Word API (`src/api/wordApi.js`)

### 5-0. Word 공통 스키마 (권장)

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

* 프론트는 `mapWordFromApi()` 로 위 구조로 정규화해서 사용.
* `partOfSpeech`

  * DB 값이 달라도 프론트에서 `Noun / Verb / Adj / Adv` 로 통일.
* `level` / `wordLevel` 둘 다 받아줌 (권장: `level` 사용).

---

### 5-1. 단어 목록 (페이지)

* `GET /api/words`

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

### 5-2. 전체 단어 목록

* `GET /api/words/all`

Response

```json
[
  { /* Word */ }
]
```

> 화면에 “전체 단어” 메뉴는 없지만,
> 내부에서 검색/추천/테스트 등에 이 목록을 사용할 수 있다.

---

### 5-3. 오늘의 단어

* `GET /api/words/today`

Response

```json
{ /* Word */ }
```

---

### 5-4. 단어 검색

* `GET /api/words/search`

Query

* `keyword`: string
* `page`: number
* `size`: number

Response

* 5-1과 동일 Page 구조

---

### 5-5. 필터 검색

* `GET /api/words/filter`

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

* 5-1과 동일 Page 구조

---

### 5-6. 단어 상세

* `GET /api/words/detail/{wordId}`

Response

```json
{ /* Word */ }
```

단어 상세 화면에서

* Word 본문 정보 +
* Word Cluster API (`/api/cluster?wordId=...`) 를 사용해 **유의어만** 추가로 보여준다.

---

### 5-7. 전체 단어 개수 테스트

* `GET /api/words/test-count`

Response

```json
12345
```

* 숫자 단일값.

---

## ⭐ 6. Favorite / Completed API

### 6-1. 즐겨찾기 추가

* `POST /api/favorites/{wordId}`

Request Body

* 없음

Response

* `200` 또는 `201` → 성공
* 이미 즐겨찾기 상태에서 다시 호출:

  * `400` + `"이미 즐겨찾기한 단어입니다."` 도 허용
    (프론트는 이 경우도 성공으로 취급 가능)

---

### 6-2. 즐겨찾기 해제

* `DELETE /api/favorites/{wordId}`

Request Body

* 없음

Response

* `200` 또는 `204` → 성공
* 이미 해제된 상태에서 호출 시

  * `400` 이더라도 “이미 해제된 상태” 메시지면 성공 취급 가능

---

### 6-3. 내 즐겨찾기 목록

* `GET /api/favorites`

Response

```json
[
  { /* Word */, "isFavorite": true }
]
```

---

### 6-4. 학습 완료 단어 목록

* `GET /api/completed`

Response

```json
[
  { /* Word */, "isCompleted": true }
]
```

---

### 6-5. 특정 단어 학습 완료 여부

* `GET /api/completed/{wordId}/status`

Response

```json
{
  "wordId": 10,
  "completed": true
}
```

---

## 📝 7. Study API (학습 로그)

별도 JS 파일 없이, `cardApi` / `quizApi` 내부에서 직접 호출한다.

### 7-1. 정답 처리

* `POST /api/study/{wordId}/correct`

Request Body

* 없음

Response

* 형식 자유 (프론트는 응답 내용 사용 안 함)

기능

* `study_log` 에 정답 횟수 +1
* 필요 시 완료 처리와 연동 가능 (백엔드 정책에 따름)

---

### 7-2. 오답 처리

* `POST /api/study/{wordId}/wrong`

Request Body

* 없음

Response

* 형식 자유 (프론트는 응답 내용 사용 안 함)

기능

* `study_log` 에 오답 횟수 +1
* 카드/퀴즈에서 `unknown` 결과와 함께 `POST /api/wrong/{wordId}` 가 이어서 호출된다.

---

## ❌ 8. Wrong Answer API (`src/api/wrongApi.js`)

### 8-0. Wrong 공통 스키마 (권장)

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

### 8-1. 오답 기록 추가

* `POST /api/wrong/{wordId}`

Response

```json
{ /* Wrong */ }
```

주의

* 같은 `wordId` 에 대해 중복 INSERT 금지
* 이미 존재하면 `totalWrong` 등 카운트만 증가시키고 동일 레코드 반환.

---

### 8-2. 오답 기록 삭제 (wordId 기준)

* `DELETE /api/wrong/{wordId}`

Response

* 형식 자유 (상태코드/성공 여부만 사용)

---

### 8-3. 내 오답 전체 목록

* `GET /api/wrong`

Query

* 없음 (필터/정렬/페이지네이션은 프론트에서 처리)

Response

```json
[
  { /* Wrong */ }
]
```

프론트는

* 전체 배열 받아

  * 날짜/사용 여부/횟수로 정렬/필터
  * 페이지네이션도 클라이언트에서 수행.

---

### 8-4. 스토리 미사용 오답 목록

* `GET /api/wrong/unused`

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

* 스토리 생성(수동/AI)에서 “아직 스토리에서 안 쓴 오답 단어들” 목록용.

---

### 8-5. 오답 → 스토리 사용됨 처리

* `POST /api/wrong/mark-used/{wrongLogId}`

Path

* `wrongLogId` = `wrongWordId`

Response (권장)

```json
{ "success": true }
```

---

### 8-6. 최근 퀴즈 오답 (대시보드/홈용)

* 실제 엔드포인트는 Quiz 쪽 (`/api/quiz/recent-wrong`) 이지만,
  프론트 `wrongApi` 내부에서 사용한다.

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

## 🃏 9. Flashcard API (`src/api/cardApi.js`)

### 9-1. 일반 카드

* `GET /api/flashcard`

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

### 9-2. 오답 카드

* `GET /api/flashcard/wrong`

Query

* `count`: number (가져올 카드 수)

Response

* 9-1 과 동일 구조 배열

프론트

* `source === "wrong-note"` 일 때 `/api/flashcard/wrong` 호출
* 이후 특정 `wordIds` 필터는 프론트에서 처리 (요청단에는 `wordIds` 안 보냄)

---

### 9-3. 카드 학습 결과 제출 흐름

백엔드에 “카드 결과 전용 API” 는 없고,
기존 Study/Wrong API 조합을 사용한다.

* `result === "unknown"` (모름)

  1. `POST /api/study/{wordId}/wrong`
  2. `POST /api/wrong/{wordId}`

* `result === "known"` (앎)

  * `POST /api/study/{wordId}/correct`

---

## 🧠 10. Quiz API (`src/api/quizApi.js`)

### 10-1. 객관식 퀴즈 조회

* `GET /api/quiz`

Query 매핑

* 위 2-2 항목 참고 (`mode`, `count`, `level`, `category`, `wordIds`)

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
  "answer": 0,
  "word": "coffee",
  "meaning": "커피",
  "meaningKo": "커피",
  "partOfSpeech": "Noun",
  "level": 1,
  "wrongWordId": null
}
```

---

### 10-2. 퀴즈 결과 저장 (배치)

* `POST /api/quiz/result`

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

* `wrongWordIds` 는 필요 시 오답노트/학습 통계와 연동 가능.

---

### 10-3. 최근 퀴즈 오답

* `GET /api/quiz/recent-wrong`

Response

* 8-6 항목 참고

---

## 📖 11. Story / AI Story API (`src/api/storyApi.js`, `src/api/aiStoryApi.js`)

### 11-1. 내 스토리 목록

* `GET /api/story`

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

### 11-2. 스토리 상세

* `GET /api/story/{storyId}`

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

### 11-3. 스토리에 사용된 단어 목록

* `GET /api/story/{storyId}/words`

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

프론트는 `{ text, pos, meaning }` 형태로 변환해서 사용.

---

### 11-4. 스토리 저장 (수동 스토리)

* `POST /api/story`

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

* `wrongLogIds` 가 존재하면

  * 서버에서 해당 오답 로그들을 `isUsedInStory = 'Y'` 로 처리해도 된다.

---

### 11-5. 스토리 삭제

* `DELETE /api/story/{storyId}`

Response 권장

```json
{
  "success": true,
  "message": "스토리가 삭제되었습니다.",
  "storyId": 10
}
```

---

### 11-6. AI 스토리 생성 + 저장

* `POST /api/ai/story`

Request

```json
{
  "wrongAnswerLogIds": [111, 222, 333]
}
```

* 배열이 비어 있는 케이스는 프론트에서 이미 막음.

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

## 📊 12. Dashboard API (`src/api/dashboardApi.js`)

### 12-1. 오늘의 목표

* `GET /api/dashboard/daily-goal`

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

### 12-2. 전체 학습 통계

* `GET /api/dashboard/stats`

Response 권장

```json
{
  "totalLearnedWords": 1250,
  "wrongWords": 10,
  "streakDays": 5
}
```

---

### 12-3. 최근 7일 학습량

* `GET /api/dashboard/weekly`

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

### 12-4. 오답 TOP 5

* `GET /api/dashboard/wrong/top5`

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

## 🔗 13. Word Cluster API (`src/api/wordClusterApi.js`)

### 13-0. Raw 스키마 (권장)

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

각 dto

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

* 현재 실서버 기준으로는 `synonym`(유의어) 타입만 내려와서, UI에서는 유의어만 표시되고 `antonym`(반의어)는 표시되지 않는다.
* 연관단어에서 곧바로 내 단어장(즐겨찾기/단어장)에 추가하는 기능은 백엔드 API 미구현으로 인해 현재는 동작하지 않는 상태이다.

---

### 13-1. 특정 단어 클러스터 조회

* `GET /api/cluster`

Query

* `wordId`: long

Response

* 위 Raw 스키마 배열

---

### 13-2. 클러스터 생성

* `POST /api/cluster/create`

Query

* `wordId`: long

Request Body

* 없음

Response

* 바디 없어도 상관없음.
* 생성 후 프론트는 다시 `GET /api/cluster?wordId=...` 호출로 최신 데이터 사용.
  → `200` 또는 `201` 만 정확히 응답.

---

### 13-3. 내 클러스터 전체 조회

* `GET /api/cluster/all`

Response

* 형식 자유 (프론트는 그대로 리스트로 사용, 별도 변환 없음)

---

### 13-4. 특정 중심 단어 클러스터 삭제

* `DELETE /api/cluster`

Query

* `wordId`: long

Response

* 형식 자유 (프론트는 응답 내용 안 쓰고 캐시만 삭제)

---

### 13-5. 모든 클러스터 삭제

* `DELETE /api/cluster/all`

Response

* 형식 자유

---

이 문서의 모든 엔드포인트는 프론트에서 실제로 사용 중이며,
특히 **2-1 ~ 2-3 (PathVariable, Quiz 파라미터, Study/Wrong 연동)** 은 맞지 않으면 정상 동작하지 않는다.

