// src/mocks/browser.js
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

/*
요약(3줄)
1) MSW Service Worker를 handlers로 구성합니다.
2) main.jsx에서 worker.start()를 호출하면 네트워크를 MSW가 가로챕니다.
3) 백엔드 없이도 401→refresh→200 시나리오를 재현할 수 있습니다.
*/
