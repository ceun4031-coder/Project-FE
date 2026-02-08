// src/main.jsx
import "./components/common/Button.css";
import "./components/common/Input.css";
import "./styles/index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

// dev proof helpers (dev에서만 의미 있음)
import "./dev/refreshProof";

const queryClient = new QueryClient();

async function enableMswIfNeeded() {
  const isDev = Boolean(import.meta?.env?.DEV);
  const enableMsw = String(import.meta?.env?.VITE_ENABLE_MSW ?? "") === "true";
  const enableProof = String(import.meta?.env?.VITE_MSW_PROOF ?? "") === "true";

  // dev + enableMSW일 때만 start
  if (!isDev || !enableMsw) return;

  try {
    const { worker } = await import("./mocks/browser");

    // Vite에서는 public/ 파일이 루트(/)로 서빙됨
    // proof 모드면 worker 등록/핸들러 미스매치가 바로 드러나도록 로그를 조금 더 친절하게.
    await worker.start({
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      onUnhandledRequest: enableProof ? "warn" : "bypass",
    });

    // eslint-disable-next-line no-console
    console.log("[MSW] Mocking enabled.", { enableProof });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[MSW] Failed to start worker (ignored):", e);
  }
}

async function bootstrap() {
  await enableMswIfNeeded(console.log("[env]", {
    DEV: import.meta.env.DEV,
    VITE_ENABLE_MSW: import.meta.env.VITE_ENABLE_MSW,
    VITE_MSW_PROOF: import.meta.env.VITE_MSW_PROOF
  })
);

  const el = document.getElementById("root");
  if (!el) return;

  ReactDOM.createRoot(el).render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

bootstrap();

/*
요약(3줄)
1) VITE_ENABLE_MSW=true(DEV에서만)면 렌더 전에 worker.start()로 MSW를 먼저 켭니다.
2) serviceWorker.url을 "/mockServiceWorker.js"로 고정해 public 서빙 경로 문제를 방어합니다.
3) proof 모드(VITE_MSW_PROOF=true)면 unhandled 요청을 warn으로 띄워 누락 핸들러를 빠르게 찾습니다.
*/
